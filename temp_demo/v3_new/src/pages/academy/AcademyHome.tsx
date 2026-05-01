import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ActionButton, SoftBrutalCard, StatusBadge, SectionHeader } from '@/components/ui/Primitives';

export function AcademyHome() {
  const isGuest = true; // Replace with proper auth context later

  return (
    <div className="container mx-auto px-4 py-12 md:py-24 space-y-24">
      
      {/* Academy Hero */}
      <section className="max-w-4xl">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1 border brutal-border mb-8 bg-surface uppercase font-mono text-xs tracking-widest text-text-muted"
        >
          DSUC Academy / Curated Builder Paths
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="font-display font-bold text-5xl md:text-7xl lg:text-8xl tracking-tight leading-[0.9] uppercase mb-8"
        >
          Learn code <br /> by shipping <br /> <span className="text-primary hover:text-accent transition-colors">real skills.</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="text-lg md:text-xl text-text-muted max-w-2xl mb-10 leading-relaxed font-sans"
        >
          Official DSUC learning paths for Solana, Rust, frontend, DeFi, security, infrastructure, and AI x Solana.
        </motion.p>
        
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-wrap gap-4">
          {isGuest ? (
             <>
               <ActionButton variant="primary">Start First Path</ActionButton>
               <ActionButton variant="secondary">Login to Sync Progress</ActionButton>
             </>
          ) : (
             <ActionButton variant="primary">Continue Learning &rarr;</ActionButton>
          )}
        </motion.div>
      </section>

      {/* Streak Board */}
      <section>
        <div className="p-8 border brutal-border bg-main-bg relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-5">
              <span className="font-display text-9xl">🔥</span>
           </div>
           
           <h3 className="font-heading font-bold uppercase text-xl mb-2">Builder Streak</h3>
           {isGuest ? (
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <p className="text-text-muted">You are browsing as a guest. Login to track your progress and maintain your daily streak.</p>
                <ActionButton variant="secondary">Login Now</ActionButton>
              </div>
           ) : (
              <div className="flex items-center gap-6 mt-6">
                <div className="text-center bg-surface border brutal-border p-4 min-w-[120px]">
                  <p className="font-display text-4xl font-bold text-primary">12</p>
                  <p className="font-mono text-xs uppercase text-text-muted">Day Streak</p>
                </div>
                <div className="text-center bg-surface border brutal-border p-4 min-w-[120px]">
                  <p className="font-display text-4xl font-bold">450</p>
                  <p className="font-mono text-xs uppercase text-text-muted">Points</p>
                </div>
              </div>
           )}
        </div>
      </section>

      {/* Curated Paths (Primary) */}
      <section>
        <SectionHeader title="Curated Paths" number="01" subtitle="Follow the official roadmap to master these domains." />
        <div className="grid grid-cols-1 gap-8">
           {[
             { id: 'solana-core', title: 'Solana Core Developer', courses: 4, units: 32, progress: 25, status: 'IN_PROGRESS' },
             { id: 'frontend-masters', title: 'Frontend Architecture', courses: 3, units: 24, progress: 0, status: 'AVAILABLE' },
             { id: 'rust-systems', title: 'Rust Systems Programming', courses: 5, units: 40, progress: 0, status: 'LOCKED' }
           ].map(path => (
              <Link to={`/academy/path/${path.id}`} key={path.id} className="block group">
                 <SoftBrutalCard className="flex flex-col md:flex-row md:items-center gap-8 group-hover:bg-main-bg transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                         <h3 className="font-heading font-bold text-2xl uppercase group-hover:text-primary transition-colors">{path.title}</h3>
                         <StatusBadge status={path.status} className={
                            path.status === 'IN_PROGRESS' ? 'text-primary border-primary' : 
                            path.status === 'AVAILABLE' ? 'text-emerald-500 border-emerald-500' : 'opacity-50'
                         } />
                      </div>
                      <p className="text-text-muted mb-4 max-w-xl">Master the fundamentals and advanced concepts required to build production-grade applications in this domain.</p>
                      <div className="flex items-center gap-6 font-mono text-xs uppercase text-text-muted">
                        <span>{path.courses} Courses</span>
                        <span>{path.units} Units</span>
                      </div>
                    </div>
                    {path.status !== 'LOCKED' && (
                       <div className="w-full md:w-48 lg:w-64">
                         <div className="flex justify-between font-mono text-[10px] mb-2">
                           <span>Progress</span>
                           <span>{path.progress}%</span>
                         </div>
                         <div className="h-2 w-full bg-border-main overflow-hidden">
                           <div className="h-full bg-primary" style={{ width: `${path.progress}%` }} />
                         </div>
                       </div>
                    )}
                 </SoftBrutalCard>
              </Link>
           ))}
        </div>
      </section>

      {/* Community Library (Secondary) */}
      <section>
        <div className="flex items-baseline justify-between mb-8 border-b brutal-border pb-4">
          <div>
            <h2 className="font-heading text-xl md:text-2xl font-bold uppercase tracking-tight">Community Library</h2>
            <p className="text-text-muted text-sm mt-1">Extra lessons, reading tracks, and community-contributed content.</p>
          </div>
          <span className="font-display text-3xl text-text-muted/30">02</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {[1, 2, 3].map(i => (
             <Link key={i} to={`/academy/community/track-${i}`} className="block group">
               <div className="border brutal-border bg-main-bg p-6 hover:bg-surface transition-colors cursor-pointer h-full flex flex-col">
                 <h4 className="font-bold mb-2 group-hover:text-primary transition-colors">Intro to Phantom Wallet Connect</h4>
                 <p className="text-sm text-text-muted mb-4 flex-1">A quick community guide on setting up the Phantom wallet adapter in a React application.</p>
                 <div className="flex items-center justify-between font-mono text-[10px] uppercase text-text-muted border-t brutal-border pt-4 mt-auto">
                   <span>5 Lessons</span>
                   <span className="font-bold group-hover:text-primary">View Track &rarr;</span>
                 </div>
               </div>
             </Link>
           ))}
        </div>
      </section>
      
    </div>
  );
}
