import { GoogleGenAI, Type, Modality, LiveServerMessage, ThinkingLevel } from "@google/genai";
import { UserProfile, CareerRecommendation, Roadmap } from "../types";

export const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_INSTRUCTION = (language: string) => `You are "CareerPath AI", a professional and strategic career consultant. 
Your goal is to provide data-driven, actionable, and insightful career advice. 
Your tone should be professional, encouraging, and highly analytical. 
Be extremely concise. Answer with only one short paragraph or sentence.
Avoid generic advice; instead, provide specific, high-impact recommendations based on the user's profile.
When asked for insights, focus on market trends, skill gaps, and strategic positioning.
IMPORTANT: You MUST respond in English for all your outputs.`;

export async function generateSpeech(text: string, language: string = 'en', voiceName: string = 'Kore'): Promise<string | undefined> {
  if (!text || text.trim().length === 0) return undefined;

  try {
    // Try Puter TTS first
    const puter = (window as any).puter;
    if (puter && puter.ai && puter.ai.txt2speech) {
      const audioBlob = await puter.ai.txt2speech(text);
      if (audioBlob instanceof Blob) {
        return URL.createObjectURL(audioBlob);
      } else if (audioBlob instanceof Audio) {
        return audioBlob.src;
      } else if (typeof audioBlob === 'string') {
        return audioBlob;
      }
    }
  } catch (error) {
    console.error("Puter TTS error:", error);
  }

  try {
    // Fallback to Gemini TTS
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      // Gemini TTS returns raw PCM data (16-bit, 24kHz, mono)
      // We need to add a WAV header for the browser to play it
      const pcmData = atob(base64Audio);
      const buffer = new ArrayBuffer(44 + pcmData.length);
      const view = new DataView(buffer);

      // RIFF identifier
      view.setUint32(0, 0x52494646, false); // "RIFF"
      // file length
      view.setUint32(4, 36 + pcmData.length, true);
      // RIFF type
      view.setUint32(8, 0x57415645, false); // "WAVE"
      // format chunk identifier
      view.setUint32(12, 0x666d7420, false); // "fmt "
      // format chunk length
      view.setUint32(16, 16, true);
      // sample format (raw PCM)
      view.setUint16(20, 1, true);
      // channel count
      view.setUint16(22, 1, true);
      // sample rate
      view.setUint32(24, 24000, true);
      // byte rate (sample rate * block align)
      view.setUint32(28, 24000 * 2, true);
      // block align (channel count * bytes per sample)
      view.setUint16(32, 2, true);
      // bits per sample
      view.setUint16(34, 16, true);
      // data chunk identifier
      view.setUint32(36, 0x64617461, false); // "data"
      // data chunk length
      view.setUint32(40, pcmData.length, true);

      // write PCM data
      for (let i = 0; i < pcmData.length; i++) {
        view.setUint8(44 + i, pcmData.charCodeAt(i));
      }

      const blob = new Blob([buffer], { type: 'audio/wav' });
      return URL.createObjectURL(blob);
    }
  } catch (error) {
    console.error("Gemini TTS error:", error);
  }
  return undefined;
}

export async function analyzeProfile(profile: UserProfile, language: string = 'en'): Promise<string> {
  const prompt = `Analyze this professional profile and provide a strategic career insight. 
  Focus on their strengths, potential growth areas, and how they align with their stated career goal.
  Profile: ${JSON.stringify(profile)}`;
  
  const result = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: { systemInstruction: SYSTEM_INSTRUCTION(language) }
  });
  return result.text || "Strategic analysis pending.";
}

export async function getCareerRecommendations(profile: UserProfile, language: string = 'en'): Promise<CareerRecommendation[]> {
  const prompt = `Based on this profile, suggest 3-5 career paths that are "water" for this user. 
  For each path, provide a title, a reason for the recommendation, a match percentage (0-100), and a realistic annual salary range (e.g., "$80k - $120k" or "Rp 10jt - 20jt/bln").
  Profile: ${JSON.stringify(profile)}`;
  
  const result = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: { 
      systemInstruction: SYSTEM_INSTRUCTION(language),
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            reason: { type: Type.STRING },
            matchPercentage: { type: Type.NUMBER },
            salaryRange: { type: Type.STRING }
          },
          required: ["title", "reason", "matchPercentage", "salaryRange"]
        }
      }
    }
  });
  return JSON.parse(result.text || "[]");
}

