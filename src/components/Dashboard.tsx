import { useState, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { UserProfile, CareerRecommendation, Roadmap } from '../types';
import { analyzeProfile, getCareerRecommendations } from '../services/gemini';
import { 
  FileText, 
  ArrowRight, 
  Target, 
  RefreshCw,
  ShieldCheck,
  Layers,
  Search,
  Linkedin,
  FastForward,
  Settings2,
  Check,
  FileSearch,
  ExternalLink
} from 'lucide-react';

interface DashboardProps {
  profile: UserProfile;
  setView: (view: any) => void;
  onUpdateProfile: (profile: UserProfile) => void;
}

export default function Dashboard({ profile, setView, onUpdateProfile }: DashboardProps) {
  const [insight, setInsight] = useState<string>('');
  const [recommendations, setRecommendations] = useState<CareerRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastSync, setLastSync] = useState<string>('');
  const [roadmapStats, setRoadmapStats] = useState({ progress: 0, alignment: 0 });
  const [confirmTarget, setConfirmTarget] = useState<CareerRecommendation | null>(null);
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [tempSkills, setTempSkills] = useState<{ name: string; level: number; courseraLink?: string }[]>([]);

  const loadRoadmapData = useCallback(() => {
    const savedRoadmap = localStorage.getItem(`roadmap_${profile.careerGoal}`);
    if (savedRoadmap) {
      try {
        const roadmap: Roadmap = JSON.parse(savedRoadmap);
        const completedCount = roadmap.steps.filter((s: any) => s.completed).length || 0;
        const progress = roadmap.steps.length > 0 ? Math.round((completedCount / roadmap.steps.length) * 100) : 0;
        
        // Calculate alignment based on skills if available
        const avgSkillLevel = roadmap.skills.length > 0 
          ? Math.round(roadmap.skills.reduce((acc, s) => acc + s.level, 0) / roadmap.skills.length)
          : roadmap.strategicFit;

        setRoadmapStats({
          progress,
          alignment: avgSkillLevel
        });
        setTempSkills(roadmap.skills);
      } catch (e) {
        console.error("Error parsing roadmap for dashboard stats:", e);
      }
    } else {
      setRoadmapStats({ progress: 0, alignment: 0 });
    }
  }, [profile.careerGoal]);

  useEffect(() => {
    loadRoadmapData();
  }, [loadRoadmapData]);

  const handleSaveSkills = () => {
    const savedRoadmap = localStorage.getItem(`roadmap_${profile.careerGoal}`);
    if (savedRoadmap) {
      try {
        const roadmap: Roadmap = JSON.parse(savedRoadmap);
        const avgSkillLevel = tempSkills.length > 0 
          ? Math.round(tempSkills.reduce((acc, s) => acc + s.level, 0) / tempSkills.length)
          : roadmap.strategicFit;
          
        const updatedRoadmap: Roadmap = {
          ...roadmap,
          skills: tempSkills,
          strategicFit: avgSkillLevel
        };
        
        localStorage.setItem(`roadmap_${profile.careerGoal}`, JSON.stringify(updatedRoadmap));
        loadRoadmapData();
        setShowSkillModal(false);
      } catch (e) {
        console.error("Error saving skills:", e);
      }
    }
  };

  const fetchData = useCallback(async (forceRefresh = false) => {
    const syncTimeKey = `last-sync-${profile.name}-${profile.careerGoal}`;
    
    setLoading(true);
    try {
      const insightKey = `strategic-insight-${profile.name}-${profile.careerGoal}-en`;
      const recsKey = `career-recommendations-${profile.name}-${profile.careerGoal}-en`;
      
      const cachedInsight = localStorage.getItem(insightKey);
      const cachedRecs = localStorage.getItem(recsKey);
      const cachedSyncTime = localStorage.getItem(syncTimeKey);
      
      if (!forceRefresh && cachedInsight && cachedRecs) {
        setInsight(cachedInsight);
        setRecommendations(JSON.parse(cachedRecs));
        if (cachedSyncTime) setLastSync(cachedSyncTime);
      } else {
        const [insightRes, recsRes] = await Promise.all([
          analyzeProfile(profile, 'en'),
          getCareerRecommendations(profile, 'en')
        ]);
        
        const now = new Date().toLocaleString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          hour: '2-digit', 
          minute: '2-digit' 
        });

        setInsight(insightRes);
        setRecommendations(recsRes);
        setLastSync(now);
        
        localStorage.setItem(insightKey, insightRes);
        localStorage.setItem(recsKey, JSON.stringify(recsRes));
        localStorage.setItem(syncTimeKey, now);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, [profile, onUpdateProfile]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = () => {
    fetchData(true);
  };

  return (
    <div className="h-full overflow-y-auto bg-surface-bg selection:bg-brand-primary selection:text-white scrollbar-thin scrollbar-thumb-border-light scrollbar-track-transparent">
      <div className="max-w-7xl mx-auto px-8 py-6 pb-20">
        
        {/* Header: Strategic Overview */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-6xl font-serif leading-none tracking-tighter">
              Strategic Hub
            </h2>
            <p className="text-black/60 font-serif italic text-xl max-w-md">
              Welcome back, {profile.name}. Your career trajectory is currently being optimized.
            </p>
          </div>
          
          <div className="flex items-center justify-between md:justify-end gap-6 md:gap-8 pt-6 md:pt-0 border-t md:border-t-0 border-border-light">
            <div className="flex flex-col items-start md:items-end gap-1">
              <span className="text-[10px] font-mono text-black/60 uppercase tracking-widest">Last Sync</span>
              <span className="text-[10px] font-mono text-black uppercase tracking-widest">{lastSync || "Just Now"}</span>
            </div>
            <button 
              onClick={handleRefresh}
              disabled={loading}
              className="p-4 md:p-6 border border-border-light hover:border-black transition-all text-black/60 hover:text-black bg-white group flex items-center justify-center"
              title="Sync Now"
            >
              <RefreshCw className={`w-5 h-5 md:w-6 md:h-6 ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Core Metrics & Actions */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Performance Metrics */}
            <div className="card-standard p-8 bg-white text-black space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-black/40">Performance</h3>
                <button 
                  onClick={() => setShowSkillModal(true)}
                  className="p-2 hover:bg-surface-bg transition-colors text-black/40 hover:text-brand-primary"
                  title="Update Skills"
                >
                  <Settings2 className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold text-black/60">
                    <span>Roadmap</span>
                    <span>{roadmapStats.progress}%</span>
                  </div>
                  <div className="h-px bg-black/10 w-full relative">
                    <div 
                      style={{ width: `${roadmapStats.progress}%` }} 
                      className="h-px bg-brand-primary absolute left-0 top-0" 
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold text-black/60">
                    <span>Skill Alignment</span>
                    <span>{roadmapStats.alignment}%</span>
                  </div>
                  <div className="h-px bg-black/10 w-full relative">
                    <div 
                      style={{ width: `${roadmapStats.alignment}%` }} 
                      className="h-px bg-brand-primary absolute left-0 top-0" 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Required Competencies */}
            <div className="card-standard p-8 bg-white text-black space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-black/40">Required Competencies</h3>
                <button 
                  onClick={() => setShowSkillModal(true)}
                  className="p-2 hover:bg-surface-bg transition-colors text-black/40 hover:text-brand-primary"
                >
                  <Settings2 className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-6">
                {tempSkills.length > 0 ? (
                  tempSkills.map((skill, i) => (
                    <div key={i} className="space-y-3">
                      <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold text-black/60">
                        <span>{skill.name}</span>
                        <span>{skill.level}%</span>
                      </div>
                      <div className="h-px bg-black/10 w-full relative">
                        <div 
                          style={{ width: `${skill.level}%` }} 
                          className="h-px bg-brand-primary absolute left-0 top-0 transition-all duration-1000" 
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs font-serif italic text-black/40">No competencies defined yet. Generate a roadmap to see required skills.</p>
                )}
              </div>
            </div>

            {/* Quick Access Grid */}
            <div className="grid grid-cols-1 gap-4">
              <button 
                onClick={() => setView('interview')}
                className="card-standard p-8 bg-white hover:bg-brand-primary hover:text-white transition-all group text-left flex items-center justify-between relative overflow-hidden"
              >
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 border border-border-light flex items-center justify-center text-brand-secondary group-hover:bg-white/10 group-hover:text-white transition-all">
                    <Target className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-60 group-hover:opacity-100">Simulation</p>
                    <h4 className="text-xl font-serif italic">Simulation interview with ai</h4>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all" />
              </button>

              <button 
                onClick={() => setView('resume-maker')}
                className="card-standard p-8 bg-white hover:bg-brand-primary hover:text-white transition-all group text-left flex items-center justify-between"
              >
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 border border-border-light flex items-center justify-center text-brand-secondary group-hover:bg-white/10 group-hover:text-white transition-all">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-60 group-hover:opacity-100">CV Maker</p>
                    <h4 className="text-xl font-serif italic">built your own CV (ats friendly)</h4>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all" />
              </button>

              <button 
                onClick={() => setView('cv-review')}
                className="card-standard p-8 bg-white hover:bg-brand-primary hover:text-white transition-all group text-left flex items-center justify-between relative overflow-hidden"
              >
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 border border-border-light flex items-center justify-center text-brand-secondary group-hover:bg-white/10 group-hover:text-white transition-all">
                    <FileSearch className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-60 group-hover:opacity-100">AI AUDIT</p>
                    <h4 className="text-xl font-serif italic">CV Strategic Audit</h4>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all" />
              </button>
            </div>
          </div>

          {/* Right Column: Strategic Insights */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* The Centerpiece: Strategic Insight */}
            <div className="card-standard p-8 md:p-12 bg-white space-y-8 relative overflow-hidden">
              <div className="absolute -left-12 top-0 vertical-text text-[10px] uppercase tracking-[0.5em] text-black/20 font-bold h-full hidden xl:flex justify-between">
                <span>STRATEGIC</span>
                <span>INTELLIGENCE</span>
                <span>Last AI Analysis</span>
              </div>
              
              <div className="flex items-center justify-between border-b border-border-light pb-6">
                <div className="flex items-center gap-4">
                  <h3 className="text-2xl font-serif italic text-black">Strategic Insight</h3>
                </div>
              </div>

              <div className="h-40 md:h-64 lg:h-80 overflow-y-auto pr-4 text-xl md:text-3xl font-serif italic leading-relaxed text-black scrollbar-thin scrollbar-thumb-border-light markdown-body">
                {loading ? (
                  <div className="space-y-6">
                    <div className="h-8 bg-surface-bg animate-pulse w-full"></div>
                    <div className="h-8 bg-surface-bg animate-pulse w-5/6"></div>
                    <div className="h-8 bg-surface-bg animate-pulse w-4/6"></div>
                  </div>
                ) : (
                  <ReactMarkdown>{insight}</ReactMarkdown>
                )}
              </div>

              <div className="pt-6 border-t border-border-light flex items-center justify-between">
                <p className="text-[10px] text-black/50 font-bold uppercase tracking-widest">
                  © 2026 SCALEUP
                </p>
              </div>
            </div>

            {/* Emerging Paths Grid */}
            <div className="space-y-8">
              <div className="flex items-end justify-between border-b border-border-light pb-6 relative">
                <h3 className="text-3xl font-serif italic text-black">Emerging Paths</h3>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-black/60">Based on your nature</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {loading ? (
                  [1, 2].map(i => (
                    <div key={i} className="card-standard aspect-square animate-pulse bg-white"></div>
                  ))
                ) : (
                  recommendations.map((rec, i) => {
                    const isActive = profile.careerGoal === rec.title;
                    return (
                      <div 
                        key={i}
                        className={`group p-8 border transition-all bg-white space-y-6 relative overflow-hidden cursor-pointer ${
                          isActive ? 'border-brand-primary ring-1 ring-brand-primary' : 'border-border-light hover:border-black'
                        }`}
                        onClick={() => {
                          if (isActive) {
                            setView('roadmap');
                          } else {
                            setConfirmTarget(rec);
                          }
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-mono text-black/60 uppercase tracking-widest">
                            {rec.matchPercentage}% Match
                            {isActive && <span className="ml-2 text-brand-primary font-bold">— CAREER ROADMAP ACTIVE</span>}
                          </span>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className={`text-2xl font-serif italic leading-tight transition-colors ${isActive ? 'text-brand-primary' : 'text-black group-hover:text-brand-primary'}`}>
                              {rec.title}
                            </h4>
                            <div className="px-2 py-0.5 border border-brand-secondary/30 bg-brand-secondary/5 text-brand-secondary text-[8px] font-mono uppercase tracking-widest">
                              {rec.salaryRange}
                            </div>
                          </div>
                          <p className="text-sm text-black/60 leading-relaxed font-serif opacity-70 line-clamp-3">
                            {rec.reason}
                          </p>
                        </div>

                        <div className="pt-6 flex items-center justify-between">
                          <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${isActive ? 'opacity-100 text-brand-primary' : 'text-black opacity-0 group-hover:opacity-100'}`}>
                            {isActive ? "Career Roadmap" : "Explore Path"}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(`https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(rec.title)}`, '_blank');
                            }}
                            className="px-3 py-1.5 bg-brand-primary/10 text-brand-primary text-[9px] font-bold uppercase tracking-widest hover:bg-brand-primary hover:text-white transition-all opacity-0 group-hover:opacity-100"
                          >
                            Find Job
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div 
            onClick={() => setConfirmTarget(null)}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <div 
            className="relative w-full max-w-md bg-white p-10 space-y-8 border border-border-light shadow-2xl"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-brand-primary font-bold text-[10px] uppercase tracking-[0.4em]">
                STRATEGIC SHIFT
              </div>
              <h3 className="text-4xl font-serif italic leading-tight text-black">
                Are you sure you want to switch your career path to {confirmTarget.title}?
              </h3>
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={() => {
                  onUpdateProfile({ 
                    ...profile, 
                    careerGoal: confirmTarget.title
                  });
                  setView('roadmap');
                  setConfirmTarget(null);
                }}
                className="button-primary w-full"
              >
                Yes, switch path
              </button>
              <button 
                onClick={() => setConfirmTarget(null)}
                className="button-secondary w-full"
              >
                No, stay here
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Skill Update Modal */}
      {showSkillModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div 
            onClick={() => setShowSkillModal(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <div 
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
          </div>
        </div>
      )}
    </div>
  );
}
