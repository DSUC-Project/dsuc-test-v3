import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ActionButton, SoftBrutalCard, StatusBadge, SectionHeader } from '@/components/ui/Primitives';
import { ContactModal } from '@/components/ui/ContactModal';
import { useStore } from '@/store/useStore';

function MarqueeStrip() {
  const text = "BUILD · LEARN · SHIP · SOLANA · WEB3 · CODE · COMMUNITY · DSUC LABS · ";
  const shouldReduceMotion = useReducedMotion();
  const isMobile = window.innerWidth < 768;
  const noAnimation = shouldReduceMotion || isMobile;

  return (
    <div className="w-full relative overflow-hidden py-4 border-y brutal-border bg-main-bg dark:bg-navy-surface flex items-center">
      <motion.div 
        className="flex whitespace-nowrap font-display uppercase font-bold text-2xl tracking-widest text-primary"
        animate={noAnimation ? {} : { x: ["0%", "-50%"] }}
        transition={noAnimation ? {} : { repeat: Infinity, duration: 25, ease: "linear" }}
      >
        <span>{text}{text}</span>
        <span>{text}{text}</span>
      </motion.div>
    </div>
  );
}

export function Home() {
  const [contactOpen, setContactOpen] = React.useState(false);
  const { members, projects, events, currentUser } = useStore();
  const [sysStatus, setSysStatus] = useState("CHECKING...");

  useEffect(() => {
    fetch('/api/health')
      .then(r => {
        if (r.ok) setSysStatus("ONLINE");
        else setSysStatus("OFFLINE");
      })
      .catch(() => setSysStatus("OFFLINE"));
  }, []);

  const recentEvents = events.slice(0, 3);
  const recentProjects = projects.slice(0, 3);
  const recentMembers = members.slice(0, 8);
  const featuredUnits = [
    { id: 'wallet-adapter', title: 'Solana Wallet Adapter', description: 'Learn how to connect Solana wallets in React applications.' },
    { id: 'anchor-programs', title: 'Intro to Anchor', description: 'Write your first Solana program using the Anchor framework.' },
    { id: 'spl-tokens', title: 'SPL Token Creation', description: 'Mint and transfer your own custom tokens on Solana.' }
  ];

  return (
    <div className="w-full">
      <ContactModal isOpen={contactOpen} onClose={() => setContactOpen(false)} />
      {/* HERO SECTION */}
      <section className="container mx-auto px-4 py-12 md:py-24 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* LEFT: 6-7 columns */}
          <div className="lg:col-span-7 flex flex-col items-start z-10">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 border brutal-border mb-8 bg-surface uppercase font-mono text-xs tracking-widest text-text-muted"
            >
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              DSUC Labs / Builder Operating System
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="font-display font-bold text-6xl md:text-8xl lg:text-9xl tracking-tighter leading-[0.85] uppercase mb-8"
            >
              Build.<br />
              <span className="text-primary hover:text-accent transition-colors">Learn.</span><br />
              Ship.<br />
              Together.
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-text-muted max-w-lg mb-10 leading-relaxed font-sans"
            >
              A student builder operating system for learning code, running community, shipping projects, and growing DSUC.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-4"
            >
              <Link to="/academy"><ActionButton variant="primary">Start Learning &rarr;</ActionButton></Link>
              <Link to="/projects"><ActionButton variant="secondary">Explore Projects</ActionButton></Link>
              <ActionButton variant="secondary" className="border-dashed" onClick={() => setContactOpen(true)}>Contact DSUC</ActionButton>
            </motion.div>
          </div>

          {/* RIGHT: 5-6 columns - Composed System View */}
          <div className="lg:col-span-5 relative w-full h-[500px] hidden lg:block overflow-visible mt-12 lg:mt-0">
             
            {/* Main Window - Code Interface */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] z-10 flex flex-col bg-[#0B0F17] rounded-md shadow-2xl border border-gray-800 overflow-hidden text-gray-300">
               {/* Terminal Bar */}
               <div className="flex items-center gap-2 px-3 py-2 bg-gray-900 border-b border-gray-800">
                  <div className="flex gap-1.5">
                     <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                     <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
                     <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
                  </div>
                  <div className="mx-auto flex items-center gap-2">
                     <span className="font-mono text-[10px] uppercase text-gray-500">dsuc@system:~</span>
                  </div>
               </div>
               
               {/* Terminal Content */}
               <div className="p-4 font-mono text-xs leading-relaxed space-y-3">
                  <div className="flex gap-2">
                     <span className="text-emerald-400">➜</span>
                     <span className="text-blue-400">dsuc</span>
                     <span className="text-gray-300">status --check</span>
                  </div>
                  <div className="pl-4 space-y-1 text-gray-400">
                     <p>['SYSTEM'] ............ 
                        <span className={
                           sysStatus === 'ONLINE' ? 'text-emerald-400 font-bold'
                           : sysStatus === 'OFFLINE' ? 'text-red-500 font-bold'
                           : 'text-yellow-400'
                        }> {sysStatus}</span>
                     </p>
                     <p>['DB_REGION'] ......... <span className="text-yellow-400">SGP_ASIA</span></p>
                     <p>['USER_MODE'] ......... <span className="text-primary">{currentUser ? 'AUTH_VERIFIED' : 'GUEST_MODE'}</span></p>
                  </div>

                  <div className="flex gap-2 mt-4">
                     <span className="text-emerald-400">➜</span>
                     <span className="text-blue-400">dsuc</span>
                     <span className="text-gray-300">metrics get all</span>
                  </div>
                  <div className="pl-4 space-y-1 text-gray-400">
                     <p>['BUILDERS'] .......... <span className="text-white font-bold">{members.length || 0}</span></p>
                     <p>['PROJECTS'] .......... <span className="text-white font-bold">{projects.length || 0}</span></p>
                     <p>['EVENTS'] ............ <span className="text-white font-bold">{events.length || 0}</span></p>
                  </div>
                  <div className="pt-2 animate-pulse text-gray-500">_</div>
               </div>
            </div>

            {/* Float 1 - Learning Path */}
            <motion.div 
               animate={{ y: [0, -6, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
               className="absolute top-[5%] -left-8 z-20 w-56 bg-surface border brutal-border p-4 shadow-xl"
            >
               <div className="flex justify-between items-center mb-3">
                 <p className="font-mono text-[10px] uppercase text-text-muted">Active Path</p>
                 <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>
               </div>
               <h4 className="font-heading font-bold text-sm mb-3">Solana Core</h4>
               <div className="w-full bg-main-bg border brutal-border h-2 mb-1">
                 <div className="h-full bg-primary w-[35%]"></div>
               </div>
               <p className="font-mono text-[10px] text-right text-text-muted">35% COMPLETED</p>
            </motion.div>

            {/* Float 2 - Next Event */}
            {events.length > 0 && (
              <motion.div 
                animate={{ y: [0, 6, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-[10%] -right-4 z-20 w-64 bg-surface border brutal-border p-4 shadow-xl"
              >
                <p className="font-mono text-[10px] uppercase text-text-muted mb-2 border-b brutal-border pb-1">Incoming Event</p>
                <div className="pt-1">
                  <h4 className="font-heading font-bold text-sm mb-1 truncate">{events[0].title}</h4>
                  <p className="text-xs text-text-muted font-mono mb-2">{events[0].date} @ {events[0].time || 'TBA'}</p>
                  <Link to="/events" className="text-[10px] font-bold uppercase tracking-wider text-primary hover:underline">
                    RSVP NOW &rarr;
                  </Link>
                </div>
              </motion.div>
            )}
            
          </div>
        </div>
      </section>

      <MarqueeStrip />

      {/* System Overview Strip */}
      <section className="border-b brutal-border bg-main-bg/50">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 brutal-border border-l border-r">
            {[ 
              { label: 'Members', val: members.length || '0' },
              { label: 'Projects', val: projects.length || '0' },
              { label: 'Events', val: events.length || '0' },
              { label: 'Academy Units', val: '120+' }
            ].map((stat, i) => (
              <div key={i} className="p-6 md:p-8 text-center flex flex-col items-center justify-center">
                <p className="font-display font-bold text-4xl lg:text-5xl mb-2">{stat.val}</p>
                <p className="font-mono text-xs uppercase tracking-widest text-text-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Content Columns Wrapper */}
      <div className="container mx-auto px-4 py-24 space-y-32">
        {/* Removed Academy/Community/Recent Events sections */}
        
        {/* Final CTA */}
        <section className="py-16 text-center max-w-2xl mx-auto">
           <h2 className="font-display text-4xl md:text-5xl font-bold uppercase mb-6">Ready to build with DSUC?</h2>
           <p className="text-text-muted mb-10">Join the platform, start learning, and build alongside other student developers.</p>
           <div className="flex flex-wrap justify-center gap-4">
              <Link to="/academy"><ActionButton variant="primary">Start Learning</ActionButton></Link>
              {!currentUser && <ActionButton variant="secondary" onClick={() => document.dispatchEvent(new Event('open-auth-modal'))}>Login</ActionButton>}
           </div>
        </section>
      </div>

    </div>
  );
}
