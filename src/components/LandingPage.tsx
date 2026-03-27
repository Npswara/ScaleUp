import React from 'react';
import { ArrowRight, Globe, Shield, Zap, Quote, Menu, X, CheckCircle2 } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <div className="h-full overflow-y-auto bg-surface-bg text-text-main overflow-x-hidden selection:bg-brand-primary selection:text-white">
      {/* Top Navigation */}
      <div className="fixed top-6 left-0 right-0 z-50 px-4 md:px-8 flex justify-center pointer-events-none">
        <nav className="w-full max-w-5xl bg-[#f8f7f3] rounded-full px-6 md:px-10 py-3 flex items-center justify-between shadow-sm border border-black/5 pointer-events-auto">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="w-6 h-6 object-contain grayscale" referrerPolicy="no-referrer" />
            <span className="text-xl font-bold tracking-tighter text-[#1a1a1a]">Scaleup</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-[#4a4a4a]">
            <button onClick={() => document.getElementById('problem')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-black transition-colors">The Problem</button>
            <button onClick={() => document.getElementById('solution')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-black transition-colors">The Solution</button>
            <button onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-black transition-colors">Pricing</button>
            <button onClick={() => document.getElementById('philosophy')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-black transition-colors">Philosophy</button>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => onStart()} // This will trigger signup
              className="hidden sm:flex items-center gap-2 px-6 py-2 bg-black text-white rounded-full text-sm font-bold hover:scale-[1.02] active:scale-90 transition-all"
            >
              Start Journey
              <ArrowRight className="w-4 h-4" />
            </button>
            
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('switch-view', { detail: 'login' }))}
              className="hidden sm:block text-sm font-bold text-[#4a4a4a] hover:text-black transition-colors"
            >
              Log In
            </button>
            
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-text-muted hover:text-text-main transition-all"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-[60] bg-surface-bg flex flex-col p-8 pointer-events-auto"
        >
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain grayscale" referrerPolicy="no-referrer" />
              <span className="text-xl font-serif italic tracking-tight">Scaleup</span>
            </div>
            <button 
              onClick={() => setIsMenuOpen(false)}
              className="p-2 text-text-muted hover:text-text-main transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex flex-col gap-8 text-2xl font-serif italic">
            <button 
              onClick={() => { document.getElementById('problem')?.scrollIntoView({ behavior: 'smooth' }); setIsMenuOpen(false); }}
              className="text-left hover:text-brand-primary transition-colors"
            >
              The Problem
            </button>
            <button 
              onClick={() => { document.getElementById('solution')?.scrollIntoView({ behavior: 'smooth' }); setIsMenuOpen(false); }}
              className="text-left hover:text-brand-primary transition-colors"
            >
              The Solution
            </button>
            <button 
              onClick={() => { document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }); setIsMenuOpen(false); }}
              className="text-left hover:text-brand-primary transition-colors"
            >
              Pricing
            </button>
            <button 
              onClick={() => { document.getElementById('philosophy')?.scrollIntoView({ behavior: 'smooth' }); setIsMenuOpen(false); }}
              className="text-left hover:text-brand-primary transition-colors"
            >
              Philosophy
            </button>
          </nav>

          <div className="mt-auto pt-8 border-t border-border-light">
            <button 
              onClick={() => { onStart(); setIsMenuOpen(false); }}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-brand-primary text-white text-xs font-bold uppercase tracking-widest hover:bg-brand-primary/90 transition-all"
            >
              Start Journey
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Hero Section: The Problem */}
      <section id="problem" className="relative min-h-screen flex flex-col justify-center px-6 md:px-8 pt-20">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-8 space-y-8 md:space-y-12">
            <div
              className="inline-block"
            >
              <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-brand-secondary mb-4 block">Strategic Alignment</span>
              <h1 className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-serif font-light leading-[0.9] tracking-tighter">
                Architect your <br />
                <span className="italic">career path.</span>
              </h1>
            </div>

            <div
              className="space-y-4"
            >
              <p className="text-lg md:text-2xl text-text-muted max-w-xl font-serif italic leading-relaxed">
                "Don't just find a job. Build a career that actually fits who you are."
              </p>
              <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-text-muted/60">
                — Scaleup
              </p>
            </div>

            <div
            >
              <button
                onClick={onStart}
                className="button-primary group flex items-center gap-4"
              >
                Start Journey
                <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-4 relative hidden lg:block">
            <div className="absolute -left-20 top-0 vertical-text text-[10px] uppercase tracking-[0.5em] text-text-muted/30 font-bold h-full flex justify-between">
              <span>EST. 2026</span>
              <span>SCALEUP AI</span>
              <span>CAREER INTELLIGENCE</span>
            </div>
            <div className="aspect-[3/4] bg-text-main/5 border border-border-light relative overflow-hidden group">
              <img 
                src="/thumbnail.png" 
                alt="Fish on a tree" 
                className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-px h-32 bg-text-main/20" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Empathy Section: The Struggle */}
      <section className="py-24 md:py-40 px-6 md:px-8 bg-text-main text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 md:p-20 opacity-10">
          <Quote className="w-32 h-32 md:w-64 md:h-64" />
        </div>
        <div className="max-w-4xl mx-auto space-y-8 md:space-y-12 relative z-10">
          <h2 
            className="text-3xl md:text-6xl font-serif italic leading-tight"
          >
            Stop trying to fit in. Start standing out in the right place.
          </h2>
          <p 
            className="text-base md:text-xl text-white/60 font-light leading-relaxed max-w-2xl"
          >
            Most career tools just help you get hired. We help you find the career where you'll actually succeed and be happy.
          </p>
        </div>
      </section>

      {/* Solution Section: The Tools */}
      <section id="solution" className="py-24 md:py-40 px-6 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 md:mb-32 gap-8">
            <div className="max-w-xl space-y-6">
              <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-brand-secondary">The Ecosystem</span>
              <h2 className="text-4xl md:text-7xl font-serif leading-none">
                Strategic <br /> 
                <span className="italic">Clarity.</span>
              </h2>
            </div>
            <p className="text-text-muted max-w-xs text-sm font-medium leading-relaxed">
              Four specialized modules designed to translate your unique potential into professional authority.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border-light border border-border-light">
            <div 
              className="p-8 md:p-12 bg-surface-bg space-y-8 transition-colors duration-500 hover:bg-white"
            >
              <span className="text-[10px] font-mono text-text-muted">01 /</span>
              <h3 className="text-2xl md:text-3xl font-serif italic">The Architect</h3>
              <p className="text-sm text-text-muted leading-relaxed">We don't just build CVs. We architect narratives that highlight your specific value in the right environments.</p>
            </div>
            <div 
              className="p-8 md:p-12 bg-surface-bg space-y-8 transition-colors duration-500 hover:bg-white"
            >
              <span className="text-[10px] font-mono text-text-muted">02 /</span>
              <h3 className="text-2xl md:text-3xl font-serif italic">The Mirror</h3>
              <p className="text-sm text-text-muted leading-relaxed">A ruthless, objective audit of your professional presence. See yourself as the market sees you.</p>
            </div>
            <div 
              className="p-8 md:p-12 bg-surface-bg space-y-8 transition-colors duration-500 hover:bg-white"
            >
              <span className="text-[10px] font-mono text-text-muted">03 /</span>
              <h3 className="text-2xl md:text-3xl font-serif italic">The Compass</h3>
              <p className="text-sm text-text-muted leading-relaxed">A dynamic roadmap that adjusts to your growth, ensuring your professional trajectory is always on target.</p>
            </div>
            <div 
              className="p-8 md:p-12 bg-surface-bg space-y-8 transition-colors duration-500 hover:bg-white"
            >
              <span className="text-[10px] font-mono text-text-muted">04 /</span>
              <h3 className="text-2xl md:text-3xl font-serif italic">The Simulation</h3>
              <p className="text-sm text-text-muted leading-relaxed">A high-stakes AI-powered simulation to sharpen your strategic narrative and build unshakeable confidence.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section id="philosophy" className="py-24 md:py-40 px-6 md:px-8 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 items-center">
          <div className="relative order-2 lg:order-1">
            <div className="aspect-square bg-surface-bg relative overflow-hidden">
              <img 
                src="/thumbnail2.png" 
                alt="Minimal" 
                className="w-full h-full object-cover grayscale opacity-50"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 md:-bottom-10 md:-right-10 w-48 md:w-64 p-6 md:p-10 bg-text-main text-white space-y-4 hidden sm:block">
              <p className="text-[8px] md:text-xs font-mono opacity-50">CORE VALUE</p>
              <p className="text-lg md:text-xl font-serif italic leading-tight">Being yourself is your greatest strength in the professional world.</p>
            </div>
          </div>
          <div className="space-y-8 md:space-y-12 order-1 lg:order-2">
            <h2 className="text-4xl md:text-6xl font-serif leading-tight">
              Stop building on the wrong <br /> 
              <span className="italic">foundation.</span>
            </h2>
            <div className="space-y-6 text-text-muted leading-relaxed">
              <p>Scaleup was built on a simple observation: most career dissatisfaction stems from a misalignment between professional potential and the current environment.</p>
              <p>We use advanced generative intelligence not to make you a "better candidate," but to help you architect a path where your existing strengths are the foundation of your success.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Product Preview Section */}
      <section className="py-24 md:py-40 px-6 md:px-8 bg-surface-bg border-t border-border-light">
        <div className="max-w-7xl mx-auto space-y-20">
          <div className="text-center space-y-6">
            <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-brand-secondary">The Interface</span>
            <h2 className="text-4xl md:text-7xl font-serif leading-none">
              The Strategic <br /> 
              <span className="italic">Hub.</span>
            </h2>
            <p className="text-text-muted max-w-xl mx-auto text-base font-serif italic">
              A minimalist command center designed for clarity, precision, and high-stakes decision making.
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="relative overflow-hidden max-h-[250px] md:max-h-[450px] lg:max-h-[650px] group">
              <img 
                src="/strategic-hub-preview.png" 
                alt="Strategic Hub Interface" 
                className="w-full h-auto grayscale group-hover:grayscale-0 transition-all duration-700 block object-top"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  // Fallback if the image doesn't exist yet
                  e.currentTarget.src = "/public/webview.png";
                }}
              />
              <div className="absolute inset-0 border border-black/5 pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 md:py-40 px-6 md:px-8 bg-white border-t border-border-light">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-6 mb-16 md:mb-32">
            <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-brand-secondary">Investment</span>
            <h2 className="text-4xl md:text-7xl font-serif leading-none">
              Transparent <br /> 
              <span className="italic">Value.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Free Tier */}
            <div className="p-8 md:p-12 bg-surface-bg border border-border-light space-y-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 px-4 py-1 bg-brand-primary text-white text-[8px] font-bold uppercase tracking-widest">Current Plan</div>
              <div className="space-y-2">
                <h3 className="text-2xl font-serif italic">Free Tier</h3>
                <p className="text-4xl font-bold tracking-tighter">$0<span className="text-sm text-text-muted font-normal">/month</span></p>
              </div>
              <ul className="space-y-4 text-sm text-text-muted font-medium">
                <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-brand-primary" /> Basic Career Architect</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-brand-primary" /> Standard Mirror Audit</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-brand-primary" /> Community Compass Access</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-brand-primary" /> 3 Simulation Rounds / Month</li>
              </ul>
              <button 
                onClick={onStart}
                className="w-full py-4 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-black/90 transition-all"
              >
                Get Started Free
              </button>
            </div>

            {/* Premium Tier (Coming Soon) */}
            <div className="p-8 md:p-12 bg-white border border-border-light space-y-8 relative opacity-60 grayscale">
              <div className="absolute top-0 right-0 px-4 py-1 bg-text-muted text-white text-[8px] font-bold uppercase tracking-widest">Coming Soon</div>
              <div className="space-y-2">
                <h3 className="text-2xl font-serif italic">Premium</h3>
                <p className="text-4xl font-bold tracking-tighter">--<span className="text-sm text-text-muted font-normal">/month</span></p>
              </div>
              <ul className="space-y-4 text-sm text-text-muted font-medium">
                <li className="flex items-center gap-3"><Zap className="w-4 h-4 text-brand-secondary" /> Advanced Narrative Architect</li>
                <li className="flex items-center gap-3"><Zap className="w-4 h-4 text-brand-secondary" /> Deep-Dive Mirror Analysis</li>
                <li className="flex items-center gap-3"><Zap className="w-4 h-4 text-brand-secondary" /> Personalized Compass Roadmap</li>
                <li className="flex items-center gap-3"><Zap className="w-4 h-4 text-brand-secondary" /> Unlimited Simulation Rounds</li>
                <li className="flex items-center gap-3"><Zap className="w-4 h-4 text-brand-secondary" /> Priority AI Processing</li>
              </ul>
              <button 
                disabled
                className="w-full py-4 bg-border-light text-text-muted text-xs font-bold uppercase tracking-widest cursor-not-allowed"
              >
                Coming Soon
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 md:py-60 px-6 md:px-8 text-center bg-surface-bg">
        <div className="max-w-3xl mx-auto space-y-8 md:space-y-12">
          <h2 className="text-5xl md:text-8xl font-serif leading-none tracking-tighter">
            Ready to <br /> <span className="italic">architect?</span>
          </h2>
          <p className="text-lg md:text-xl text-text-muted font-serif italic">Your professional blueprint is waiting.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 pt-8">
            <button
              onClick={onStart}
              className="button-primary w-full sm:w-auto"
            >
              Start your journey
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 md:py-20 px-6 md:px-8 border-t border-border-light bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12 md:gap-20">
          <div className="space-y-8 max-w-sm">
            <div className="flex items-center gap-3">
              <span className="text-xl font-serif italic tracking-tight">Scaleup</span>
            </div>
            <p className="text-sm text-text-muted leading-relaxed">
              A design-led career intelligence platform for those who refuse to settle for misalignment.
            </p>
            <div className="flex gap-6 text-text-muted">
              <Globe className="w-4 h-4 cursor-pointer hover:text-text-main transition-colors" />
              <Shield className="w-4 h-4 cursor-pointer hover:text-text-main transition-colors" />
              <Zap className="w-4 h-4 cursor-pointer hover:text-text-main transition-colors" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-12 md:gap-20">
            <div className="space-y-6">
              <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-text-muted">System</h4>
              <ul className="space-y-3 text-sm font-medium">
                <li><button className="hover:text-brand-primary transition-colors">The Architect</button></li>
                <li><button className="hover:text-brand-primary transition-colors">The Mirror</button></li>
                <li><button className="hover:text-brand-primary transition-colors">The Compass</button></li>
                <li><button className="hover:text-brand-primary transition-colors">The Simulation</button></li>
              </ul>
            </div>
            <div className="space-y-6">
              <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-text-muted">Company</h4>
              <ul className="space-y-3 text-sm font-medium">
                <li><button className="hover:text-brand-primary transition-colors">Privacy</button></li>
                <li><button className="hover:text-brand-primary transition-colors">Terms</button></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-24 md:mt-40 pt-8 border-t border-border-light flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-text-muted font-bold tracking-widest uppercase">
          <span>© 2026 Scaleup</span>
          <span>Crafted for the strategic professional</span>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
