import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { SectionHeader, ActionButton } from '@/components/ui/Primitives';

import type { AcademyLearnerStats, AcademyV2CommunityTrack, AcademyV2Path } from '@/types';
import { fetchAcademyV2Catalog } from '@/lib/academy/v2Api';
import { useAcademyProgressState } from '@/lib/academy/useAcademyProgress';
import { countCompletedAcademyV2CourseUnits } from '@/lib/academy/v2Progress';
import { useStore } from '@/store/useStore';

const ACADEMY_TIME_ZONE = 'Asia/Ho_Chi_Minh';
const academyDayFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: ACADEMY_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

function academyDayKey(value: Date) {
  const parts = academyDayFormatter.formatToParts(value);
  const year = parts.find((part) => part.type === 'year')?.value || '0000';
  const month = parts.find((part) => part.type === 'month')?.value || '00';
  const day = parts.find((part) => part.type === 'day')?.value || '00';
  return `${year}-${month}-${day}`;
}

export function AcademyHome() {
  const navigate = useNavigate();
  const { currentUser, walletAddress, authToken } = useStore();
  const [paths, setPaths] = useState<AcademyV2Path[]>([]);
  const [communityTracks, setCommunityTracks] = useState<AcademyV2CommunityTrack[]>([]);
  const [learnerStats, setLearnerStats] = useState<AcademyLearnerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isGuest = !currentUser;

  const identity = useMemo(
    () => ({
      userId: currentUser?.id ?? null,
      walletAddress: walletAddress ?? null,
    }),
    [currentUser?.id, walletAddress]
  );

  const { state } = useAcademyProgressState({
    identity,
    currentUserId: currentUser?.id ?? null,
    authToken,
    walletAddress,
  });

  const getPathProgress = useCallback((path: AcademyV2Path) => {
    let completed = 0;
    let total = 0;
    for (const course of path.courses || []) {
      total += course.total_unit_count || 0;
      completed += countCompletedAcademyV2CourseUnits(state.completedLessons, course.id);
    }
    return {
      completed,
      total,
      pct: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [state.completedLessons]);

  useEffect(() => {
    let cancelled = false;

    async function loadCatalog() {
      setLoading(true);
      setError('');
      try {
        const base = (import.meta as any).env.VITE_API_BASE_URL || '';
        const data = await fetchAcademyV2Catalog(
          base,
          authToken || localStorage.getItem('auth_token'),
          walletAddress
        );

        if (!cancelled) {
          setPaths((data.curated_paths || []).slice().sort((a, b) => a.order - b.order));
          setCommunityTracks(
            (data.community_tracks || []).slice().sort((a, b) => a.sort_order - b.sort_order)
          );
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || 'Không thể tải lộ trình học viện.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadCatalog();
    return () => {
      cancelled = true;
    };
  }, [authToken, walletAddress]);

  useEffect(() => {
    if (!currentUser) {
      setLearnerStats(null);
      return;
    }

    let cancelled = false;

    async function loadLearnerStats() {
      try {
        const base = (import.meta as any).env.VITE_API_BASE_URL || '';
        const token = authToken || localStorage.getItem('auth_token');
        const headers: Record<string, string> = {};

        if (token) {
          headers.Authorization = `Bearer ${token}`;
        } else if (walletAddress) {
          headers['x-wallet-address'] = walletAddress;
        }

        const response = await fetch(`${base}/api/academy/stats`, {
          headers,
          credentials: 'include',
        });
        const result = await response.json().catch(() => null);

        if (!cancelled && response.ok && result?.success && result?.data) {
          setLearnerStats(result.data as AcademyLearnerStats);
        }
      } catch {
        if (!cancelled) {
          setLearnerStats(null);
        }
      }
    }

    void loadLearnerStats();
    return () => {
      cancelled = true;
    };
  }, [authToken, currentUser, walletAddress]);

  const today = new Date();
  
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    return academyDayKey(d);
  });

  const dayLabel = (dateKey: string) => {
      const parts = dateKey.split('-');
      return `${parts[2]}/${parts[1]}`;
  }

  const openAuthModal = () => {
      // For now do nothing or dispatch an event, assume handled by navbar for real login
  }

  return (
    <div className="w-full">
      <section className="container mx-auto px-4 pt-16 pb-12">
        <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
          className="inline-flex items-center gap-2 px-3 py-1 border brutal-border mb-8 bg-surface font-mono text-xs uppercase tracking-widest text-text-muted">
          <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          DSUC Academy / Builder Education System
        </motion.div>
        
        <motion.h1 initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay: 0.1 }}
          className="font-display font-bold text-5xl md:text-7xl tracking-tighter leading-[0.9] uppercase mb-6">
          Learn Solana.<br />
          <span className="text-primary">Build on-chain.</span><br />
          Ship real products.
        </motion.h1>
        
        <motion.p initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay: 0.2 }}
          className="text-lg text-text-muted max-w-2xl mb-10 leading-relaxed font-sans">
          Structured paths for Solana developers. From fundamentals to full-stack on-chain programs.
        </motion.p>
      </section>

      <section className="container mx-auto px-4 mb-16">
        <div className="bg-surface brutal-border brutal-shadow p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          {/* Streak count */}
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="font-display font-black text-5xl text-primary leading-none">
                {isGuest ? '—' : ((learnerStats as any)?.streak_current ?? learnerStats?.streak ?? 0)}
              </p>
              <p className="font-mono text-xs uppercase text-text-muted mt-1">Day Streak 🔥</p>
            </div>
            <div className="text-center">
              <p className="font-display font-black text-5xl leading-none">
                {isGuest ? '—' : ((learnerStats as any)?.xp_total ?? 0)}
              </p>
              <p className="font-mono text-xs uppercase text-text-muted mt-1">Total XP</p>
            </div>
          </div>
          
          {/* Last 7 days dots */}
          <div>
            <p className="font-mono text-xs uppercase text-text-muted mb-2">Last 7 Days</p>
            <div className="flex items-center gap-2">
              {last7Days.map((day) => {
                const isActive = learnerStats?.active_days?.includes(day) ?? false;
                return (
                  <div key={day} className="flex flex-col items-center gap-1">
                    <div className={`w-4 h-4 rounded-full border brutal-border ${isActive ? 'bg-primary' : 'bg-main-bg'}`} />
                    <span className="font-mono text-[9px] text-text-muted">{dayLabel(day)}</span>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Guest CTA */}
          {isGuest && (
            <div className="flex items-center gap-4">
              <p className="text-sm text-text-muted">Sign in to track your streak</p>
              <ActionButton variant="secondary" onClick={openAuthModal}>Login</ActionButton>
            </div>
          )}
        </div>
      </section>

      <section className="container mx-auto px-4 mb-16">
        <SectionHeader title="Curated Paths" subtitle="Official DSUC learning paths. Complete in order." />
        
        <div className="grid grid-cols-1 gap-6">
          {paths?.map((path, i) => {
            const pathProgress = getPathProgress(path);
            const hasCourses = path.courses && path.courses.length > 0;
            
            return (
              <motion.div key={path.id}
                initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay: i * 0.05 }}>
                
                {hasCourses ? (
                  <Link to={`/academy/path/${path.id}`} className="block group">
                    <div className="bg-surface brutal-border brutal-shadow hover:bg-main-bg transition-colors p-6 flex flex-col md:flex-row md:items-center gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-heading font-bold text-xl group-hover:text-primary transition-colors">{path.title}</h3>
                          {pathProgress.pct > 0 && pathProgress.pct < 100 && (
                            <span className="px-2 py-0.5 border brutal-border font-mono text-[10px] uppercase text-primary border-primary">In Progress</span>
                          )}
                          {pathProgress.pct === 100 && (
                            <span className="px-2 py-0.5 border brutal-border font-mono text-[10px] uppercase text-green-500 border-green-500">Completed</span>
                          )}
                        </div>
                        <p className="text-sm text-text-muted mb-3 max-w-xl">{path.description}</p>
                        <p className="font-mono text-xs text-text-muted uppercase">{path.courses.length} Courses</p>
                      </div>
                      {pathProgress.pct > 0 && (
                        <div className="w-full md:w-56 shrink-0">
                          <div className="flex justify-between font-mono text-[10px] mb-1">
                            <span>Progress</span><span>{pathProgress.pct}%</span>
                          </div>
                          <div className="h-2 bg-border-main brutal-border">
                            <div className="h-full bg-primary transition-all" style={{ width: `${pathProgress.pct}%` }} />
                          </div>
                        </div>
                      )}
                      {pathProgress.pct === 0 && (
                        <div className="shrink-0">
                           <ActionButton variant="secondary">Start Path &rarr;</ActionButton>
                        </div>
                      )}
                    </div>
                  </Link>
                ) : (
                  // Coming soon path
                  <div className="bg-surface brutal-border p-6 flex flex-col md:flex-row md:items-center gap-6 opacity-50">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-heading font-bold text-xl">{path.title}</h3>
                        <span className="px-2 py-0.5 border brutal-border font-mono text-[10px] uppercase text-text-muted">Coming Soon</span>
                      </div>
                      <p className="text-sm text-text-muted">{path.description}</p>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="container mx-auto px-4 pb-16">
        <SectionHeader title="Community Library" subtitle="Extra content contributed by the DSUC community." />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {communityTracks?.map((track, i) => (
            <Link key={track.id} to={`/academy/community/${track.id}`} className="block group">
              <div className="bg-surface brutal-border hover:bg-main-bg transition-colors p-5 h-full flex flex-col">
                <h4 className="font-heading font-bold mb-2 group-hover:text-primary transition-colors">{track.title}</h4>
                <p className="text-sm text-text-muted mb-4 flex-1 line-clamp-2">{track.description}</p>
                <div className="flex items-center justify-between font-mono text-[10px] uppercase text-text-muted border-t brutal-border pt-4 mt-auto">
                  <span>{track.lesson_count} Lessons</span>
                  <span className="group-hover:text-primary">View Track &rarr;</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
