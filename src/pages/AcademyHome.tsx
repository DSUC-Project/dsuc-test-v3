import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Boxes,
  Flame,
  Sparkles,
  Trophy,
} from "lucide-react";

import type {
  AcademyLearnerStats,
  AcademyV2CommunityTrack,
  AcademyV2Path,
} from "@/types";
import { fetchAcademyV2Catalog } from "@/lib/academy/v2Api";
import { useAcademyProgressState } from "@/lib/academy/useAcademyProgress";
import { countCompletedAcademyV2CourseUnits } from "@/lib/academy/v2Progress";
import { useStore } from "@/store/useStore";
import {
  ActionButton,
  SoftBrutalCard,
  StatusBadge,
  SectionHeader,
} from "@/components/ui/Primitives";

const ACADEMY_TIME_ZONE = "Asia/Ho_Chi_Minh";
const academyDayFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: ACADEMY_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
const academyWeekdayFormatter = new Intl.DateTimeFormat("vi-VN", {
  timeZone: ACADEMY_TIME_ZONE,
  weekday: "short",
});
const academyDayNumberFormatter = new Intl.DateTimeFormat("vi-VN", {
  timeZone: ACADEMY_TIME_ZONE,
  day: "2-digit",
});

function pluralize(value: number, singular: string, plural: string) {
  return value === 1 ? singular : plural;
}

function academyDayKey(value: Date) {
  const parts = academyDayFormatter.formatToParts(value);
  const year = parts.find((part) => part.type === "year")?.value || "0000";
  const month = parts.find((part) => part.type === "month")?.value || "00";
  const day = parts.find((part) => part.type === "day")?.value || "00";
  return `${year}-${month}-${day}`;
}

