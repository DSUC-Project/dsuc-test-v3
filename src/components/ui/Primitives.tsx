import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

// PRIMITIVES

export const PaperPanel = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("bg-surface border border-border-main rounded-xl p-6", className)} {...props} />
  )
});
PaperPanel.displayName = 'PaperPanel';

export const SoftBrutalCard = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      ref={ref} 
      className={cn("bg-surface border border-border-main shadow-sm rounded-xl p-6 overflow-hidden", className)} 
      {...(props as any)} 
    />
  )
});
SoftBrutalCard.displayName = 'SoftBrutalCard';

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
}
export const ActionButton = React.forwardRef<HTMLButtonElement, ActionButtonProps>(({ className, variant = 'primary', ...props }, ref) => {
  const base = "px-4 py-2 font-bold uppercase tracking-wider text-sm transition-all border border-border-main rounded-xl active:scale-95";
  let variants = {
    primary: "bg-primary text-white shadow-sm hover:shadow-md hover:bg-primary/90",
    secondary: "bg-surface text-text-main shadow-sm hover:bg-main-bg hover:shadow-md",
    danger: "bg-red-500 text-white shadow-sm hover:shadow-md hover:bg-red-600",
    success: "bg-emerald-500 text-white shadow-sm hover:shadow-md hover:bg-emerald-600",
  }
  return (
    <button ref={ref} className={cn(base, variants[variant], className)} {...props} />
  )
});
ActionButton.displayName = 'ActionButton';

export const StatusBadge = ({ status, className }: { status: string, className?: string }) => {
  return (
    <span className={cn("inline-flex items-center px-3 py-1 rounded-full border border-border-main font-mono text-xs font-medium uppercase bg-surface text-text-muted", className)}>
      {status}
    </span>
  )
}

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  number?: string;
  showNumber?: boolean; // NEW — default false
  className?: string;
}

export const SectionHeader = ({ title, showNumber = false, number, subtitle, className }: SectionHeaderProps) => (
  <div className={cn("mb-8 border-b border-border-main pb-4 flex items-end gap-4", className)}>
    {showNumber && number && (
      <span className="font-heading text-3xl text-text-muted/30">{number}</span>
    )}
    <div>
      <h2 className="font-heading text-2xl md:text-3xl font-bold uppercase tracking-tight">{title}</h2>
      {subtitle && <p className="text-text-muted text-sm mt-1">{subtitle}</p>}
    </div>
  </div>
);

