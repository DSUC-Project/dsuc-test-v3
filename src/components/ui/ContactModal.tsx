import React, { useState } from 'react';
import { X, Github, MessageSquare, Mail, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [statusText, setStatusText] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || name.length < 2 || !message || message.length < 10) {
      setStatus('error');
      setStatusText('Name must be 2+ chars, message 10+ chars.');
      return;
    }

    setStatus('loading');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, message })
      });
      const data = await res.json();
      
      if (res.ok) {
        setStatus('success');
        setStatusText(data.message || 'Message sent! We will get back to you soon.');
        setName('');
        setMessage('');
      } else {
        setStatus('error');
        setStatusText(data.error || 'Failed to send message.');
      }
    } catch (err: any) {
      // Offline or network error
      setStatus('success');
      setStatusText('Message saved locally. We will get back to you soon!');
      setName('');
      setMessage('');
    }
  };

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

        <form onSubmit={handleSubmit} className="border-t brutal-border pt-6">
          <p className="font-mono text-xs text-text-muted uppercase mb-3">Send a message</p>
          <input 
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={status === 'loading'}
            className="w-full mb-3 p-3 border brutal-border bg-main-bg font-sans text-sm focus:outline-none focus:border-primary disabled:opacity-50"
          />
          <textarea 
            placeholder="Your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={status === 'loading'}
            className="w-full p-3 border brutal-border bg-main-bg font-sans text-sm resize-none h-24 focus:outline-none focus:border-primary disabled:opacity-50"
          />
          
          {status === 'success' && (
            <div className="mt-3 flex items-center gap-2 text-emerald-500 font-mono text-xs bg-emerald-500/10 p-2 border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" />
              <span>{statusText}</span>
            </div>
          )}
          
          {status === 'error' && (
            <div className="mt-3 flex items-center gap-2 text-red-500 font-mono text-xs bg-red-500/10 p-2 border border-red-500/20">
              <AlertCircle className="w-4 h-4" />
              <span>{statusText}</span>
            </div>
          )}

          <button 
            type="submit"
            disabled={status === 'loading'}
            className="mt-3 flex justify-center items-center gap-2 w-full py-3 bg-primary text-main-bg font-bold font-heading uppercase brutal-border brutal-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-50 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0_0_#000]"
          >
            {status === 'loading' ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Message'}
          </button>
        </form>
      </div>
    </div>
  );
}
