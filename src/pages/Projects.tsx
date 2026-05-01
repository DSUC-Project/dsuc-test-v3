import React from 'react';
import { SectionHeader, SoftBrutalCard, ActionButton, StatusBadge } from '@/components/ui/Primitives';

export function Projects() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b brutal-border pb-8">
         <SectionHeader title="Project Showcase" subtitle="Products shipped by DSUC builders." />
         <ActionButton variant="primary" className="mt-4 md:mt-0 max-w-xs">Add Project</ActionButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         {[1,2,3,4,5,6].map(i => (
            <SoftBrutalCard key={i} className="flex flex-col p-0 overflow-hidden cursor-pointer group">
               <div className="aspect-[16/9] w-full bg-border-main border-b brutal-border overflow-hidden relative">
                  <div className="absolute inset-0 bg-primary/10 group-hover:bg-transparent transition-colors z-10" />
                  {/* placeholder image */}
                  <div className="w-full h-full bg-[radial-gradient(var(--text-main)_1px,transparent_1px)] [background-size:12px_12px] opacity-10" />
               </div>
               <div className="p-6 flex flex-col flex-1 bg-surface group-hover:bg-main-bg transition-colors">
                  <div className="flex items-start justify-between mb-2">
                     <h3 className="font-heading font-bold text-xl uppercase tracking-tight">Builder OS</h3>
                     <StatusBadge status="LIVE" className="border-emerald-500 text-emerald-500" />
                  </div>
                  <p className="font-mono text-[10px] uppercase text-text-muted mb-4">Infrastructure</p>
                  
                  <p className="text-sm text-text-muted mb-6 flex-1">
                    A comprehensive operating system for managing student communities, learning paths, and project bounties on Solana.
                  </p>
                  
                  <div className="flex items-center justify-between border-t brutal-border pt-4">
                     <div className="flex -space-x-2">
                        <div className="w-6 h-6 rounded-full border brutal-border bg-primary" />
                        <div className="w-6 h-6 rounded-full border brutal-border bg-accent" />
                     </div>
                     <span className="font-mono text-[10px] font-bold uppercase group-hover:text-primary transition-colors">View App &rarr;</span>
                  </div>
               </div>
            </SoftBrutalCard>
         ))}
      </div>
    </div>
  );
}
