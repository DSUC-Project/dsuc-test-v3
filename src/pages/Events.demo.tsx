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
      <div className="relative py-8 md:py-12 space-y-8 md:space-y-16">
        <div className="absolute left-[24px] md:left-1/2 top-0 bottom-0 w-[3px] bg-text-main -ml-[1.5px] z-0"></div>
        {[1, 2, 3].map((i, idx) => {
            const isEven = idx % 2 === 0;
            return (
            <div 
              key={i} 
              className={`relative w-full flex flex-col md:flex-row group cursor-pointer ${isEven ? 'md:justify-start' : 'md:justify-end'}`}
            >
              {/* Timeline Node Marker */}
              <div className="absolute left-[24px] md:left-1/2 top-8 md:top-1/2 w-5 h-5 bg-surface border-[4px] border-text-main -translate-x-1/2 md:-translate-y-1/2 group-hover:bg-primary group-hover:scale-125 transition-all z-10 shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff]" />
              
              {/* Compact Event Card */}
              <div className={`w-[calc(100%-48px)] md:w-[calc(50%-48px)] ml-auto md:ml-0 flex flex-col bg-surface border-2 border-text-main shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] group-hover:shadow-[8px_8px_0_0_#000] dark:group-hover:shadow-[8px_8px_0_0_#fff] group-hover:-translate-y-1 group-hover:-translate-x-1 transition-all duration-300 p-0`}>
                
                <div className="w-full h-32 md:h-40 border-b-2 border-text-main overflow-hidden bg-highlight flex-shrink-0">
                   <div className="w-full h-full bg-primary/20 flex flex-col items-center justify-center font-mono font-bold text-lg uppercase text-primary group-hover:scale-105 transition-transform duration-500">
                     Demo Image
                   </div>
                </div>

                <div className="flex flex-row items-stretch w-full">
                  {/* Date Block */}
                  <div className="flex flex-col items-center justify-center p-4 bg-main-bg border-r-2 border-text-main w-20 md:w-24 group-hover:bg-primary group-hover:text-surface transition-colors flex-shrink-0">
                    <span className="font-heading font-black text-3xl leading-none">{20 + i}</span>
                    <span className="font-mono text-[10px] uppercase font-bold tracking-widest mt-1 opacity-80">Oct</span>
                  </div>
                  
                  {/* Content Block */}
                  <div className="p-4 flex-1 flex flex-col justify-center min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <StatusBadge status={"WORKSHOP"} className="bg-surface group-hover:bg-main-bg" />
                      <span className="font-mono text-[10px] text-text-muted font-bold tracking-widest">{i === 1 ? "Today" : "in 2 days"}</span>
                    </div>
                    
                    <h3 className="font-heading font-black text-lg md:text-xl uppercase tracking-tight text-text-main line-clamp-1 mb-1">
                      Solana Anchor Best Practices
                    </h3>
                    
                    <div className="flex items-center gap-3 font-mono text-[10px] font-bold text-text-muted mt-2">
                       <span className="flex flex-1 items-center gap-1 truncate">
                          Virtual (Discord)
                       </span>
                    </div>
                  </div>

                  {/* Action Block */}
                  <div className="hidden sm:flex items-center justify-center px-4 md:px-6 border-l-2 border-text-main bg-main-bg text-text-muted group-hover:bg-text-main group-hover:text-surface transition-colors flex-shrink-0">
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          )})}
      </div>
      )}
    </div>
  );
}
