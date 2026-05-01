import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CheckCircle, ChevronDown, Circle, Lock } from 'lucide-react';
import { ActionButton } from '@/components/ui/Primitives';

import type { AcademyV2CourseDetail, AcademyV2Module, AcademyV2UnitSummary } from '@/types';
import { fetchAcademyV2Course } from '@/lib/academy/v2Api';
import { useAcademyProgressState } from '@/lib/academy/useAcademyProgress';
import { countCompletedAcademyV2CourseUnits, isAcademyV2UnitCompleted } from '@/lib/academy/v2Progress';
import { useStore } from '@/store/useStore';

type FlatUnit = AcademyV2UnitSummary & {
  moduleId: string;
  moduleTitle: string;
};

function flattenCourseUnits(course: AcademyV2CourseDetail): FlatUnit[] {
  return course.modules.flatMap((module) =>
    [...module.learn_units, ...module.practice_units]
      .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
      .map((unit) => ({
        ...unit,
        moduleId: module.id,
        moduleTitle: module.title,
      }))
  );
}

function countCompletedModuleUnits(module: AcademyV2Module, completedLessons: Record<string, boolean>, courseId: string) {
  return [...module.learn_units, ...module.practice_units].filter(u => isAcademyV2UnitCompleted(completedLessons, courseId, u.id)).length;
}

