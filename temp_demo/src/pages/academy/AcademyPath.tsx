import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Check, Lock } from 'lucide-react';
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
            setError('Không tìm thấy lộ trình học.');
            setPath(null);
          } else {
            setPath(found);
          }
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || 'Không thể tải lộ trình học.');
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

  if (loading) return null;
  if (!path) return <div className="container mx-auto px-4 py-24 text-center">{error}</div>;

  const totalUnits = path.total_unit_count;
  const totalXP = path.courses.reduce((sum, c) => sum + ((c as any).modules?.reduce((msum: number, m: any) => msum + m.units.reduce((usum: number, u: any) => usum + (u.xp_reward || 0), 0), 0) || 0), 0); // fallback xp approx

  return (
    <div className="w-full">
      {/* Path header */}
      <div className="container mx-auto px-4 py-12">
        <Link to="/academy" className="font-mono text-xs uppercase text-text-muted hover:text-primary mb-8 inline-block">
          ← Back to Academy
        </Link>
        
        <h1 className="font-display font-bold text-5xl md:text-7xl uppercase tracking-tighter mb-4">{path.title}</h1>
        <p className="text-text-muted text-lg max-w-2xl mb-6">{path.description}</p>
        
        <div className="flex items-center gap-6 font-mono text-xs uppercase text-text-muted">
          <span>{path.courses.length} Courses</span>
          <span>{totalUnits} Units</span>
          {/*<span>{totalXP} XP Available</span>*/}
        </div>
      </div>

      {/* Course sequence with vertical connector */}
      <div className="container mx-auto px-4 pb-16">
        <div className="relative">
          {/* Vertical connector line */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-border-main hidden md:block" />
          
          <div className="space-y-6">
            {path.courses.map((course, index) => {
              const numCompleted = countCompletedAcademyV2CourseUnits(progress.state.completedLessons, course.id);
              const progressPct = course.total_unit_count > 0 ? Math.round((numCompleted / course.total_unit_count) * 100) : 0;
              
              const isLocked = index > 0 && !isCourseComplete(progress.state, path.courses[index-1]);
              const isComplete = isCourseComplete(progress.state, course);
              
              return (
                <div key={course.id} className="relative pl-0 md:pl-16">
                  {/* Node on line */}
                  <div className={`absolute left-4 top-6 w-5 h-5 rounded-full border-2 hidden md:flex items-center justify-center
                    ${isComplete ? 'bg-primary border-primary' : isLocked ? 'bg-main-bg border-border-main' : 'bg-surface border-text-main'}`}>
                    {isComplete && <Check className="w-3 h-3 text-main-bg" />}
                    {isLocked && <Lock className="w-2 h-2 text-text-muted" />}
                  </div>
                  
                  {/* Course number */}
                  <div className="font-mono text-xs uppercase text-text-muted mb-2">
                    Course {String(index + 1).padStart(2, '0')}
                  </div>
                  
                  {/* Course card */}
                  {isLocked ? (
                    <div className="bg-surface brutal-border p-6 opacity-50 cursor-not-allowed">
                      <div className="flex items-center gap-3 mb-2">
                        <Lock className="w-4 h-4 text-text-muted" />
                        <h3 className="font-heading font-bold text-lg">{course.title}</h3>
                      </div>
                      <p className="text-sm text-text-muted">Complete {path.courses[index-1].title} to unlock.</p>
                    </div>
                  ) : (
                    <Link to={`/academy/course/${course.id}`} className="block group">
                      <div className="bg-surface brutal-border brutal-shadow hover:bg-main-bg transition-colors p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-heading font-bold text-xl group-hover:text-primary transition-colors mb-1">{course.title}</h3>
                            <p className="text-sm text-text-muted">{course.description}</p>
                          </div>
                          {isComplete && (
                            <span className="px-2 py-0.5 border border-green-500 font-mono text-[10px] uppercase text-green-500 shrink-0 ml-4">Done</span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex gap-4 font-mono text-xs text-text-muted uppercase">
                            <span>{course.module_count} Modules</span>
                            <span>{course.total_unit_count} Units</span>
                          </div>
                          {progressPct > 0 && (
                            <div className="w-32">
                              <div className="h-1.5 bg-border-main hidden sm:block">
                                <div className="h-full bg-primary" style={{ width: `${progressPct}%` }} />
                              </div>
                              <span className="text-xs text-text-muted sm:hidden">{progressPct}%</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
