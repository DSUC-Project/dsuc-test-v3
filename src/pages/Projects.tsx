import toast from 'react-hot-toast';
import React, { useState } from 'react';
import { SectionHeader, SoftBrutalCard, ActionButton, StatusBadge } from '@/components/ui/Primitives';
import { useStore } from '@/store/useStore';
import { Project } from '@/types';
import ReactDOM from 'react-dom';
import { motion } from 'motion/react';
import { Plus, X } from 'lucide-react';
import { Link } from 'react-router-dom';

function AddProjectModal({ isOpen, onClose, onAdd }: { isOpen: boolean, onClose: () => void, onAdd: (p: Project) => void }) {
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    onAdd({
      id: Math.random().toString(),
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      category: formData.get('category') as string,
      builders: (formData.get('builders') as string).split(',').map(s => s.trim()),
      link: formData.get('link') as string,
      repoLink: formData.get('repoLink') as string,
      tech_stack: (formData.get('tech_stack') as string).split(',').map(s => s.trim()),
      status: 'Draft'
    });
    onClose();
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto" onClick={onClose}>
      <div className="absolute inset-0 bg-main-bg/80 backdrop-blur-sm" />
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }} 
        animate={{ scale: 1, opacity: 1, y: 0 }} 
        className="bg-surface border brutal-border p-8 w-full max-w-lg relative z-10 my-8 max-h-[90vh] overflow-y-auto shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-6 right-6 text-text-muted hover:text-text-main transition-colors z-10">
          <X size={20} />
        </button>
        
        <div className="mb-8 pr-10">
          <h3 className="text-2xl font-display font-bold uppercase tracking-tight">Add Project</h3>
          <p className="text-sm text-text-muted mt-2">Showcase your work to the community.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Project Name</label>
            <input name="name" required className="w-full bg-main-bg border brutal-border px-4 py-3 outline-none font-mono text-sm transition-all focus:border-primary" />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Description</label>
            <textarea name="description" rows={3} required className="w-full bg-main-bg border brutal-border px-4 py-3 outline-none font-mono text-sm transition-all focus:border-primary resize-none" />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Category</label>
            <input name="category" placeholder="e.g. Infrastructure, DeFi" required className="w-full bg-main-bg border brutal-border px-4 py-3 outline-none font-mono text-sm transition-all focus:border-primary" />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Tech Stack (comma separated)</label>
            <input name="tech_stack" placeholder="React, Node, Solana" className="w-full bg-main-bg border brutal-border px-4 py-3 outline-none font-mono text-sm transition-all focus:border-primary" />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Builders (comma separated)</label>
            <input name="builders" placeholder="Zah, Cuong..." required className="w-full bg-main-bg border brutal-border px-4 py-3 outline-none font-mono text-sm transition-all focus:border-primary" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Website Link</label>
              <input name="link" required className="w-full bg-main-bg border brutal-border px-4 py-3 outline-none font-mono text-sm transition-all focus:border-primary" />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-text-muted">GitHub Repo</label>
              <input name="repoLink" className="w-full bg-main-bg border brutal-border px-4 py-3 outline-none font-mono text-sm transition-all focus:border-primary" />
            </div>
          </div>

          <ActionButton type="submit" variant="primary" className="w-full mt-4">Submit Project</ActionButton>
        </form>
      </motion.div>
    </div>,
    document.body
  );
}

export function Projects() {
  const { projects, addProject, currentUser } = useStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const canManage = currentUser?.memberType === 'member';

  const handleAddClick = () => {
    if (!currentUser) {
      toast('Vui lòng đăng nhập trước!');
      return;
    }
    if (!canManage) {
      toast('Tài khoản cộng đồng không thể tạo dự án.');
      return;
    }
    setIsAddModalOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b brutal-border pb-8">
         <SectionHeader title="Project Showcase" subtitle="Products shipped by DSUC builders." className="mb-4 md:mb-0" />
         
         <div className="w-full md:w-auto">
           {canManage ? (
             <ActionButton variant="primary" className="w-full md:w-auto min-w-[150px]" onClick={handleAddClick}>
               <span className="flex justify-center items-center gap-2"><Plus size={16}/> Add Project</span>
             </ActionButton>
           ) : (
             <div className="px-4 py-2 bg-main-bg border brutal-border text-xs font-mono text-text-muted text-center">
               Restricted to Members
             </div>
           )}
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
         {projects.map((proj) => (
            <Link to={`/project/${proj.id}`} key={proj.id} className="block h-full cursor-pointer">
              <div className="flex flex-col h-full bg-surface border brutal-border p-5 group hover:border-primary transition-colors shadow-sm relative overflow-hidden">
                 
                 <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                   <span className="text-primary font-mono text-lg">↗</span>
                 </div>

                 <div className="flex flex-col flex-1">
                    <div className="flex items-start justify-between mb-1 gap-4">
                       <h3 className="font-heading font-bold text-xl uppercase tracking-tight truncate pr-6">{proj.name}</h3>
                    </div>
                    <p className="font-mono text-[10px] uppercase text-text-muted mb-4">{proj.category} • <span className={proj.status === 'Published' ? "text-emerald-500 font-bold" : ""}>{proj.status || 'LIVE'}</span></p>
                    
                    <p className="text-sm text-text-muted mb-6 flex-1 line-clamp-3 leading-relaxed">
                      {proj.description}
                    </p>
                    
                    {proj.tech_stack && proj.tech_stack.length > 0 && (
                      <div className="mb-4 flex flex-wrap gap-1.5">
                        {proj.tech_stack.slice(0, 4).map(t => (
                          <span key={t} className="px-2 py-1 bg-main-bg border brutal-border text-[9px] font-mono whitespace-nowrap">{t}</span>
                        ))}
                        {proj.tech_stack.length > 4 && <span className="px-2 py-1 bg-main-bg text-text-muted text-[9px] font-mono">+{proj.tech_stack.length - 4}</span>}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between border-t brutal-border pt-4 mt-auto">
                       <div className="flex flex-col w-full">
                          <span className="text-[9px] font-mono uppercase text-text-muted mb-1">Builders</span>
                          <span className="text-xs font-bold truncate">{proj.builders.join(', ')}</span>
                       </div>
                    </div>
                 </div>
              </div>
            </Link>
         ))}
      </div>
      
      <AddProjectModal isOpen={isAddModalOpen && canManage} onClose={() => setIsAddModalOpen(false)} onAdd={addProject} />
    </div>
  );
}
