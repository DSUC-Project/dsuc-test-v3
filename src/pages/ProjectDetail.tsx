import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, Github, Share2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { SectionHeader, SoftBrutalCard, StatusBadge, ActionButton } from '@/components/ui/Primitives';

export function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { projects } = useStore();
  
  const project = projects.find(p => p.id === id);

  if (!project) {
    return <div className="text-text-muted text-center pt-20 font-mono text-sm uppercase">Project Not Found</div>;
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link Copied to Clipboard');
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-16 space-y-12">
      <button 
        onClick={() => navigate('/projects')}
        className="flex items-center gap-2 text-text-muted hover:text-text-main transition-colors font-mono text-xs uppercase tracking-widest w-fit border brutal-border px-4 py-2 bg-surface hover:bg-main-bg"
      >
        <ArrowLeft size={16} /> Back to Projects
      </button>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full"
      >
        <SoftBrutalCard className="p-8 md:p-12 relative overflow-hidden h-full flex flex-col">
          <button 
            onClick={handleCopyLink}
            className="absolute top-8 right-8 text-text-muted hover:text-text-main hover:bg-main-bg p-3 border brutal-border transition-colors z-20"
            title="Share Link"
          >
            <Share2 size={20} />
          </button>

          <div className="flex flex-col md:flex-row items-start gap-8 mb-12 relative z-10 w-full xl:w-5/6 pr-12 md:pr-24">
             <div className="flex-1 mt-2">
                <div className="flex flex-wrap items-center gap-3 mb-6">
                   <StatusBadge status={project.category} />
                   <span className="text-[10px] text-emerald-500 font-mono font-bold tracking-widest uppercase flex items-center gap-2 px-3 py-1 border brutal-border bg-surface">
                     <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                     </span>
                     ONLINE
                   </span>
                </div>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-text-main mb-6 leading-tight tracking-tight uppercase">{project.name}</h1>
                
                <div className="flex flex-wrap gap-2">
                  {project.builders.map(b => (
                     <span key={b} className="text-[10px] font-mono font-bold tracking-wide text-text-muted uppercase bg-main-bg px-3 py-1 border brutal-border cursor-default">
                       {b}
                     </span>
                  ))}
                </div>
             </div>
          </div>

          <div className="mb-12 relative z-10 bg-main-bg border brutal-border p-8 mt-8">
             <h3 className="text-xs font-mono font-bold text-text-muted uppercase mb-6 tracking-widest flex items-center gap-3 border-b brutal-border pb-4">
               <span className="w-2 h-2 bg-primary block" /> Overview
             </h3>
             <p className="text-text-main font-mono text-sm leading-relaxed pl-5 border-l-2 border-primary/30">
               {project.description}
             </p>

             {project.techStack && project.techStack.length > 0 && (
                <div className="mt-8 border-t brutal-border pt-6">
                    <h4 className="text-[10px] font-mono text-text-muted uppercase tracking-widest mb-4">Tech Stack</h4>
                    <div className="flex flex-wrap gap-2">
                      {project.techStack.map(tech => (
                        <span key={tech} className="text-[10px] font-mono uppercase bg-surface px-2 py-1 border brutal-border text-text-main">{tech}</span>
                      ))}
                    </div>
                </div>
             )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-10 mt-auto pt-8 border-t brutal-border">
             <ActionButton 
               variant="primary"
               onClick={() => window.open(project.link, '_blank')}
               className="w-full"
             >
               <span className="flex items-center justify-center gap-2"><ExternalLink size={20} /> View Demo</span>
             </ActionButton>
             {project.repoLink && (
               <ActionButton 
                 variant="secondary"
                 onClick={() => window.open(project.repoLink, '_blank')}
                 className="w-full"
               >
                 <span className="flex items-center justify-center gap-2"><Github size={20} /> Source Code</span>
               </ActionButton>
             )}
          </div>
        </SoftBrutalCard>
      </motion.div>
    </div>
  );
}
