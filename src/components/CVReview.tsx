import { useState, useRef } from 'react';
import { UserProfile } from '../types';
import { analyzeCV } from '../services/gemini';
import { ArrowLeft, FileText, Sparkles, CheckCircle2, AlertCircle, RefreshCw, Zap, Target, Search, FileSearch, ShieldCheck, Upload, FileUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

interface CVReviewProps {
  profile: UserProfile;
  onBack: () => void;
  onUpdateProfile: (profile: UserProfile) => void;
}

export default function CVReview({ profile, onBack, onUpdateProfile }: CVReviewProps) {
  const [cvText, setCvText] = useState('');
  const [targetJob, setTargetJob] = useState(profile.careerGoal || '');
  const [review, setReview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setExtracting(true);
    try {
      if (file.type === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(' ');
          fullText += pageText + '\n';
        }
        setCvText(fullText);
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        setCvText(result.value);
      } else if (file.type === 'text/plain') {
        const text = await file.text();
        setCvText(text);
      } else {
        alert("Unsupported file format. Please upload PDF, DOCX, or TXT.");
      }
    } catch (error) {
      console.error("File extraction error:", error);
      alert("Failed to extract text from file. Please try again or copy-paste text.");
    } finally {
      setExtracting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleReview = async () => {
    if (!cvText.trim() || !targetJob.trim()) return;

    setLoading(true);

    try {
      const response = await analyzeCV(cvText, targetJob, profile, 'en');
      setReview(response);
    } catch (error) {
      console.error("CV Review error:", error);
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
                <FileSearch className="w-4 h-4" /> CV Audit Engine
              </div>
              <h2 className="text-5xl md:text-7xl font-serif leading-none tracking-tighter">
                The <span className="italic">Audit.</span>
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
              <div className="space-y-8">
                <div className="space-y-4">
                  <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-text-muted">Target Position</h3>
                  <div className="relative group">
                    <input 
                      type="text"
                      value={targetJob}
                      readOnly
                      className="w-full bg-transparent border-b border-border-light py-4 pr-12 focus:border-text-main outline-none transition-all font-serif italic text-xl text-text-main placeholder:text-text-muted/30 opacity-70 cursor-not-allowed"
                      placeholder="e.g. Senior Product Manager"
                    />
                    <Target className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-text-main transition-colors" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-text-muted">CV Content</h3>
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-brand-primary hover:text-black transition-colors"
                    >
                      {extracting ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                      {extracting ? "Extracting..." : "Upload CV"}
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileUpload} 
                      accept=".pdf,.docx,.txt" 
                      className="hidden" 
                    />
                  </div>
                  <p className="text-sm text-text-muted font-serif italic leading-relaxed">
                    Upload your CV file (PDF, DOCX, or TXT) to start the strategic audit. AI will extract the text automatically.
                  </p>
                  {cvText && (
                    <div className="p-4 bg-surface-bg border border-border-light rounded-sm">
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-brand-secondary mb-2">
                        <CheckCircle2 className="w-3 h-3" /> Text Extracted Successfully
                      </div>
                      <p className="text-[10px] text-text-muted font-mono line-clamp-3 opacity-60">
                        {cvText}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-8 bg-surface-bg border border-border-light space-y-4">
                <div className="flex items-center gap-2 text-[10px] text-brand-secondary font-bold uppercase tracking-widest">
                  <AlertCircle className="w-4 h-4" /> Note
                </div>
                <p className="text-sm text-text-muted leading-relaxed font-serif italic opacity-70">
                  Your CV data is processed securely and used only for this strategic analysis.
                </p>
              </div>
              
              <button 
                onClick={handleReview}
                disabled={loading || !cvText.trim() || !targetJob.trim() || extracting}
                className="w-full button-primary flex items-center justify-center gap-4"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 fill-current" />}
                {loading ? "Analyzing..." : "Analyze CV"}
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
                  <FileText className="w-10 h-10 text-text-muted relative z-10" />
                </div>
                <div className="space-y-4">
                  <h3 className="text-3xl font-serif italic text-text-main">Awaiting CV Data</h3>
                  <p className="text-text-muted max-w-xs font-serif opacity-70 leading-relaxed">Upload your CV to receive a strategic audit and optimization roadmap.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

