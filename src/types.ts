export interface UserProfile {
  name: string;
  email?: string;
  age: number;
  education: string;
  experience: string;
  interests: string[];
  careerGoal: string;
  skills: string[];
  currentSkills?: string;
  missingSkills?: string;
  careerChallenge?: string;
  reflectionSummary?: string;
}

export interface CareerRecommendation {
  title: string;
  reason: string;
  matchPercentage: number;
  salaryRange: string;
}

export interface RoadmapStep {
  title: string;
  description: string;
  timeline: string;
  completed: boolean;
  link?: string;
  courseraLink?: string;
}

export interface Roadmap {
  careerTitle: string;
  salary: string;
  monthlySalary: string;
  salaryGrowth: string;
  marketOutlook: string;
  marketDemand: 'High' | 'Medium' | 'Low';
  strategicFit: number;
  strategicAdvice: string;
  learningMaterials: string[];
  certifications: { name: string; link?: string }[];
  skills: { name: string; level: number; courseraLink?: string }[];
  steps: RoadmapStep[];
}

export interface SkillGap {
  skill: string;
  status: 'missing' | 'basic' | 'proficient';
  priority: 'high' | 'medium' | 'low';
}

export interface ResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    summary: string;
    links: { label: string; url: string }[];
  };
  experience: {
    company: string;
    position: string;
    duration: string;
    description: string;
  }[];
  education: {
    school: string;
    degree: string;
    year: string;
    gpa?: string;
  }[];
  projects: {
    name: string;
    description: string;
    link?: string;
  }[];
  certifications: {
    name: string;
    issuer: string;
    year: string;
  }[];
  languages: {
    language: string;
    proficiency: string;
  }[];
  awards: {
    title: string;
    issuer: string;
    year: string;
  }[];
  organizations: {
    name: string;
    role: string;
    duration: string;
    description: string;
  }[];
  skills: string[];
}
