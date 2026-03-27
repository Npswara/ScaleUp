import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, ResumeData } from '../types';
import { chatWithMentorStream } from '../services/gemini';
import ReactMarkdown from 'react-markdown';
import { jsPDF } from 'jspdf';
import { 
  ArrowLeft, 
  FileText, 
  Download, 
  Plus, 
  Trash2, 
  Sparkles, 
  Briefcase, 
  GraduationCap, 
  User, 
  Settings, 
  Save, 
  Zap, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Link as LinkIcon, 
  Award, 
  Globe, 
  Code,
  Layout,
  Eye,
  ShieldCheck,
  Cpu,
  Terminal,
  ChevronRight,
  MoreHorizontal,
  History,
  Target,
  Layers,
  MousePointer2
} from 'lucide-react';

interface ResumeMakerProps {
  profile: UserProfile;
  onBack: () => void;
  onUpdateProfile: (profile: UserProfile) => void;
}

export default function ResumeMaker({ profile, onBack, onUpdateProfile }: ResumeMakerProps) {

  const [resume, setResume] = useState<ResumeData>({
    personalInfo: {
      fullName: profile.name,
      email: '',
      phone: '',
      location: '',
      summary: `Strategic professional focused on ${profile.careerGoal}. Experienced in ${profile.experience}.`,
      links: [],
    },
    experience: [
      { company: '', position: '', duration: '', description: '' }
    ],
    education: [
      { school: profile.education, degree: '', year: '', gpa: '' }
    ],
    projects: [],
    certifications: [],
    languages: [],
    awards: [],
    organizations: [],
    skills: profile.skills,
  });

  const [view, setView] = useState<'edit' | 'preview' | 'audit'>('edit');
  const [activeSection, setActiveSection] = useState<string>('personal');
  const [auditResult, setAuditResult] = useState<string>('');
  const [auditLoading, setAuditLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const updatePersonalInfo = (field: keyof ResumeData['personalInfo'], value: any) => {
    setResume(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value }
    }));
  };

  const addLink = () => {
    updatePersonalInfo('links', [...resume.personalInfo.links, { label: '', url: '' }]);
  };

  const updateLink = (index: number, field: 'label' | 'url', value: string) => {
    const newLinks = [...resume.personalInfo.links];
    newLinks[index] = { ...newLinks[index], [field]: value };
    updatePersonalInfo('links', newLinks);
  };

  const removeLink = (index: number) => {
    updatePersonalInfo('links', resume.personalInfo.links.filter((_, i) => i !== index));
  };

  const addExperience = () => {
    setResume(prev => ({
      ...prev,
      experience: [...prev.experience, { company: '', position: '', duration: '', description: '' }]
    }));
  };

  const removeExperience = (index: number) => {
    setResume(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  const updateExperience = (index: number, field: keyof ResumeData['experience'][0], value: string) => {
    const newExp = [...resume.experience];
    newExp[index] = { ...newExp[index], [field]: value };
    setResume(prev => ({ ...prev, experience: newExp }));
  };

  const addEducation = () => {
    setResume(prev => ({
      ...prev,
      education: [...prev.education, { school: '', degree: '', year: '', gpa: '' }]
    }));
  };

  const removeEducation = (index: number) => {
    setResume(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const updateEducation = (index: number, field: keyof ResumeData['education'][0], value: string) => {
    const newEdu = [...resume.education];
    newEdu[index] = { ...newEdu[index], [field]: value };
    setResume(prev => ({ ...prev, education: newEdu }));
  };

  const addProject = () => {
    setResume(prev => ({
      ...prev,
      projects: [...prev.projects, { name: '', description: '', link: '' }]
    }));
  };

  const updateProject = (index: number, field: keyof ResumeData['projects'][0], value: string) => {
    const newProjects = [...resume.projects];
    newProjects[index] = { ...newProjects[index], [field]: value };
    setResume(prev => ({ ...prev, projects: newProjects }));
  };

  const removeProject = (index: number) => {
    setResume(prev => ({ ...prev, projects: prev.projects.filter((_, i) => i !== index) }));
  };

  const addCertification = () => {
    setResume(prev => ({
      ...prev,
      certifications: [...prev.certifications, { name: '', issuer: '', year: '' }]
    }));
  };

  const updateCertification = (index: number, field: keyof ResumeData['certifications'][0], value: string) => {
    const newCerts = [...resume.certifications];
    newCerts[index] = { ...newCerts[index], [field]: value };
    setResume(prev => ({ ...prev, certifications: newCerts }));
  };

  const removeCertification = (index: number) => {
    setResume(prev => ({ ...prev, certifications: prev.certifications.filter((_, i) => i !== index) }));
  };

  const addLanguage = () => {
    setResume(prev => ({
      ...prev,
      languages: [...prev.languages, { language: '', proficiency: '' }]
    }));
  };

  const updateLanguage = (index: number, field: keyof ResumeData['languages'][0], value: string) => {
    const newLangs = [...resume.languages];
    newLangs[index] = { ...newLangs[index], [field]: value };
    setResume(prev => ({ ...prev, languages: newLangs }));
  };

  const removeLanguage = (index: number) => {
    setResume(prev => ({ ...prev, languages: prev.languages.filter((_, i) => i !== index) }));
  };

  const addAward = () => {
    setResume(prev => ({
      ...prev,
      awards: [...prev.awards, { title: '', issuer: '', year: '' }]
    }));
  };

  const updateAward = (index: number, field: keyof ResumeData['awards'][0], value: string) => {
    const newAwards = [...resume.awards];
    newAwards[index] = { ...newAwards[index], [field]: value };
    setResume(prev => ({ ...prev, awards: newAwards }));
  };

  const removeAward = (index: number) => {
    setResume(prev => ({ ...prev, awards: prev.awards.filter((_, i) => i !== index) }));
  };

  const addOrganization = () => {
    setResume(prev => ({
      ...prev,
      organizations: [...prev.organizations, { name: '', role: '', duration: '', description: '' }]
    }));
  };

  const updateOrganization = (index: number, field: keyof ResumeData['organizations'][0], value: string) => {
    const newOrgs = [...resume.organizations];
    newOrgs[index] = { ...newOrgs[index], [field]: value };
    setResume(prev => ({ ...prev, organizations: newOrgs }));
  };

  const removeOrganization = (index: number) => {
    setResume(prev => ({ ...prev, organizations: prev.organizations.filter((_, i) => i !== index) }));
  };

  const handleAudit = async () => {
    setAuditLoading(true);
    setAuditResult('');
    setView('audit');
    try {
      const resumeText = JSON.stringify(resume, null, 2);
      const prompt = `Perform a high-stakes professional audit of this CV for the role of ${profile.careerGoal}.
      CV Data: ${resumeText}
      
      Provide a strategic analysis:
      1. Strategic Alignment Score (out of 10)
      2. Narrative Strength Assessment
      3. Critical Gaps & Optimization Areas
      4. Actionable Recommendations to maximize impact.`;
      
      const stream = await chatWithMentorStream(prompt, profile, [], 'en');
      
      setAuditLoading(false);
      for await (const chunk of stream) {
        setAuditResult(prev => prev + chunk);
      }
    } catch (error) {
      console.error("Audit error:", error);
      setAuditLoading(false);
    }
  };

  const downloadAsPDF = () => {
    const doc = new jsPDF({
      unit: 'pt',
      format: 'a4',
      orientation: 'portrait'
    });

    const margin = 50;
    let y = 60;
    const pageWidth = doc.internal.pageSize.getWidth();
    const contentWidth = pageWidth - (margin * 2);

    // Helper for text wrapping and page breaks
    const addText = (text: string, fontSize: number, style: 'normal' | 'bold' | 'italic' = 'normal', color: [number, number, number] = [0, 0, 0], spacing: number = 10, align: 'left' | 'center' | 'right' = 'left', xOffset: number = 0) => {
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', style);
      doc.setTextColor(color[0], color[1], color[2]);
      
      const lines = doc.splitTextToSize(text, contentWidth - xOffset);
      
      if (y + (lines.length * fontSize) > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        y = margin + 20;
      }

      const x = align === 'center' ? pageWidth / 2 : (align === 'right' ? pageWidth - margin : margin + xOffset);
      doc.text(lines, x, y, { align });
      y += (lines.length * (fontSize * 1.15)) + spacing;
    };

    const drawLine = () => {
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(margin, y - 6, pageWidth - margin, y - 6);
    };

    // Header (Centered)
    addText(resume.personalInfo.fullName.toUpperCase(), 16, 'bold', [0, 0, 0], 2, 'center');
    const contactInfo = [
      resume.personalInfo.location,
      resume.personalInfo.email,
      resume.personalInfo.phone
    ].filter(Boolean).join(' | ');
    addText(contactInfo, 9, 'normal', [0, 0, 0], 12, 'center');

    // Links
    if (resume.personalInfo.links.length > 0) {
      const linksStr = resume.personalInfo.links.map(l => `${l.label}: ${l.url}`).join(' | ');
      addText(linksStr, 8, 'normal', [0, 0, 0], 15, 'center');
    }

    // Summary
    if (resume.personalInfo.summary) {
      addText("SUMMARY", 10, 'bold', [0, 0, 0], 6);
      drawLine();
      addText(resume.personalInfo.summary, 9, 'normal', [0, 0, 0], 15);
    }

    // Experience
    if (resume.experience.length > 0) {
      addText("EXPERIENCE", 10, 'bold', [0, 0, 0], 6);
      drawLine();
      resume.experience.forEach(exp => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.text(exp.position, margin, y);
        doc.text(exp.duration, pageWidth - margin, y, { align: 'right' });
        y += 11;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text(exp.company, margin, y);
        if (resume.personalInfo.location) {
          doc.text(resume.personalInfo.location, pageWidth - margin, y, { align: 'right' });
        }
        y += 14;

        if (exp.description) {
          const bullets = exp.description.split('\n').filter(line => line.trim());
          bullets.forEach(bullet => {
            const cleanBullet = bullet.replace(/^[•\-\*]\s*/, '');
            const lines = doc.splitTextToSize(cleanBullet, contentWidth - 15);
            doc.text('•', margin + 5, y);
            doc.text(lines, margin + 15, y);
            y += (lines.length * 11) + 2;
          });
        }
        y += 6;
      });
    }

    // Organizations
    if (resume.organizations.length > 0) {
      addText("ORGANIZATIONS", 10, 'bold', [0, 0, 0], 6);
      drawLine();
      resume.organizations.forEach(org => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.text(org.role, margin, y);
        doc.text(org.duration, pageWidth - margin, y, { align: 'right' });
        y += 11;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text(org.name, margin, y);
        y += 14;

        if (org.description) {
          const bullets = org.description.split('\n').filter(line => line.trim());
          bullets.forEach(bullet => {
            const cleanBullet = bullet.replace(/^[•\-\*]\s*/, '');
            const lines = doc.splitTextToSize(cleanBullet, contentWidth - 15);
            doc.text('•', margin + 5, y);
            doc.text(lines, margin + 15, y);
            y += (lines.length * 11) + 2;
          });
        }
        y += 6;
      });
    }

    // Education
    if (resume.education.length > 0) {
      addText("EDUCATION", 10, 'bold', [0, 0, 0], 6);
      drawLine();
      resume.education.forEach(edu => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.text(edu.school, margin, y);
        doc.text(edu.year, pageWidth - margin, y, { align: 'right' });
        y += 11;
        doc.setFont('helvetica', 'normal');
        doc.text(edu.degree + (edu.gpa ? ` | GPA: ${edu.gpa}` : ''), margin, y);
        y += 18;
      });
    }

    // Skills
    if (resume.skills.length > 0) {
      addText("SKILLS & COMPETENCIES", 10, 'bold', [0, 0, 0], 6);
      drawLine();
      const skillStr = resume.skills.join(' | ');
      addText(skillStr, 9, 'normal', [0, 0, 0], 15);
    }

    // Projects
    if (resume.projects.length > 0) {
      addText("PROJECTS", 10, 'bold', [0, 0, 0], 6);
      drawLine();
      resume.projects.forEach(p => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.text(p.name, margin, y);
        y += 11;
        doc.setFont('helvetica', 'normal');
        const lines = doc.splitTextToSize(p.description, contentWidth);
        doc.text(lines, margin, y);
        y += (lines.length * 11) + 10;
      });
    }

    // Certifications
    if (resume.certifications.length > 0) {
      addText("CERTIFICATIONS", 10, 'bold', [0, 0, 0], 6);
      drawLine();
      resume.certifications.forEach(c => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.text(c.name, margin, y);
        doc.text(c.year, pageWidth - margin, y, { align: 'right' });
        y += 11;
        doc.setFont('helvetica', 'normal');
        doc.text(c.issuer, margin, y);
        y += 15;
      });
    }

    // Awards
    if (resume.awards.length > 0) {
      addText("AWARDS & HONORS", 10, 'bold', [0, 0, 0], 6);
      drawLine();
      resume.awards.forEach(a => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.text(a.title, margin, y);
        doc.text(a.year, pageWidth - margin, y, { align: 'right' });
        y += 11;
        doc.setFont('helvetica', 'normal');
        doc.text(a.issuer, margin, y);
        y += 15;
      });
    }

    // Languages
    if (resume.languages.length > 0) {
      addText("LANGUAGES", 10, 'bold', [0, 0, 0], 6);
      drawLine();
      const langStr = resume.languages.map(l => `${l.language} (${l.proficiency})`).join(' | ');
      addText(langStr, 9, 'normal', [0, 0, 0], 15);
    }

    doc.save(`CV_${resume.personalInfo.fullName.replace(/\s+/g, '_')}.pdf`);
  };

  const sections = [
    { id: 'personal', label: "Personal Info", icon: User },
    { id: 'experience', label: "Experience", icon: Briefcase },
    { id: 'organizations', label: "Organizations", icon: Layers },
    { id: 'education', label: "Education", icon: GraduationCap },
    { id: 'skills', label: "Skills", icon: Zap },
    { id: 'projects', label: "Projects", icon: Code },
    { id: 'certifications', label: "Certifications", icon: Award },
    { id: 'languages', label: "Languages", icon: Globe },
    { id: 'awards', label: "Awards", icon: Target },
  ];

  return (
    <div className="h-full flex flex-col bg-surface-bg text-black selection:bg-brand-primary selection:text-white relative overflow-hidden">
      {/* Immersive Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-1/2 h-1/2 bg-brand-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-1/2 h-1/2 bg-brand-secondary/5 blur-[120px] rounded-full" />
      </div>

      {/* Header: Architect Console */}
      <div className="px-4 py-4 md:px-8 md:py-6 flex flex-col md:flex-row items-start md:items-center justify-between bg-white/80 backdrop-blur-xl border-b border-border-light z-20 shrink-0 gap-4 md:gap-0">
        <div className="flex items-center gap-4 md:gap-8 w-full md:w-auto">
          <button 
            onClick={onBack} 
            className="p-2 md:p-3 border border-border-light hover:border-black transition-all text-black hover:text-black bg-white shrink-0"
          >
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 text-brand-primary font-bold text-[8px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.4em] truncate">
              <FileText className="w-2.5 h-2.5 md:w-3 md:h-3" /> Document Architect
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <h2 className="text-lg md:text-2xl font-serif italic tracking-tight truncate">Resume Builder</h2>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between md:justify-end gap-2 md:gap-4 w-full md:w-auto">
          <div className="flex bg-white border border-border-light p-0.5 md:p-1 rounded-lg md:rounded-xl">
            <button 
              onClick={() => setView('edit')}
              className={`px-2 md:px-4 py-1.5 md:py-2 rounded-md md:rounded-lg text-[8px] md:text-[10px] font-mono uppercase tracking-widest transition-all ${view === 'edit' ? 'bg-brand-primary text-white shadow-lg' : 'text-black hover:text-black/80'}`}
            >
              Blueprint
            </button>
            <button 
              onClick={() => setView('preview')}
              className={`px-2 md:px-4 py-1.5 md:py-2 rounded-md md:rounded-lg text-[8px] md:text-[10px] font-mono uppercase tracking-widest transition-all ${view === 'preview' ? 'bg-brand-primary text-white shadow-lg' : 'text-black hover:text-black/80'}`}
            >
              Mirror
            </button>
          </div>
          <div className="hidden md:block w-px h-8 bg-border-light mx-2" />
          <div className="flex items-center gap-2">
            <button 
              onClick={handleAudit}
              className="px-3 md:px-6 py-2 md:py-2.5 bg-brand-secondary text-white text-[8px] md:text-[10px] font-bold uppercase tracking-[0.1em] md:tracking-[0.2em] hover:bg-brand-primary transition-all flex items-center gap-1.5 md:gap-2"
            >
              <Zap className="w-2.5 h-2.5 md:w-3 md:h-3" /> AI Audit
            </button>
            <button 
              onClick={downloadAsPDF}
              className="p-2 md:p-2.5 border border-border-light hover:border-black text-black hover:text-black/80 transition-all bg-white"
            >
              <Download className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden z-10">
        {/* Sidebar Navigation */}
        <div className="w-full md:w-72 border-b md:border-b-0 md:border-r border-border-light bg-white/50 backdrop-blur-md flex flex-col shrink-0">
          <div className="p-4 md:p-8 space-y-4 md:space-y-8">
            <div className="space-y-2">
              <span className="hidden md:block text-[9px] font-mono text-black uppercase tracking-widest">Navigation Protocol</span>
              <div className="flex md:flex-col overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 gap-1 md:space-y-1 scrollbar-none">
                {sections.map(section => (
                  <button
                    key={section.id}
                    onClick={() => {
                      setView('edit');
                      setActiveSection(section.id);
                    }}
                    className={`flex items-center justify-between p-2 md:p-3 transition-all group shrink-0 md:shrink ${activeSection === section.id && view === 'edit' ? 'bg-brand-primary/5 text-brand-primary' : 'text-black hover:text-black/80'}`}
                  >
                    <div className="flex items-center gap-2 md:gap-3">
                      <section.icon className={`w-3.5 h-3.5 md:w-4 md:h-4 ${activeSection === section.id && view === 'edit' ? 'text-brand-primary' : 'text-black/50 group-hover:text-black'}`} />
                      <span className="text-[10px] md:text-xs font-medium tracking-tight whitespace-nowrap">{section.label}</span>
                    </div>
                    {activeSection === section.id && view === 'edit' && <ChevronRight className="hidden md:block w-3 h-3" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="hidden md:block pt-8 border-t border-border-light space-y-4">
              <div className="flex items-center justify-between">
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-black">Integrity</span>
                  <span className="text-emerald-500">Verified</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-black">Sync</span>
                  <span className="text-emerald-500">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth scrollbar-thin scrollbar-thumb-border-light scrollbar-track-transparent">
          <AnimatePresence mode="wait">
            {view === 'edit' ? (
              <motion.div
                key="edit"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-4xl mx-auto space-y-8 md:space-y-16"
              >
                {/* Section Rendering Logic */}
                {activeSection === 'personal' && (
                  <div className="space-y-8 md:space-y-12">
                      <div className="space-y-2 md:space-y-4">
                        <h3 className="text-2xl md:text-4xl font-serif italic tracking-tight">Personal Information</h3>
                        <p className="text-black text-xs md:text-sm max-w-xl leading-relaxed">
                          Define your professional identity. This is the core signal that recruiters will process first.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 md:gap-y-8">
                        <div className="space-y-2">
                          <label className="text-[8px] md:text-[9px] font-mono text-black uppercase tracking-widest">Full Name</label>
                          <input 
                            type="text" 
                            value={resume.personalInfo.fullName}
                            onChange={e => updatePersonalInfo('fullName', e.target.value)}
                            className="w-full bg-white border border-border-light rounded-xl p-3 md:p-4 focus:border-brand-primary/50 outline-none transition-all font-serif italic text-base md:text-lg shadow-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[8px] md:text-[9px] font-mono text-black uppercase tracking-widest">Email Address</label>
                          <input 
                            type="email" 
                            value={resume.personalInfo.email}
                            onChange={e => updatePersonalInfo('email', e.target.value)}
                            className="w-full bg-white border border-border-light rounded-xl p-3 md:p-4 focus:border-brand-primary/50 outline-none transition-all font-mono text-xs md:text-sm shadow-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[8px] md:text-[9px] font-mono text-black uppercase tracking-widest">Phone Number</label>
                          <input 
                            type="text" 
                            value={resume.personalInfo.phone}
                            onChange={e => updatePersonalInfo('phone', e.target.value)}
                            className="w-full bg-white border border-border-light rounded-xl p-3 md:p-4 focus:border-brand-primary/50 outline-none transition-all font-mono text-xs md:text-sm shadow-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[8px] md:text-[9px] font-mono text-black uppercase tracking-widest">Location</label>
                          <input 
                            type="text" 
                            value={resume.personalInfo.location}
                            onChange={e => updatePersonalInfo('location', e.target.value)}
                            className="w-full bg-white border border-border-light rounded-xl p-3 md:p-4 focus:border-brand-primary/50 outline-none transition-all font-serif italic text-base md:text-lg shadow-sm"
                          />
                        </div>
                        <div className="md:col-span-2 space-y-1">
                          <label className="text-[8px] md:text-[9px] font-mono text-black uppercase tracking-widest">Professional Summary</label>
                          <textarea 
                            value={resume.personalInfo.summary}
                            onChange={e => updatePersonalInfo('summary', e.target.value)}
                            className="w-full bg-white border border-border-light rounded-xl p-4 md:p-6 h-32 md:h-40 focus:border-brand-primary/50 outline-none transition-all resize-none font-serif italic text-base md:text-lg leading-relaxed shadow-sm"
                            placeholder="Write a compelling summary of your professional journey..."
                          />
                        </div>
                      </div>

                      <div className="space-y-4 md:space-y-6">
                        <div className="flex items-center justify-between border-b border-border-light pb-2 md:pb-4">
                          <span className="text-[8px] md:text-[9px] font-mono text-black uppercase tracking-widest">Digital Footprint</span>
                          <button onClick={addLink} className="text-[9px] md:text-[10px] font-bold text-brand-primary hover:text-brand-secondary transition-colors flex items-center gap-1.5 md:gap-2">
                            <Plus className="w-2.5 h-2.5 md:w-3 md:h-3" /> Add Link
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          {resume.personalInfo.links.map((link, i) => (
                            <div key={i} className="flex gap-2 md:gap-3 items-center group">
                              <input 
                                placeholder="Label"
                                value={link.label}
                                onChange={e => updateLink(i, 'label', e.target.value)}
                                className="flex-1 bg-white border border-border-light rounded-xl p-2.5 md:p-3 text-[10px] md:text-xs outline-none focus:border-brand-primary/30 shadow-sm"
                              />
                              <input 
                                placeholder="URL"
                                value={link.url}
                                onChange={e => updateLink(i, 'url', e.target.value)}
                                className="flex-[2] bg-white border border-border-light rounded-xl p-2.5 md:p-3 text-[10px] md:text-xs outline-none focus:border-brand-primary/30 font-mono shadow-sm"
                              />
                              <button onClick={() => removeLink(i)} className="p-2 text-black hover:text-red-500 transition-colors shrink-0">
                                <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                  </div>
                )}

                {activeSection === 'experience' && (
                  <div className="space-y-8 md:space-y-12">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-2 md:space-y-4">
                        <h3 className="text-2xl md:text-4xl font-serif italic tracking-tight">Work Experience</h3>
                        <p className="text-black text-xs md:text-sm max-w-xl leading-relaxed">
                          Chronicle your professional evolution. Focus on impact and strategic contributions.
                        </p>
                      </div>
                      <button onClick={addExperience} className="w-full md:w-auto px-6 py-3 border border-brand-primary/30 text-brand-primary hover:bg-brand-primary hover:text-white transition-all text-[10px] md:text-xs font-bold uppercase tracking-widest">
                        Add Experience
                      </button>
                    </div>

                    <div className="space-y-6 md:space-y-8">
                      {resume.experience.map((exp, i) => (
                        <div key={i} className="p-6 md:p-10 bg-white border border-border-light rounded-2xl md:rounded-3xl relative group overflow-hidden shadow-sm">
                          <div className="absolute top-0 left-0 w-1 h-full bg-brand-primary/40" />
                          <button 
                            onClick={() => removeExperience(i)}
                            className="absolute top-4 right-4 md:top-6 md:right-6 p-2 text-black hover:text-red-500 transition-all md:opacity-0 md:group-hover:opacity-100"
                          >
                            <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                          </button>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                            <div className="space-y-2">
                              <label className="text-[8px] md:text-[9px] font-mono text-black uppercase tracking-widest">Company</label>
                              <input 
                                type="text" 
                                value={exp.company}
                                onChange={e => updateExperience(i, 'company', e.target.value)}
                                className="w-full bg-surface-bg border border-border-light rounded-xl p-3 md:p-4 focus:border-brand-primary/50 outline-none transition-all font-serif italic text-base md:text-lg shadow-inner"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[8px] md:text-[9px] font-mono text-black uppercase tracking-widest">Position</label>
                              <input 
                                type="text" 
                                value={exp.position}
                                onChange={e => updateExperience(i, 'position', e.target.value)}
                                className="w-full bg-surface-bg border border-border-light rounded-xl p-3 md:p-4 focus:border-brand-primary/50 outline-none transition-all font-serif italic text-base md:text-lg shadow-inner"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[8px] md:text-[9px] font-mono text-black uppercase tracking-widest">Duration</label>
                              <input 
                                type="text" 
                                value={exp.duration}
                                onChange={e => updateExperience(i, 'duration', e.target.value)}
                                className="w-full bg-surface-bg border border-border-light rounded-xl p-3 md:p-4 focus:border-brand-primary/50 outline-none transition-all font-mono text-xs md:text-sm shadow-inner"
                                placeholder="Jan 2020 - Present"
                              />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                              <label className="text-[8px] md:text-[9px] font-mono text-black uppercase tracking-widest">Description</label>
                              <textarea 
                                value={exp.description}
                                onChange={e => updateExperience(i, 'description', e.target.value)}
                                className="w-full bg-surface-bg border border-border-light rounded-xl p-4 md:p-6 h-32 md:h-40 focus:border-brand-primary/50 outline-none transition-all resize-none font-serif italic text-base md:text-lg leading-relaxed shadow-inner"
                                placeholder="Describe your key responsibilities and achievements..."
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeSection === 'education' && (
                  <div className="space-y-8 md:space-y-12">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-2 md:space-y-4">
                        <h3 className="text-2xl md:text-4xl font-serif italic tracking-tight">Education</h3>
                        <p className="text-black text-xs md:text-sm max-w-xl leading-relaxed">
                          Your academic foundation. Highlight specialized degrees and honors.
                        </p>
                      </div>
                      <button onClick={addEducation} className="w-full md:w-auto px-6 py-3 border border-brand-primary/30 text-brand-primary hover:bg-brand-primary hover:text-white transition-all text-[10px] md:text-xs font-bold uppercase tracking-widest">
                        Add Education
                      </button>
                    </div>

                    <div className="space-y-6 md:space-y-8">
                      {resume.education.map((edu, i) => (
                        <div key={i} className="p-6 md:p-10 bg-white border border-border-light rounded-2xl md:rounded-3xl relative group overflow-hidden shadow-sm">
                          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/40" />
                          <button 
                            onClick={() => removeEducation(i)}
                            className="absolute top-4 right-4 md:top-6 md:right-6 p-2 text-black hover:text-red-500 transition-all md:opacity-0 md:group-hover:opacity-100"
                          >
                            <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                          </button>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                            <div className="space-y-2">
                              <label className="text-[8px] md:text-[9px] font-mono text-black uppercase tracking-widest">School/University</label>
                              <input 
                                type="text" 
                                value={edu.school}
                                onChange={e => updateEducation(i, 'school', e.target.value)}
                                className="w-full bg-surface-bg border border-border-light rounded-xl p-3 md:p-4 focus:border-brand-primary/50 outline-none transition-all font-serif italic text-base md:text-lg shadow-inner"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[8px] md:text-[9px] font-mono text-black uppercase tracking-widest">Degree/Field of Study</label>
                              <input 
                                type="text" 
                                value={edu.degree}
                                onChange={e => updateEducation(i, 'degree', e.target.value)}
                                className="w-full bg-surface-bg border border-border-light rounded-xl p-3 md:p-4 focus:border-brand-primary/50 outline-none transition-all font-serif italic text-base md:text-lg shadow-inner"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[8px] md:text-[9px] font-mono text-black uppercase tracking-widest">Year</label>
                              <input 
                                type="text" 
                                value={edu.year}
                                onChange={e => updateEducation(i, 'year', e.target.value)}
                                className="w-full bg-surface-bg border border-border-light rounded-xl p-3 md:p-4 focus:border-brand-primary/50 outline-none transition-all font-mono text-xs md:text-sm shadow-inner"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[8px] md:text-[9px] font-mono text-black uppercase tracking-widest">GPA</label>
                              <input 
                                type="text" 
                                value={edu.gpa}
                                onChange={e => updateEducation(i, 'gpa', e.target.value)}
                                className="w-full bg-surface-bg border border-border-light rounded-xl p-3 md:p-4 focus:border-brand-primary/50 outline-none transition-all font-mono text-xs md:text-sm shadow-inner"
                                placeholder="3.85/4.00"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeSection === 'skills' && (
                  <div className="space-y-8 md:space-y-12">
                    <div className="space-y-2 md:space-y-4">
                      <h3 className="text-2xl md:text-4xl font-serif italic tracking-tight">Skills & Competencies</h3>
                      <p className="text-black text-xs md:text-sm max-w-xl leading-relaxed">
                        List your technical skills, tools, and core competencies.
                      </p>
                    </div>

                    <div className="p-6 md:p-10 bg-white border border-border-light rounded-2xl md:rounded-3xl shadow-sm">
                      <div className="flex flex-wrap gap-2 md:gap-3">
                        {resume.skills.map((skill, i) => (
                          <div key={i} className="px-3 md:px-4 py-1.5 md:py-2 bg-brand-primary/5 border border-brand-primary/20 rounded-lg md:rounded-xl text-[10px] md:text-xs font-mono text-brand-primary flex items-center gap-1.5 md:gap-2">
                            {skill}
                            <button 
                              onClick={() => setResume(prev => ({ ...prev, skills: prev.skills.filter((_, idx) => idx !== i) }))}
                              className="text-black hover:text-red-500 transition-colors"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                        <button 
                          onClick={() => {
                            const skill = prompt('Enter skill:');
                            if (skill) setResume(prev => ({ ...prev, skills: [...prev.skills, skill] }));
                          }}
                          className="px-3 md:px-4 py-1.5 md:py-2 border border-dashed border-border-light rounded-lg md:rounded-xl text-[10px] md:text-xs font-mono text-black hover:border-brand-primary hover:text-brand-primary transition-all"
                        >
                          + Add Skill
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'organizations' && (
                  <div className="space-y-8 md:space-y-12">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-2 md:space-y-4">
                        <h3 className="text-2xl md:text-4xl font-serif italic tracking-tight">Organizations & Leadership</h3>
                        <p className="text-black text-xs md:text-sm max-w-xl leading-relaxed">
                          Volunteer work, student organizations, or professional associations.
                        </p>
                      </div>
                      <button onClick={addOrganization} className="w-full md:w-auto px-6 py-3 border border-brand-primary/30 text-brand-primary hover:bg-brand-primary hover:text-white transition-all text-[10px] md:text-xs font-bold uppercase tracking-widest">
                        Add Organization
                      </button>
                    </div>

                    <div className="space-y-6 md:space-y-8">
                      {resume.organizations.map((org, i) => (
                        <div key={i} className="p-6 md:p-10 bg-white border border-border-light rounded-2xl md:rounded-3xl relative group overflow-hidden shadow-sm">
                          <div className="absolute top-0 left-0 w-1 h-full bg-brand-primary/40" />
                          <button 
                            onClick={() => removeOrganization(i)}
                            className="absolute top-4 right-4 md:top-6 md:right-6 p-2 text-black hover:text-red-500 transition-all md:opacity-0 md:group-hover:opacity-100"
                          >
                            <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                          </button>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                            <div className="space-y-2">
                              <label className="text-[8px] md:text-[9px] font-mono text-black uppercase tracking-widest">Organization</label>
                              <input 
                                type="text" 
                                value={org.name}
                                onChange={e => updateOrganization(i, 'name', e.target.value)}
                                className="w-full bg-surface-bg border border-border-light rounded-xl p-3 md:p-4 focus:border-brand-primary/50 outline-none transition-all font-serif italic text-base md:text-lg shadow-inner"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[8px] md:text-[9px] font-mono text-black uppercase tracking-widest">Role</label>
                              <input 
                                type="text" 
                                value={org.role}
                                onChange={e => updateOrganization(i, 'role', e.target.value)}
                                className="w-full bg-surface-bg border border-border-light rounded-xl p-3 md:p-4 focus:border-brand-primary/50 outline-none transition-all font-serif italic text-base md:text-lg shadow-inner"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[8px] md:text-[9px] font-mono text-black uppercase tracking-widest">Duration</label>
                              <input 
                                type="text" 
                                value={org.duration}
                                onChange={e => updateOrganization(i, 'duration', e.target.value)}
                                className="w-full bg-surface-bg border border-border-light rounded-xl p-3 md:p-4 focus:border-brand-primary/50 outline-none transition-all font-mono text-xs md:text-sm shadow-inner"
                              />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                              <label className="text-[8px] md:text-[9px] font-mono text-black uppercase tracking-widest">Description</label>
                              <textarea 
                                value={org.description}
                                onChange={e => updateOrganization(i, 'description', e.target.value)}
                                className="w-full bg-surface-bg border border-border-light rounded-xl p-4 md:p-6 h-32 md:h-40 focus:border-brand-primary/50 outline-none transition-all resize-none font-serif italic text-base md:text-lg leading-relaxed shadow-inner"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeSection === 'projects' && (
                  <div className="space-y-8 md:space-y-12">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-2 md:space-y-4">
                        <h3 className="text-2xl md:text-4xl font-serif italic tracking-tight">Key Projects</h3>
                        <p className="text-black text-xs md:text-sm max-w-xl leading-relaxed">
                          Showcase your best work, side projects, or academic research.
                        </p>
                      </div>
                      <button onClick={addProject} className="w-full md:w-auto px-6 py-3 border border-brand-primary/30 text-brand-primary hover:bg-brand-primary hover:text-white transition-all text-[10px] md:text-xs font-bold uppercase tracking-widest">
                        Add Project
                      </button>
                    </div>

                    <div className="space-y-6 md:space-y-8">
                      {resume.projects.map((p, i) => (
                        <div key={i} className="p-6 md:p-10 bg-white border border-border-light rounded-2xl md:rounded-3xl relative group overflow-hidden shadow-sm">
                          <div className="absolute top-0 left-0 w-1 h-full bg-brand-primary/40" />
                          <button 
                            onClick={() => removeProject(i)}
                            className="absolute top-4 right-4 md:top-6 md:right-6 p-2 text-black hover:text-red-500 transition-all md:opacity-0 md:group-hover:opacity-100"
                          >
                            <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                          </button>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                            <div className="space-y-2">
                              <label className="text-[8px] md:text-[9px] font-mono text-black uppercase tracking-widest">Project Name</label>
                              <input 
                                type="text" 
                                value={p.name}
                                onChange={e => updateProject(i, 'name', e.target.value)}
                                className="w-full bg-surface-bg border border-border-light rounded-xl p-3 md:p-4 focus:border-brand-primary/50 outline-none transition-all font-serif italic text-base md:text-lg shadow-inner"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[8px] md:text-[9px] font-mono text-black uppercase tracking-widest">Link (Optional)</label>
                              <input 
                                type="text" 
                                value={p.link}
                                onChange={e => updateProject(i, 'link', e.target.value)}
                                className="w-full bg-surface-bg border border-border-light rounded-xl p-3 md:p-4 focus:border-brand-primary/50 outline-none transition-all font-mono text-xs md:text-sm shadow-inner"
                              />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                              <label className="text-[8px] md:text-[9px] font-mono text-black uppercase tracking-widest">Description</label>
                              <textarea 
                                value={p.description}
                                onChange={e => updateProject(i, 'description', e.target.value)}
                                className="w-full bg-surface-bg border border-border-light rounded-xl p-4 md:p-6 h-32 md:h-40 focus:border-brand-primary/50 outline-none transition-all resize-none font-serif italic text-base md:text-lg leading-relaxed shadow-inner"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeSection === 'certifications' && (
                  <div className="space-y-8 md:space-y-12">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-2 md:space-y-4">
                        <h3 className="text-2xl md:text-4xl font-serif italic tracking-tight">Certifications</h3>
                        <p className="text-black text-xs md:text-sm max-w-xl leading-relaxed">
                          Professional certifications, licenses, or online courses.
                        </p>
                      </div>
                      <button onClick={addCertification} className="w-full md:w-auto px-6 py-3 border border-brand-primary/30 text-brand-primary hover:bg-brand-primary hover:text-white transition-all text-[10px] md:text-xs font-bold uppercase tracking-widest">
                        Add Certification
                      </button>
                    </div>

                    <div className="space-y-6 md:space-y-8">
                      {resume.certifications.map((c, i) => (
                        <div key={i} className="p-6 md:p-10 bg-white border border-border-light rounded-2xl md:rounded-3xl relative group overflow-hidden shadow-sm">
                          <div className="absolute top-0 left-0 w-1 h-full bg-brand-primary/40" />
                          <button 
                            onClick={() => removeCertification(i)}
                            className="absolute top-4 right-4 md:top-6 md:right-6 p-2 text-black hover:text-red-500 transition-all md:opacity-0 md:group-hover:opacity-100"
                          >
                            <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                          </button>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                            <div className="space-y-2">
                              <label className="text-[8px] md:text-[9px] font-mono text-black uppercase tracking-widest">Certification Name</label>
                              <input 
                                type="text" 
                                value={c.name}
                                onChange={e => updateCertification(i, 'name', e.target.value)}
                                className="w-full bg-surface-bg border border-border-light rounded-xl p-3 md:p-4 focus:border-brand-primary/50 outline-none transition-all font-serif italic text-base md:text-lg shadow-inner"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[8px] md:text-[9px] font-mono text-black uppercase tracking-widest">Issuer</label>
                              <input 
                                type="text" 
                                value={c.issuer}
                                onChange={e => updateCertification(i, 'issuer', e.target.value)}
                                className="w-full bg-surface-bg border border-border-light rounded-xl p-3 md:p-4 focus:border-brand-primary/50 outline-none transition-all font-serif italic text-base md:text-lg shadow-inner"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[8px] md:text-[9px] font-mono text-black uppercase tracking-widest">Year</label>
                              <input 
                                type="text" 
                                value={c.year}
                                onChange={e => updateCertification(i, 'year', e.target.value)}
                                className="w-full bg-surface-bg border border-border-light rounded-xl p-3 md:p-4 focus:border-brand-primary/50 outline-none transition-all font-mono text-xs md:text-sm shadow-inner"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeSection === 'languages' && (
                  <div className="space-y-8 md:space-y-12">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-2 md:space-y-4">
                        <h3 className="text-2xl md:text-4xl font-serif italic tracking-tight">Languages</h3>
                        <p className="text-black text-xs md:text-sm max-w-xl leading-relaxed">
                          List languages you speak and your proficiency level.
                        </p>
                      </div>
                      <button onClick={addLanguage} className="w-full md:w-auto px-6 py-3 border border-brand-primary/30 text-brand-primary hover:bg-brand-primary hover:text-white transition-all text-[10px] md:text-xs font-bold uppercase tracking-widest">
                        Add Language
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      {resume.languages.map((l, i) => (
                        <div key={i} className="p-6 md:p-10 bg-white border border-border-light rounded-2xl md:rounded-3xl relative group overflow-hidden shadow-sm">
                          <div className="absolute top-0 left-0 w-1 h-full bg-brand-primary/40" />
                          <button 
                            onClick={() => removeLanguage(i)}
                            className="absolute top-4 right-4 md:top-6 md:right-6 p-2 text-black hover:text-red-500 transition-all md:opacity-0 md:group-hover:opacity-100"
                          >
                            <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                          </button>
                          
                          <div className="space-y-4 md:space-y-6">
                            <div className="space-y-2">
                              <label className="text-[8px] md:text-[9px] font-mono text-black uppercase tracking-widest">Language</label>
                              <input 
                                type="text" 
                                value={l.language}
                                onChange={e => updateLanguage(i, 'language', e.target.value)}
                                className="w-full bg-surface-bg border border-border-light rounded-xl p-3 md:p-4 focus:border-brand-primary/50 outline-none transition-all font-serif italic text-base md:text-lg shadow-inner"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[8px] md:text-[9px] font-mono text-black uppercase tracking-widest">Proficiency</label>
                              <input 
                                type="text" 
                                value={l.proficiency}
                                onChange={e => updateLanguage(i, 'proficiency', e.target.value)}
                                className="w-full bg-surface-bg border border-border-light rounded-xl p-3 md:p-4 focus:border-brand-primary/50 outline-none transition-all font-serif italic text-base md:text-lg shadow-inner"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeSection === 'awards' && (
                  <div className="space-y-8 md:space-y-12">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-2 md:space-y-4">
                        <h3 className="text-2xl md:text-4xl font-serif italic tracking-tight">Awards & Honors</h3>
                        <p className="text-black text-xs md:text-sm max-w-xl leading-relaxed">
                          Scholarships, competitions, or professional recognition.
                        </p>
                      </div>
                      <button onClick={addAward} className="w-full md:w-auto px-6 py-3 border border-brand-primary/30 text-brand-primary hover:bg-brand-primary hover:text-white transition-all text-[10px] md:text-xs font-bold uppercase tracking-widest">
                        Add Award
                      </button>
                    </div>

                    <div className="space-y-6 md:space-y-8">
                      {resume.awards.map((a, i) => (
                        <div key={i} className="p-6 md:p-10 bg-white border border-border-light rounded-2xl md:rounded-3xl relative group overflow-hidden shadow-sm">
                          <div className="absolute top-0 left-0 w-1 h-full bg-brand-primary/40" />
                          <button 
                            onClick={() => removeAward(i)}
                            className="absolute top-4 right-4 md:top-6 md:right-6 p-2 text-black hover:text-red-500 transition-all md:opacity-0 md:group-hover:opacity-100"
                          >
                            <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                          </button>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                            <div className="space-y-2">
                              <label className="text-[8px] md:text-[9px] font-mono text-black uppercase tracking-widest">Award Title</label>
                              <input 
                                type="text" 
                                value={a.title}
                                onChange={e => updateAward(i, 'title', e.target.value)}
                                className="w-full bg-surface-bg border border-border-light rounded-xl p-3 md:p-4 focus:border-brand-primary/50 outline-none transition-all font-serif italic text-base md:text-lg shadow-inner"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[8px] md:text-[9px] font-mono text-black uppercase tracking-widest">Issuer</label>
                              <input 
                                type="text" 
                                value={a.issuer}
                                onChange={e => updateAward(i, 'issuer', e.target.value)}
                                className="w-full bg-surface-bg border border-border-light rounded-xl p-3 md:p-4 focus:border-brand-primary/50 outline-none transition-all font-serif italic text-base md:text-lg shadow-inner"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[8px] md:text-[9px] font-mono text-black uppercase tracking-widest">Year</label>
                              <input 
                                type="text" 
                                value={a.year}
                                onChange={e => updateAward(i, 'year', e.target.value)}
                                className="w-full bg-surface-bg border border-border-light rounded-xl p-3 md:p-4 focus:border-brand-primary/50 outline-none transition-all font-mono text-xs md:text-sm shadow-inner"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ) : view === 'preview' ? (
              <motion.div
                key="preview"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="max-w-4xl mx-auto bg-white text-black p-12 shadow-[0_0_100px_rgba(0,0,0,0.5)] min-h-[1100px] font-serif selection:bg-brand-primary/20"
              >
                <div className="space-y-8">
                  {/* Preview Header */}
                  <div className="text-center space-y-4 border-b-2 border-black pb-8">
                    <h1 className="text-5xl font-black uppercase tracking-tighter leading-none">{resume.personalInfo.fullName}</h1>
                    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-[9px] font-mono uppercase tracking-widest text-black">
                      <span>{resume.personalInfo.email}</span>
                      <span>{resume.personalInfo.phone}</span>
                      <span>{resume.personalInfo.location}</span>
                      {resume.personalInfo.links.map((l, i) => (
                        <a key={i} href={l.url} target="_blank" rel="noopener noreferrer" className="hover:text-brand-primary underline">{l.label}</a>
                      ))}
                    </div>
                  </div>

                  {/* Preview Summary */}
                  <section className="space-y-2">
                    <h2 className="text-[10px] font-mono uppercase tracking-[0.4em] border-b border-black/10 pb-1">Summary</h2>
                    <p className="text-base leading-snug text-justify italic">{resume.personalInfo.summary}</p>
                  </section>

                  {/* Preview Experience */}
                  <section className="space-y-6">
                    <h2 className="text-[10px] font-mono uppercase tracking-[0.4em] border-b border-black/10 pb-1">Experience</h2>
                    <div className="space-y-6">
                      {resume.experience.map((exp, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between items-baseline">
                            <h3 className="text-xl font-bold italic">{exp.position}</h3>
                            <span className="text-[10px] font-mono uppercase tracking-widest text-black">{exp.duration}</span>
                          </div>
                          <p className="text-xs font-bold uppercase tracking-widest text-brand-primary">{exp.company}</p>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap text-black">{exp.description}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Preview Organizations */}
                  {resume.organizations.length > 0 && (
                    <section className="space-y-6">
                      <h2 className="text-[10px] font-mono uppercase tracking-[0.4em] border-b border-black/10 pb-1">Organizations</h2>
                      <div className="space-y-6">
                        {resume.organizations.map((org, i) => (
                          <div key={i} className="space-y-1">
                            <div className="flex justify-between items-baseline">
                              <h3 className="text-xl font-bold italic">{org.role}</h3>
                              <span className="text-[10px] font-mono uppercase tracking-widest text-black">{org.duration}</span>
                            </div>
                            <p className="text-xs font-bold uppercase tracking-widest text-brand-primary">{org.name}</p>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap text-black">{org.description}</p>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  <div className="grid grid-cols-2 gap-12">
                    <div className="space-y-8">
                      <section className="space-y-4">
                        <h2 className="text-[10px] font-mono uppercase tracking-[0.4em] border-b border-black/10 pb-1">Education</h2>
                        {resume.education.map((edu, i) => (
                          <div key={i} className="space-y-0.5">
                            <h3 className="text-base font-bold italic">{edu.school}</h3>
                            <p className="text-xs font-medium">{edu.degree}</p>
                            <p className="text-[9px] font-mono uppercase tracking-widest text-black">{edu.year} {edu.gpa ? `• GPA: ${edu.gpa}` : ''}</p>
                          </div>
                        ))}
                      </section>

                      {resume.projects.length > 0 && (
                        <section className="space-y-4">
                          <h2 className="text-[10px] font-mono uppercase tracking-[0.4em] border-b border-black/10 pb-1">Projects</h2>
                          {resume.projects.map((p, i) => (
                            <div key={i} className="space-y-0.5">
                              <h3 className="text-base font-bold italic">{p.name}</h3>
                              <p className="text-xs leading-relaxed text-black/80">{p.description}</p>
                            </div>
                          ))}
                        </section>
                      )}

                      {resume.awards.length > 0 && (
                        <section className="space-y-4">
                          <h2 className="text-[10px] font-mono uppercase tracking-[0.4em] border-b border-black/10 pb-1">Awards</h2>
                          {resume.awards.map((a, i) => (
                            <div key={i} className="space-y-0.5">
                              <h3 className="text-base font-bold italic">{a.title}</h3>
                              <p className="text-[9px] font-mono uppercase tracking-widest text-black">{a.issuer} • {a.year}</p>
                            </div>
                          ))}
                        </section>
                      )}
                    </div>

                    <div className="space-y-8">
                      <section className="space-y-4">
                        <h2 className="text-[10px] font-mono uppercase tracking-[0.4em] border-b border-black/10 pb-1">Skills</h2>
                        <div className="flex flex-wrap gap-x-3 gap-y-1">
                          {resume.skills.map((skill, i) => (
                            <span key={i} className="text-[10px] font-mono uppercase tracking-widest border-b border-black/10 pb-0.5">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </section>

                      {resume.certifications.length > 0 && (
                        <section className="space-y-4">
                          <h2 className="text-[10px] font-mono uppercase tracking-[0.4em] border-b border-black/10 pb-1">Certifications</h2>
                          {resume.certifications.map((c, i) => (
                            <div key={i} className="space-y-0.5">
                              <h3 className="text-xs font-bold italic">{c.name}</h3>
                              <p className="text-[9px] font-mono uppercase tracking-widest text-black">{c.issuer} • {c.year}</p>
                            </div>
                          ))}
                        </section>
                      )}

                      {resume.languages.length > 0 && (
                        <section className="space-y-4">
                          <h2 className="text-[10px] font-mono uppercase tracking-[0.4em] border-b border-black/10 pb-1">Languages</h2>
                          <div className="space-y-1">
                            {resume.languages.map((l, i) => (
                              <div key={i} className="flex justify-between items-center">
                                <span className="text-xs font-bold italic">{l.language}</span>
                                <span className="text-[9px] font-mono uppercase tracking-widest text-black">{l.proficiency}</span>
                              </div>
                            ))}
                          </div>
                        </section>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="audit"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="max-w-4xl mx-auto space-y-6"
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 bg-brand-secondary/10 border border-brand-secondary/30 rounded-full flex items-center justify-center relative">
                    <ShieldCheck className="w-8 h-8 text-brand-secondary" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-2xl font-serif italic tracking-tight">Strategic Audit Protocol</h3>
                    <p className="text-black font-mono text-[9px] uppercase tracking-[0.3em]">
                      Analyzing Narrative Integrity & Market Alignment
                    </p>
                  </div>
                </div>

                <div className="bg-white border border-border-light rounded-2xl p-8 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-brand-secondary/50" />
                  {auditLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-4">
                      <RefreshCw className="w-10 h-10 text-brand-secondary animate-spin" />
                      <div className="space-y-1 text-center">
                        <p className="text-[10px] font-mono text-brand-secondary uppercase tracking-[0.4em] animate-pulse">AI is thinking...</p>
                        <p className="text-black text-[9px] font-mono uppercase tracking-widest">Running heuristic analysis on document structure</p>
                      </div>
                    </div>
                  ) : (
                    <div className="markdown-body prose max-w-none prose-p:font-serif prose-p:italic prose-p:text-base prose-headings:font-serif prose-headings:italic prose-headings:mb-1 prose-p:mb-2 prose-li:mb-1 prose-ul:mb-4">
                      <ReactMarkdown>{auditResult}</ReactMarkdown>
                    </div>
                  )}
                </div>

                {!auditLoading && (
                  <div className="flex justify-center">
                    <button 
                      onClick={() => setView('edit')}
                      className="px-12 py-4 border border-border-light hover:border-brand-primary text-black hover:text-brand-primary transition-all text-xs font-bold uppercase tracking-[0.3em] rounded-full bg-white"
                    >
                      Return to Blueprint
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
