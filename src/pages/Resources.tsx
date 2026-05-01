import React, { useEffect, useState } from 'react';
import { FileText, Folder, Link as LinkIcon, Video, ExternalLink, Search, Plus, X } from 'lucide-react';
import { SectionHeader, SoftBrutalCard, StatusBadge, ActionButton } from '@/components/ui/Primitives';
import { useStore } from '@/store/useStore';
import { Resource, ResourceCategory } from '@/types';
import ReactDOM from 'react-dom';
import { motion } from 'motion/react';

const CATEGORIES: ResourceCategory[] = ['Learning', 'Training', 'Document', 'Media', 'Hackathon'];

function AddResourceModal({ isOpen, onClose, onAdd }: { isOpen: boolean, onClose: () => void, onAdd: (r: Resource) => void }) {
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    onAdd({
      id: Math.random().toString(),
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      url: formData.get('url') as string,
      type: formData.get('type') as "Link" | "Document" | "Video" | "Drive" | "Doc",
      category: formData.get('category') as ResourceCategory,
      size: 'N/A'
    });
    onClose();
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="absolute inset-0 bg-main-bg/80 backdrop-blur-sm" />
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }} 
        animate={{ scale: 1, opacity: 1, y: 0 }} 
        className="bg-surface border brutal-border p-8 w-full max-w-md relative z-10 my-8 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-6 right-6 text-text-muted hover:text-text-main transition-colors z-10">
          <X size={20} />
        </button>
        
        <div className="mb-8 pr-8">
          <h3 className="text-2xl font-display font-bold uppercase tracking-tight">Add Resource</h3>
          <p className="text-sm text-text-muted mt-2">Share a document or link to the community.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Title / Name</label>
            <input name="name" required className="w-full bg-main-bg border brutal-border px-4 py-3 outline-none font-mono text-sm transition-all focus:border-primary" />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Description</label>
            <textarea name="description" required rows={2} className="w-full bg-main-bg border brutal-border px-4 py-3 outline-none font-mono text-sm transition-all focus:border-primary resize-none" />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-widest text-text-muted">URL</label>
            <input name="url" required type="url" className="w-full bg-main-bg border brutal-border px-4 py-3 outline-none font-mono text-sm transition-all focus:border-primary text-primary" />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Type</label>
            <select name="type" className="w-full bg-main-bg border brutal-border px-4 py-3 outline-none font-mono text-sm transition-all appearance-none focus:border-primary">
               <option value="Document">Document</option>
               <option value="Video">Video</option>
               <option value="Drive">Folder / Drive</option>
               <option value="Link">Link</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Category</label>
            <select name="category" className="w-full bg-main-bg border brutal-border px-4 py-3 outline-none font-mono text-sm transition-all appearance-none focus:border-primary">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <ActionButton type="submit" variant="primary" className="w-full mt-6">
            Upload Resource
          </ActionButton>
        </form>
      </motion.div>
    </div>,
    document.body
  );
}

export function Resources() {
  const { resources, fetchResources, addResource, currentUser } = useStore();
  const [data, setData] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const canManage = currentUser?.memberType === 'member';

  useEffect(() => {
    fetchResources().catch(() => {});
  }, [fetchResources]);

  useEffect(() => {
    if (resources && resources.length > 0) {
      setData(resources);
    }
  }, [resources]);

  const categories = ['All', ...CATEGORIES];

  const filteredResources = data.filter(r => {
    const rTitle = r.title || r.name || '';
    const rDesc = r.description || '';
    const matchesSearch = rTitle.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          rDesc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || r.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const getIcon = (type: string) => {
    switch(type) {
      case 'Doc':
      case 'Document':
        return <FileText className="w-6 h-6 text-primary" />;
      case 'Drive':
        return <Folder className="w-6 h-6 text-blue-500" />;
      case 'Video':
        return <Video className="w-6 h-6 text-red-500" />;
      default:
        return <LinkIcon className="w-6 h-6 text-emerald-500" />;
    }
  };

  const handleAddClick = () => {
    if (!currentUser) {
      alert('Vui lòng đăng nhập trước!');
      return;
    }
    if (!canManage) {
      alert('Tài khoản cộng đồng không thể thêm tài nguyên.');
      return;
    }
    setIsModalOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-16 space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between items-start gap-4 mb-8 border-b brutal-border pb-8">
        <SectionHeader title="Resources" subtitle="Documentation, guides, and tools for the community." className="mb-0 border-none pb-0" />
        <div className="w-full md:w-auto mt-4 md:mt-0 flex gap-4">
           {canManage && (
             <ActionButton variant="primary" onClick={handleAddClick} className="w-full md:w-auto">
               <span className="flex items-center gap-2"><Plus size={16}/> Add Resource</span>
             </ActionButton>
           )}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div className="flex flex-wrap gap-2">
          {categories.map(c => (
            <button 
              key={c}
              onClick={() => setActiveCategory(c)}
              className={`px-4 py-2 font-mono text-xs uppercase tracking-widest border brutal-border transition-colors ${activeCategory === c ? 'bg-primary text-main-bg font-bold' : 'bg-surface hover:bg-main-bg text-text-muted hover:text-text-main'}`}
            >
              {c}
            </button>
          ))}
        </div>
        
        <div className="relative w-full md:w-64 shrink-0">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input 
            type="text" 
            placeholder="Search resources..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-surface brutal-border p-2 pl-9 font-mono text-xs focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResources.map(resource => (
          <div key={resource.id} className="flex flex-col h-full bg-surface border brutal-border p-5 group hover:border-primary transition-colors cursor-pointer shadow-sm relative overflow-hidden" onClick={() => window.open(resource.url, '_blank')}>
            <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
               <ExternalLink className="w-4 h-4 text-primary" />
            </div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-main-bg border brutal-border text-primary">
                {getIcon(resource.type || 'Link')}
              </div>
              <div>
                <h3 className="font-heading font-bold text-lg leading-tight truncate pr-6 group-hover:text-primary transition-colors">{resource.title || resource.name}</h3>
                <p className="font-mono text-[9px] uppercase text-text-muted mt-1">{resource.category || "GENERAL"} • {resource.type || 'Link'}</p>
              </div>
            </div>
            
            <p className="text-sm text-text-muted mt-2 mb-4 flex-grow line-clamp-2 leading-relaxed">{resource.description || 'No description provided.'}</p>
            
            <div className="flex items-center justify-between border-t brutal-border pt-3 mt-auto">
              <div className="flex flex-wrap gap-1">
                {resource.tags?.slice(0,3).map((tag: string) => (
                  <span key={tag} className="text-[9px] font-mono uppercase bg-main-bg px-2 py-1 border brutal-border text-text-muted">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
        {filteredResources.length === 0 && (
          <div className="col-span-full p-12 text-center border border-dashed brutal-border text-text-muted font-mono text-xs uppercase">
            No resources found.
          </div>
        )}
      </div>

      <AddResourceModal isOpen={isModalOpen && canManage} onClose={() => setIsModalOpen(false)} onAdd={addResource} />
    </div>
  );
}
