import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { motion } from 'motion/react';
import { GitBranch, Star, Code, ExternalLink, Plus, X, Briefcase } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Bounty, Repo } from '../types';
import { clsx } from 'clsx';
import { SectionHeader, SoftBrutalCard, StatusBadge, ActionButton } from '@/components/ui/Primitives';

export function Work() {
  const [activeTab, setActiveTab] = useState<'bounties' | 'repos'>('bounties');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { currentUser } = useStore();
  const canManage = currentUser?.memberType === 'member';

  const handleAddClick = () => {
    if (!currentUser) {
      alert('Vui lòng đăng nhập trước!');
      return;
    }

    if (!canManage) {
      alert('Tài khoản cộng đồng không thể tạo dự án/nhiệm vụ.');
      return;
    }
    setIsModalOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-16 space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between items-start gap-4 mb-8 border-b brutal-border pb-8">
        <SectionHeader title="Work Board" subtitle="Bounties & Open Source repositories from DSUC." className="mb-0 border-none pb-0" />
        <div className="w-full md:w-auto mt-4 md:mt-0 flex gap-4">
           {canManage && (
             <ActionButton variant="primary" onClick={handleAddClick} className="w-full md:w-auto">
               <span className="flex items-center gap-2">
                 <Plus size={16}/> ADD {activeTab === 'bounties' ? 'BOUNTY' : 'REPO'}
               </span>
             </ActionButton>
           )}
        </div>
      </div>

      <div className="flex bg-surface border brutal-border w-fit">
        <TabButton active={activeTab === 'bounties'} onClick={() => setActiveTab('bounties')}>
          Bounties
        </TabButton>
        <TabButton active={activeTab === 'repos'} onClick={() => setActiveTab('repos')}>
          Open Source
        </TabButton>
      </div>

      {activeTab === 'bounties' ? <BountyBoard /> : <RepoList />}
      
      {isModalOpen && canManage && <AddItemModal type={activeTab} onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}

function TabButton({ children, active, onClick }: { children?: React.ReactNode, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={clsx(
        "px-6 py-3 text-sm font-mono uppercase tracking-widest transition-colors whitespace-nowrap border-x border-transparent first:border-l-0 last:border-r-0",
        active ? "bg-primary text-main-bg font-bold border-r-brutal-border" : "text-text-muted hover:text-text-main hover:bg-main-bg"
      )}
    >
      {children}
    </button>
  );
}

function BountyBoard() {
  const { bounties } = useStore();
  const columns = ['Open', 'In Progress', 'Completed', 'Closed'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {columns.map(status => (
        <div key={status} className="bg-main-bg border brutal-border p-4 h-full flex flex-col">
          <div className="flex items-center gap-2 mb-4 border-b brutal-border pb-3">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-text-main shrink-0 flex-1">{status}</span>
            <span className="bg-surface border brutal-border text-text-main text-[10px] font-mono px-2 py-0.5">
              {bounties.filter(b => b.status === status).length}
            </span>
          </div>

          <div className="space-y-4 flex-1">
             {bounties.filter(b => b.status === status).map(bounty => (
               <BountyCard key={bounty.id} bounty={bounty} />
             ))}
             {bounties.filter(b => b.status === status).length === 0 && (
                <div className="h-24 border border-dashed brutal-border flex items-center justify-center text-text-muted text-[10px] font-mono uppercase tracking-widest bg-surface">
                  Empty
                </div>
             )}
          </div>
        </div>
      ))}
    </div>
  );
}

function BountyCard({ bounty }: { bounty: Bounty; key?: React.Key }) {
  const content = (
    <div className="p-4 flex flex-col h-full relative cursor-pointer hover:bg-surface border brutal-border border-transparent hover:border-text-main transition-colors bg-main-bg">
      <div className="flex justify-between items-start mb-3">
         <span className="text-[9px] font-mono font-bold px-2 py-0.5 uppercase border brutal-border bg-surface text-text-muted">
           {bounty.difficulty}
         </span>
         <span className="text-primary font-mono font-bold text-xs">{bounty.reward}</span>
      </div>
      <h4 className="font-bold text-text-main text-sm leading-tight mb-3">{bounty.title}</h4>
      <div className="flex flex-wrap gap-1.5 mb-4 mt-auto">
        {bounty.tags.map(tag => (
          <span key={tag} className="text-[9px] text-text-muted font-mono uppercase tracking-wider bg-surface px-1.5 py-0.5 border brutal-border">#{tag}</span>
        ))}
      </div>
      {bounty.submitLink && (
        <div className="mt-2 w-full py-1.5 text-primary text-[10px] font-bold font-mono tracking-widest uppercase transition-colors flex items-center justify-center gap-1 border brutal-border hover:bg-primary hover:text-main-bg">
          VIEW TASK
          <ExternalLink size={12} className="transition-transform group-hover:translate-x-1" />
        </div>
      )}
    </div>
  );

  if (bounty.submitLink) {
    return (
      <a
        href={bounty.submitLink}
        target="_blank"
        rel="noopener noreferrer"
        className="block group"
      >
        {content}
      </a>
    );
  }

  return (
    <div className="block group">
      {content}
    </div>
  );
}

function RepoList() {
  const { repos } = useStore();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {repos.map((repo) => {
        const content = (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10 w-full h-full">
            <div className="flex items-start sm:items-center gap-5 flex-1">
              <div className="w-10 h-10 bg-main-bg flex items-center justify-center text-primary border brutal-border shrink-0 group-hover:bg-primary group-hover:text-main-bg transition-colors">
                <Code size={20} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-display font-bold text-text-main tracking-tight line-clamp-1">{repo.name}</h3>
                <p className="text-text-muted font-mono text-xs mt-1 line-clamp-2">{repo.description}</p>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-4 pl-5 shrink-0 sm:mt-0 sm:pl-0">
               <div className="flex items-center gap-2 text-text-main font-mono font-bold text-[10px] uppercase tracking-widest bg-surface px-2 py-1 border brutal-border">
                  <div className="w-1.5 h-1.5 rounded-full bg-text-main" />
                  {repo.language}
               </div>
               <div className="flex items-center gap-3 text-xs font-mono font-bold text-text-muted bg-main-bg px-2 py-1 border brutal-border">
                  <div className="flex items-center gap-1"><Star size={12} className="text-text-muted" /> {repo.stars}</div>
                  <div className="flex items-center gap-1"><GitBranch size={12} className="text-text-muted" /> {repo.forks}</div>
               </div>
               <div className="p-1.5 text-text-main bg-main-bg border brutal-border group-hover:bg-primary group-hover:text-main-bg transition-colors sm:block hidden">
                 <ExternalLink size={16} />
               </div>
            </div>
          </div>
        );

        const className = clsx(
          "bg-surface p-6 flex flex-col justify-center border brutal-border transition-colors relative overflow-hidden group h-full",
          repo.repoLink
            ? "hover:bg-main-bg cursor-pointer"
            : "opacity-75 cursor-default"
        );

        if (repo.repoLink) {
          return (
            <a
              key={repo.id}
              href={repo.repoLink}
              target="_blank"
              rel="noopener noreferrer"
              className={className}
            >
              {content}
            </a>
          );
        }

        return (
          <div key={repo.id} className={className}>
            {content}
          </div>
        );
      })}
    </div>
  );
}

function AddItemModal({ type, onClose }: { type: 'bounties' | 'repos', onClose: () => void }) {
  const { addBounty, addRepo } = useStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    if (type === 'bounties') {
      addBounty({
        id: Math.random().toString(),
        title: formData.get('title') as string,
        reward: formData.get('reward') as string,
        difficulty: formData.get('difficulty') as any,
        tags: (formData.get('tags') as string).split(',').map(s => s.trim()),
        status: 'Open',
        submitLink: formData.get('submitLink') as string || undefined
      });
    } else {
      addRepo({
        id: Math.random().toString(),
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        language: formData.get('language') as string,
        stars: 0,
        forks: 0,
        repoLink: formData.get('repoLink') as string || undefined
      });
    }
    onClose();
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6" onClick={onClose}>
      <div className="absolute inset-0 bg-main-bg/80 backdrop-blur-sm" />
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }} 
        animate={{ scale: 1, opacity: 1, y: 0 }} 
        className="bg-surface border brutal-border p-8 w-full max-w-lg relative z-10 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-6 right-6 text-text-muted hover:text-text-main transition-colors z-10">
          <X size={20} />
        </button>
        <div className="mb-8 pr-10">
          <h3 className="text-2xl font-display font-bold uppercase tracking-tight">ADD {type === 'bounties' ? 'BOUNTY' : 'REPO'}</h3>
          <p className="text-text-muted text-sm mt-2">
            {type === 'bounties' ? 'Post a new bountied task for members.' : 'Share open source repository.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono font-bold text-text-muted uppercase tracking-widest">{type === 'bounties' ? 'Bounty Title' : 'Repo Name'}</label>
            <input name={type === 'bounties' ? 'title' : 'name'} required className="w-full bg-main-bg border brutal-border px-4 py-3 text-text-main focus:border-primary outline-none font-mono text-sm transition-colors" />
          </div>
          
          {type === 'bounties' ? (
             <div className="space-y-4">
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold text-text-muted uppercase tracking-widest">Reward</label>
                    <input name="reward" required className="w-full bg-main-bg border brutal-border px-4 py-3 text-text-main focus:border-primary outline-none font-mono text-sm transition-colors font-bold" />
                 </div>
                 <div className="space-y-1.5">
                     <label className="text-[10px] font-mono font-bold text-text-muted uppercase tracking-widest">Difficulty</label>
                     <select name="difficulty" className="w-full bg-main-bg border brutal-border px-4 py-3 text-text-main focus:border-primary outline-none font-mono text-sm transition-colors appearance-none">
                       <option value="Easy">Easy</option>
                       <option value="Medium">Medium</option>
                       <option value="Hard">Hard</option>
                     </select>
                 </div>
               </div>
               <div className="space-y-1.5">
                 <label className="text-[10px] font-mono font-bold text-text-muted uppercase tracking-widest">Tags (comma separated)</label>
                 <input name="tags" required className="w-full bg-main-bg border brutal-border px-4 py-3 text-text-main focus:border-primary outline-none font-mono text-sm transition-colors" />
               </div>
               <div className="space-y-1.5">
                 <label className="text-[10px] font-mono font-bold text-text-muted uppercase tracking-widest">Submit Link</label>
                 <input name="submitLink" type="url" className="w-full bg-main-bg border brutal-border px-4 py-3 text-text-main focus:border-primary outline-none font-mono text-sm transition-colors" />
               </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold text-text-muted uppercase tracking-widest">Description</label>
                <textarea name="description" rows={3} required className="w-full bg-main-bg border brutal-border px-4 py-3 text-text-main focus:border-primary outline-none font-mono text-sm transition-colors resize-none" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold text-text-muted uppercase tracking-widest">Language</label>
                    <input name="language" required className="w-full bg-main-bg border brutal-border px-4 py-3 text-text-main focus:border-primary outline-none font-mono text-sm transition-colors" />
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold text-text-muted uppercase tracking-widest">Repo Link</label>
                    <input name="repoLink" type="url" required className="w-full bg-main-bg border brutal-border px-4 py-3 text-text-main focus:border-primary outline-none font-mono text-sm transition-colors" />
                 </div>
              </div>
            </div>
          )}

          <ActionButton type="submit" variant="primary" className="w-full mt-6">
            CREATE ITEM
          </ActionButton>
        </form>
      </motion.div>
    </div>,
    document.body
  );
}
