import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Lock, ArrowRight, Play } from 'lucide-react';
import { ActionButton } from '@/components/ui/Primitives';

import type { AcademyV2Path } from '@/types';
import { fetchAcademyV2Catalog } from '@/lib/academy/v2Api';
import { useAcademyProgressState } from '@/lib/academy/useAcademyProgress';
import { countCompletedAcademyV2CourseUnits } from '@/lib/academy/v2Progress';
import { useStore } from '@/store/useStore';

function isCourseComplete(pathState: ReturnType<typeof useAcademyProgressState>['state'], course: AcademyV2Path['courses'][number]) {
  const completed = countCompletedAcademyV2CourseUnits(pathState.completedLessons, course.id);
  return course.total_unit_count > 0 && completed >= course.total_unit_count;
}

export function AcademyPath() {
  const { pathId = '' } = useParams<{ pathId: string }>();
  const navigate = useNavigate();
  const { currentUser, walletAddress, authToken } = useStore();
  const [path, setPath] = useState<AcademyV2Path | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const identity = useMemo(
    () => ({
      userId: currentUser?.id ?? null,
      walletAddress: walletAddress ?? null,
    }),
    [currentUser?.id, walletAddress]
  );

  const progress = useAcademyProgressState({
    identity,
    currentUserId: currentUser?.id ?? null,
    authToken,
    walletAddress,
  });

  useEffect(() => {
    let cancelled = false;

    async function loadPath() {
      setLoading(true);
      setError('');
      try {
        const base = (import.meta as any).env.VITE_API_BASE_URL || '';
        const data = await fetchAcademyV2Catalog(
          base,
          authToken || localStorage.getItem('auth_token'),
          walletAddress
        );
        const found = (data.curated_paths || []).find((item) => item.id === pathId) || null;

        if (!cancelled) {
          if (!found) {
            setError('Path not found.');
            setPath(null);
          } else {
            setPath(found);
          }
        }
      } catch (err: any) {
        if (!cancelled) {
           setError(err.message || 'Error connecting to the server.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadPath();
    return () => {
      cancelled = true;
    };
  }, [authToken, pathId, walletAddress]);

  if (loading) {
    return (
       <div className="container mx-auto px-4 py-24 space-y-12 max-w-4xl">
         <div className="h-48 bg-surface animate-pulse border brutal-border" />
         <div className="space-y-6">
            <div className="h-32 bg-surface animate-pulse border brutal-border" />
            <div className="h-32 bg-surface animate-pulse border brutal-border" />
         </div>
       </div>
    );
  }

  if (!path) {
    return (
      <div className="container mx-auto px-4 py-24 text-center max-w-xl">
         <div className="border brutal-border bg-red-500/10 p-8">
            <h2 className="font-heading text-2xl font-bold uppercase mb-4 tracking-tighter text-red-500">Path Error</h2>
            <p className="font-mono text-sm text-red-500 mb-8">{error}</p>
            <ActionButton variant="secondary" onClick={() => navigate('/academy')}>Back to Academy</ActionButton>
         </div>
      </div>
    );
  }

  const totalUnits = path.total_unit_count;
  const completedTotalUnits = path.courses.reduce((sum, course) => sum + countCompletedAcademyV2CourseUnits(progress.state.completedLessons, course.id), 0);
  const overallProgressPercent = totalUnits > 0 ? Math.round((completedTotalUnits / totalUnits) * 100) : 0;

  return (
    <div className="pb-20 mt-10">
      {/* Header Container */}
      <div className="container mx-auto px-4 mb-16 max-w-5xl">
         <Link to="/academy" className="inline-flex items-center gap-2 px-3 py-1 bg-surface font-mono text-[10px] uppercase tracking-widest text-text-main border brutal-border hover:bg-main-bg transition-colors mb-8">
           <ArrowLeft className="w-3 h-3" /> Back to Academy
         </Link>

         <div className="border brutal-border bg-surface px-6 py-10 sm:p-12 relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
               <div className="max-w-xl">
                  <div className="inline-flex items-center gap-2 border brutal-border bg-main-bg px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-text-muted mb-6">
                    {path.tag || path.difficulty || 'LEARNING PATH'}
                  </div>
                  
                  <h1 className="font-display font-bold text-5xl sm:text-7xl uppercase tracking-tighter mb-6 leading-[0.9]">
                     {path.title}
                  </h1>
                  
                  <p className="text-text-muted text-lg border-l-2 border-primary pl-4">
                     {path.description}
                  </p>
               </div>

               <div className="bg-main-bg border brutal-border p-6 shrink-0 md:w-64">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-1">Path Progress</div>
                  <div className="font-display text-5xl font-bold text-text-main mb-4">{overallProgressPercent}%</div>
                  
                  <div className="w-full h-2 bg-surface border brutal-border relative overflow-hidden">
                     <div className="absolute inset-y-0 left-0 bg-primary border-r brutal-border transition-all duration-1000" style={{ width: `${overallProgressPercent}%` }} />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-6">
                     <div>
                        <div className="font-bold text-xl">{path.courses.length}</div>
                        <div className="text-[10px] font-mono uppercase tracking-widest text-text-muted">Courses</div>
                     </div>
                     <div>
                        <div className="font-bold text-xl">{totalUnits}</div>
                        <div className="text-[10px] font-mono uppercase tracking-widest text-text-muted">Units</div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* Course Sequence */}
      <div className="container mx-auto px-4 max-w-5xl relative">
         {/* Vertical trunk line */}
         <div className="absolute left-[39px] sm:left-[61px] top-4 bottom-12 w-1 bg-border-main z-0 hidden md:block" />
         
         <div className="space-y-8">
            {path.courses.map((course, index) => {
               const numCompleted = countCompletedAcademyV2CourseUnits(progress.state.completedLessons, course.id);
               const progressPct = course.total_unit_count > 0 ? Math.round((numCompleted / course.total_unit_count) * 100) : 0;
               
               const isLocked = index > 0 && !isCourseComplete(progress.state, path.courses[index-1]);
               const isComplete = isCourseComplete(progress.state, course);
               const isActive = !isLocked && !isComplete;

               let nodeClasses = "w-12 h-12 sm:w-16 sm:h-16 border brutal-border shrink-0 flex items-center justify-center z-10 bg-surface ";
               if (isComplete) nodeClasses += "border-primary text-primary";
               else if (isActive) nodeClasses += "border-text-main text-text-main shadow-sm";
               else nodeClasses += "border-border-main text-text-muted";

               return (
                  <div key={course.id} className="relative flex flex-col md:flex-row items-start gap-4 sm:gap-8">
                     
                     {/* Node */}
                     <div className="hidden md:flex flex-col items-center gap-2">
                        <div className={nodeClasses}>
                           {isComplete ? <Check className="w-6 h-6" /> : 
                            isLocked ? <Lock className="w-5 h-5 opacity-50" /> : 
                            <span className="font-display font-bold text-2xl">{index + 1}</span>}
                        </div>
                     </div>

                     {/* Mobile Node / Label */}
                     <div className="md:hidden flex items-center gap-3">
                        <div className="w-10 h-10 border brutal-border flex items-center justify-center bg-surface">
                           <span className="font-display font-bold text-xl">{index + 1}</span>
                        </div>
                        <span className="font-mono uppercase tracking-widest text-[10px] text-text-muted">
                           {isLocked ? 'Locked' : isComplete ? 'Completed' : 'Current Course'}
                        </span>
                     </div>

                     {/* Card */}
                     <div className="flex-1 w-full">
                        {isLocked ? (
                           <div className="bg-main-bg border brutal-border border-dashed p-6 sm:p-8 opacity-60">
                              <div className="flex items-center gap-3 mb-2">
                                 <Lock className="w-5 h-5 text-text-muted" />
                                 <h3 className="font-heading font-bold text-xl sm:text-2xl text-text-muted uppercase tracking-tight">{course.title}</h3>
                              </div>
                              <p className="text-sm text-text-muted mt-2 font-mono">
                                 Complete "{path.courses[index-1].title}" to unlock.
                              </p>
                           </div>
                        ) : (
                           <Link to={`/academy/course/${course.id}`} className="block group focus:outline-none">
                              <div className={`bg-surface border brutal-border p-6 sm:p-8 transition-colors hover:border-primary ${isActive ? 'shadow-sm' : ''} relative overflow-hidden group-focus:ring-2 group-focus:ring-primary`}>
                                 
                                 <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                                    <div className="flex-1">
                                       <div className="flex items-center gap-3 mb-4">
                                          {isComplete && (
                                             <span className="bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest">
                                                Completed
                                             </span>
                                          )}
                                          {isActive && (
                                             <span className="bg-main-bg border brutal-border px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest">
                                                In Progress
                                             </span>
                                          )}
                                       </div>
                                       
                                       <h3 className="font-heading font-bold text-2xl sm:text-3xl text-text-main uppercase tracking-tighter mb-4 group-hover:text-primary transition-colors">
                                          {course.title}
                                       </h3>
                                       
                                       <p className="text-text-muted text-sm mb-6 leading-relaxed">
                                          {course.description}
                                       </p>
                                    </div>
                                    
                                    {/* Stats block */}
                                    <div className="shrink-0 flex gap-4 sm:flex-col sm:items-end">
                                       <div className="text-center sm:text-right border brutal-border p-3 bg-main-bg">
                                          <div className="font-display text-3xl font-bold leading-none">{progressPct}%</div>
                                          <div className="text-[10px] font-mono uppercase tracking-widest text-text-muted mt-1 border-t brutal-border pt-1 pt-1">Done</div>
                                       </div>
                                    </div>
                                 </div>

                                 <div className="flex flex-wrap items-center justify-between pt-6 border-t brutal-border">
                                    <div className="flex gap-4 items-center">
                                       <span className="text-[10px] font-mono uppercase tracking-widest text-text-muted">
                                          {course.module_count} Modules
                                       </span>
                                       <span className="text-[10px] font-mono uppercase tracking-widest text-text-muted">
                                          {course.total_unit_count} Units
                                       </span>
                                    </div>

                                    <div className="inline-flex items-center gap-2 text-primary text-[10px] font-bold uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                                       {isComplete ? 'Review Course' : 'Continue'} &rarr;
                                    </div>
                                 </div>
                              </div>
                           </Link>
                        )}
                     </div>
                  </div>
               );
            })}
         </div>
      </div>
    </div>
  );
}
