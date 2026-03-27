import { useState } from 'react';
import { UserProfile } from '../types';
import { analyzeLinkedInProfile } from '../services/gemini';
import { ArrowLeft, Linkedin, Sparkles, CheckCircle2, AlertCircle, RefreshCw, Zap, Target, Search, Link as LinkIcon, ShieldCheck } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface LinkedInReviewProps {
  profile: UserProfile;
  onBack: () => void;
  onUpdateProfile: (profile: UserProfile) => void;
}

export default function LinkedInReview({ profile, onBack, onUpdateProfile }: LinkedInReviewProps) {
  const [cvUrl, setCvUrl] = useState('');
  const [review, setReview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [selectedFocusAreas, setSelectedFocusAreas] = useState<string[]>([]);

  const focusAreas = [
    { id: 'headline', label: "Headline & Summary", icon: Sparkles },
    { id: 'experience', label: "Experience Impact", icon: Target },
    { id: 'skills', label: "Skills & Endorsements", icon: Zap },
    { id: 'networking', label: "Networking Strategy", icon: Linkedin },
    { id: 'searchability', label: "SEO & Searchability", icon: Search },
  ];

  const toggleFocusArea = (id: string) => {
    setSelectedFocusAreas(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const handleReview = async () => {
    if (!cvUrl.trim()) return;

    setLoading(true);
    
    try {
      const response = await analyzeLinkedInProfile(cvUrl, profile, { 
        language: 'en',
        focusAreas: selectedFocusAreas 
      });
      setReview(response);
    } catch (error) {
      console.error("LinkedIn Review error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-surface-bg selection:bg-brand-primary selection:text-white">
      <div className="max-w-7xl mx-auto px-8 py-10 pb-32">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-12">
          <div className="flex items-start gap-8">
            <button 
              onClick={onBack} 
              className="p-4 border border-border-light hover:border-text-main transition-all text-text-muted hover:text-text-main bg-white"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-brand-secondary font-bold text-[10px] uppercase tracking-[0.4em]">
                <Search className="w-4 h-4" /> CV Audit Engine
              </div>
              <h2 className="text-5xl md:text-7xl font-serif leading-none tracking-tighter">
                The <span className="italic">Mirror.</span>
              </h2>
              <p className="text-text-muted font-serif italic text-xl max-w-md">Strategic resume optimization for high-stakes roles.</p>
            </div>
          </div>
          <div className="hidden lg:flex items-center gap-4">
            <div className="flex flex-col items-end gap-1">
              <span className="text-[10px] font-mono text-brand-secondary uppercase tracking-widest">Operational</span>
            </div>
            <div className="w-px h-10 bg-border-light" />
            <ShieldCheck className="w-6 h-6 text-brand-primary opacity-20" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Input Area */}
          <div className="lg:col-span-5 space-y-12">
            <div className="card-standard p-12 bg-white space-y-12">
              <div className="space-y-4">
                <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-text-muted">Document Source</h3>
                <p className="text-2xl font-serif italic leading-tight text-text-main">Paste your LinkedIn profile URL below for a strategic audit.</p>
              </div>
              
              <div className="space-y-12">
                <div className="relative group">
                  <input 
                    type="url"
                    value={cvUrl}
                    onChange={e => setCvUrl(e.target.value)}
                    className="w-full bg-transparent border-b border-border-light py-4 pr-12 focus:border-text-main outline-none transition-all font-serif italic text-xl text-text-main placeholder:text-text-muted/30"
                    placeholder="https://linkedin.com/in/username"
                  />
                  <LinkIcon className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-text-main transition-colors" />
                </div>

                {/* Focus Areas Selection */}
                <div className="space-y-6">
                  <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-text-muted">Strategic Focus Areas</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {focusAreas.map((area) => (
                      <button
                        key={area.id}
                        onClick={() => toggleFocusArea(area.id)}
                        className={`flex items-center gap-4 p-4 border transition-all text-left ${
                          selectedFocusAreas.includes(area.id)
                            ? 'border-text-main bg-surface-bg'
                            : 'border-border-light hover:border-text-main/30'
                        }`}
                      >
                        <div className={`w-8 h-8 flex items-center justify-center border ${
                          selectedFocusAreas.includes(area.id)
                            ? 'border-text-main bg-text-main text-white'
                            : 'border-border-light text-text-muted'
                        }`}>
                          <area.icon className="w-4 h-4" />
                        </div>
                        <span className={`text-sm font-serif italic ${
                          selectedFocusAreas.includes(area.id) ? 'text-text-main' : 'text-text-muted'
                        }`}>
                          {area.label}
                        </span>
                        {selectedFocusAreas.includes(area.id) && (
                          <CheckCircle2 className="w-4 h-4 ml-auto text-brand-secondary" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="p-8 bg-surface-bg border border-border-light space-y-4">
                  <div className="flex items-center gap-2 text-[10px] text-brand-secondary font-bold uppercase tracking-widest">
                    <AlertCircle className="w-4 h-4" /> Note
                  </div>
                  <p className="text-sm text-text-muted leading-relaxed font-serif italic opacity-70">
                    Ensure the profile is set to <b className="text-text-main">Public</b> so the AI can analyze the content effectively.
                  </p>
                </div>
              </div>
              
              <button 
                onClick={handleReview}
                disabled={loading || !cvUrl.trim()}
                className="w-full button-primary flex items-center justify-center gap-4"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 fill-current" />}
                {loading ? "Analyzing..." : "Analyze Profile"}
              </button>
            </div>

            <div className="hidden lg:block space-y-8">
              <div className="flex items-center gap-4 text-text-muted">
                <div className="w-px h-12 bg-border-light" />
                <p className="text-[10px] uppercase tracking-[0.3em] font-bold">Audit Protocol</p>
              </div>
              <div className="vertical-text text-[10px] uppercase tracking-[0.5em] text-text-muted/30 font-bold h-64 flex justify-between">
                <span>EST. 2026</span>
                <span>SCALEUP AI</span>
                <span>ASSET OPTIMIZATION</span>
              </div>
            </div>
          </div>

          {/* Review Area */}
          <div className="lg:col-span-7">
            {review ? (
              <div 
                className="card-standard p-12 bg-white space-y-12 h-full flex flex-col"
              >
                <div className="flex items-center justify-between border-b border-border-light pb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 border border-border-light flex items-center justify-center text-brand-secondary">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h3 className="text-3xl font-serif italic">Strategic Verdict</h3>
                  </div>
                  <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest">Analysis Complete</span>
                </div>
                
                <div className="markdown-body font-serif text-lg leading-relaxed flex-1 overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-border-light scrollbar-track-transparent">
                  <ReactMarkdown>{review}</ReactMarkdown>
                </div>
                
                <div className="pt-8 border-t border-border-light flex items-start gap-4">
                  <AlertCircle className="w-5 h-5 text-brand-secondary flex-shrink-0 mt-0.5" />
                  <p className="text-[10px] text-text-muted leading-relaxed font-bold uppercase tracking-[0.2em]">
                    This analysis is AI-generated and should be used as strategic guidance.
                  </p>
                </div>
              </div>
            ) : (
              <div className="card-standard p-20 bg-white border-dashed border border-border-light h-full flex flex-col items-center justify-center text-center space-y-8">
                <div className="w-24 h-24 border border-border-light flex items-center justify-center relative group">
                  <div className="absolute inset-0 bg-surface-bg group-hover:bg-brand-primary/5 transition-colors" />
                  <Linkedin className="w-10 h-10 text-text-muted relative z-10" />
                </div>
                <div className="space-y-4">
                  <h3 className="text-3xl font-serif italic text-text-main">Awaiting Profile Data</h3>
                  <p className="text-text-muted max-w-xs font-serif opacity-70 leading-relaxed">Paste your LinkedIn URL to receive a strategic audit and optimization roadmap.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
