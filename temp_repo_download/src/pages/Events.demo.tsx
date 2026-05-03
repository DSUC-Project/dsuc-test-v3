import React, { useState } from "react";
import {
  SectionHeader,
  SoftBrutalCard,
  StatusBadge,
} from "@/components/ui/Primitives";
import { ArrowRight } from "lucide-react";

export function Events() {
  const [filter, setFilter] = useState<"upcoming" | "past" | "all">("upcoming");
  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <SectionHeader
          title="Events & Sessions"
          subtitle="Workshops, meetups, and builder co-working sessions."
          className="mb-0"
        />

         <div className="flex flex-col items-end gap-4 w-full md:w-auto">
          <div className="flex flex-wrap gap-2 justify-end font-mono text-[10px] uppercase font-bold">
            <button 
              onClick={() => setFilter("upcoming")}
              className={`px-3 py-1.5 border border-border-main transition-all ${filter === "upcoming" ? "bg-text-main text-surface" : "bg-surface text-text-muted hover:text-text-main hover:bg-main-bg shadow-sm"}`}>
              Upcoming
            </button>
            <button 
               onClick={() => setFilter("past")}
               className={`px-3 py-1.5 border border-border-main transition-all ${filter === "past" ? "bg-text-main text-surface" : "bg-surface text-text-muted hover:text-text-main hover:bg-main-bg shadow-sm"}`}>
              Past Recordings
            </button>
            <button 
               onClick={() => setFilter("all")}
               className={`px-3 py-1.5 border border-border-main transition-all ${filter === "all" ? "bg-text-main text-surface" : "bg-surface text-text-muted hover:text-text-main hover:bg-main-bg shadow-sm"}`}>
              All
            </button>
          </div>
        </div>
      </div>

      {filter === "past" ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
             <div 
               key={i}
               className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border-2 border-text-main bg-surface hover:bg-main-bg transition-colors cursor-pointer`}
             >
               <div className="flex items-center gap-4">
                 <div className="font-mono text-xs font-bold text-text-muted w-16 whitespace-nowrap">
                   Oct {20 + i}
                 </div>
                 <div>
                   <h4 className="font-heading font-black uppercase text-text-main text-sm sm:text-base">
                     Solana Anchor Best Practices
                   </h4>
                   <div className="font-mono text-[10px] text-text-muted font-bold mt-1 uppercase">
                     RECORDING • YouTube
                   </div>
                 </div>
               </div>
               <div className="flex sm:justify-start justify-end">
                 <span className="text-[10px] uppercase font-bold tracking-widest text-primary flex items-center gap-1 hover:underline">
                   View <ArrowRight size={12} />
                 </span>
               </div>
             </div>
          ))}
        </div>
      ) : (
      <div className="relative border-l-[3px] border-text-main ml-4 md:ml-8 pl-6 md:pl-12 py-4 space-y-10 before:content-[''] before:absolute before:border-l-[3px] before: before:border-surface before:left-[-3px] before:top-0 before:h-full before:w-0">
        {[1, 2, 3].map((i) => (
            <div 
              key={i} 
              className={`relative group cursor-pointer`}
            >
              {/* Timeline Node Marker */}
              <div className="absolute -left-[32px] md:-left-[56px] top-6 w-4 h-4 rounded-none bg-surface border-4 border-text-main group-hover:bg-primary group-hover:scale-125 transition-transform z-10 shadow-[2px_2px_0_0_rgba(0,0,0,1)] dark:shadow-[2px_2px_0_0_rgba(255,255,255,1)]" />
              
              {/* Compact Event Card */}
              <div className="bg-surface border-2 border-text-main shadow-[4px_4px_0_0_rgba(0,0,0,1)] dark:shadow-[4px_4px_0_0_rgba(255,255,255,1)] group-hover:shadow-[8px_8px_0_0_rgba(0,0,0,1)] dark:group-hover:shadow-[8px_8px_0_0_rgba(255,255,255,1)] group-hover:-translate-y-1 group-hover:-translate-x-1 transition-all duration-300 p-0 flex flex-row items-stretch">
                
                {/* Date Block */}
                <div className="flex flex-col items-center justify-center p-4 bg-main-bg border-r-2 border-text-main w-20 md:w-24 group-hover:bg-primary group-hover:text-surface transition-colors flex-shrink-0">
                  <span className="font-heading font-black text-3xl leading-none">{20 + i}</span>
                  <span className="font-mono text-[10px] uppercase font-bold tracking-widest mt-1 opacity-80">Oct</span>
                </div>
                
                {/* Content Block */}
                <div className="p-4 md:p-6 flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <StatusBadge status={"WORKSHOP"} className="bg-surface group-hover:bg-main-bg" />
                      <span className="font-mono text-[10px] text-text-muted font-bold tracking-widest">{i === 1 ? "Today" : "in 2 days"}</span>
                    </div>
                    <h3 className="font-heading font-black text-xl md:text-2xl uppercase tracking-tight mb-2 text-text-main group-hover:text-primary transition-colors truncate">
                      Solana Anchor Best Practices
                    </h3>
                  </div>
                  
                  <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8 mt-4 font-mono text-[10px] uppercase font-bold text-text-muted">
                    <span className="flex items-center gap-2">
                       18:00 ICT
                    </span>
                    <span className="flex items-center gap-2">
                       Virtual (Discord)
                    </span>
                  </div>
                </div>

                <div className="hidden md:flex flex-col items-center justify-center border-l-2 border-text-main p-6 w-32 shrink-0 bg-surface group-hover:bg-main-bg transition-colors">
                  <span className="font-mono text-[10px] uppercase font-bold tracking-widest block w-full text-center mb-2">RSVP</span>
                  <span className="font-display font-black text-xl">LUMA</span>
                  <span className="opacity-0 group-hover:opacity-100 mt-2 transition-opacity font-bold">&rarr;</span>
                </div>
              </div>
            </div>
          ))}
      </div>
      )}
    </div>
  );
}
