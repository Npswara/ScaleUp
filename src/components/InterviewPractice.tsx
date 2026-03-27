import { useState, useEffect, useRef } from 'react';
import { UserProfile } from '../types';
import { chatWithMentorStream, generateSpeech } from '../services/gemini';
import { Mic, MicOff, ArrowLeft, Volume2, VolumeX, Sparkles, Play, Square, MessageSquare, Award, Target, ArrowRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface InterviewPracticeProps {
  profile: UserProfile;
  onBack: () => void;
  onUpdateProfile: (profile: UserProfile) => void;
}

export default function InterviewPractice({ profile, onBack, onUpdateProfile }: InterviewPracticeProps) {
  const [mode, setMode] = useState<'start' | 'interview' | 'feedback'>('start');
  const [messages, setMessages] = useState<{ role: string, parts: { text: string }[] }[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [feedback, setFeedback] = useState<string>('');
  const [mute, setMute] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isTtsQuotaExceeded, setIsTtsQuotaExceeded] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const handleAnswerRef = useRef<((text: string) => void) | null>(null);
  // Streamed TTS:
  // - We enqueue speech chunks as soon as we see sentence-ending punctuation.
  // - This reduces the "wait for full response" delay.
  const speechQueueRef = useRef<string[]>([]);
  const pendingSpeechRef = useRef<string>('');
  const ttsWorkerActiveRef = useRef<boolean>(false);
  const audioBufferRef = useRef<{ text: string, audio: HTMLAudioElement }[]>([]);
  const isFetchingRef = useRef<boolean>(false);

  const INTERVIEWER_INSTRUCTION = () => `You are a professional and strategic interviewer for a high-level position. 
 Your goal is to conduct a realistic, challenging, and insightful mock interview.
 Your tone should be professional, slightly formal, and highly analytical.
 Ask one question at a time. Wait for the user's response before asking the next question.
 Provide brief, constructive feedback or follow-up questions based on the user's answers.
 Be extremely concise.
 IMPORTANT: You MUST respond in English.`;

  // Update the ref whenever handleAnswer changes
  useEffect(() => {
    handleAnswerRef.current = handleAnswer;
  }, [messages, profile]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (handleAnswerRef.current) {
          handleAnswerRef.current(transcript);
        }
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => setIsListening(false);
    }

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
      if (audioRef.current) {
        audioRef.current.pause();
        if (audioRef.current.src.startsWith('blob:')) {
          URL.revokeObjectURL(audioRef.current.src);
        }
        audioRef.current = null;
      }
      if (timerRef.current) clearInterval(timerRef.current);
      // Cleanup audio buffer
      audioBufferRef.current.forEach(item => {
        if (item.audio && item.audio.src.startsWith('blob:')) {
          URL.revokeObjectURL(item.audio.src);
        }
      });
      audioBufferRef.current = [];
    };
  }, []);

  useEffect(() => {
    if (mode === 'interview') {
      timerRef.current = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setTimer(0);
    }
  }, [mode]);

  useEffect(() => {
    if (mute) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      speechQueueRef.current = [];
      pendingSpeechRef.current = '';
      audioBufferRef.current = [];
      setIsSpeaking(false);
    }
  }, [mute]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const normalizeForSpeech = (text: string) => {
    // Basic cleanup to avoid reading markdown symbols and literal punctuation.
    return text
      .replace(/[`*_#>-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const resetTts = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    speechQueueRef.current = [];
    pendingSpeechRef.current = '';
    audioBufferRef.current = [];
    ttsWorkerActiveRef.current = false;
    isFetchingRef.current = false;
    setIsSpeaking(false);
  };

  const fetchNextAudio = async () => {
    if (mute || isFetchingRef.current || speechQueueRef.current.length === 0 || audioBufferRef.current.length >= 2) return;

    isFetchingRef.current = true;
    const nextText = speechQueueRef.current.shift();
    if (!nextText) {
      isFetchingRef.current = false;
      return;
    }

    try {
      const audioUrl = await generateSpeech(nextText, 'en', 'Kore');
      if (audioUrl) {
        const audio = new Audio(audioUrl);
        audioBufferRef.current.push({ text: nextText, audio });
        audio.load();
      } else {
        // Fallback to browser TTS if Gemini TTS fails
        setIsTtsQuotaExceeded(true);
        audioBufferRef.current.push({ text: nextText, audio: null as any });
      }
    } catch (error) {
      console.error("Fetch audio error:", error);
    } finally {
      isFetchingRef.current = false;
      // Try to fetch another if buffer not full
      fetchNextAudio();
    }
  };

  const processSpeechQueue = async () => {
    if (mute) return;
    
    // Always try to keep the buffer full
    fetchNextAudio();

    if (ttsWorkerActiveRef.current) return;
    
    if (audioBufferRef.current.length === 0) {
      // If nothing in buffer but something in queue, wait for fetch
      if (speechQueueRef.current.length > 0) {
        setTimeout(processSpeechQueue, 100);
      } else {
        setIsSpeaking(false);
      }
      return;
    }

    ttsWorkerActiveRef.current = true;
    setIsSpeaking(true);

    const item = audioBufferRef.current.shift();
    if (!item) {
      ttsWorkerActiveRef.current = false;
      processSpeechQueue();
      return;
    }

    try {
      if (item.audio) {
        audioRef.current = item.audio;
        
        item.audio.onended = () => {
          if (item.audio.src.startsWith('blob:')) {
            URL.revokeObjectURL(item.audio.src);
          }
          ttsWorkerActiveRef.current = false;
          // Small delay to ensure smooth transition
          setTimeout(processSpeechQueue, 50);
        };
        
        item.audio.onerror = () => {
          ttsWorkerActiveRef.current = false;
          processSpeechQueue();
        };

        await item.audio.play();
      } else {
        // Fallback to browser TTS
        const utterance = new SpeechSynthesisUtterance(item.text);
        utterance.lang = 'en-US';
        utterance.rate = 1.6;
        
        utterance.onend = () => {
          ttsWorkerActiveRef.current = false;
          processSpeechQueue();
        };
        
        utterance.onerror = () => {
          ttsWorkerActiveRef.current = false;
          processSpeechQueue();
        };
        
        window.speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error("Speech error:", error);
      ttsWorkerActiveRef.current = false;
      processSpeechQueue();
    }
  };

  const enqueueSpeechText = (rawText: string) => {
    if (mute) return;
    const cleaned = normalizeForSpeech(rawText);
    if (!cleaned) return;

    // Keep utterances long to minimize pauses between chunks for a "very fast" experience.
    const MAX_LEN = 500;
    if (cleaned.length <= MAX_LEN) {
      speechQueueRef.current.push(cleaned);
      processSpeechQueue();
      return;
    }

    // Chunk long text by length.
    for (let i = 0; i < cleaned.length; i += MAX_LEN) {
      const part = cleaned.slice(i, i + MAX_LEN).trim();
      if (part) speechQueueRef.current.push(part);
    }
    processSpeechQueue();
  };

  const pushSpeechChunk = (chunk: string) => {
    if (mute) return;
    pendingSpeechRef.current += chunk;

    while (true) {
      const pending = pendingSpeechRef.current;
      
      // Only break at a sentence ending (. ! ?) if we have enough text to justify a chunk (e.g., > 120 chars)
      // OR if the pending text is becoming very long (> 300 chars) even without a sentence ending.
      const sentenceMatch = /[.!?]/.exec(pending);
      let breakIndex = -1;
      
      if (sentenceMatch && pending.length > 120) {
        breakIndex = sentenceMatch.index + 1;
      } else if (pending.length > 250) {
        // If no sentence ending but text is long, break at comma or space
        const commaMatch = /[,]/.exec(pending);
        if (commaMatch) {
          breakIndex = commaMatch.index + 1;
        } else {
          const spaceMatch = /\s/.exec(pending.slice(150));
          if (spaceMatch) {
            breakIndex = 150 + spaceMatch.index + 1;
          }
        }
      }

      if (breakIndex === -1) break;

      const segment = pending.slice(0, breakIndex).trim();
      pendingSpeechRef.current = pending.slice(breakIndex);

      if (segment) enqueueSpeechText(segment);
    }
  };

  const flushSpeech = () => {
    if (mute) return;
    const remaining = pendingSpeechRef.current.trim();
    pendingSpeechRef.current = '';
    if (remaining) enqueueSpeechText(remaining);
  };

  const startInterview = async () => {
    setMode('interview');
    setIsThinking(true);
    resetTts();
    const prompt = `Start a professional mock interview for the position of ${profile.careerGoal}. 
    Ask the first question. Be strategic, analytical, and professional.`;
    
    try {
      let fullResponse = '';
      const stream = chatWithMentorStream(prompt, profile, [], 'en', INTERVIEWER_INSTRUCTION());
      
      setMessages([{ role: 'model', parts: [{ text: '' }] }]);
      
      for await (const chunk of stream) {
        if (isThinking) setIsThinking(false);
        fullResponse += chunk;
        pushSpeechChunk(chunk);
        setMessages(prev => {
          const newMessages = [...prev];
          if (newMessages.length > 0) {
            newMessages[newMessages.length - 1].parts[0].text = fullResponse;
          }
          return newMessages;
        });
      }
      flushSpeech();
    } catch (error) {
      console.error("Interview start error:", error);
    } finally {
      setIsThinking(false);
    }
  };

  const handleAnswer = async (text: string) => {
    if (!text.trim()) return;
    
    resetTts();
    const userMessage = { role: 'user', parts: [{ text }] };
    setMessages(prev => [...prev, userMessage]);
    setIsThinking(true);

    try {
      let fullResponse = '';
      const stream = chatWithMentorStream(text, profile, messages, 'en', INTERVIEWER_INSTRUCTION());
      
      setMessages(prev => [...prev, { role: 'model', parts: [{ text: '' }] }]);
      
      for await (const chunk of stream) {
        if (isThinking) setIsThinking(false);
        fullResponse += chunk;
        pushSpeechChunk(chunk);
        setMessages(prev => {
          const newMessages = [...prev];
          if (newMessages.length > 0) {
            newMessages[newMessages.length - 1].parts[0].text = fullResponse;
          }
          return newMessages;
        });
      }
      flushSpeech();
    } catch (error) {
      console.error("Interview error:", error);
    } finally {
      setIsThinking(false);
    }
  };

  const finishInterview = async () => {
    setIsThinking(true);
    resetTts();
    const prompt = `The interview is over. Provide a professional, strategic feedback on my performance. 
    Analyze my content, structure, and confidence based on our conversation. 
    Give me a strategic score out of 10.`;
    
    try {
      let fullResponse = '';
      const stream = chatWithMentorStream(prompt, profile, messages, 'en', INTERVIEWER_INSTRUCTION());
      
      setFeedback('');
      setMode('feedback');
      
      for await (const chunk of stream) {
        if (isThinking) setIsThinking(false);
        fullResponse += chunk;
        setFeedback(fullResponse);
        // User requested: voice agent dont read anything again after interview ended
        // pushSpeechChunk(chunk); 
      }
      // flushSpeech();
    } catch (error) {
      console.error("Interview finish error:", error);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto flex flex-col bg-surface-bg selection:bg-brand-primary selection:text-white">
      <div className="max-w-6xl mx-auto w-full px-4 md:px-8 py-6 md:py-10 pb-32 flex-1 flex flex-col">
        {isTtsQuotaExceeded && !mute && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-amber-500/10 border border-amber-500/20 text-amber-600 px-4 py-2 rounded-full text-xs font-medium flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-300 z-50">
          <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
          Using standard voice (AI Quota exceeded)
        </div>
      )}

      {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 md:gap-12 mb-12 md:mb-24">
          <div className="flex items-start gap-4 md:gap-8">
            <button 
              onClick={onBack} 
              className="p-3 md:p-4 border border-border-light hover:border-black transition-all text-black hover:text-black bg-white"
            >
              <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            <div className="space-y-2 md:space-y-4">
              <div className="flex items-center gap-2 text-black font-bold text-[8px] md:text-[10px] uppercase tracking-[0.4em]">
                Performance Training
              </div>
              <h2 className="text-4xl md:text-7xl font-serif leading-none tracking-tighter text-black">
                The <span className="italic">Simulation.</span>
              </h2>
              <p className="text-black font-serif italic text-lg md:text-xl max-w-md">{profile.careerGoal}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setMute(!mute)} 
              className="p-3 md:p-4 border border-border-light hover:border-black transition-all text-black hover:text-black bg-white"
            >
              {mute ? <VolumeX className="w-5 h-5 md:w-6 md:h-6" /> : <Volume2 className="w-5 h-5 md:w-6 md:h-6" />}
            </button>
            {mode === 'interview' && (
              <button 
                onClick={finishInterview}
                className="button-secondary border-red-200 text-red-600 hover:bg-red-50 hover:border-red-500 py-3 px-6 text-xs"
              >
                Terminate Session
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          {mode === 'start' && (
            <div 
              className="flex-1 flex flex-col items-center justify-center text-center card-standard bg-white p-8 md:p-20"
            >
              <div className="w-24 h-24 md:w-32 md:h-32 border border-border-light flex items-center justify-center mb-8 md:mb-12 relative group">
                <div className="absolute inset-0 bg-brand-primary/5 group-hover:bg-brand-primary/10 transition-colors" />
                <Target className="w-10 h-10 md:w-12 md:h-12 text-brand-primary relative z-10" />
              </div>
              <h3 className="text-3xl md:text-4xl font-serif italic mb-4 md:mb-6 text-black">Ready for Strategic Assessment?</h3>
              <p className="text-black max-w-md mb-12 md:mb-16 font-serif leading-relaxed text-sm md:text-base">
                I'll conduct a high-stakes mock interview for your target role: {profile.careerGoal}. Focus on clarity, strategy, and confidence.
              </p>
              <button 
                onClick={startInterview}
                className="button-primary group flex items-center gap-4"
              >
                <Play className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" /> Initialize Simulation
              </button>
            </div>
          )}

          {mode === 'interview' && (
            <div 
              className="flex-1 flex flex-col lg:flex-row gap-8 md:gap-12"
            >
              {/* Simulation Hardware View */}
              <div className="lg:col-span-8 flex-1 flex flex-col card-standard bg-white text-text-main overflow-hidden relative border border-border-light shadow-sm">
                {/* Hardware UI Details */}
                <div className="absolute top-0 left-0 right-0 p-4 md:p-6 flex justify-between items-center border-b border-border-light bg-white/80 backdrop-blur-sm z-20">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 'bg-black'}`} />
                    <span className="text-[8px] md:text-[10px] font-mono tracking-widest uppercase text-black">
                      {isListening ? 'REC' : 'STANDBY'}
                    </span>
                  </div>
                  <div className="text-[8px] md:text-[10px] font-mono tracking-widest text-black">
                    {formatTime(timer)}
                  </div>
                </div>

                {/* Chat Area - Now only showing the latest question in a fixed bubble */}
                <div className="flex-1 flex flex-col justify-center py-8 md:py-12 px-4 md:px-12">
                  <div className="space-y-2">
                    <span className="text-[8px] md:text-[10px] font-mono uppercase tracking-[0.4em] text-black ml-4">Mentor</span>
                    <div className="card-standard bg-white border border-border-light rounded-2xl md:rounded-3xl p-6 md:p-12 shadow-sm h-[350px] md:h-[450px] overflow-y-auto scrollbar-thin scrollbar-thumb-border-light flex flex-col">
                      {messages.length > 0 && (
                        <div className="flex-1">
                          <div className="max-w-full space-y-6 md:space-y-8 text-left">
                            <div className="text-2xl md:text-4xl font-serif italic leading-tight text-black">
                              <div className="markdown-body text-black">
                                <ReactMarkdown>{messages[messages.length - 1].parts[0].text}</ReactMarkdown>
                              </div>
                            </div>
                            
                            {/* If user just answered, show it here too in the same bubble */}
                            {messages[messages.length - 1].role === 'user' && messages.length > 1 && (
                              <div className="pt-6 md:pt-8 border-t border-border-light">
                                <span className="text-[8px] md:text-[10px] font-mono text-black uppercase tracking-widest block mb-3 md:mb-4">Your Answer</span>
                                <p className="text-lg md:text-xl font-serif italic text-black leading-relaxed">
                                  {messages[messages.length - 1].parts[0].text}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      {isThinking && (
                        <div className="flex justify-start items-center gap-3 py-4">
                          <div className="flex gap-2">
                            <div className="w-1 h-1 bg-black rounded-full animate-bounce" />
                            <div className="w-1 h-1 bg-black rounded-full animate-bounce delay-100" />
                            <div className="w-1 h-1 bg-black rounded-full animate-bounce delay-200" />
                          </div>
                          <span className="text-xs font-serif italic text-black">Thinking...</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Control Panel */}
                <div className="p-6 md:p-12 border-t border-border-light bg-white/80 backdrop-blur-md flex flex-col gap-6 md:gap-8">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6 md:gap-8">
                    <div className="flex items-center gap-6 md:gap-8">
                      <button 
                        onClick={() => {
                          if (isListening) {
                            recognitionRef.current?.stop();
                            setIsListening(false);
                          } else {
                            if (audioRef.current) {
                              audioRef.current.pause();
                            }
                            // If the mentor is speaking, stop it so the mic is clean.
                            resetTts();
                            recognitionRef.current?.start();
                            setIsListening(true);
                          }
                        }}
                        className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center transition-all duration-500 relative group ${
                          isListening 
                            ? 'bg-red-500 text-white shadow-[0_0_30px_rgba(239,68,68,0.2)]' 
                            : 'bg-black text-white hover:scale-105 shadow-md'
                        }`}
                      >
                        {isListening ? <Square className="w-5 h-5 md:w-6 md:h-6 fill-current" /> : <Mic className="w-5 h-5 md:w-6 md:h-6" />}
                        <div className={`absolute -inset-2 border border-border-light rounded-full ${isListening ? 'animate-ping' : 'group-hover:border-black/20 transition-colors'}`} />
                      </button>
                      <div className="text-left space-y-1">
                        <p className="text-[8px] md:text-[10px] font-mono uppercase tracking-widest text-black">
                          {isListening ? 'audio' : 'Waiting for Input'}
                        </p>
                        <p className="text-lg md:text-xl font-serif italic text-black">
                          {isListening ? 'Listening...' : 'Click to respond'}
                        </p>
                      </div>
                    </div>

                    <div className="hidden sm:flex flex-col items-end gap-2">
                      <div className="flex gap-1">
                        {[...Array(12)].map((_, i) => (
                          <div 
                            key={i} 
                            className={`w-1 h-4 transition-all duration-300 ${
                              isListening 
                                ? 'bg-black animate-pulse' 
                                : 'bg-black'
                            }`}
                            style={{ animationDelay: `${i * 50}ms` }}
                          />
                        ))}
                      </div>
                      <span className="text-[8px] md:text-[10px] font-mono text-black uppercase tracking-widest">audio</span>
                    </div>
                  </div>

                  <div className="relative">
                    <input 
                      type="text"
                      placeholder="Type your answer..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const val = (e.target as HTMLInputElement).value;
                          if (val.trim()) {
                            handleAnswer(val);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }
                      }}
                      className="w-full py-3 md:py-4 px-4 md:px-6 bg-surface-bg border border-border-light rounded-xl md:rounded-2xl font-serif italic text-base md:text-lg focus:outline-none focus:border-brand-primary transition-all"
                    />
                    <button 
                      onClick={(e) => {
                        const input = e.currentTarget.previousSibling as HTMLInputElement;
                        if (input.value.trim()) {
                          handleAnswer(input.value);
                          input.value = '';
                        }
                      }}
                      className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 p-2 text-brand-primary hover:scale-110 transition-transform"
                    >
                      <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Side Context */}
              <div className="lg:w-64 space-y-8 md:space-y-12 hidden lg:block">
                <div className="space-y-4 md:space-y-6">
                  <div className="space-y-3 md:space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono text-black">STATUS</span>
                      <span className="text-[10px] font-mono text-black">ONLINE</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono text-black">LINK</span>
                      <span className="text-[10px] font-mono text-black">STABLE</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono text-black">ANALYSIS</span>
                      <span className="text-[10px] font-mono text-black">LAST AI ANALYSIS</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {mode === 'feedback' && (
            <div 
              className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12"
            >
              <div className="lg:col-span-8 space-y-6 md:space-y-8">
                <div className="card-standard bg-white p-6 md:p-12 space-y-8 md:space-y-12">
                  <div className="flex items-center gap-4 md:gap-6">
                    <div className="w-12 h-12 md:w-16 md:h-16 border border-border-light flex items-center justify-center text-black">
                      <Award className="w-6 h-6 md:w-8 md:h-8" />
                    </div>
                    <div>
                      <h3 className="text-3xl md:text-4xl font-serif italic text-black">Post-Simulation Analysis</h3>
                      <p className="text-black font-serif text-sm md:text-base">Strategic performance evaluation</p>
                    </div>
                  </div>
                  
                  <div className="markdown-body font-serif text-base md:text-lg leading-relaxed border-t border-border-light pt-8 md:pt-12 text-black">
                    <ReactMarkdown>{feedback}</ReactMarkdown>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 space-y-6 md:space-y-8">
                <div className="card-standard p-8 md:p-10 bg-white border border-border-light text-black space-y-8 md:space-y-10">
                  <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-black">Strategic Score</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-6xl md:text-7xl font-serif italic text-black">
                      {feedback.match(/(\d+)\/10/)?.[1] || '8'}
                    </span>
                    <span className="text-xl md:text-2xl font-serif text-black">/10</span>
                  </div>
                  <p className="text-xs text-black font-serif italic leading-relaxed">
                    "Your performance indicates a strong alignment with the strategic requirements of this role."
                  </p>
                </div>

                <div className="space-y-4">
                  <button 
                    onClick={() => setMode('start')}
                    className="w-full button-secondary py-3"
                  >
                    New Simulation
                  </button>
                  <button 
                    onClick={onBack}
                    className="w-full button-primary py-3"
                  >
                    Return to Dashboard
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
