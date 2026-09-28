import React, { useEffect } from 'react';
import { X, ArrowUpRight, CheckCircle2, Layers, Cpu, Globe } from 'lucide-react';
import { Project } from '../../types';
import { SoundEngine } from '../../lib/audio';

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
  onOpenContact: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  project,
  onClose,
  onOpenContact
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (project) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [project, onClose]);

  if (!project) return null;

  return (
    <div
      id="project-modal-backdrop"
      className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-end animate-fadeIn select-none"
      onClick={onClose}
    >
      <div
        id="project-modal-drawer"
        className="relative w-full max-w-2xl h-full bg-[#0d0d10] border-l border-neutral-800 text-white flex flex-col justify-between overflow-y-auto p-6 sm:p-10 md:p-12 shadow-2xl animate-slideInRight"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-6">
          <div className="flex items-center space-x-3">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: project.accentColor }} />
            <span className="font-mono text-xs text-neutral-400 uppercase tracking-widest">
              {project.category} • {project.year}
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              SoundEngine.playTick();
              onClose();
            }}
            className="w-10 h-10 rounded-full border border-neutral-800 bg-neutral-900 hover:border-neutral-600 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4 text-neutral-300" />
          </button>
        </div>

        {/* Content Body */}
        <div className="space-y-8 my-8">
          <div>
            <span className="font-mono text-xs text-orange-400 uppercase tracking-widest">
              CLIENT: {project.client}
            </span>
            <h2 className="font-display text-4xl sm:text-5xl font-extrabold uppercase tracking-tight text-white mt-1">
              {project.title}
            </h2>
          </div>

          {/* Hero Visual Mockup */}
          <div className="relative w-full h-64 sm:h-80 rounded-xl overflow-hidden border border-neutral-800">
            <img
              src={project.image}
              alt={project.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-black/70 backdrop-blur-sm border border-white/20 text-xs font-mono text-white">
              {project.metrics}
            </div>
          </div>

          {/* Detailed Narrative */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-widest text-neutral-400">
              [ THE CHALLENGE & SYSTEM EXECUTION ]
            </h3>
            <p className="text-sm sm:text-base text-neutral-300 leading-relaxed font-sans">
              {project.description}
            </p>
          </div>

          {/* Technology Matrix */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-widest text-neutral-400 flex items-center space-x-2">
              <Cpu className="w-3.5 h-3.5 text-orange-400" />
              <span>CORE ARCHITECTURE & TECH MATRIX</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full text-xs font-mono bg-neutral-900 border border-neutral-800 text-neutral-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Delivered Milestones */}
          <div className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/50 space-y-3 text-xs font-mono">
            <span className="text-neutral-400 uppercase tracking-wider block">KEY DELIVERABLES</span>
            <div className="space-y-2 text-neutral-300">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Custom WebGL engine with dynamic hardware acceleration</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Design system with tokenized color, typography & motion scales</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Production Lighthouse performance audited at 98+ score</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer CTAs */}
        <div className="flex items-center justify-between border-t border-neutral-800 pt-6">
          <button
            type="button"
            onClick={() => {
              SoundEngine.playTick();
              onClose();
              onOpenContact();
            }}
            className="flex items-center space-x-2 px-6 py-3 rounded-full bg-orange-500 hover:bg-orange-400 text-black font-semibold text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer"
          >
            <span>REQUEST SIMILAR WORK</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="text-xs font-mono text-neutral-400 hover:text-white uppercase tracking-wider cursor-pointer"
          >
            CLOSE CASE STUDY
          </button>
        </div>
      </div>
    </div>
  );
};