export async function generateRoadmap(careerTitle: string, profile: UserProfile, language: string = 'en'): Promise<Roadmap> {
  const prompt = `Generate a 3-6 month roadmap for the user to transition into: ${careerTitle}. 
  Include:
  1. A realistic annual salary range for this role.
  2. A realistic monthly salary range for this role.
  3. A brief salary growth projection.
  4. A brief market outlook.
  5. Market Demand level: "High", "Medium", or "Low".
  6. A Strategic Fit score (0-100).
  7. A piece of strategic advice.
  8. A list of 3-5 specific learning materials.
  9. A list of 2-3 recommended certifications, including a direct link to the certification page if possible.
  10. A list of 4-6 key skills required, each with a search link to Coursera. Set the level for ALL skills to 0 to represent the starting point of the journey.
  11. For every single step in the roadmap, provide a descriptive title, a detailed description, and set completed to false.
  IMPORTANT: All skill levels MUST be 0 and all steps MUST have completed set to false.
  User Profile: ${JSON.stringify(profile)}`;
  
  const result = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: { 
      systemInstruction: SYSTEM_INSTRUCTION(language),
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          careerTitle: { type: Type.STRING },
          salary: { type: Type.STRING },
          monthlySalary: { type: Type.STRING },
          salaryGrowth: { type: Type.STRING },
          marketOutlook: { type: Type.STRING },
          marketDemand: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
          strategicFit: { type: Type.NUMBER },
          strategicAdvice: { type: Type.STRING },
          learningMaterials: { 
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          certifications: { 
            type: Type.ARRAY,
            items: { 
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                link: { type: Type.STRING }
              },
              required: ["name"]
            }
          },
          skills: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                level: { type: Type.NUMBER },
                courseraLink: { type: Type.STRING, description: "A direct search link to Coursera for this specific skill" }
              },
              required: ["name", "level", "courseraLink"]
            }
          },
          steps: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                timeline: { type: Type.STRING },
                completed: { type: Type.BOOLEAN },
                courseraLink: { type: Type.STRING, description: "A direct search link to Coursera for this specific topic" }
              },
              required: ["title", "description", "timeline", "completed", "courseraLink"]
            }
          }
        },
        required: ["careerTitle", "salary", "monthlySalary", "salaryGrowth", "marketOutlook", "marketDemand", "strategicFit", "strategicAdvice", "learningMaterials", "certifications", "skills", "steps"]
      }
    }
  });

  const roadmap: Roadmap = JSON.parse(result.text || "{}");

  // Ensure all skill levels are 0 and Coursera links are properly formatted
  if (roadmap.skills) {
    roadmap.skills = roadmap.skills.map((skill) => {
      // Force all skill levels to 0 as requested
      skill.level = 0;
      
      if (!skill.courseraLink || !skill.courseraLink.startsWith('http')) {
        const searchQuery = encodeURIComponent(`${skill.name} coursera`);
        return { ...skill, level: 0, courseraLink: `https://www.coursera.org/search?query=${searchQuery}` };
      }
      return { ...skill, level: 0 };
    });
  }

  // Ensure all steps are not completed initially
  if (roadmap.steps) {
    roadmap.steps = roadmap.steps.map(step => {
      step.completed = false;
      if (!step.courseraLink || !step.courseraLink.startsWith('http')) {
        const searchQuery = encodeURIComponent(`${step.title} ${careerTitle} coursera`);
        return { ...step, completed: false, courseraLink: `https://www.coursera.org/search?query=${searchQuery}` };
      }
      return { ...step, completed: false };
    });
  }

  // Enhance steps with real YouTube links using the backend API in parallel
  if (roadmap.steps && roadmap.steps.length > 0) {
    const enhancedSteps = await Promise.all(roadmap.steps.map(async (step) => {
      try {
        // Use a more focused search query: title + career goal
        // Truncate description if it's too long to avoid API issues
        const shortDesc = step.description.length > 60 ? step.description.substring(0, 60) + "..." : step.description;
        const searchQuery = `${step.title} ${careerTitle} full tutorial`;
        
        // Retry logic for fetch
        let response;
        let retries = 2;
        while (retries >= 0) {
          try {
            response = await fetch(`/api/youtube/search?q=${encodeURIComponent(searchQuery)}`);
            if (response.ok) break;
          } catch (e) {
            if (retries === 0) throw e;
          }
          retries--;
          if (retries >= 0) await new Promise(r => setTimeout(r, 500));
        }
        
        if (response && response.ok) {
          const data = await response.json();
          return { ...step, link: data.url };
        }
      } catch (error) {
        console.error(`Failed to fetch YouTube link for step: ${step.title}`, error);
      }
      return step;
    }));
    roadmap.steps = enhancedSteps;
  }

  return roadmap;
}

