import React from 'react';
import { Moon, Sun, Menu, X, ChevronDown } from 'lucide-react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { AuthModalExample } from '../ui/ModalShell';

// Simplified Theme context for demonstration
export function useTheme() {
  const [theme, setTheme] = React.useState<'light' | 'dark'>('light');
  
  React.useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');
  return { theme, toggleTheme };
}

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [opsOpen, setOpsOpen] = React.useState(false);
  const [authModalOpen, setAuthModalOpen] = React.useState(false);
  
  const location = useLocation();
  React.useEffect(() => setMobileMenuOpen(false), [location]); // Close menu on route change

  // Dummy auth state
  const isGuest = true;

  const navLinks = [
    { name: 'Members', path: '/members' },
    { name: 'Events', path: '/events' },
    { name: 'Academy', path: '/academy' },
    { name: 'Resources', path: '/resources' },
    { name: 'Projects', path: '/projects' },
  ];

  const opsLinks = [
    { name: 'Leaderboard', path: '/leaderboard' },
    { name: 'Meet', path: '/meet' },
    { name: 'Work', path: '/work' },
    { name: 'Finance', path: '/finance' },
    { name: 'Admin', path: '/admin' },
    { name: 'Academy Admin', path: '/academy-admin' },
  ];

  return (
    <>
      <AuthModalExample isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      <header className="sticky top-0 z-50 w-full border-b brutal-border bg-surface/90 backdrop-blur transition-colors">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/home" className="flex items-center gap-2 font-display font-bold text-xl uppercase tracking-tighter">
            <div className="w-6 h-6 bg-primary brutal-border brutal-shadow-sm flex items-center justify-center text-main-bg text-xs">D</div>
            DSUC Labs
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium uppercase tracking-wider">
            {navLinks.map((link) => (
              <NavLink 
                key={link.path} 
                to={link.path}
                className={({isActive}) => cn(
                  "hover:text-primary transition-colors",
                  isActive ? "text-primary border-b-2 border-primary" : "text-text-muted"
                )}
              >
                {link.name}
              </NavLink>
            ))}
            
            {/* Operations Dropdown */}
            <div className="relative" onMouseEnter={() => setOpsOpen(true)} onMouseLeave={() => setOpsOpen(false)}>
              <button className={cn(
                "flex items-center gap-1 hover:text-primary transition-colors h-16",
                location.pathname.match(/\/(leaderboard|meet|work|finance|admin|academy-admin)/) ? "text-primary border-b-2 border-primary" : "text-text-muted"
              )}>
                Operations <ChevronDown className="w-4 h-4" />
              </button>
              <AnimatePresence>
                {opsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full right-0 w-48 bg-surface brutal-border brutal-shadow py-2 flex flex-col z-50 block uppercase text-xs"
                  >
                    {opsLinks.map((link) => (
                      <NavLink 
                        key={link.path} 
                        to={link.path}
                        className={({isActive}) => cn(
                          "px-4 py-2 hover:bg-main-bg transition-colors block",
                          isActive ? "text-primary font-bold" : "text-text-main"
                        )}
                      >
                        {link.name}
                      </NavLink>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <button onClick={toggleTheme} className="p-2 brutal-border bg-main-bg hover:bg-surface transition-colors" aria-label="Toggle Theme">
              {theme === 'light' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            
            {isGuest ? (
              <button 
                onClick={() => setAuthModalOpen(true)}
                className="px-4 py-2 bg-primary text-main-bg brutal-border brutal-shadow-sm font-bold text-sm uppercase tracking-wider hover:-translate-y-1 hover:shadow-[4px_6px_0px_0px_var(--shadow-brutal-color)] transition-all"
              >
                Login
              </button>
            ) : (
              <Link to="/profile" className="w-8 h-8 rounded-full brutal-border bg-accent overflow-hidden" />
            )}
          </div>

          {/* Mobile Toggle */}
          <button 
            className="md:hidden p-2 brutal-border"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5"/> : <Menu className="w-5 h-5"/>}
          </button>

        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t brutal-border bg-surface truncate"
            >
              <div className="flex flex-col p-4 gap-4 uppercase font-bold text-sm">
                {navLinks.map(link => (
                  <NavLink key={link.path} to={link.path} className={({isActive}) => cn("p-2", isActive && "text-primary")}>
                    {link.name}
                  </NavLink>
                ))}
                <div className="h-px bg-border-main w-full" />
                <p className="text-xs text-text-muted p-2">Operations</p>
                <div className="grid grid-cols-2 gap-2 pl-2">
                  {opsLinks.map(link => (
                    <NavLink key={link.path} to={link.path} className={({isActive}) => cn("p-2 text-xs", isActive && "text-primary")}>
                      {link.name}
                    </NavLink>
                  ))}
                </div>
                
                <div className="flex items-center justify-between mt-4">
                  <button onClick={toggleTheme} className="flex items-center gap-2 p-2 brutal-border">
                    {theme === 'light' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />} Theme
                  </button>
                  {isGuest ? (
                     <button onClick={() => setAuthModalOpen(true)} className="px-4 py-2 bg-primary text-main-bg brutal-border font-bold">Login</button>
                  ) : (
                     <Link to="/profile" className="px-4 py-2 border brutal-border hover:bg-main-bg">Profile</Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
