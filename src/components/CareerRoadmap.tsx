import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, Roadmap } from '../types';
import { generateRoadmap } from '../services/gemini';
import { checkAndResetUsage, isUsageExceeded, SOFT_LIMIT } from '../lib/usage';
import { ArrowLeft, CheckCircle2, Circle, Loader2, Youtube, ExternalLink, RefreshCw, Briefcase, Settings2, Eye, AlertCircle, Check, X } from 'lucide-react';

interface CareerRoadmapProps {
  profile: UserProfile;
  onBack: () => void;
  onUpdateProfile: (profile: UserProfile) => void;
}

export default function CareerRoadmap({ profile, onBack, onUpdateProfile }: CareerRoadmapProps) {
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [tempSkills, setTempSkills] = useState<{ name: string; level: number; courseraLink?: string }[]>([]);

  useEffect(() => {
    if (roadmap) {
      setTempSkills(roadmap.skills);
    }
  }, [roadmap]);

  const handleSaveSkills = () => {
    if (!roadmap) return;
    const updatedRoadmap = { ...roadmap, skills: tempSkills };
    setRoadmap(updatedRoadmap);
    localStorage.setItem(`roadmap_${profile.careerGoal}`, JSON.stringify(updatedRoadmap));
    setShowSkillModal(false);
  };

  useEffect(() => {
    const fetchRoadmap = async (force = false) => {
      if (!force) {
        const savedRoadmap = localStorage.getItem(`roadmap_${profile.careerGoal}`);
        if (savedRoadmap) {
          try {
            const parsed = JSON.parse(savedRoadmap);
            // Check if it has links (new schema)
            const hasStepLinks = parsed.steps && parsed.steps.some((s: any) => s.link);
            const hasCourseraLinks = parsed.steps && parsed.steps.some((s: any) => s.courseraLink);
            const hasCertLinks = parsed.certifications && parsed.certifications.some((c: any) => typeof c === 'object' && c.link);
            
            if (hasStepLinks && hasCertLinks && hasCourseraLinks) {
              setRoadmap(parsed);
              setLoading(false);
              return;
            }
          } catch (e) {
            console.error("Error parsing saved roadmap:", e);
          }
        }
      }

      setLoading(true);
      try {
        const res = await generateRoadmap(profile.careerGoal, profile);
        setRoadmap(res);
        localStorage.setItem(`roadmap_${profile.careerGoal}`, JSON.stringify(res));
      } catch (error) {
        console.error("Error generating roadmap:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRoadmap();
  }, [profile]);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const res = await generateRoadmap(profile.careerGoal, profile);
      setRoadmap(res);
      localStorage.setItem(`roadmap_${profile.careerGoal}`, JSON.stringify(res));
      
      onUpdateProfile(profile);
    } catch (error) {
      console.error("Error regenerating roadmap:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleStep = (index: number) => {
    if (!roadmap) return;
    const newSteps = [...roadmap.steps];
    newSteps[index].completed = !newSteps[index].completed;
    const updatedRoadmap = { ...roadmap, steps: newSteps };
    setRoadmap(updatedRoadmap);
    localStorage.setItem(`roadmap_${profile.careerGoal}`, JSON.stringify(updatedRoadmap));
  };

  const handleRefreshVideo = async (index: number) => {
    if (!roadmap) return;
    const step = roadmap.steps[index];
    const videoIdMatch = step.link?.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([\w-]{11})/);
    const currentVideoId = videoIdMatch ? videoIdMatch[1] : '';
    
    try {
      // Use a more focused search query: title + career goal
      const searchQuery = `${step.title} ${roadmap.careerTitle} full tutorial`;
      const response = await fetch(`/api/youtube/search?q=${encodeURIComponent(searchQuery)}&exclude=${currentVideoId}`);
      
      if (response.ok) {
        const data = await response.json();
        const newSteps = [...roadmap.steps];
        newSteps[index] = { ...step, link: data.url };
        const updatedRoadmap = { ...roadmap, steps: newSteps };
        setRoadmap(updatedRoadmap);
        localStorage.setItem(`roadmap_${profile.careerGoal}`, JSON.stringify(updatedRoadmap));
      }
    } catch (error) {
      console.error("Error refreshing video:", error);
    }
  };

  const completedCount = roadmap?.steps.filter(s => s.completed).length || 0;
  const progressPercent = roadmap ? Math.round((completedCount / roadmap.steps.length) * 100) : 0;

  const getYoutubeEmbedUrl = (url: string) => {
    if (!url) return null;
    // Handle various YouTube URL formats
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    const videoId = (match && match[2].length === 11) ? match[2] : null;
    
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
    
    // Fallback for direct IDs if the AI just returns the ID
    if (url.length === 11 && !url.includes('/') && !url.includes('.')) {
      return `https://www.youtube.com/embed/${url}`;
    }
    
    return null;
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 bg-surface-bg">
        <div className="relative">
          <Loader2 className="w-12 h-12 text-brand-primary animate-spin" />
          <div className="absolute inset-0 blur-xl bg-brand-primary/20 animate-pulse" />
        </div>
        <h3 className="mt-6 text-2xl font-serif italic text-black">Architecting Your Path</h3>
        <p className="mt-2 text-black/60 text-center max-w-xs font-serif opacity-70">Our system is analyzing market trends and your profile to build a strategic roadmap.</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-surface-bg selection:bg-brand-primary selection:text-white">
      <div className="max-w-5xl mx-auto px-8 py-10 pb-32">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-12">
          <div className="flex items-start gap-8">
            <button 
              onClick={onBack} 
              className="p-4 border border-border-light hover:border-black transition-all text-black/60 hover:text-black bg-white"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-brand-secondary font-bold text-[10px] uppercase tracking-[0.4em]">
                Strategic Trajectory
              </div>
              <h2 className="text-5xl md:text-7xl font-serif leading-none tracking-tighter text-black">
                The <span className="italic">Compass</span>
              </h2>
              <p className="text-black/60 font-serif italic text-xl max-w-md">{profile.careerGoal}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => window.open(`https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(profile.careerGoal)}`, '_blank')}
              className="flex items-center gap-2 px-6 py-4 bg-brand-primary text-white hover:bg-black transition-all text-[10px] font-bold uppercase tracking-widest"
            >
              <Briefcase className="w-4 h-4" />
              Find Job
            </button>
            <button 
              onClick={handleRefresh}
              className="flex items-center gap-2 px-6 py-4 border border-border-light hover:border-black transition-all text-[10px] font-bold uppercase tracking-widest bg-white"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Regenerate Roadmap
            </button>
          </div>
        </div>

        {roadmap ? (
          <div className={`grid grid-cols-1 lg:grid-cols-12 gap-12`}>
            {/* Sidebar: Progress & Context */}
            <div className="lg:col-span-4 space-y-12">
                <div className="card-standard p-10 bg-white text-black space-y-10">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-black/40 flex items-center gap-2">
                      Dash Status
                    </h3>
                    <span className="text-[10px] font-mono text-brand-primary">
                      {completedCount}/{roadmap.steps.length}
                    </span>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="h-px bg-black/10 w-full relative">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 1.5, ease: "circOut" }}
                        className="h-px bg-brand-primary absolute left-0 top-0"
                      />
                    </div>
                    <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold text-black/60">
                      <span>Alignment</span>
                      <span>{progressPercent}%</span>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-black/10 space-y-8">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <p className="text-[7px] uppercase tracking-[0.3em] font-bold text-black/40 flex items-center gap-1.5">
                          Annual
                        </p>
                        <p className="text-sm font-serif italic text-brand-primary">{roadmap.salary}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[7px] uppercase tracking-[0.3em] font-bold text-black/40 flex items-center gap-1.5">
                          Monthly
                        </p>
                        <p className="text-sm font-serif italic text-brand-primary">{roadmap.monthlySalary}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[7px] uppercase tracking-[0.3em] font-bold text-black/40">Salary Growth</p>
                      <p className="text-[10px] font-serif text-black/60 leading-relaxed">{roadmap.salaryGrowth}</p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-[7px] uppercase tracking-[0.3em] font-bold text-black/40">Strategic Fit</p>
                        <span className="text-[10px] font-mono text-brand-primary">{roadmap.strategicFit}%</span>
                      </div>
                      <div className="h-1 bg-black/5 w-full rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${roadmap.strategicFit}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className="h-full bg-brand-primary"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-[7px] uppercase tracking-[0.3em] font-bold text-black/40">Market Demand</p>
                        <span className={`text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-sm ${
                          roadmap.marketDemand === 'High' ? 'bg-emerald-500/20 text-emerald-600' :
                          roadmap.marketDemand === 'Medium' ? 'bg-amber-500/20 text-amber-600' :
                          'bg-rose-500/20 text-rose-600'
                        }`}>
                          {roadmap.marketDemand}
                        </span>
                      </div>
                      <p className="text-[10px] font-serif text-black/60 leading-relaxed">{roadmap.marketOutlook}</p>
                    </div>
                  </div>

                  <p className="text-[10px] text-black/40 font-serif italic leading-relaxed pt-4 border-t border-black/5">
                    "Strategy is not a solo sport, even when you're the only one on the field."
                  </p>
                </div>

                <div className="card-standard p-10 bg-white border border-border-light space-y-12 relative overflow-hidden">
                  <div className="space-y-8 relative z-10">
                    <div className="flex items-center gap-3">
                      <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-black/60">Learning Path</h3>
                    </div>
                    <ul className="space-y-5">
                      {roadmap.learningMaterials.map((item, i) => (
                        <li key={i} className="flex items-start gap-4 text-sm font-serif text-black group cursor-default">
                          <span className="text-[9px] font-mono text-black/40 mt-1">0{i+1}</span>
                          <span className="group-hover:text-brand-primary transition-colors">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-8 pt-10 border-t border-border-light relative z-10">
                    <div className="flex items-center gap-3">
                      <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-black/60">Certifications</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      {roadmap.certifications.map((cert, i) => {
                        const name = typeof cert === 'string' ? cert : cert.name;
                        const link = typeof cert === 'string' ? null : cert.link;
                        
                        return (
                          <div key={i} className="p-4 bg-surface-bg border border-border-light hover:border-brand-primary transition-all group relative">
                            <p className="text-xs font-bold text-black group-hover:text-brand-primary transition-colors pr-8">
                              {name}
                            </p>
                            {link && (
                              <a 
                                href={link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-black/40 hover:text-brand-primary transition-colors"
                                title="Get Certification"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-6 pt-10 border-t border-border-light relative z-10">
                    <div className="flex items-center gap-3">
                      <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-black/60">Strategic Advice</h3>
                    </div>
                    <div className="p-6 bg-surface-bg border-l-2 border-brand-secondary italic max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-border-light scrollbar-track-transparent pr-2">
                      <p className="text-sm font-serif text-black/60 leading-relaxed">
                        {roadmap.strategicAdvice}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="hidden lg:block space-y-8">
                  <div className="flex items-center gap-4 text-black/60">
                    <div className="w-px h-12 bg-border-light" />
                    <p className="text-[10px] uppercase tracking-[0.3em] font-bold">Strategic Path</p>
                  </div>
                  <div className="vertical-text text-[10px] uppercase tracking-[0.5em] text-black/30 font-bold h-64 flex justify-between">
                    <span>EST. 2026</span>
                    <span>SCALEUP</span>
                    <span>CAREER INTELLIGENCE</span>
                  </div>
                </div>
              </div>

            {/* Main Content: Steps */}
            <div className={`lg:col-span-8 space-y-12`}>
              <div className="card-standard p-10 bg-white border border-border-light space-y-10">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-serif text-black">Required Competencies</h2>
                    <p className="text-xs text-black/60 font-serif italic">Target proficiency levels for success</p>
                  </div>
                  <button 
                    onClick={() => setShowSkillModal(true)}
                    className="flex items-center gap-2 px-4 py-2 border border-border-light hover:border-black transition-all text-[10px] font-bold uppercase tracking-widest bg-white"
                  >
                    <Settings2 className="w-4 h-4" />
                    Skill Alignment
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                  {roadmap.skills.map((skill, i) => (
                    <div key={i} className="space-y-3">
                      <div className="flex justify-between items-end">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-serif text-black">{skill.name}</span>
                          {skill.courseraLink && (
                            <a 
                              href={skill.courseraLink} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-brand-primary hover:text-black transition-colors"
                              title="Learn on Coursera"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-black/60">{skill.level}%</span>
                      </div>
                      <div className="h-1 bg-surface-bg w-full rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${skill.level}%` }}
                          transition={{ duration: 1, delay: i * 0.1 }}
                          className="h-full bg-brand-primary"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-12">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-px flex-1 bg-border-light" />
                    <h2 className="text-[10px] uppercase tracking-[0.4em] font-bold text-black/60">The Roadmap</h2>
                    <div className="h-px flex-1 bg-border-light" />
                  </div>
                  <p className="text-center text-xl md:text-2xl font-serif italic text-black/60 max-w-2xl mx-auto leading-relaxed">
                    "Don't lie to yourself, we only help you to achieve your career"
                  </p>
                </div>

                <div className="space-y-8">
                  {roadmap.steps.map((step, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`card-standard p-10 flex flex-col sm:flex-row gap-10 transition-all duration-500 relative overflow-hidden ${
                    step.completed 
                      ? 'bg-white border-brand-secondary/30' 
                      : 'bg-white'
                  }`}
                >
                  {step.completed && (
                    <div className="absolute top-0 right-0 p-4">
                    </div>
                  )}

                  <div className="flex flex-col items-center gap-4">
                    <span className="text-[10px] font-mono text-black/60">0{i + 1}</span>
                    <button 
                      onClick={() => toggleStep(i)}
                      className={`w-14 h-14 border flex items-center justify-center transition-all duration-500 ${
                        step.completed 
                          ? 'bg-black border-black text-white' 
                          : 'bg-transparent border-border-light text-black/60 hover:border-black hover:text-black'
                      }`}
                    >
                      {step.completed ? (
                        <div className="w-2 h-2 bg-white" />
                      ) : (
                        <div className="w-2 h-2 bg-border-light" />
                      )}
                    </button>
                    <div className="w-px h-full bg-border-light hidden sm:block" />
                  </div>

                  <div className="flex-1 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                      <h4 className={`text-3xl font-serif italic leading-tight text-black`}>
                        {step.title}
                      </h4>
                      <div className="flex items-center gap-2 text-[10px] font-mono text-black/60 uppercase tracking-widest">
                        {step.timeline}
                      </div>
                    </div>
                    
                    <p className={`text-sm leading-relaxed font-serif ${step.completed ? 'text-black' : 'text-black/60'}`}>
                      {step.description}
                    </p>

                    {step.courseraLink && (
                      <div className="pt-2">
                        <a 
                          href={step.courseraLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-all text-[10px] font-bold uppercase tracking-widest rounded-sm"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Coursera Course
                        </a>
                      </div>
                    )}
                    
                    {step.link && getYoutubeEmbedUrl(step.link) && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <p className="text-[10px] font-medium">Information: This video is for representational purposes only.</p>
                          </div>
                          <button 
                            onClick={() => handleRefreshVideo(i)}
                            className="flex items-center gap-1.5 px-2 py-1 bg-white border border-amber-200 hover:border-amber-400 text-[9px] font-bold uppercase tracking-wider transition-all"
                            title="Find another video if this one is unavailable"
                          >
                            <RefreshCw className="w-3 h-3" />
                            Refresh Video
                          </button>
                        </div>
                        <div className="space-y-2">
                          <div className="aspect-video w-full bg-black border border-border-light overflow-hidden">
                            <iframe
                              src={getYoutubeEmbedUrl(step.link)!}
                              className="w-full h-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              loading="lazy"
                              title={step.title}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {!step.completed && (
                      <button 
                        onClick={() => toggleStep(i)}
                        className="text-[10px] font-bold text-black uppercase tracking-[0.3em] flex items-center gap-2 group"
                      >
                        Mark as complete 
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="pt-12 flex flex-col items-center text-center space-y-6">
                <div className="inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.4em] text-brand-secondary font-bold">
                  Strategic Plan
                </div>
                <p className="text-xl font-serif italic text-black/60 max-w-md">
                  "Strategy is about making choices, trade-offs; it's about deliberately choosing to be different."
                </p>
              </div>
            </div>
          </div>
        </div>
        ) : (
          <div className="text-center py-40 card-standard bg-white">
            <p className="text-2xl font-serif italic text-black/60">Failed to generate roadmap. Try again later.</p>
          </div>
        )}
      </div>

      {/* Skill Update Modal */}
      <AnimatePresence>
        {showSkillModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSkillModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white p-6 md:p-10 space-y-6 md:space-y-8 border border-border-light shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="space-y-3 md:space-y-4">
                <div className="flex items-center gap-2 text-brand-primary font-bold text-[8px] md:text-[10px] uppercase tracking-[0.4em]">
                  STRATEGIC UPDATE
                </div>
                <h3 className="text-2xl md:text-3xl font-serif italic leading-tight text-black">
                  Manual Skill Update
                </h3>
                <p className="text-xs md:text-sm text-black/60 font-serif italic">
                  Adjust your current proficiency levels for the required competencies.
                </p>
              </div>

              <div className="space-y-6 pr-2 scrollbar-thin scrollbar-thumb-border-light">
                {tempSkills.map((skill, idx) => (
                  <div key={idx} className="space-y-3">
                    <div className="flex justify-between items-end">
                      <div className="flex items-center gap-2">
                        <span className="text-xs md:text-sm font-serif text-black">{skill.name}</span>
                        {skill.courseraLink && (
                          <a 
                            href={skill.courseraLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-brand-primary hover:text-black transition-colors"
                            title="Learn on Coursera"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      <span className="text-[9px] md:text-[10px] font-mono text-black/60">{skill.level}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={skill.level}
                      onChange={(e) => {
                        const newSkills = [...tempSkills];
                        newSkills[idx].level = parseInt(e.target.value);
                        setTempSkills(newSkills);
                      }}
                      className="w-full h-1 bg-surface-bg appearance-none cursor-pointer accent-brand-primary"
                    />
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <button 
                  onClick={handleSaveSkills}
                  className="w-full py-4 bg-brand-primary text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-black transition-all flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" /> Save Skill Levels
                </button>
                <button 
                  onClick={() => setShowSkillModal(false)}
                  className="w-full py-4 border border-border-light text-black/60 text-[10px] font-bold uppercase tracking-[0.2em] hover:border-black hover:text-black transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
