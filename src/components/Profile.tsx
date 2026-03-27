import { useState } from 'react';
import { UserProfile } from '../types';
import { User, GraduationCap, Briefcase, Heart, Target, Save, ArrowLeft, CheckCircle2, Sparkles, MessageSquare } from 'lucide-react';

interface ProfileProps {
  profile: UserProfile;
  onUpdate: (profile: UserProfile) => boolean;
  onBack: () => void;
}

export default function Profile({ profile, onUpdate, onBack }: ProfileProps) {
  const [formData, setFormData] = useState<UserProfile>({ ...profile });
  const [isSaved, setIsSaved] = useState(false);

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = onUpdate(formData);
    if (success) {
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    }
  };

  const commonInterests = ['Technology', 'Finance', 'Healthcare', 'Creative Arts', 'Business Strategy', 'Data Science', 'Education', 'Marketing', 'Engineering', 'Public Service'];

  return (
    <div className="h-full overflow-y-auto bg-surface-bg">
      <div className="max-w-5xl mx-auto px-8 py-16">
        {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div className="flex items-center gap-6">
              <button onClick={onBack} className="w-12 h-12 flex items-center justify-center border border-border-light hover:border-brand-primary transition-all group">
                <ArrowLeft className="w-5 h-5 text-text-muted group-hover:text-brand-primary" />
              </button>
              <div>
                <div className="text-[10px] uppercase tracking-[0.3em] font-bold text-brand-primary mb-2">The Identity</div>
                <h2 className="text-5xl font-serif italic tracking-tight text-text-main">Professional Profile</h2>
              </div>
            </div>

            <div className="flex flex-col items-end gap-4">
              {isSaved && (
                <div 
                  className="flex items-center gap-2 text-brand-primary font-serif italic"
                >
                  <CheckCircle2 className="w-4 h-4" /> Profile updated successfully!
                </div>
              )}
            </div>
          </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Personal & Background */}
          <div className="lg:col-span-7 space-y-12">
            <section>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-8 h-[1px] bg-brand-primary/30" />
                <h3 className="text-[10px] uppercase tracking-widest font-bold text-text-muted">Personal Information</h3>
              </div>
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-text-muted mb-3">Full Name</label>
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-transparent border-b border-border-light py-4 focus:border-brand-primary outline-none transition-all text-xl font-serif italic"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-text-muted mb-3">Current Age</label>
                    <input 
                      type="number" 
                      value={formData.age || ''}
                      onChange={e => setFormData({ ...formData, age: parseInt(e.target.value) })}
                      className="w-full bg-transparent border-b border-border-light py-4 focus:border-brand-primary outline-none transition-all text-xl font-serif italic"
                    />
                  </div>
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-8 h-[1px] bg-brand-primary/30" />
                <h3 className="text-[10px] uppercase tracking-widest font-bold text-text-muted">Academic & Professional Background</h3>
              </div>
              <div className="space-y-8">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-text-muted mb-3">Highest Education</label>
                  <input 
                    type="text" 
                    value={formData.education}
                    onChange={e => setFormData({ ...formData, education: e.target.value })}
                    className="w-full bg-transparent border-b border-border-light py-4 focus:border-brand-primary outline-none transition-all text-lg font-serif italic"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-text-muted mb-3">Professional Experience Summary</label>
                  <textarea 
                    value={formData.experience}
                    onChange={e => setFormData({ ...formData, experience: e.target.value })}
                    className="w-full bg-white border border-border-light p-6 focus:border-brand-primary outline-none transition-all h-48 resize-none font-serif italic text-lg"
                  />
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Interests & Goals */}
          <div className="lg:col-span-5 space-y-12">

            <section className="card-standard p-8 bg-white">
              <div className="flex items-center gap-4 mb-8">
                <h3 className="text-[10px] uppercase tracking-widest font-bold text-text-muted">Core Interest Areas</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {commonInterests.map(interest => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => handleInterestToggle(interest)}
                    className={`p-4 border transition-all text-left flex items-center justify-between group ${
                      formData.interests.includes(interest)
                        ? 'border-brand-primary bg-brand-primary/5 text-brand-primary'
                        : 'border-border-light text-text-muted hover:border-brand-primary/30'
                    }`}
                  >
                    <span className="font-serif italic text-sm">{interest}</span>
                    {formData.interests.includes(interest) && <CheckCircle2 className="w-3 h-3" />}
                  </button>
                ))}
              </div>
            </section>

            <section className="card-standard p-8 bg-white">
              <div className="flex items-center gap-4 mb-8">
                <h3 className="text-[10px] uppercase tracking-widest font-bold text-text-muted">Strategic Career</h3>
              </div>
              <div className="space-y-8">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-text-muted mb-3">Target Career or Objective</label>
                  <input 
                    type="text" 
                    value={formData.careerGoal}
                    onChange={e => setFormData({ ...formData, careerGoal: e.target.value })}
                    className="w-full bg-transparent border-b border-border-light py-4 focus:border-brand-primary outline-none transition-all text-lg font-serif italic"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-text-muted mb-3">Primary Skills (Comma Separated)</label>
                  <input 
                    type="text" 
                    value={formData.skills.join(', ')}
                    onChange={e => setFormData({ ...formData, skills: e.target.value.split(',').map(s => s.trim()) })}
                    className="w-full bg-transparent border-b border-border-light py-4 focus:border-brand-primary outline-none transition-all text-lg font-serif italic"
                  />
                </div>
              </div>
            </section>

            <div className="flex gap-4 pt-8">
              <button 
                type="button"
                onClick={onBack}
                className="flex-1 button-secondary"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="flex-[2] button-primary flex items-center justify-center gap-3"
              >
                <div className="flex items-center gap-3">
                  <Save className="w-4 h-4" /> Save Changes
                </div>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
