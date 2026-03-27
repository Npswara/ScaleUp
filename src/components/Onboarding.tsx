import { useState } from 'react';
import { UserProfile } from '../types';
import { ArrowRight, ArrowLeft, User, GraduationCap, Briefcase, Heart, Target, CheckCircle2, Sparkles, Languages, BrainCircuit } from 'lucide-react';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
  onBack: () => void;
}

export default function Onboarding({ onComplete, onBack }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<UserProfile>({
    name: '',
    age: 0,
    education: '',
    experience: '',
    interests: [],
    careerGoal: '',
    skills: [],
    currentSkills: '',
    missingSkills: '',
    careerChallenge: '',
  });

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const commonInterests = ['Technology', 'Finance', 'Healthcare', 'Creative Arts', 'Business Strategy', 'Data Science', 'Education', 'Marketing', 'Engineering', 'Public Service'];

  return (
    <div className="min-h-screen bg-surface-bg flex flex-col lg:flex-row overflow-hidden relative">
      {/* Left Side: Narrative/Context */}
      <div className="lg:w-1/3 bg-brand-primary p-12 lg:p-20 flex flex-col justify-between text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="text-[10px] uppercase tracking-[0.3em] font-bold mb-8 text-white">The Beginning</div>
          <h1 className="text-5xl lg:text-7xl font-serif italic leading-tight mb-8">
            Setting the <br />
            <span className="text-brand-secondary">Compass.</span>
          </h1>
          <p className="text-lg text-white max-w-xs leading-relaxed font-light">
            Before we begin the journey, we must understand the traveler. Your path is unique; your tools should be too.
          </p>
        </div>

        <div className="relative z-10 mt-20 lg:mt-0">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-[1px] bg-white" />
            <span className="text-[10px] uppercase tracking-widest font-bold text-white">Step {step + 1} of 4</span>
          </div>
          <div className="flex gap-1">
            {[0, 1, 2, 3].map(i => (
              <div 
                key={i} 
                className={`h-1 transition-all duration-500 ${step >= i ? 'w-8 bg-brand-secondary' : 'w-2 bg-white/20'}`}
              />
            ))}
          </div>
        </div>

        {/* Decorative Vertical Text */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 vertical-text text-[80px] font-serif text-white/5 pointer-events-none select-none">
          ORIENTATION
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="flex-1 p-8 lg:p-24 flex items-center justify-center overflow-y-auto scrollbar-thin scrollbar-thumb-border-light scrollbar-track-transparent">
        <div className="max-w-xl w-full">
          {step === 0 && (
            <div>
              <div className="mb-12">
                <h2 className="text-4xl font-serif mb-4 italic text-black">Personal Information</h2>
                <p className="text-black/60">Let's start with the basics. Who is embarking on this journey?</p>
              </div>
              <div className="space-y-8">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-black/60 mb-3">Full Name</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-transparent border-b border-border-light py-4 focus:border-brand-primary outline-none transition-all text-2xl font-serif italic text-black"
                    placeholder="e.g., John Doe"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-black/60 mb-3">Age</label>
                  <input 
                    type="number" 
                    value={formData.age || ''}
                    onChange={e => setFormData({ ...formData, age: parseInt(e.target.value) })}
                    className="w-full bg-transparent border-b border-border-light py-4 focus:border-brand-primary outline-none transition-all text-2xl font-serif italic text-black"
                    placeholder="Your age"
                  />
                </div>
              </div>
              <div className="flex gap-8 mt-16">
                <button 
                  onClick={onBack}
                  className="text-[10px] uppercase tracking-widest font-bold text-text-muted hover:text-text-main transition-all flex items-center gap-2"
                >
                  <ArrowLeft className="w-3 h-3" /> Back
                </button>
                <button 
                  onClick={nextStep}
                  disabled={!formData.name || !formData.age}
                  className="button-primary disabled:opacity-30"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <div className="mb-12">
                <h2 className="text-4xl font-serif mb-4 italic text-black">Background</h2>
                <p className="text-black/60">Your history informs your future. Where have you been?</p>
              </div>
              <div className="space-y-8">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-black/60 mb-3">Education</label>
                  <input 
                    type="text" 
                    value={formData.education}
                    onChange={e => setFormData({ ...formData, education: e.target.value })}
                    className="w-full bg-transparent border-b border-border-light py-4 focus:border-brand-primary outline-none transition-all text-xl font-serif italic text-black"
                    placeholder="e.g., B.S. in Computer Science"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-black/60 mb-3">Experience</label>
                  <textarea 
                    value={formData.experience}
                    onChange={e => setFormData({ ...formData, experience: e.target.value })}
                    className="w-full bg-transparent border border-border-light p-6 focus:border-brand-primary outline-none transition-all h-40 resize-none font-serif italic text-lg text-black"
                    placeholder="Briefly describe your professional journey..."
                  />
                </div>
              </div>
              <div className="flex gap-8 mt-16">
                <button 
                  onClick={prevStep}
                  className="text-[10px] uppercase tracking-widest font-bold text-text-muted hover:text-text-main transition-all flex items-center gap-2"
                >
                  <ArrowLeft className="w-3 h-3" /> Back
                </button>
                <button 
                  onClick={nextStep}
                  disabled={!formData.education.trim() || !formData.experience.trim()}
                  className="button-primary disabled:opacity-30"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="mb-12">
                <h2 className="text-4xl font-serif mb-4 italic text-black">Interests</h2>
                <p className="text-black/60">What makes your heart beat faster? Select the domains that call to you.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {commonInterests.map(interest => (
                  <button
                    key={interest}
                    onClick={() => handleInterestToggle(interest)}
                    className={`p-6 border transition-all text-left flex items-center justify-between group ${
                      formData.interests.includes(interest)
                        ? 'border-brand-primary bg-white text-brand-primary'
                        : 'border-border-light text-black/60 hover:border-brand-primary/30'
                    }`}
                  >
                    <span className="font-serif text-lg italic">{interest}</span>
                    {formData.interests.includes(interest) && <CheckCircle2 className="w-4 h-4" />}
                  </button>
                ))}
              </div>
              <div className="flex gap-8 mt-16">
                <button 
                  onClick={prevStep}
                  className="text-[10px] uppercase tracking-widest font-bold text-text-muted hover:text-text-main transition-all flex items-center gap-2"
                >
                  <ArrowLeft className="w-3 h-3" /> Back
                </button>
                <button 
                  onClick={nextStep}
                  disabled={formData.interests.length === 0}
                  className="button-primary disabled:opacity-30"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <div className="mb-12">
                <h2 className="text-4xl font-serif mb-4 italic text-black">Career Goals</h2>
                <p className="text-black/60">Where do you want to be in the next decade?</p>
              </div>
              <div className="space-y-8">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-black/60 mb-3">Career Goal</label>
                  <input 
                    type="text" 
                    value={formData.careerGoal}
                    onChange={e => setFormData({ ...formData, careerGoal: e.target.value })}
                    className="w-full bg-transparent border-b border-border-light py-4 focus:border-brand-primary outline-none transition-all text-2xl font-serif italic text-black"
                    placeholder="e.g., Senior Software Architect"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-black/60 mb-3">Skills</label>
                  <input 
                    type="text" 
                    value={formData.skills.join(', ')}
                    onChange={e => setFormData({ ...formData, skills: e.target.value.split(',').map(s => s.trim()) })}
                    className="w-full bg-transparent border-b border-border-light py-4 focus:border-brand-primary outline-none transition-all text-xl font-serif italic text-black"
                    placeholder="e.g., React, Node.js, Python"
                  />
                </div>
              </div>
              <div className="flex gap-8 mt-16">
                <button 
                  onClick={prevStep}
                  className="text-[10px] uppercase tracking-widest font-bold text-text-muted hover:text-text-main transition-all flex items-center gap-2"
                >
                  <ArrowLeft className="w-3 h-3" /> Back
                </button>
                <button 
                  onClick={() => onComplete(formData)}
                  disabled={!formData.careerGoal.trim() || formData.skills.filter(s => s.trim() !== '').length === 0}
                  className="button-primary disabled:opacity-30"
                >
                  Complete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
