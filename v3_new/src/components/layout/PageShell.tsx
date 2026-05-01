import React from 'react';
import { Navbar } from './Navbar';
import { AppBackground } from './AppBackground';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

const getIntensityForPath = (path: string): 'low' | 'medium' | 'high' => {
  if (path === '/' || path.startsWith('/home') || path.startsWith('/projects') || path === '/academy') return 'high';
  if (path.startsWith('/academy/unit') || path.startsWith('/finance') || path.startsWith('/admin')) return 'low';
  return 'medium';
}

export function PageShell() {
  const location = useLocation();
  const intensity = getIntensityForPath(location.pathname);

  return (
    <div className="relative min-h-screen flex flex-col font-sans text-text-main">
      <AppBackground intensity={intensity} />
      <Navbar />
      
      {/* Route Transition Shell */}
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="flex-1 flex flex-col pt-0" // Removed top padding here, layout manages it
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>
      
      {/* Optional minimal footer */}
      <footer className="mt-auto py-8 border-t brutal-border bg-main-bg/50 backdrop-blur text-center text-xs font-mono uppercase tracking-widest text-text-muted">
         <p>DSUC Labs OS v2.0 &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