export async function analyzeLinkedInProfile(url: string, profile: UserProfile, options: { language?: string, focusAreas?: string[] } = {}): Promise<string> {
  const { language = 'en', focusAreas = [] } = options;
  const focusText = focusAreas.length > 0 ? `Focus specifically on these areas: ${focusAreas.join(', ')}.` : '';
  const prompt = `Perform a deep-dive strategic LinkedIn profile audit for the target position of "${profile.careerGoal}". 
  LinkedIn Profile URL: ${url}
  ${focusText}
  
  Provide a comprehensive, high-impact analysis with the following sections:
  
  ### 1. Profile Strength & Searchability
  - **Score (0-10)**: Provide a specific score and justify it.
  - **Keyword Density**: Identify 3-5 keywords that are missing but critical for a ${profile.careerGoal}.
  - **SEO Verdict**: Is the profile appearing in the right searches?
  
  ### 2. Headline & About Section
  - **Headline Critique**: Why the current headline is or isn't working.
  - **Power Headlines**: Provide 3 distinct options (e.g., "The Specialist", "The Result-Driven", "The Visionary").
  - **The Hook**: Provide a specific, attention-grabbing opening sentence for the "About" section.
  - **The Narrative**: Suggest a structure for the summary that tells a story of growth and impact.
  
  ### 3. Experience & Impact (STAR Method)
  - **Impact Audit**: Evaluate if the current descriptions are "duty-based" or "impact-based".
  - **Bullet Point Refactor**: Take 2 existing bullet points and rewrite them using the STAR (Situation, Task, Action, Result) method with placeholders for metrics.
  
  ### 4. Skill Gap & Endorsement Strategy
  - **Critical Skills**: List 5 skills that must be added or moved to the top.
  - **Proof Points**: Suggest one specific way to demonstrate each skill (e.g., "Add a link to project X").
  
  ### 5. Networking & Visibility Strategy
  - **Target Connections**: 3 specific job titles to target for networking.
  - **Search Queries**: Provide 2-3 specific LinkedIn search strings to find these people.
  - **Connection Template**: A personalized, high-conversion request template (max 300 chars).
  
  ### 6. Immediate Action Checklist
  - A prioritized list of the top 5 changes to make right now for maximum immediate impact.`;
  
  const result = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: { 
      systemInstruction: `You are a world-class LinkedIn strategist and executive recruiter. 
      Your goal is to transform the user's LinkedIn profile into a high-performance landing page that attracts top-tier recruiters and opportunities.
      Be specific, blunt but constructive, and provide actual copy/text suggestions they can copy-paste.
      Use professional yet modern formatting with Markdown.
      IMPORTANT: You MUST respond in English.
      User Profile: ${JSON.stringify(profile)}`,
      tools: [{ urlContext: {} }]
    }
  });
  return result.text || "LinkedIn analysis pending.";
}

