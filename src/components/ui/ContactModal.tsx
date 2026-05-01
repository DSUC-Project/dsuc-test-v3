import React from 'react';
import { X, Github, MessageSquare, Mail } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ContactModal({ isOpen, onClose }: ContactModalProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-surface brutal-border brutal-shadow p-8">
        <button onClick={onClose} className="absolute top-4 right-4 p-1 hover:text-primary transition-colors">
          <X className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary brutal-border flex items-center justify-center">
            <span className="font-display font-black text-main-bg text-sm">DS</span>
          </div>
          <div>
            <h2 className="font-heading font-bold text-xl uppercase">Contact DSUC</h2>
            <p className="font-mono text-xs text-text-muted uppercase">DUT Superteam University Club</p>
          </div>
        </div>

        <div className="space-y-3 mb-8">
          <a href="https://discord.gg/dsuc" target="_blank" rel="noreferrer"
            className="flex items-center gap-3 p-3 border brutal-border hover:bg-main-bg transition-colors group">
            <MessageSquare className="w-4 h-4 text-primary" />
            <div>
              <p className="font-bold text-sm group-hover:text-primary transition-colors">Discord Community</p>
              <p className="font-mono text-xs text-text-muted">discord.gg/dsuc</p>
            </div>
          </a>
          <a href="mailto:contact@dsuc.fun" 
            className="flex items-center gap-3 p-3 border brutal-border hover:bg-main-bg transition-colors group">
            <Mail className="w-4 h-4 text-primary" />
            <div>
              <p className="font-bold text-sm group-hover:text-primary transition-colors">Email</p>
              <p className="font-mono text-xs text-text-muted">contact@dsuc.fun</p>
            </div>
          </a>
          <a href="https://github.com/DSUC-Project" target="_blank" rel="noreferrer"
            className="flex items-center gap-3 p-3 border brutal-border hover:bg-main-bg transition-colors group">
            <Github className="w-4 h-4 text-primary" />
            <div>
              <p className="font-bold text-sm group-hover:text-primary transition-colors">GitHub</p>
              <p className="font-mono text-xs text-text-muted">github.com/DSUC-Project</p>
            </div>
          </a>
        </div>

        <div className="border-t brutal-border pt-6">
          <p className="font-mono text-xs text-text-muted uppercase mb-3">Send a message</p>
          <textarea 
            placeholder="Your message..."
            className="w-full p-3 border brutal-border bg-main-bg font-sans text-sm resize-none h-24 focus:outline-none focus:border-primary"
          />
          <button className="mt-3 w-full py-3 bg-primary text-main-bg font-bold font-heading uppercase brutal-border brutal-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
            Send Message
          </button>
        </div>
      </div>
    </div>
  );
}