export function AcademyHome() {
  const navigate = useNavigate();
  const { currentUser, walletAddress, authToken } = useStore();
  const [paths, setPaths] = useState<AcademyV2Path[]>([]);
  const [communityTracks, setCommunityTracks] = useState<
    AcademyV2CommunityTrack[]
  >([]);
  const [learnerStats, setLearnerStats] = useState<AcademyLearnerStats | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const identity = useMemo(
    () => ({
      userId: currentUser?.id ?? null,
      walletAddress: walletAddress ?? null,
    }),
    [currentUser?.id, walletAddress],
  );

  const { state } = useAcademyProgressState({
    identity,
    currentUserId: currentUser?.id ?? null,
    authToken,
    walletAddress,
  });

  useEffect(() => {
    let cancelled = false;

    async function loadCatalog() {
      setLoading(true);
      setError("");
      try {
        const base = (import.meta as any).env.VITE_API_BASE_URL || "";
        const data = await fetchAcademyV2Catalog(
          base,
          authToken || localStorage.getItem("auth_token"),
          walletAddress,
        );

        if (!cancelled) {
          setPaths(
            (data.curated_paths || [])
              .slice()
              .sort((a, b) => a.order - b.order),
          );
          setCommunityTracks(
            (data.community_tracks || [])
              .slice()
              .sort((a, b) => a.sort_order - b.sort_order),
          );
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || "Failed to load academy catalog.");
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
        const base = (import.meta as any).env.VITE_API_BASE_URL || "";
        const token = authToken || localStorage.getItem("auth_token");
        const headers: Record<string, string> = {};

        if (token) {
          headers.Authorization = `Bearer ${token}`;
        } else if (walletAddress) {
          headers["x-wallet-address"] = walletAddress;
        }

        const response = await fetch(`${base}/api/academy/stats`, {
          headers,
          credentials: "include",
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

  const totalCuratedUnits = paths.reduce(
    (sum, path) => sum + path.total_unit_count,
    0,
  );
  const totalCompletedUnits = paths.reduce(
    (sum, path) =>
      sum +
      path.courses.reduce(
        (courseSum, course) =>
          courseSum +
          countCompletedAcademyV2CourseUnits(state.completedLessons, course.id),
        0,
      ),
    0,
  );

  const today = new Date();
  const firstName = currentUser?.name?.split(" ")[0] || "Builder";
  const currentStreak = learnerStats?.streak ?? 0;
  const streakHeadline =
    currentStreak >= 30
      ? "Outstanding Streak"
      : currentStreak >= 7
        ? "Great Pace"
        : currentStreak >= 1
          ? "On a Roll"
          : "Start Your Streak";
  const lastActivityLabel = learnerStats?.last_activity
    ? new Date(learnerStats.last_activity).toLocaleDateString("en-US", {
        timeZone: ACADEMY_TIME_ZONE,
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "";
  const activeDays = new Set(learnerStats?.active_days || []);
  const streakDays = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (13 - i));
    const dayKey = academyDayKey(d);
    return {
      date: d,
      completed: activeDays.has(dayKey),
      isToday: i === 13,
    };
  });

  return (
    <div className="container mx-auto px-4 py-12 md:py-24 space-y-32">
      {/* Hero Section */}
      <section className="relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
          <div className="lg:col-span-7 flex flex-col items-start z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1  mb-8 bg-surface uppercase font-mono text-xs tracking-widest text-text-muted">
              {currentUser ? (
                <>
                  <Trophy size={14} className="text-primary" /> {firstName} is
                  learning
                </>
              ) : (
                "Guest Preview"
              )}
            </div>

            <h1 className="font-display font-bold text-6xl md:text-8xl tracking-tighter leading-[0.85] uppercase mb-8">
              DSUC
              <br />
              <span className="text-primary">Academy</span>
            </h1>

            <p className="text-lg md:text-xl text-text-muted max-w-lg mb-10 leading-relaxed font-sans">
              Learn Solana step-by-step, complete real-world exercises, and
              maintain your learning streak.
            </p>

            <div className="grid grid-cols-3 gap-4 w-full max-w-lg mb-8">
              <div className="p-4 bg-surface text-center">
                <BookOpen className="w-5 h-5 mx-auto mb-2 text-primary" />
                <p className="font-display text-2xl font-bold">
                  {paths.length}
                </p>
                <p className="font-mono text-[10px] uppercase text-text-muted mt-1">
                  Paths
                </p>
              </div>
              <div className="p-4 bg-surface text-center">
                <Boxes className="w-5 h-5 mx-auto mb-2 text-primary" />
                <p className="font-display text-2xl font-bold">
                  {totalCuratedUnits}
                </p>
                <p className="font-mono text-[10px] uppercase text-text-muted mt-1">
                  Total Units
                </p>
              </div>
              <div className="p-4 bg-surface text-center">
                <Flame className="w-5 h-5 mx-auto mb-2 text-primary" />
                <p className="font-display text-2xl font-bold">
                  {totalCompletedUnits}
                </p>
                <p className="font-mono text-[10px] uppercase text-text-muted mt-1">
                  Completed
                </p>
              </div>
            </div>
          </div>

          {/* Streak Board */}
          <div className="lg:col-span-5 relative w-full h-full min-h-[300px]">
            <div className="w-full bg-surface border border-border-main p-6 shadow-sm flex flex-col h-full">
              {currentUser ? (
                <div className="space-y-6 flex-1 flex flex-col">
                  <div className="flex items-start justify-between  pb-6">
                    <div>
                      <StatusBadge
                        status="Active Streak"
                        className="mb-4 bg-primary/10 text-primary border-primary/20"
                      />
                      <div className="font-display text-6xl font-bold leading-none">
                        {currentStreak}
                      </div>
                      <div className="mt-2 text-xs font-mono uppercase tracking-widest text-text-muted">
                        {streakHeadline}
                      </div>
                    </div>
                    <Flame className="w-12 h-12 text-primary" />
                  </div>

                  <div className="grid grid-cols-7 gap-2 my-auto">
                    {streakDays.map((day, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col items-center gap-2"
                      >
                        <span className="text-[10px] font-mono text-text-muted uppercase">
                          {academyWeekdayFormatter.format(day.date)}
                        </span>
                        <div
                          className={`flex h-10 w-full sm:h-12 items-center justify-center border border-border-main transition-all ${day.completed ? "bg-primary text-white" : "bg-main-bg text-text-muted/30"} ${day.isToday && !day.completed ? "border-primary " : ""}`}
                        >
                          {day.completed || day.isToday ? (
                            <Flame className="w-4 h-4" />
                          ) : null}
                        </div>
                        <span
                          className={`text-[10px] font-bold font-mono ${day.isToday ? "text-primary" : "text-text-muted"}`}
                        >
                          {academyDayNumberFormatter.format(day.date)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-auto">
                    <div className="border border-border-main bg-main-bg p-3">
                      <div className="text-[10px] font-mono uppercase tracking-widest text-text-muted">
                        Current
                      </div>
                      <div className="mt-1 font-bold">{currentStreak} Days</div>
                    </div>
                    <div className="border border-border-main bg-main-bg p-3">
                      <div className="text-[10px] font-mono uppercase tracking-widest text-text-muted">
                        Last Active
                      </div>
                      <div className="mt-1 font-bold text-sm truncate">
                        {lastActivityLabel || "Never"}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col h-full justify-center items-center text-center p-6 bg-main-bg border border-dashed border-border-main">
                  <StatusBadge status="Preview Mode" className="mb-6" />
                  <h3 className="font-heading text-xl font-bold mb-4">
                    Track Your Learning
                  </h3>
                  <p className="text-sm text-text-muted mb-8 max-w-sm">
                    Sign in to save your streak, track completion, and earn
                    credentials.
                  </p>
                  <ActionButton variant="secondary">
                    Login to Start
                  </ActionButton>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Curated Paths Section */}
      <section>
        <SectionHeader
          title="Curated Paths"
          subtitle="Structured learning stages designed by DSUC Labs."
        />

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-64 animate-pulse bg-surface border border-border-main"
              />
            ))}
          </div>
        ) : error ? (
          <div className="-500/50 bg-red-500/10 text-red-500 px-6 py-4 text-sm font-mono text-center">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {paths.map((path) => {
              const completedUnits = path.courses.reduce(
                (sum, course) =>
                  sum +
                  countCompletedAcademyV2CourseUnits(
                    state.completedLessons,
                    course.id,
                  ),
                0,
              );
              const progressPercent =
                path.total_unit_count > 0
                  ? Math.round((completedUnits / path.total_unit_count) * 100)
                  : 0;

              return (
                <Link key={path.id} to={`/academy/path/${path.id}`} className="focus:outline-none">
                  <SoftBrutalCard
                    intent="primary"
                    interactive
                    className="h-full flex flex-col"
                  >
          <div className="absolute top-0 left-0 w-full h-1 border-b border-border-main">
                      <div
                        className="h-full bg-primary transition-all duration-1000 ease-out"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>

                    <div className="pt-4 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-6">
                        <StatusBadge status={path.tag || path.difficulty} />
                        <div className="text-right">
                          <div className="text-2xl font-display font-bold text-text-main group-hover:text-primary transition-colors">
                            {progressPercent}%
                          </div>
                        </div>
                      </div>

                      <h3 className="font-heading text-2xl font-bold uppercase tracking-tight mb-6">
                        {path.title}
                      </h3>

                      <div className="grid grid-cols-2 gap-3 mb-8 w-full mt-auto">
                        <div className="px-3 py-2">
                          <div className="font-bold text-2xl">{path.course_count}</div>
                          <div className="text-[10px] font-mono text-text-muted uppercase mt-0.5">
                            Courses
                          </div>
                        </div>
                        <div className="px-3 py-2">
                          <div className="font-bold text-2xl">{path.total_unit_count}</div>
                          <div className="text-[10px] font-mono text-text-muted uppercase mt-0.5">
                            Units
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 text-sm font-bold mt-auto">
                        <span className="text-text-muted capitalize">
                          {path.difficulty}
                        </span>
                        <span className="inline-flex items-center gap-2 text-primary uppercase text-[10px] tracking-wider transition-all">
                          Open Path <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </SoftBrutalCard>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Community Tracks Section */}
      <section>
        <SectionHeader
          title="Community Extensions"
          subtitle="Additional topics curated by the DSUC community."
        />

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`comm-skel-${index}`}
                className="h-48 animate-pulse bg-surface border border-border-main"
              />
            ))}
          </div>
        ) : communityTracks.length === 0 ? (
          <div className="p-12 text-center bg-surface border-2 border-dashed border-border-main font-mono text-sm text-text-muted">
            No community tracks available yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {communityTracks.map((track) => (
              <Link key={track.id} to={`/academy/community/${track.id}`} className="focus:outline-none">
                <SoftBrutalCard intent="info" interactive className="h-full flex flex-col p-6 text-left">
                  <div className="flex items-start justify-between gap-4 border-b border-dashed border-border-main mb-4 pb-4">
                    <StatusBadge status="Community" className="bg-main-bg" />
                    <Boxes className="w-5 h-5 text-text-muted group-hover:text-cyan-400 transition-colors" />
                  </div>

                  <h3 className="font-heading text-lg font-bold mb-3 uppercase tracking-tight group-hover:text-cyan-400 transition-colors">
                    {track.title}
                  </h3>

                  <p className="text-sm text-text-muted line-clamp-2 leading-relaxed mb-6 flex-1 font-mono">
                    {track.subtitle ||
                      track.description ||
                      "Community contributed curriculum."}
                  </p>

                  <div className="flex flex-wrap items-center justify-between border-t border-dashed border-border-main pt-4 mt-auto">
                    <div className="flex gap-3 items-center font-mono text-[10px] text-text-muted uppercase">
                      <span>{track.lesson_count} Lessons</span>
                      <span>•</span>
                      <span>
                        ~{Math.max(1, Math.round(track.total_minutes / 60))} hr
                      </span>
                    </div>

                    <ArrowRight className="h-4 w-4 text-cyan-400 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                  </div>
                </SoftBrutalCard>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
