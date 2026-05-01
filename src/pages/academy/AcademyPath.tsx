import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ActionButton, SoftBrutalCard, StatusBadge, SectionHeader } from '@/components/ui/Primitives';

export function AcademyPath() {
  const { pathId } = useParams();

  // Mock path layout based on instructions
  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <Link to="/academy" className="inline-flex items-center gap-2 font-mono text-xs uppercase font-bold text-text-muted hover:text-primary transition-colors mb-12">
        &larr; Back to Academy
      </Link>

      {/* Path Hero */}
      <section className="mb-20">
        <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tighter uppercase mb-6">
          Path: {pathId?.replace('-', ' ')}
        </h1>
        <p className="text-xl text-text-muted max-w-2xl mb-8">
          Complete the sequence of courses below to master this domain. Your progress is saved as you complete each unit.
        </p>
        <div className="w-full max-w-md">
           <div className="flex justify-between font-mono text-xs mb-2 uppercase">
             <span>Path Progress</span>
             <span>25%</span>
           </div>
           <div className="h-2 w-full bg-border-main">
             <div className="h-full bg-primary w-1/4" />
           </div>
        </div>
      </section>

      {/* Course Roadmap */}
      <section>
         <SectionHeader title="Course Roadmap" subtitle="Follow the courses in sequential order." />
         
         <div className="relative border-l-2 border-dashed border-border-main ml-4 md:ml-8 pl-8 md:pl-16 space-y-16 py-8">
            {/* Course 1: Completed */}
            <div className="relative">
              <div className="absolute -left-[45px] md:-left-[77px] top-4 w-6 h-6 bg-primary brutal-border rounded-full flex items-center justify-center">
                <span className="text-[10px] font-bold text-main-bg">✓</span>
              </div>
              <SoftBrutalCard className="opacity-75">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div>
                    <p className="font-mono text-[10px] uppercase text-text-muted mb-2">Course 01</p>
                    <h3 className="font-heading text-2xl font-bold uppercase mb-2">Fundamentals</h3>
                    <p className="text-text-muted mb-4 max-w-xl">Learn the absolute basics of the environment and syntax.</p>
                    <div className="flex gap-4 font-mono text-xs text-text-muted">
                      <span>4 Modules</span>
                      <span>12 Units</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <StatusBadge status="COMPLETED" className="text-emerald-500 border-emerald-500" />
                    <Link to={`/academy/course/fundamentals`}><ActionButton variant="secondary" className="mt-4">Review</ActionButton></Link>
                  </div>
                </div>
              </SoftBrutalCard>
            </div>

            {/* Course 2: In Progress */}
            <div className="relative">
              <div className="absolute -left-[45px] md:-left-[77px] top-4 w-6 h-6 bg-main-bg border-2 border-primary rounded-full animate-pulse" />
              <SoftBrutalCard className="border-primary">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div>
                    <p className="font-mono text-[10px] uppercase text-primary mb-2">Course 02</p>
                    <h3 className="font-heading text-2xl font-bold uppercase mb-2">Core Concepts</h3>
                    <p className="text-text-muted mb-4 max-w-xl">Deep dive into state management and smart contract inter-op.</p>
                    <div className="flex gap-4 font-mono text-xs text-text-muted">
                      <span>6 Modules</span>
                      <span>20 Units</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                    <StatusBadge status="IN_PROGRESS" className="text-primary border-primary" />
                    <div className="w-full mt-4 flex justify-between font-mono text-[10px] mb-1">
                       <span>Progress</span><span>45%</span>
                    </div>
                    <div className="w-full h-1 bg-border-main mb-4">
                       <div className="h-full bg-primary w-[45%]" />
                    </div>
                    <Link to={`/academy/course/core-concepts`}><ActionButton variant="primary">Continue</ActionButton></Link>
                  </div>
                </div>
              </SoftBrutalCard>
            </div>

            {/* Course 3: Locked */}
            <div className="relative">
              <div className="absolute -left-[45px] md:-left-[77px] top-4 w-6 h-6 bg-main-bg border-2 border-border-main rounded-full" />
              <SoftBrutalCard className="opacity-50 grayscale select-none">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div>
                    <p className="font-mono text-[10px] uppercase text-text-muted mb-2">Course 03</p>
                    <h3 className="font-heading text-2xl font-bold uppercase mb-2 bg-main-bg inline-block px-2 border border-dashed border-border-main">Advanced Architecture</h3>
                    <p className="text-text-muted mb-4 max-w-xl">Building scalable and secure systems for production.</p>
                    <div className="p-3 border border-dashed brutal-border bg-main-bg/50 text-sm font-mono flex items-center justify-center text-text-muted mt-4">
                      Complete the previous course to unlock this one.
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <StatusBadge status="LOCKED" />
                    <ActionButton variant="secondary" className="mt-4 pointer-events-none opacity-50">Locked</ActionButton>
                  </div>
                </div>
              </SoftBrutalCard>
            </div>

         </div>
      </section>
    </div>
  );
}
