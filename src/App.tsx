/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from './types';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import CareerRoadmap from './components/CareerRoadmap';
import InterviewPractice from './components/InterviewPractice';
import LinkedInReview from './components/LinkedInReview';
import CVReview from './components/CVReview';
import ResumeMaker from './components/ResumeMaker';
import Profile from './components/Profile';
import LandingPage from './components/LandingPage';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import Verify from './components/Auth/Verify';
import { LayoutDashboard, PenTool, User, Loader2, Linkedin, ArrowLeft, FileSearch, Sparkles, Menu, X, LogOut } from 'lucide-react';
import { summarizeReflection } from './services/gemini';

type View = 'landing' | 'onboarding' | 'dashboard' | 'roadmap' | 'interview' | 'linkedin-review' | 'cv-review' | 'resume-maker' | 'profile' | 'login' | 'signup' | 'verify';

function SplashScreen({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-[200] bg-surface-bg flex flex-col items-center justify-center overflow-hidden"
    >
      <div className="relative flex flex-col items-center gap-8">
        <div className="relative w-48 h-48">
          {/* Animated Logo */}
          <motion.img
            src="/logo.png"
            alt="Logo"
            className="w-full h-full object-contain"
            initial={{ filter: "grayscale(0%)", scale: 0.8, opacity: 0 }}
            animate={{ filter: "grayscale(100%)", scale: 1, opacity: 1 }}
            transition={{ 
              filter: { duration: 2, delay: 0.5, ease: "easeInOut" },
              scale: { duration: 1, ease: "easeOut" },
              opacity: { duration: 0.8 }
            }}
            referrerPolicy="no-referrer"
          />
          
          {/* Subtle pulse effect */}
          <motion.div 
            className="absolute inset-0 rounded-full border border-brand-primary/20"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="text-center space-y-3"
        >
          <h1 className="text-5xl font-serif italic tracking-tight text-text-main">Scaleup</h1>
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-8 bg-brand-primary/30" />
            <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-text-muted">Architecting Your Career</p>
            <div className="h-px w-8 bg-brand-primary/30" />
          </div>
        </motion.div>
      </div>

      {/* Background decorative elements */}
      <motion.div 
        className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-brand-primary/5 rounded-full blur-[120px]"
        animate={{ 
          x: [0, 20, 0],
          y: [0, -20, 0]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-brand-primary/5 rounded-full blur-[120px]"
        animate={{ 
          x: [0, -20, 0],
          y: [0, 20, 0]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  );
}

function AppContent() {
  const [view, setView] = useState<View>('landing');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  const saveProfile = async (profile: UserProfile) => {
    const token = localStorage.getItem('scaleup-token');
    if (!token) return;

    try {
      await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profile)
      });
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  const fetchProfile = async (token: string) => {
    try {
      const response = await fetch('/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const profile = await response.json();
        setUserProfile(profile);
        localStorage.setItem('career-path-profile', JSON.stringify(profile));
        return profile;
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
    return null;
  };

  const handleUpdateProfile = (profile: UserProfile) => {
    setUserProfile(profile);
    localStorage.setItem('career-path-profile', JSON.stringify(profile));
    saveProfile(profile);
  };

  const handleSetView = (newView: View) => {
    if (view === 'landing' && newView !== 'landing') {
      setShowSplash(true);
    }
    setView(newView);
  };

  // Load profile from local storage if exists
  useEffect(() => {
    const handleSwitchView = (e: any) => {
      handleSetView(e.detail);
    };
    window.addEventListener('switch-view', handleSwitchView);

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('token')) {
      handleSetView('verify');
      return;
    }

    const token = localStorage.getItem('scaleup-token');
    if (token) {
      fetchProfile(token).then(profile => {
        if (profile) {
          handleSetView('dashboard');
        } else {
          const savedProfile = localStorage.getItem('career-path-profile');
          if (savedProfile) {
            const profile = JSON.parse(savedProfile);
            setUserProfile(profile);
            handleSetView('dashboard');
          }
        }
      });
    } else {
      const savedProfile = localStorage.getItem('career-path-profile');
      if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        setUserProfile(profile);
        handleSetView('dashboard');
      }
    }

    return () => window.removeEventListener('switch-view', handleSwitchView);
  }, []);

  const handleManualUpdateProfile = (profile: UserProfile) => {
    handleUpdateProfile(profile);
    return true;
  };

  const handleLogout = () => {
    localStorage.removeItem('career-path-profile');
    localStorage.removeItem('scaleup-token');
    localStorage.removeItem('scaleup-refresh-token');
    setUserProfile(null);
    handleSetView('landing');
    setIsMobileMenuOpen(false);
  };

  const handleLoginSuccess = async (user: any, tokens: { accessToken: string }) => {
    localStorage.setItem('scaleup-token', tokens.accessToken);
    
    const profile = await fetchProfile(tokens.accessToken);
    if (profile) {
      handleSetView('dashboard');
    } else {
      const savedProfile = localStorage.getItem('career-path-profile');
      if (savedProfile) {
        // If we have a local profile but none on server, save it to server
        const localProfile = JSON.parse(savedProfile);
        setUserProfile(localProfile);
        saveProfile(localProfile);
        handleSetView('dashboard');
      } else {
        handleSetView('onboarding');
      }
    }
  };

  const handleOnboardingComplete = async (profile: UserProfile) => {
    if (profile.currentSkills || profile.missingSkills || profile.careerChallenge) {
      setIsSummarizing(true);
      try {
        const summary = await summarizeReflection(profile, 'en');
        const updatedProfile = { ...profile, reflectionSummary: summary };
        handleUpdateProfile(updatedProfile);
        handleSetView('dashboard');
      } catch (error) {
        console.error("Error summarizing reflection:", error);
        handleUpdateProfile(profile);
        handleSetView('dashboard');
      } finally {
        setIsSummarizing(false);
      }
    } else {
      handleUpdateProfile(profile);
      handleSetView('dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-surface-bg text-text-main font-sans selection:bg-brand-primary selection:text-white">
      <AnimatePresence>
        {showSplash && (
          <SplashScreen onComplete={() => setShowSplash(false)} />
        )}
      </AnimatePresence>

      {/* Header */}
      {view !== 'landing' && (
        <div className="fixed top-4 left-0 right-0 z-50 px-4 md:px-8 flex justify-center pointer-events-none">
          <header className="w-full max-w-4xl bg-[#f8f7f3] rounded-full px-6 md:px-8 py-2 flex items-center justify-between shadow-sm border border-black/5 pointer-events-auto">
            <div className="flex items-center gap-2.5">
              <img src="/logo.png" alt="Logo" className="w-5 h-5 object-contain grayscale" referrerPolicy="no-referrer" />
              <span className="text-lg font-bold tracking-tighter text-[#1a1a1a] hidden sm:block">Scaleup</span>
            </div>

            {userProfile && (
              <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-[#4a4a4a]">
                <button 
                  onClick={() => handleSetView('dashboard')}
                  className={`hover:text-black transition-colors ${view === 'dashboard' ? 'text-black' : ''}`}
                >
                  Strategic Hub
                </button>
                <button 
                  onClick={() => handleSetView('roadmap')}
                  className={`hover:text-black transition-colors ${view === 'roadmap' ? 'text-black' : ''}`}
                >
                  Career Roadmap
                </button>
                <button 
                  onClick={() => handleSetView('linkedin-review')}
                  className={`hover:text-black transition-colors ${view === 'linkedin-review' ? 'text-black' : ''}`}
                >
                  LinkedIn Review
                </button>
              </nav>
            )}

            <div className="flex items-center gap-3">
              {userProfile && (
                <button 
                  onClick={() => handleSetView('profile')}
                  className="w-8 h-8 rounded-full bg-white border border-black/5 flex items-center justify-center hover:border-black transition-all shadow-sm"
                  title="Profile"
                >
                  <User className="w-3.5 h-3.5 text-[#4a4a4a]" />
                </button>
              )}

              {userProfile && (
                <button 
                  onClick={handleLogout}
                  className="w-8 h-8 rounded-full bg-white border border-black/5 flex items-center justify-center hover:border-black transition-all shadow-sm"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5 text-[#4a4a4a]" />
                </button>
              )}

              {userProfile && (
                <button 
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="lg:hidden p-1.5 text-[#4a4a4a] hover:text-black transition-all"
                >
                  {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              )}
            </div>
          </header>
        </div>
      )}

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && userProfile && (
        <div
          className="fixed inset-0 z-[60] bg-surface-bg flex flex-col p-8"
        >
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain grayscale" referrerPolicy="no-referrer" />
              <span className="text-xl font-serif italic tracking-tight">Scaleup</span>
            </div>
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 text-text-muted hover:text-text-main transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex flex-col gap-8 text-2xl font-serif italic">
            <button 
              onClick={() => { handleSetView('dashboard'); setIsMobileMenuOpen(false); }}
              className={`text-left hover:text-brand-primary transition-colors ${view === 'dashboard' ? 'text-brand-primary' : 'text-text-main'}`}
            >
              Strategic Hub
            </button>
            <button 
              onClick={() => { handleSetView('roadmap'); setIsMobileMenuOpen(false); }}
              className={`text-left hover:text-brand-primary transition-colors ${view === 'roadmap' ? 'text-brand-primary' : 'text-text-main'}`}
            >
              Career Roadmap
            </button>
            <button 
              onClick={() => { handleSetView('linkedin-review'); setIsMobileMenuOpen(false); }}
              className={`text-left hover:text-brand-primary transition-colors ${view === 'linkedin-review' ? 'text-brand-primary' : 'text-text-main'}`}
            >
              LinkedIn Review
            </button>
            <button 
              onClick={() => { handleSetView('profile'); setIsMobileMenuOpen(false); }}
              className={`text-left hover:text-brand-primary transition-colors ${view === 'profile' ? 'text-brand-primary' : 'text-text-main'}`}
            >
              Identity
            </button>
            <button 
              onClick={handleLogout}
              className="text-left hover:text-brand-primary transition-colors text-text-muted flex items-center gap-3"
            >
              <LogOut className="w-6 h-6" />
              Logout
            </button>
          </nav>

          <div className="mt-auto pt-8 border-t border-border-light">
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="pt-14 min-h-screen">
        {view === 'landing' && (
          <div
            key="landing"
            className="h-full"
          >
            <LandingPage onStart={() => handleSetView('signup')} />
          </div>
        )}

        {view === 'login' && (
          <div key="login" className="pt-24 pb-12 px-4">
            <Login onLoginSuccess={handleLoginSuccess} onSwitchToSignup={() => handleSetView('signup')} />
          </div>
        )}

        {view === 'signup' && (
          <div key="signup" className="pt-24 pb-12 px-4">
            <Signup onSwitchToLogin={() => handleSetView('login')} onLoginSuccess={handleLoginSuccess} />
          </div>
        )}

        {view === 'verify' && (
          <div key="verify" className="pt-24 pb-12 px-4">
            <Verify onBackToLogin={() => handleSetView('login')} />
          </div>
        )}

        {view === 'onboarding' && (
          <div
            key="onboarding"
          >
            <Onboarding onComplete={handleOnboardingComplete} onBack={() => handleSetView('landing')} />
          </div>
        )}

        {view === 'dashboard' && userProfile && (
          <div
            key="dashboard"
            className="h-full"
          >
            <Dashboard 
              profile={userProfile} 
              setView={handleSetView} 
              onUpdateProfile={handleUpdateProfile}
            />
          </div>
        )}

        {view === 'profile' && userProfile && (
          <div
            key="profile"
          >
            <Profile 
              profile={userProfile} 
              onUpdate={handleManualUpdateProfile} 
              onBack={() => handleSetView('dashboard')} 
            />
          </div>
        )}

        {view === 'roadmap' && userProfile && (
          <div
            key="roadmap"
          >
            <CareerRoadmap 
              profile={userProfile} 
              onBack={() => handleSetView('dashboard')} 
              onUpdateProfile={handleUpdateProfile}
            />
          </div>
        )}

        {view === 'linkedin-review' && userProfile && (
          <div
            key="linkedin-review"
          >
            <LinkedInReview 
              profile={userProfile} 
              onBack={() => handleSetView('dashboard')} 
              onUpdateProfile={handleUpdateProfile}
            />
          </div>
        )}

        {view === 'cv-review' && userProfile && (
          <div
            key="cv-review"
          >
            <CVReview 
              profile={userProfile} 
              onBack={() => handleSetView('dashboard')} 
              onUpdateProfile={handleUpdateProfile}
            />
          </div>
        )}

        {view === 'interview' && userProfile && (
          <div
            key="interview"
          >
            <InterviewPractice 
              profile={userProfile} 
              onBack={() => handleSetView('dashboard')} 
              onUpdateProfile={handleUpdateProfile}
            />
          </div>
        )}

        {view === 'resume-maker' && userProfile && (
          <div
            key="resume-maker"
          >
            <ResumeMaker 
              profile={userProfile} 
              onBack={() => handleSetView('dashboard')} 
              onUpdateProfile={handleUpdateProfile}
            />
          </div>
        )}
      </main>

      {/* Global Loading State */}
      {isSummarizing && (
        <div
          className="fixed inset-0 z-[100] bg-surface-bg flex items-center justify-center p-8"
        >
          <div className="max-w-md w-full space-y-8 text-center">
            <div className="relative w-24 h-24 mx-auto">
              <div
                className="absolute inset-0 border-t-2 border-brand-primary rounded-full animate-spin"
              />
              <div className="absolute inset-4 border border-border-light rounded-full flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-brand-primary animate-pulse" />
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-3xl font-serif italic text-text-main">Architecting your path...</h3>
              <p className="text-text-muted font-mono text-[10px] uppercase tracking-[0.2em]">This will only take a moment.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen">
      <AppContent />
    </div>
  );
}
