import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

// PRIMITIVES

export const PaperPanel = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("bg-surface border brutal-border p-6", className)} {...props} />
  )
});
PaperPanel.displayName = 'PaperPanel';

export const SoftBrutalCard = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      ref={ref} 
      className={cn("bg-surface border brutal-border brutal-shadow-sm p-6 overflow-hidden", className)} 
      {...props} 
    />
  )
});
SoftBrutalCard.displayName = 'SoftBrutalCard';

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
}
export const ActionButton = React.forwardRef<HTMLButtonElement, ActionButtonProps>(({ className, variant = 'primary', ...props }, ref) => {
  const base = "px-4 py-2 font-bold uppercase tracking-wider text-sm transition-all border brutal-border active:translate-y-0 active:shadow-none";
  let variants = {
    primary: "bg-primary text-main-bg brutal-shadow-sm hover:-translate-y-1 hover:shadow-[4px_4px_0_0_var(--shadow-brutal-color)]",
    secondary: "bg-surface text-text-main brutal-shadow-sm hover:bg-main-bg hover:-translate-y-1 hover:shadow-[4px_4px_0_0_var(--shadow-brutal-color)]",
    danger: "bg-red-500 text-main-bg brutal-shadow-sm hover:-translate-y-1 hover:shadow-[4px_4px_0_0_var(--shadow-brutal-color)]",
    success: "bg-emerald-500 text-main-bg brutal-shadow-sm hover:-translate-y-1 hover:shadow-[4px_4px_0_0_var(--shadow-brutal-color)]",
  }
  return (
    <button ref={ref} className={cn(base, variants[variant], className)} {...props} />
  )
});
ActionButton.displayName = 'ActionButton';

export const StatusBadge = ({ status, className }: { status: string, className?: string }) => {
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 border brutal-border font-mono text-[10px] uppercase tracking-widest bg-main-bg", className)}>
      {status}
    </span>
  )
}

export const SectionHeader = ({ title, number, subtitle }: { title: string, number?: string, subtitle?: string }) => (
  <div className="mb-8 border-b brutal-border pb-4 flex items-end gap-4">
    {number && <span className="font-display text-4xl md:text-6xl text-text-muted/30 -mb-2">{number}</span>}
    <div>
      <h2 className="font-heading text-2xl md:text-3xl font-bold uppercase tracking-tight">{title}</h2>
      {subtitle && <p className="text-text-muted text-sm mt-1">{subtitle}</p>}
    </div>
  </div>
);