export function AcademyCourse() {
  const { courseId = '' } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { currentUser, walletAddress, authToken } = useStore();
  
  const [course, setCourse] = useState<AcademyV2CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

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

    async function loadCourse() {
      setLoading(true);
      setError('');
      try {
        const base = (import.meta as any).env.VITE_API_BASE_URL || '';
        const result = await fetchAcademyV2Course(
          base,
          courseId,
          authToken || localStorage.getItem('auth_token'),
          walletAddress
        );

        if (!cancelled) {
          setCourse(result);
          if (result && result.modules.length > 0) {
            setExpandedModules(new Set([result.modules[0].id]));
          }
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || 'Không thể tải khóa học.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadCourse();
    return () => {
      cancelled = true;
    };
  }, [authToken, courseId, walletAddress]);

  if (loading) return null;
  if (!course) return <div className="container mx-auto px-4 py-24 text-center">{error}</div>;

  const flatUnits = flattenCourseUnits(course);
  const completedCount = countCompletedAcademyV2CourseUnits(progress.state.completedLessons, course.id);
  const totalCount = course.total_unit_count;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  
  const overallProgress = {
    completed: completedCount,
    total: totalCount,
    pct: progressPct
  };

  const firstIncompleteUnit = flatUnits.find(u => !isAcademyV2UnitCompleted(progress.state.completedLessons, course.id, u.id));
  
  // Create an ordered list of all units to determine locking based on flat index
  const allUnitsWithState = flatUnits.map((u, i) => {
    const isCompleted = isAcademyV2UnitCompleted(progress.state.completedLessons, course.id, u.id);
    const prevCompleted = i > 0 ? isAcademyV2UnitCompleted(progress.state.completedLessons, course.id, flatUnits[i-1].id) : true;
    const isLocked = !prevCompleted;
    
    return {
      ...u,
      completed: isCompleted,
      locked: isLocked
    };
  });

  const isUnitLocked = (unitId: string) => allUnitsWithState.find(u => u.id === unitId)?.locked ?? true;
  const isUnitComplete = (unitId: string) => allUnitsWithState.find(u => u.id === unitId)?.completed ?? false;

  const toggleModule = (modId: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      if (next.has(modId)) next.delete(modId);
      else next.add(modId);
      return next;
    });
  };

  const instructor = (course.instructor as any) || {
    name: 'DSUC Team',
    title: 'Core Contributors',
    avatar: 'https://ui-avatars.com/api/?name=DSUC&background=random'
  };

  const totalXP = course.modules.reduce((msum, m) => msum + [...m.learn_units, ...m.practice_units].reduce((usum, u) => usum + (u.xp_reward || 0), 0), 0);

  // currentUnitId makes sense if we wanted to highlight one, maybe the first incomplete
  const currentUnitId = firstIncompleteUnit?.id;

  return (
    <div className="min-h-screen">
      {/* Top nav bar */}
      <div className="sticky top-16 z-40 bg-surface/90 backdrop-blur border-b brutal-border hidden md:block">
        <div className="container mx-auto px-4 h-12 flex items-center justify-between">
          <Link to={`/academy/path/${course.path_id}`} className="font-mono text-xs uppercase hover:text-primary">
            ← {course.path_title || 'Lộ trình'}
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-32 h-1.5 bg-border-main">
              <div className="h-full bg-primary" style={{ width: `${overallProgress.pct}%` }} />
            </div>
            <span className="font-mono text-xs text-text-muted">{overallProgress.completed}/{overallProgress.total}</span>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8 flex gap-8">
        
        {/* LEFT: Course outline sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-32 space-y-1 max-h-[calc(100vh-10rem)] overflow-y-auto pr-2">
            {allUnitsWithState.map(unit => (
              <button key={unit.id}
                onClick={() => !unit.locked && navigate(`/academy/unit/${course.id}/${unit.id}`)}
                className={`w-full text-left flex items-center gap-2 px-3 py-2 text-xs font-sans rounded transition-colors
                  ${unit.id === currentUnitId ? 'bg-primary/10 text-primary' : ''}
                  ${unit.locked ? 'opacity-40 cursor-not-allowed' : 'hover:bg-surface cursor-pointer'}
                  ${unit.completed ? 'text-text-muted' : ''}`}
                disabled={unit.locked}
                >
                <span className="shrink-0">
                  {unit.completed ? <CheckCircle className="w-3 h-3 text-green-500" /> :
                   unit.locked ? <Lock className="w-3 h-3" /> :
                   <Circle className="w-3 h-3" />}
                </span>
                <span className="line-clamp-1">{unit.title}</span>
              </button>
            ))}
          </div>
        </aside>
        
        {/* RIGHT: Main content */}
        <main className="flex-1 min-w-0">
          {/* Course hero */}
          <div className="bg-surface brutal-border brutal-shadow p-8 mb-8">
            <p className="font-mono text-xs uppercase text-primary mb-2">{course.path_title || 'Khóa học'}</p>
            <h1 className="font-display font-bold text-4xl md:text-5xl uppercase tracking-tighter mb-4">{course.title}</h1>
            <p className="text-text-muted text-lg mb-6 max-w-2xl">{course.description}</p>
            
            {/* Instructor */}
            <div className="flex items-center gap-3 mb-6">
              <img src={instructor.avatar || 'https://ui-avatars.com/api/?name=DSUC'} alt={instructor.name} className="w-8 h-8 rounded-full brutal-border" />
              <div>
                <p className="font-bold text-sm">{instructor.name}</p>
                <p className="font-mono text-xs text-text-muted">{instructor.title || instructor.bio || 'Instructor'}</p>
              </div>
            </div>
            
            {/* Stats + CTA */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex gap-6 font-mono text-xs text-text-muted uppercase">
                <span>{course.modules.length} Modules</span>
                <span>{flatUnits.length} Units</span>
                {totalXP > 0 && <span>{totalXP} XP</span>}
              </div>
              <Link to={`/academy/unit/${course.id}/${firstIncompleteUnit?.id || flatUnits[0]?.id}`}>
                <ActionButton variant="primary">
                  {overallProgress.completed > 0 ? 'Continue →' : 'Start Course →'}
                </ActionButton>
              </Link>
            </div>
          </div>
          
          {/* Module accordion */}
          <div className="space-y-4">
            {course.modules.map((module, mi) => {
              const moduleUnits = [...module.learn_units, ...module.practice_units].sort((a,b) => (a.order||0)-(b.order||0));
              const mCompleted = countCompletedModuleUnits(module, progress.state.completedLessons, course.id);

              return (
                <div key={module.id} className="bg-surface brutal-border brutal-shadow">
                  <button
                    onClick={() => toggleModule(module.id)}
                    className="w-full flex items-center justify-between p-5 text-left hover:bg-main-bg transition-colors">
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-text-muted/40 font-black text-2xl">{String(mi+1).padStart(2,'0')}</span>
                      <div>
                        <h3 className="font-heading font-bold">{module.title}</h3>
                        <p className="font-mono text-xs text-text-muted">{mCompleted}/{moduleUnits.length} complete</p>
                      </div>
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform ${expandedModules.has(module.id) ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {expandedModules.has(module.id) && (
                    <div className="border-t brutal-border divide-y divide-border-main">
                      {moduleUnits.map(unit => {
                        const isLocked = isUnitLocked(unit.id);
                        const isComplete = isUnitComplete(unit.id);
                        
                        return (
                          <div key={unit.id}
                            onClick={() => !isLocked && navigate(`/academy/unit/${course.id}/${unit.id}`)}
                            className={`flex items-center gap-4 px-5 py-4 transition-colors
                              ${isLocked ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:bg-main-bg'}`}>
                            
                            <span className="shrink-0 w-5">
                              {isComplete ? <CheckCircle className="w-5 h-5 text-green-500" /> :
                               isLocked ? <Lock className="w-4 h-4 text-text-muted" /> :
                               <Circle className="w-5 h-5 text-text-muted" />}
                            </span>
                            
                            <div className="flex-1 min-w-0">
                              <p className="font-sans font-medium text-sm line-clamp-1">{unit.title}</p>
                              {(unit as any).description && <p className="font-mono text-xs text-text-muted line-clamp-1 mt-0.5">{(unit as any).description}</p>}
                            </div>
                            
                            <div className="flex items-center gap-2 shrink-0">
                              <span className={`px-2 py-0.5 border font-mono text-[10px] uppercase
                                ${unit.type === 'challenge' ? 'border-primary text-primary' : 'border-border-main text-text-muted'}`}>
                                {unit.type === 'challenge' ? 'Practice' : 'Lesson'}
                              </span>
                              {unit.xp_reward && <span className="font-mono text-[10px] text-text-muted">+{unit.xp_reward}xp</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}
