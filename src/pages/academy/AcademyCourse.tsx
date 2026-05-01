import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ActionButton, SoftBrutalCard, StatusBadge } from '@/components/ui/Primitives';

export function AcademyCourse() {
  const { courseId } = useParams();

  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <Link to="/academy/path/solana-core" className="inline-flex items-center gap-2 font-mono text-xs uppercase font-bold text-text-muted hover:text-primary transition-colors mb-12">
        &larr; Back to Path
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-8">
          <section className="mb-16">
            <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tighter uppercase mb-6">
              Course: {courseId?.replace('-', ' ')}
            </h1>
            <p className="text-lg text-text-muted mb-8 leading-relaxed">
              Deep dive into state management and smart contract inter-op. Learn how to securely handle user data on-chain.
            </p>
            <Link to="/academy/unit/1/1"><ActionButton variant="primary">Continue Next Unit</ActionButton></Link>
          </section>

          <section className="space-y-12">
            {/* Module 1 */}
            <div>
              <div className="border-b brutal-border pb-4 mb-6">
                <h3 className="font-heading font-bold text-2xl uppercase">Module 01: State PDA</h3>
                <p className="text-text-muted mt-2">Deriving addresses and managing space.</p>
              </div>
              
              <div className="space-y-4">
                {/* Unit 1 */}
                <SoftBrutalCard className="p-4 flex items-center justify-between hover:bg-main-bg transition-colors">
                  <div className="flex items-center gap-4">
                    <StatusBadge status="COMPLETED" className="text-emerald-500 border-emerald-500" />
                    <div>
                      <h4 className="font-bold">Understanding Program Derived Addresses</h4>
                      <p className="font-mono text-[10px] uppercase text-text-muted mt-1">Reading &middot; 5 Mins</p>
                    </div>
                  </div>
                  <Link to="/academy/unit/1/1"><ActionButton variant="secondary" className="text-xs py-1 px-3">Review</ActionButton></Link>
                </SoftBrutalCard>

                {/* Unit 2 */}
                <SoftBrutalCard className="p-4 flex items-center justify-between border-primary">
                  <div className="flex items-center gap-4">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <div>
                      <h4 className="font-bold">Build Your First PDA</h4>
                      <p className="font-mono text-[10px] uppercase text-text-muted mt-1 text-primary font-bold">Challenge &middot; 450 XP</p>
                    </div>
                  </div>
                  <Link to="/academy/unit/1/2"><ActionButton variant="primary" className="text-xs py-1 px-3">Start</ActionButton></Link>
                </SoftBrutalCard>

                {/* Unit 3 */}
                <SoftBrutalCard className="p-4 flex items-center justify-between opacity-50 select-none">
                  <div className="flex items-center gap-4">
                    <StatusBadge status="LOCKED" />
                    <div>
                      <h4 className="font-bold">PDA Security Checks</h4>
                      <p className="font-mono text-[10px] uppercase text-text-muted mt-1">Quiz &middot; 100 XP</p>
                    </div>
                  </div>
                </SoftBrutalCard>
              </div>
            </div>
          </section>
        </div>

        {/* Sticky Sidebar */}
        <div className="hidden lg:block lg:col-span-4">
          <div className="sticky top-24 border brutal-border bg-surface p-6">
            <h3 className="font-heading font-bold uppercase mb-4">Course Progress</h3>
            <div className="flex justify-between font-mono text-[10px] mb-2">
              <span>Progress</span><span>33%</span>
            </div>
            <div className="h-2 w-full bg-border-main mb-6">
              <div className="h-full bg-primary w-[33%]" />
            </div>
            
            <h3 className="font-heading font-bold uppercase mb-4 border-t brutal-border pt-6">Next in line</h3>
            <p className="font-bold text-sm">Build Your First PDA</p>
            <p className="font-mono text-xs text-text-muted mt-2">Challenge &middot; Estimated 20 mins</p>
          </div>
        </div>
      </div>
    </div>
  );
}