export async function analyzeCV(cvText: string, targetJob: string, profile: UserProfile, language: string = 'en'): Promise<string> {
  const prompt = `Perform a high-stakes CV audit for the target position of "${targetJob}". 
  CV Content: ${cvText}
  
  Provide a comprehensive, high-impact analysis with the following sections:
  
  ### 1. Acceptance Probability
  - **Score (0-100%)**: Provide a specific percentage and justify it based on the current CV vs. market expectations for a ${targetJob}.
  - **The Verdict**: A blunt, honest assessment of whether this CV would pass the initial screening.
  
  ### 2. Strategic Alignment
  - **Strengths**: 3 key areas where the CV aligns perfectly with the target role.
  - **Critical Gaps**: 3-5 missing skills, experiences, or keywords that are causing the "rejection" risk.
  
  ### 3. ATS Optimization
  - **ATS Score (0-10)**: How well will an Applicant Tracking System read this?
  - **Formatting Issues**: Identify any layout or font issues that might break ATS.
  
  ### 4. Impact Refactor
  - **Weak Points**: Identify 2-3 weak or "duty-based" bullet points.
  - **Power Refactor**: Rewrite those points using the STAR method with high-impact metrics.
  
  ### 5. Immediate Action Plan
  - A prioritized list of the top 5 changes to make right now to move the acceptance probability from its current state to 90%+.`;
  
  const result = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: { 
      systemInstruction: `You are a world-class executive recruiter and career strategist. 
      Your goal is to provide a ruthless, objective, and highly strategic audit of the user's CV against their target job.
      Be specific, data-driven, and provide actual copy/text suggestions.
      Use professional yet modern formatting with Markdown.
      IMPORTANT: You MUST respond in English.
      User Profile: ${JSON.stringify(profile)}`
    }
  });
  return result.text || "CV analysis pending.";
}

export async function* chatWithMentorStream(message: string, profile: UserProfile, history: { role: string, parts: { text: string }[] }[], language: string = 'en', customInstruction?: string) {
  const chat = ai.chats.create({
    model: "gemini-3-flash-preview",
    config: { 
      systemInstruction: (customInstruction || SYSTEM_INSTRUCTION(language)) + `\nUser Profile: ${JSON.stringify(profile)}`,
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }
    },
    history: history
  });
  
  const result = await chat.sendMessageStream({ message });
  for await (const chunk of result) {
    yield chunk.text || "";
  }
}

export async function chatWithMentor(message: string, profile: UserProfile, history: { role: string, parts: { text: string }[] }[], language: string = 'en'): Promise<string> {
  const chat = ai.chats.create({
    model: "gemini-3-flash-preview",
    config: { systemInstruction: SYSTEM_INSTRUCTION(language) + `\nUser Profile: ${JSON.stringify(profile)}` },
    history: history
  });
  
  const result = await chat.sendMessage({ message });
  return result.text || "I'm listening.";
}

export async function summarizeConsultation(messages: { role: string, parts: { text: string }[] }[], language: string = 'en'): Promise<string> {
  const chat = ai.chats.create({
    model: "gemini-3-flash-preview",
    config: { 
      systemInstruction: `You are a professional career strategist. Summarize the following career consultation conversation into concise strategic points. Focus on challenges, goals, and action plans. Use English.`
    }
  });

  const conversationText = messages.map(m => `${m.role}: ${m.parts[0].text}`).join('\n');
  const result = await chat.sendMessage({ message: `Please summarize this conversation:\n\n${conversationText}` });
  return result.text || '';
}

export async function summarizeReflection(profile: UserProfile, language: string = 'en'): Promise<string> {
  const prompt = `Summarize the user's current skills, missing skills, and career challenges into a concise, professional, and strategic insight.
  
  Current Skills: ${profile.currentSkills}
  Missing Skills: ${profile.missingSkills}
  Career Challenge: ${profile.careerChallenge}
  
  Provide a summary that highlights their potential and the most critical next steps for their career growth.`;
  
  const result = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: { systemInstruction: SYSTEM_INSTRUCTION(language) }
  });
  return result.text || "Reflection summary pending.";
}

export interface LiveSessionCallbacks {
  onopen?: () => void;
  onmessage: (message: LiveServerMessage) => void;
  onerror?: (error: any) => void;
  onclose?: () => void;
}

export function connectLive(language: string, systemInstruction: string, callbacks: LiveSessionCallbacks) {
  return ai.live.connect({
    model: "gemini-2.5-flash-native-audio-preview-12-2025",
    callbacks,
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
      },
      systemInstruction,
    },
  });
}
