import React from 'react';
import { SectionHeader, SoftBrutalCard, StatusBadge } from '@/components/ui/Primitives';

export function Events() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <SectionHeader title="Events & Sessions" number="04" subtitle="Workshops, meetups, and builder co-working sessions." />

      <div className="flex gap-4 mb-8 border-b brutal-border pb-4 w-full overflow-auto font-mono text-xs uppercase font-bold">
        <button className="text-primary hover:text-primary transition-colors">Upcoming</button>
        <button className="text-text-muted hover:text-text-main transition-colors">Past Recordings</button>
        <button className="text-text-muted hover:text-text-main transition-colors">All</button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {[1,2,3].map(i => (
           <SoftBrutalCard key={i} className="flex flex-col md:flex-row md:items-center gap-6 group hover:bg-main-bg cursor-pointer transition-colors p-4 md:p-6">
             <div className="flex-shrink-0 text-center border brutal-border bg-surface px-6 py-4 min-w-[120px] group-hover:bg-primary group-hover:text-main-bg transition-colors">
               <p className="font-mono text-xs uppercase tracking-widest mb-1">Oct</p>
               <p className="font-display font-bold text-4xl">{20 + i}</p>
             </div>
             
             <div className="flex-1 min-w-0">
               <div className="flex items-center gap-3 mb-2">
                 <StatusBadge status="WORKSHOP" className="bg-surface group-hover:bg-main-bg" />
                 <span className="font-mono text-[10px] text-text-muted">{i === 1 ? 'Today' : 'in 2 days'}</span>
               </div>
               <h3 className="font-heading font-bold text-xl md:text-2xl uppercase tracking-tight mb-2 truncate">Solana Anchor Best Practices</h3>
               <p className="text-text-muted text-sm max-w-2xl">Learn how to write secure eDSL code, protect against reentrancy, and structure complex state.</p>
             </div>
             
             <div className="flex flex-col items-start md:items-end gap-4 min-w-[150px] font-mono text-xs uppercase border-t md:border-t-0 md:border-l brutal-border pt-4 md:pt-0 md:pl-6 mt-4 md:mt-0">
                <div className="space-y-1">
                  <p className="text-text-muted">Time: <span className="text-text-main font-bold">18:00 ICT</span></p>
                  <p className="text-text-muted">Loc: <span className="text-text-main font-bold">Virtual (Discord)</span></p>
                </div>
                <div className="font-bold text-primary flex items-center justify-center w-full border brutal-border px-4 py-2 bg-surface hover:bg-main-bg group-hover:border-primary">
                  RSVP LuMa &rarr;
                </div>
             </div>
           </SoftBrutalCard>
        ))}
      </div>
    </div>
  );
}
