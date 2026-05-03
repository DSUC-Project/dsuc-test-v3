import React, { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Link } from "react-router-dom";
import { ActionButton, SoftBrutalCard, StatusBadge, SectionHeader } from "@/components/ui/Primitives";
import { ContactModal } from "@/components/ui/ContactModal";
import { GlitchText } from "@/components/GlitchText";
import { useStore } from "@/store/useStore";
import { ArrowRight } from "lucide-react";

function MarqueeStrip() {
  const text =
    "BUILD · LEARN · SHIP · SOLANA · WEB3 · CODE · COMMUNITY · DSUC LABS · ";
  const shouldReduceMotion = useReducedMotion();
  const isMobile = window.innerWidth < 768;
  const noAnimation = shouldReduceMotion || isMobile;

  return (
    <div className="w-full relative overflow-hidden py-4  bg-main-bg dark:bg-navy-surface flex items-center">
      <motion.div
        className="flex whitespace-nowrap font-display uppercase font-bold text-2xl tracking-widest text-primary"
        animate={noAnimation ? {} : { x: ["0%", "-50%"] }}
        transition={
          noAnimation ? {} : { repeat: Infinity, duration: 25, ease: "linear" }
        }
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
  const { members, projects, events, currentUser } = useStore();
  const [sysStatus, setSysStatus] = useState("CHECKING...");

  useEffect(() => {
    fetch("/api/health")
      .then((r) => {
        if (r.ok) setSysStatus("ONLINE");
        else setSysStatus("OFFLINE");
      })
      .catch(() => setSysStatus("OFFLINE"));
  }, []);

  const recentEvents = events.slice(0, 3);
  const recentProjects = projects.slice(0, 3);
  const recentMembers = members.slice(0, 8);
  const featuredUnits = [
    {
      id: "wallet-adapter",
      title: "Solana Wallet Adapter",
      description: "Learn how to connect Solana wallets in React applications.",
    },
    {
      id: "anchor-programs",
      title: "Intro to Anchor",
      description:
        "Write your first Solana program using the Anchor framework.",
    },
    {
      id: "spl-tokens",
      title: "SPL Token Creation",
      description: "Mint and transfer your own custom tokens on Solana.",
    },
  ];

  return (
    <div className="w-full">
      <ContactModal
        isOpen={contactOpen}
        onClose={() => setContactOpen(false)}
      />
      {/* HERO SECTION */}
      <section className="container mx-auto px-4 py-12 md:py-24 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* LEFT: Content list */}
          <div className="lg:col-span-7 flex flex-col items-start z-10 order-1">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 bg-surface font-mono text-[10px] tracking-widest uppercase font-bold text-text-main mb-8 border-2 border-text-main shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff]"
            >
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              System Live
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-display font-black text-6xl md:text-7xl lg:text-8xl tracking-tighter leading-[0.85] uppercase mb-8"
            >
              WE
              <br />
              <GlitchText words={["BUILD", "LEARN", "SHIP"]} className="text-primary hover:text-accent transition-colors drop-shadow-[2px_2px_0_rgba(0,0,0,0.1)]" />
              <br />
              TOGETHER.
            </motion.h1>

             <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-text-muted max-w-sm mb-10 leading-relaxed font-mono"
            >
              A student builder operating system for learning code, running
              community, shipping projects, and growing DSUC.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 w-full"
            >
              <Link to="/academy" className="w-full sm:w-auto">
                <ActionButton variant="primary" className="w-full justify-center">
                  Start Learning &rarr;
                </ActionButton>
              </Link>
              <Link to="/projects" className="w-full sm:w-auto">
                <ActionButton variant="secondary" className="w-full justify-center">
                  Explore Projects
                </ActionButton>
              </Link>
            </motion.div>
          </div>

          {/* RIGHT: Code Interface Panel */}
          <div className="lg:col-span-5 hidden lg:flex flex-col justify-center order-2 relative z-10 w-full max-w-[400px] h-full min-h-[400px] ml-auto">
             <div className="w-full h-full flex flex-col bg-[#0B0F17] border-2 border-text-main shadow-[8px_8px_0_0_rgba(17,24,39,1)] dark:shadow-[8px_8px_0_0_#fff] overflow-hidden text-gray-300 transform md:-rotate-1 hover:rotate-0 transition-transform duration-500 text-xs">
              {/* Terminal Bar */}
              <div className="flex items-center gap-2 px-4 py-2 bg-text-main border-b-2 border-text-main">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                </div>
                <div className="mx-auto flex items-center gap-2">
                  <span className="font-mono text-[10px] uppercase text-surface font-bold tracking-widest">
                    dsuc@system:~
                  </span>
                </div>
              </div>

              {/* Terminal Content */}
              <div className="p-5 font-mono text-[9px] sm:text-[10px] leading-relaxed flex-1 flex flex-col text-gray-300 overflow-hidden">
                <div className="select-none leading-relaxed text-[8px] sm:text-[10px] w-full">
                  <div><span className="text-blue-400">fn</span> <span className="text-yellow-200">main</span>() {"{"}</div>
                  <div className="pl-4"><span className="text-blue-400">let</span> key = <span className="text-emerald-400">b"DSUC"</span>;</div>
                  <br />
                  <div className="pl-4"><span className="text-blue-400">let</span> encrypted = [</div>
                  <div className="pl-8 text-gray-300">10, 50, 56, 38, 100, 115, 117, 99, 100, 105, 117, 7, 17, 7, 117, 16,</div>
                  <div className="pl-8 text-gray-300">17, 3, 16, 17, 16, 22, 20, 14, 100, 6, 27, 10, 18, 22, 7, 16,</div>
                  <div className="pl-8 text-gray-300">13, 7, 12, 99, 7, 31, 0, 1, 78, 21, 58, 54, 42, 55, 48, 39,</div>
                  <div className="pl-8 text-gray-300">100, 115, 111, 99, 117, 106, 123, 115, 113, 125, 103, 115, 118, 102,</div>
                  <div className="pl-8 text-gray-300">95, 1, 43, 50, 39, 39, 100, 115, 117, 99, 126, 115, 15, 2,</div>
                  <div className="pl-8 text-gray-300">12, 115, 122, 99, 16, 27, 26, 7, 13, 6, 24, 99, 107, 115,</div>
                  <div className="pl-8 text-gray-300">31, 6, 22, 1, 12,</div>
                  <div className="pl-4">];</div>
                  <br />
                  <div className="pl-4"><span className="text-blue-400">let</span> decoded: <span className="text-emerald-300">String</span> = encrypted</div>
                  <div className="pl-8">.iter()</div>
                  <div className="pl-8">.enumerate()</div>
                  <div className="pl-8">.map(|(i, b)| (b ^ key[i % key.len()]) <span className="text-blue-400">as</span> <span className="text-emerald-300">char</span>)</div>
                  <div className="pl-8">.collect();</div>
                  <br />
                  <div className="pl-4"><span className="text-yellow-200">println!</span>(<span className="text-emerald-400">"{'{'}{'}'}"</span>, decoded);</div>
                  <div>{"}"}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <MarqueeStrip />

      {/* System Overview Strip */}
      <section className="bg-main-bg/50 border-t border-b border-border-main">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-border-main border-x border-border-main">
            {[
              { label: "Members", val: members.length || "0" },
              { label: "Projects", val: projects.length || "0" },
              { label: "Events", val: events.length || "0" },
              { label: "Academy Units", val: "120+" },
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
