import React from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import {
  ActionButton,
  SoftBrutalCard,
  StatusBadge,
  SectionHeader,
} from "@/components/ui/Primitives";
import { ContactModal } from "@/components/ui/ContactModal";

function MarqueeStrip() {
  const text =
    "BUILD · LEARN · SHIP · SOLANA · WEB3 · CODE · COMMUNITY · DSUC LABS · ";
  return (
    <div className="w-full relative overflow-hidden py-4 border-y border-dashed border-border-main bg-main-bg dark:bg-navy-surface flex items-center">
      <motion.div
        className="flex whitespace-nowrap font-display uppercase font-bold text-2xl tracking-widest text-primary"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
      >
        <span>
          {text}
          {text}
        </span>
        <span>
          {text}
          {text}
        </span>
      </motion.div>
    </div>
  );
}

export function Home() {
  const [contactOpen, setContactOpen] = React.useState(false);

  return (
    <div className="w-full">
      <ContactModal
        isOpen={contactOpen}
        onClose={() => setContactOpen(false)}
      />
      {/* 10. HERO SECTION */}
      <section className="container mx-auto px-4 py-12 md:py-24 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* LEFT: 6-7 columns */}
          <div className="lg:col-span-7 flex flex-col items-start z-10">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 border border-border-main mb-8 bg-surface uppercase font-mono text-xs tracking-widest text-text-muted"
            >
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              DSUC Labs / Builder Operating System
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-display font-bold text-6xl md:text-8xl lg:text-9xl tracking-tighter leading-[0.85] uppercase mb-8"
            >
              Build.
              <br />
              <span className="text-primary hover:text-accent transition-colors">
                Learn.
              </span>
              <br />
              Ship.
              <br />
              Together.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-text-muted max-w-lg mb-10 leading-relaxed font-sans"
            >
              A student builder operating system for learning code, running
              community, shipping projects, and growing DSUC.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-4"
            >
              <Link to="/academy">
                <ActionButton variant="primary">
                  Start Learning &rarr;
                </ActionButton>
              </Link>
              <Link to="/projects">
                <ActionButton variant="secondary">
                  Explore Projects
                </ActionButton>
              </Link>
              <ActionButton
                variant="secondary"
                className="border-dashed"
                onClick={() => setContactOpen(true)}
              >
                Contact DSUC
              </ActionButton>
            </motion.div>
          </div>

          {/* RIGHT: 5-6 columns - Composed System View */}
          <div className="lg:col-span-5 relative min-h-[500px] hidden md:block">
            {/* Decorative BG Chips */}
            <div className="absolute top-10 right-10 z-0 opacity-20 dark:opacity-30">
              <pre className="font-mono text-xs">anchor build</pre>
            </div>

            {/* Main System Card */}
            <SoftBrutalCard className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-[28rem] z-10 flex flex-col shadow-xl">
              <div className="flex justify-between items-center border-b border-dashed border-border-main pb-4 mb-4">
                <h3 className="font-heading font-bold uppercase tracking-tight">
                  System Status
                </h3>
                <StatusBadge
                  status="ONLINE"
                  className="text-emerald-500 border-emerald-500"
                />
              </div>
              <div className="flex-1 space-y-6 flex flex-col justify-center">
                <div>
                  <p className="font-mono text-[10px] text-text-muted uppercase mb-1">
                    Current Mode
                  </p>
                  <p className="font-bold border px-3 py-2 bg-main-bg">
                    GUEST_VIEW
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-2 bg-main-bg text-center">
                    <p className="font-display font-bold text-2xl">45+</p>
                    <p className="font-mono text-[9px] uppercase">Builders</p>
                  </div>
                  <div className="p-2 bg-main-bg text-center">
                    <p className="font-display font-bold text-2xl">12</p>
                    <p className="font-mono text-[9px] uppercase">Projects</p>
                  </div>
                </div>
              </div>
              <div className="mt-auto border-t border-dashed border-border-main pt-4">
                <p className="font-mono text-[10px] text-text-muted truncate">
                  SERVER: OK | DB: ASYNC_SYNC | REGION: SGP
                </p>
              </div>
            </SoftBrutalCard>

            {/* Overlapping Mini Card 1 - Academy Preview */}
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-20 -left-6 z-20 w-48 bg-surface border border-border-main shadow-sm p-4 rotate-[-2deg]"
            >
              <p className="font-mono text-[10px] uppercase text-text-muted mb-2">
                Learning Path
              </p>
              <h4 className="font-bold text-sm mb-2">Solana Core</h4>
              <div className="h-1 bg- w-full rounded-none overflow-hidden">
                <div className="h-full bg-primary w-1/4"></div>
              </div>
              <p className="font-mono text-[10px] text-right mt-1">25%</p>
            </motion.div>

            {/* Overlapping Mini Card 2 - Next Event */}
            <motion.div
              animate={{ y: [0, 4, 0] }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
              className="absolute bottom-16 -right-6 z-20 w-52 bg-surface border border-border-main shadow-sm p-4 rotate-[1.5deg]"
            >
              <p className="font-mono text-[10px] uppercase text-text-muted mb-2">
                Next Event
              </p>
              <h4 className="font-bold text-sm mb-1">Builder Session #4</h4>
              <p className="text-xs text-text-muted mb-2">
                Tomorrow, 18:00 ICT
              </p>
              <Link
                to="/events"
                className="text-[10px] font-bold uppercase underline"
              >
                View Details &rarr;
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      <MarqueeStrip />

      {/* System Overview Strip */}
      <section className="bg-main-bg/50 border-t border-b border-border-main">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-border-main border-x border-border-main">
            {[
              { label: "Members", val: "45+" },
              { label: "Projects", val: "12" },
              { label: "Events", val: "80+" },
              { label: "Academy Units", val: "120" },
            ].map((stat, i) => (
              <div
                key={i}
                className="p-6 md:p-8 text-center flex flex-col items-center justify-center"
              >
                <p className="font-display font-bold text-4xl lg:text-5xl mb-2">
                  {stat.val}
                </p>
                <p className="font-mono text-xs uppercase tracking-widest text-text-muted">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
