
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { ArrowUpRight, Cpu, Globe, Loader2, AlertCircle } from 'lucide-react';
import { useStore } from '../store/useStore';
import { ContactModal } from '@/components/ui/ContactModal';

export function Dashboard() {
  const { events, backendStatus } = useStore();
  const [contactOpen, setContactOpen] = useState(false);

  const eventHistory = [...events]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  const statusConfig = {
    connecting: { text: 'INITIALIZING...', color: 'text-accent', icon: Loader2, pulse: true, spin: true },
    online: { text: 'SERVER ONLINE', color: 'text-primary', icon: Cpu, pulse: false, spin: false },
    offline: { text: 'DISCONNECTED', color: 'text-red-500', icon: AlertCircle, pulse: false, spin: false },
  }[backendStatus];

  return (
    <div className="space-y-16 bg-main-bg">
      {/* Hero Section */}
      <section className="relative min-h-[50vh] flex flex-col justify-center items-center text-center pt-10">
        
        {/* Abstract Background Shapes */}
        <div className="absolute top-20 left-10 w-16 h-16 bg-accent rounded-none border brutal-border pointer-events-none -z-10 brutal-shadow-sm" />
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-primary/20 border brutal-border transform rotate-12 pointer-events-none -z-10 brutal-shadow-sm" />
        <div className="absolute top-1/4 right-20 w-12 h-12 bg-primary border brutal-border transform rotate-45 pointer-events-none -z-10 brutal-shadow-sm" />
        <div className="absolute bottom-1/3 left-20 w-20 h-20 bg-emerald-400/20 border brutal-border transform -rotate-12 pointer-events-none -z-10 brutal-shadow-sm" />

        {/* Floating HUD Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-visible hidden md:block z-50">
          <FloatingBadge className="top-[10%] left-[10%]" delay={0}>
            <div className={`flex items-center gap-2 ${statusConfig.color} font-mono font-bold bg-surface px-3 py-2 border brutal-border brutal-shadow-sm pointer-events-auto text-sm uppercase`}>
              <statusConfig.icon size={16} className={clsx("text-text-main", statusConfig.pulse && 'animate-pulse', statusConfig.spin && 'animate-spin')} />
              <span>{statusConfig.text}</span>
            </div>
          </FloatingBadge>
          <FloatingBadge className="bottom-[15%] right-[10%]" delay={1.5}>
            <div className="flex items-center gap-2 text-main-bg bg-primary px-3 py-2 border brutal-border brutal-shadow-sm font-mono font-bold text-sm uppercase">
              <Globe size={16} />
              <span>NETWORK STABLE</span>
            </div>
          </FloatingBadge>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8 inline-flex items-center gap-2 px-4 py-2 border brutal-border bg-surface brutal-shadow-sm text-text-main text-xs font-bold uppercase tracking-widest z-10"
        >
          <span className="w-2.5 h-2.5 bg-primary animate-pulse" />
          System v2.0.4 Ready
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl lg:text-8xl font-display font-bold tracking-tight mb-8 max-w-4xl z-10 leading-[0.95] text-text-main uppercase"
        >
          DUT SUPERTEAM <br />
          <span className="text-primary">UNIVERSITY CLUB</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg md:text-xl text-text-muted max-w-2xl mb-10 z-10 font-medium leading-relaxed bg-surface p-4 border brutal-border brutal-shadow-sm"
        >
          The Web3 playground for Danang University of Technology students to develop skills, launch real-world projects on Solana, and grow together.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex gap-4 z-10"
        >
          <button
            onClick={() => setContactOpen(true)}
            className="group flex items-center justify-center gap-3 bg-primary text-main-bg hover:opacity-90 px-8 py-5 border brutal-border font-display font-bold text-xl tracking-wider brutal-shadow transition-all hover:-translate-y-1 hover:brutal-shadow-sm"
          >
            CONTACT US
            <ArrowUpRight size={28} className="group-hover:rotate-45 transition-transform duration-300" strokeWidth={2} />
          </button>
        </motion.div>
      </section>

      {/* Stats Tickers */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6 border-y brutal-border bg-surface">
        <StatCard label="Members" value="15" suffix="HACKERS" />
        <StatCard label="Active Projects" value="10+" suffix="PROJECTS" />
        <StatCard label="Interns" value="5+" suffix="MEMBERS" />
      </section>

      {/* Event History */}
      <section className="space-y-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-surface flex items-center justify-center border brutal-border brutal-shadow-sm">
            <Globe size={24} className="text-primary" />
          </div>
          <span className="text-text-main font-display font-bold text-3xl uppercase tracking-tight">Recent Events</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {eventHistory.map((event, idx) => (
            <React.Fragment key={event.id}>
              <EventCard event={event} idx={idx} />
            </React.Fragment>
          ))}
          {eventHistory.length === 0 && (
            <div className="col-span-3 text-center py-16 bg-surface border brutal-border brutal-shadow-sm text-text-muted font-mono font-bold text-lg uppercase tracking-widest">
              NO RECENT EVENTS
            </div>
          )}
        </div>
      </section>

      <ContactModal isOpen={contactOpen} onClose={() => setContactOpen(false)} />
    </div>
  );
}

function EventCard({ event, idx }: { event: any, idx: number }) {
  const lumaLink = String(event.luma_link || event.lumaLink || event.link || '').trim();
  const eventDate = event.date ? new Date(event.date) : null;
  const dayLabel = eventDate
    ? String(eventDate.getDate()).padStart(2, '0')
    : '--';
  const monthLabel = eventDate
    ? eventDate.toLocaleString('en-US', { month: 'short' })
    : '---';

  const cardClasses = clsx(
    "bg-surface p-6 relative group transition-all border brutal-border",
    lumaLink ? "cursor-pointer hover:-translate-y-1 hover:-translate-x-1 brutal-shadow hover:brutal-shadow-sm" : "cursor-default brutal-shadow-sm"
  );

  const inner = (
    <>
      <div className="flex justify-between items-start mb-6">
        <span className="px-3 py-1 bg-main-bg border brutal-border text-text-main text-xs font-bold uppercase tracking-wider">
          {event.type}
        </span>
        <div className="text-right">
          <div className="text-3xl font-display font-bold text-text-main group-hover:text-primary transition-colors leading-none">
            {dayLabel}
          </div>
          <div className="text-xs font-bold text-text-muted uppercase mt-1">
            {monthLabel}
          </div>
        </div>
      </div>

      <h3 className="text-xl font-display font-bold mb-3 text-text-main transition-colors line-clamp-2 leading-tight uppercase">
        {event.title}
      </h3>
      <p className="w-fit border brutal-border bg-main-bg px-3 py-1.5 font-mono text-xs font-bold uppercase text-text-muted">
        {event.location || 'Location TBA'}
      </p>
    </>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.1 }}
      className="h-full"
    >
      {lumaLink ? (
        <div className={`${cardClasses} h-full relative`}>
          <a
            href={lumaLink}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open event ${event.title}`}
            className="absolute inset-0 z-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          />
          <div className="relative z-10 pointer-events-none">
            {inner}
          </div>
        </div>
      ) : (
        <div className={`${cardClasses} h-full`}>
          {inner}
        </div>
      )}
    </motion.div>
  );
}

function FloatingBadge({ children, className, delay }: { children?: React.ReactNode, className?: string, delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{
        opacity: 1,
        y: [0, -5, 0],
      }}
      transition={{
        y: { repeat: Infinity, duration: 4, ease: "easeInOut", delay },
        opacity: { duration: 0.5, delay }
      }}
      className={clsx("absolute", className)}
    >
      {children}
    </motion.div>
  );
}

function StatCard({ label, value, suffix }: { label: string, value: string, suffix: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-surface border-x md:border-x-0 border-y md:border-y border-transparent md:border-x-main-bg transition-transform duration-300">
      <span className="text-primary text-xs font-mono font-bold uppercase tracking-widest mb-2 border-b brutal-border pb-1">{label}</span>
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-display font-bold text-text-main">{value}</span>
        <span className="text-sm font-bold text-text-muted font-display uppercase tracking-widest">{suffix}</span>
      </div>
    </div>
  );
}
