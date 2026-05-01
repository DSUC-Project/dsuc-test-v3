import React, { useState } from 'react';
import { SectionHeader, SoftBrutalCard, StatusBadge, ActionButton } from '@/components/ui/Primitives';
import { useStore } from '@/store/useStore';
import { Event } from '@/types';
import ReactDOM from 'react-dom';
import { motion } from 'motion/react';
import { Plus, X } from 'lucide-react';

function AddEventModal({ isOpen, onClose, onAdd }: { isOpen: boolean, onClose: () => void, onAdd: (e: Event) => void }) {
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    onAdd({
      id: Math.random().toString(),
      title: formData.get('title') as string,
      date: formData.get('date') as string,
      time: formData.get('time') as string,
      location: formData.get('location') as string,
      luma_link: formData.get('luma_link') as string,
      description: formData.get('description') as string,
      type: 'Workshop',
      attendees: 0
    });
    onClose();
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6" onClick={onClose}>
      <div className="absolute inset-0 bg-main-bg/80 backdrop-blur-sm" />
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-lg border brutal-border bg-surface p-8 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute right-5 top-5 p-2 text-text-muted hover:text-text-main"><X size={20} /></button>
        
        <div className="mb-8">
          <h3 className="text-3xl font-display font-bold uppercase tracking-tight">Add Event</h3>
          <p className="mt-2 text-sm text-text-muted">Schedule a new session for the community.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Event Title</label>
            <input name="title" required className="w-full border brutal-border bg-main-bg p-3 text-sm focus:border-primary outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Date</label>
              <input name="date" type="date" required className="w-full border brutal-border bg-main-bg p-3 text-sm focus:border-primary outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Time</label>
              <input name="time" type="time" required className="w-full border brutal-border bg-main-bg p-3 text-sm focus:border-primary outline-none" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Location</label>
            <input name="location" required className="w-full border brutal-border bg-main-bg p-3 text-sm focus:border-primary outline-none" />
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Description</label>
            <textarea name="description" className="w-full border brutal-border bg-main-bg p-3 text-sm focus:border-primary outline-none min-h-[80px]" />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-text-muted">LuMa Link</label>
            <input name="luma_link" type="url" required className="w-full border brutal-border bg-main-bg p-3 text-sm focus:border-primary outline-none" />
          </div>

          <ActionButton type="submit" variant="primary" className="w-full mt-4">Create Event</ActionButton>
        </form>
      </motion.div>
    </div>,
    document.body
  );
}

export function Events() {
  const { events, addEvent, currentUser } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState<'upcoming' | 'past' | 'all'>('upcoming');
  const canManage = currentUser?.memberType === 'member';

  const now = new Date();
  
  const sortedEvents = [...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const filteredEvents = sortedEvents.filter(evt => {
    const evtDate = new Date(evt.date);
    if (filter === 'upcoming') return evtDate >= now;
    if (filter === 'past') return evtDate < now;
    return true;
  });

  const handleAddClick = () => {
    if (!currentUser) {
      alert('Please log in first!');
      return;
    }
    if (!canManage) {
      alert('Community accounts cannot create events.');
      return;
    }
    setIsModalOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
        <SectionHeader title="Events & Sessions" subtitle="Workshops, meetups, and builder co-working sessions." className="mb-4 md:mb-0" />
        
        <div className="w-full md:w-auto">
           {canManage ? (
             <ActionButton variant="primary" className="w-full md:w-auto" onClick={handleAddClick}>
               <span className="flex items-center gap-2"><Plus size={16}/> Add Event</span>
             </ActionButton>
           ) : (
             <div className="px-4 py-2 bg-main-bg border brutal-border text-xs font-mono text-text-muted text-center">
               Events restricted to Members
             </div>
           )}
        </div>
      </div>

      <div className="flex gap-4 mb-8 border-b brutal-border pb-4 w-full overflow-auto font-mono text-xs uppercase font-bold">
        <button onClick={() => setFilter('upcoming')} className={`transition-colors ${filter === 'upcoming' ? 'text-primary' : 'text-text-muted hover:text-text-main'}`}>Upcoming</button>
        <button onClick={() => setFilter('past')} className={`transition-colors ${filter === 'past' ? 'text-primary' : 'text-text-muted hover:text-text-main'}`}>Past Recordings</button>
        <button onClick={() => setFilter('all')} className={`transition-colors ${filter === 'all' ? 'text-primary' : 'text-text-muted hover:text-text-main'}`}>All</button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredEvents.length > 0 ? filteredEvents.map((evt) => {
           const dateObj = evt.date ? new Date(evt.date) : new Date();
           const month = dateObj.toLocaleString('en-US', { month: 'short' });
           const day = dateObj.getDate();
           const lumaLink = String((evt as any).luma_link || (evt as any).lumaLink || (evt as any).link || '').trim();
           return (
           <div key={evt.id} className="flex flex-col md:flex-row md:items-stretch group hover:bg-main-bg bg-surface border brutal-border transition-colors cursor-default shadow-sm relative overflow-hidden">
             
             {/* Date Box */}
             <div className="flex-shrink-0 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r brutal-border px-6 py-4 w-full md:w-32 bg-main-bg/50 group-hover:bg-primary group-hover:text-main-bg transition-colors">
               <p className="font-mono text-[10px] uppercase tracking-widest mb-1">{month}</p>
               <p className="font-display font-bold text-4xl leading-none">{day}</p>
             </div>
             
             {/* Content */}
             <div className="flex-1 p-5 flex flex-col justify-center min-w-0">
               <div className="flex items-center gap-3 mb-2">
                 <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-mono uppercase bg-surface border border-primary/20">{evt.type || 'SESSION'}</span>
               </div>
               <h3 className="font-heading font-bold text-xl uppercase tracking-tight mb-2 truncate">{evt.title}</h3>
               <p className="text-text-muted text-sm max-w-2xl leading-relaxed limit-lines-2">{evt.description || 'Upcoming ecosystem deep dive.'}</p>
             </div>
             
             {/* Info & CTA */}
             <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 p-5 md:w-48 bg-main-bg/20 border-t md:border-t-0 md:border-l brutal-border font-mono text-xs uppercase">
                <div className="space-y-1 text-left md:text-right w-full">
                  <p className="text-text-muted">TIME: <span className="text-text-main font-bold">{evt.time || '18:00'}</span></p>
                  <p className="text-text-muted">LOC: <span className="text-text-main font-bold whitespace-nowrap overflow-hidden text-ellipsis inline-block max-w-[80px] align-bottom">{evt.location}</span></p>
                </div>
                <div className="w-auto md:w-full">
                  {lumaLink ? (
                    <a href={lumaLink} target="_blank" rel="noreferrer" className="block w-full text-center font-bold text-primary flex items-center justify-center border brutal-border px-4 py-2 bg-surface hover:bg-main-bg group-hover:border-primary transition-colors whitespace-nowrap">
                      RSVP &rarr;
                    </a>
                  ) : (
                    <div className="w-full text-center text-[10px] text-text-muted py-2 border border-transparent whitespace-nowrap">
                      Internal
                    </div>
                  )}
                </div>
             </div>
           </div>
        )}) : (
          <div className="p-12 text-center border brutal-border bg-surface text-text-muted">
             <p>No events found for this category.</p>
          </div>
        )}
      </div>

      <AddEventModal isOpen={isModalOpen && canManage} onClose={() => setIsModalOpen(false)} onAdd={addEvent} />
    </div>
  );
}
