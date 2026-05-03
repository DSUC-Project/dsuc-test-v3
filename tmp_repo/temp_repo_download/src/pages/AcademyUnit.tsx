import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ClipboardCopy,
  Code2,
  Flame,
  Lightbulb,
  LoaderCircle,
  Lock,
  Sparkles,
  TerminalSquare,
  Play,
} from "lucide-react";

import type {
  AcademyV2CourseDetail,
  AcademyV2UnitDetail,
  AcademyV2UnitSummary,
} from "@/types";
import {
  canRunAcademyChallenge,
  runAcademyChallenge,
  type ChallengeRunReport,
} from "@/lib/academy/challengeRunner";
import { CodeEditorPane, CodeSurface } from "@/components/academy/CodeSurface";
import { renderMd, slugifyMarkdownHeading } from "@/lib/academy/md";
import { fetchAcademyV2Unit } from "@/lib/academy/v2Api";
import { useAcademyProgressState } from "@/lib/academy/useAcademyProgress";
import {
  countCompletedAcademyV2CourseUnits,
  isAcademyV2UnitCompleted,
} from "@/lib/academy/v2Progress";
import { useStore } from "@/store/useStore";

type OutlineItem = {
  id: string;
  label: string;
  level: number;
};

type FlatUnit = AcademyV2UnitSummary & {
  moduleId: string;
  moduleTitle: string;
};

type WorkspaceTab = "editor" | "results" | "hints" | "solution";

function getEmbedUrl(url: string): string | null {
  try {
    const value = new URL(url);
    if (
      value.hostname === "www.youtube.com" ||
      value.hostname === "youtube.com"
    ) {
      const video = value.searchParams.get("v");
      return video ? `https://www.youtube.com/embed/${video}` : null;
    }
    if (value.hostname === "youtu.be") {
      const video = value.pathname.slice(1);
      return video ? `https://www.youtube.com/embed/${video}` : null;
    }
    if (value.hostname === "vimeo.com" || value.hostname === "www.vimeo.com") {
      const video = value.pathname.slice(1);
      return video ? `https://player.vimeo.com/video/${video}` : null;
    }
    return null;
  } catch {
    return null;
  }
}

function draftKey(courseId: string, unitId: string) {
  return `academy-lab-draft:${courseId}:${unitId}`;
}

function extractMarkdownOutline(md: string): OutlineItem[] {
  return String(md || "")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^#{1,4}\s+/.test(line))
    .map((line) => {
      const match = /^(#{1,4})\s+(.+)$/.exec(line);
      if (!match) {
        return null;
      }

      const label = match[2].replace(/[`*_~]/g, "").trim();
      return {
        id: slugifyMarkdownHeading(label),
        label,
        level: match[1].length,
      } satisfies OutlineItem;
    })
    .filter((item): item is OutlineItem => !!item && !!item.id)
    .slice(0, 8);
}

function flattenCourseUnits(course: AcademyV2CourseDetail): FlatUnit[] {
  return course.modules.flatMap((module) =>
    [...module.learn_units, ...module.practice_units]
      .sort((left, right) => Number(left.order || 0) - Number(right.order || 0))
      .map((unit) => ({
        ...unit,
        moduleId: module.id,
        moduleTitle: module.title,
      })),
  );
}

function isUnitLocked(
  completedLessons: Record<string, boolean>,
  courseId: string,
  flatUnits: FlatUnit[],
  unitId: string,
) {
  const flatIndex = flatUnits.findIndex((item) => item.id === unitId);
  const previous = flatIndex > 0 ? flatUnits[flatIndex - 1] : null;

  return previous
    ? !isAcademyV2UnitCompleted(completedLessons, courseId, previous.id)
    : false;
}

function practiceModeText(unit: AcademyV2UnitDetail) {
  if (unit.language === "rust" && unit.deployable) {
    return "Bài Lab Solana";
  }

  if (unit.language === "rust") {
    return "Bài thực hành Rust";
  }

  if (unit.language === "typescript") {
    return "Thử thách TypeScript";
  }

  return "Thử thách thực hành";
}

export function AcademyUnit() {
  const { courseId = "", unitId = "" } = useParams<{
    courseId: string;
    unitId: string;
  }>();
  const navigate = useNavigate();
  const { currentUser, walletAddress, authToken } = useStore();

  const [unitData, setUnitData] = useState<{
    course: AcademyV2CourseDetail;
    unit: AcademyV2UnitDetail;
    previous_unit: AcademyV2UnitSummary | null;
    next_unit: AcademyV2UnitSummary | null;
    unit_index: number;
    total_units: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [draftCode, setDraftCode] = useState("");
  const [revealedHints, setRevealedHints] = useState(1);
  const [reloadNonce, setReloadNonce] = useState(0);
  const [runLoading, setRunLoading] = useState(false);
  const [runReport, setRunReport] = useState<ChallengeRunReport | null>(null);
  const [lastRunSource, setLastRunSource] = useState("");
  const [activeWorkspaceTab, setActiveWorkspaceTab] =
    useState<WorkspaceTab>("editor");
  const [solutionUnlocked, setSolutionUnlocked] = useState(false);

  const identity = useMemo(
    () => ({
      userId: currentUser?.id ?? null,
      walletAddress: walletAddress ?? null,
    }),
    [currentUser?.id, walletAddress],
  );

  const progress = useAcademyProgressState({
    identity,
    currentUserId: currentUser?.id ?? null,
    authToken,
    walletAddress,
  });

  useEffect(() => {
    let cancelled = false;

    window.scrollTo(0, 0);
    async function loadUnit() {
      setLoading(true);
      setError("");
      setNotice("");
      try {
        const base = (import.meta as any).env.VITE_API_BASE_URL || "";
        const result = await fetchAcademyV2Unit(
          base,
          courseId,
          unitId,
          authToken || localStorage.getItem("auth_token"),
          walletAddress,
        );

        if (!cancelled) {
          setUnitData(result);
          const nextDraft =
            typeof window !== "undefined"
              ? window.localStorage.getItem(draftKey(courseId, unitId)) ||
                result.unit.code ||
                ""
              : result.unit.code || "";
          setDraftCode(nextDraft);
          setRevealedHints(1);
          setRunReport(null);
          setLastRunSource("");
          setActiveWorkspaceTab("editor");
          setSolutionUnlocked(false);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || "Không thể tải bài học.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadUnit();
    return () => {
      cancelled = true;
    };
  }, [authToken, courseId, reloadNonce, unitId, walletAddress]);

  useEffect(() => {
    if (!unitData || typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(draftKey(courseId, unitId), draftCode);
  }, [courseId, draftCode, unitData, unitId]);

  const previewUnit = unitData?.unit ?? null;
  const previewPracticeRunnable =
    !!previewUnit &&
    previewUnit.section === "practice" &&
    canRunAcademyChallenge(previewUnit);

  useEffect(() => {
    if (
      !previewUnit ||
      previewUnit.section !== "practice" ||
      !previewPracticeRunnable ||
      typeof window === "undefined"
    ) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
        event.preventDefault();
        void handleRunChallenge();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [draftCode, previewPracticeRunnable, previewUnit?.id]);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-[1400px] px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4">
          <div className="h-8 w-32 animate-pulse rounded-full bg-surface" />
          <div className="h-16 w-3/4 animate-pulse rounded-lg bg-surface mt-2" />
          <div className="h-6 w-1/2 animate-pulse rounded-lg bg-surface mt-2" />
        </div>
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <div className="h-96 w-full animate-pulse rounded-xl bg-surface" />
            <div className="h-64 w-full animate-pulse rounded-xl bg-surface" />
          </div>
          <div className="h-96 w-full animate-pulse rounded-xl bg-surface" />
        </div>
      </div>
    );
  }

  if (!unitData) {
    return (
      <div className="mx-auto mt-12 max-w-2xl rounded-xl  bg-white p-12 text-center shadow-sm">
        <div className="mb-6 mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive shadow-sm">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h1 className="font-heading text-3xl font-bold uppercase tracking-tight text-text-main mb-4">
          Failed to load unit
        </h1>
        <p className="mb-8 text-sm font-medium text-text-muted bg-surface rounded-lg p-4 border border-border-main">
          {error || "The unit could not be loaded. Please try again later."}
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button
            type="button"
            onClick={() => setReloadNonce((value) => value + 1)}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-xs font-bold uppercase tracking-widest text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md"
          >
            Retry
          </button>
          <Link
            to="/academy"
            className="inline-flex items-center gap-2 rounded-full border border-border-main bg-white px-6 py-3 text-xs font-bold uppercase tracking-widest text-text-main shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-surface hover:shadow-md"
          >
            Back to Academy
          </Link>
        </div>
      </div>
    );
  }

  const { course, unit, previous_unit, next_unit, unit_index, total_units } =
    unitData;
  const embedUrl = unit.video_url ? getEmbedUrl(unit.video_url) : null;
  const flatCourseUnits = flattenCourseUnits(course);
  const currentModule =
    course.modules.find((module) => module.id === unit.module_id) || null;
  const currentModuleUnits = currentModule
    ? [...currentModule.learn_units, ...currentModule.practice_units].sort(
        (left, right) => Number(left.order || 0) - Number(right.order || 0),
      )
    : [];
  const outline = extractMarkdownOutline(unit.content_md);
  const unitDone = isAcademyV2UnitCompleted(
    progress.state.completedLessons,
    course.id,
    unit.id,
  );
  const isPractice = unit.section === "practice";
  const draftDirty = draftCode !== (unit.code || "");
  const runnerSupported = isPractice && canRunAcademyChallenge(unit);
  const runReportIsFresh = !!runReport && lastRunSource === draftCode;
  const activeRunReport = runReportIsFresh ? runReport : null;
  const completionBlocked =
    runnerSupported &&
    !unitDone &&
    (!runReportIsFresh || !runReport?.allPassed);
  const runtimeLabel =
    activeRunReport?.runtimeLabel ||
    runReport?.runtimeLabel ||
    (unit.language === "rust"
      ? unit.build_type === "buildable"
        ? "Máy ảo biên dịch Rust"
        : "Trình xác thực mã Rust định hướng"
      : runnerSupported
        ? "Trình chạy thử thách trên trình duyệt"
        : "Không gian thực hành");
  const completedCount = countCompletedAcademyV2CourseUnits(
    progress.state.completedLessons,
    course.id,
  );
  const courseProgressPercent =
    course.total_unit_count > 0
      ? Math.round((completedCount / course.total_unit_count) * 100)
      : 0;
  const currentModuleCompleted = currentModule
    ? currentModuleUnits.filter((item) =>
        isAcademyV2UnitCompleted(
          progress.state.completedLessons,
          course.id,
          item.id,
        ),
      ).length
    : 0;
  const currentModulePercent =
    currentModuleUnits.length > 0
      ? Math.round((currentModuleCompleted / currentModuleUnits.length) * 100)
      : 0;

  async function handleComplete() {
    setNotice("");

    if (completionBlocked) {
      setNotice(
        runLoading
          ? "Hệ thống đang chạy bài kiểm tra. Vui lòng đợi kết quả trước khi hoàn thành."
          : "Hãy vượt qua tất cả các bài kiểm tra kể cả ẩn trước khi hoàn thành chặng này.",
      );
      return;
    }

    const saved = await progress.persistUnitCompletion(course.id, unit.id, {
      quizPassed: isPractice,
      xpAwarded: unit.xp_reward,
    });

    setNotice(
      saved
        ? "Tiến độ được đồng bộ. Hoạt động luyện tập đã được lưu lại."
        : "Tiến độ đã được lưu cục bộ. Hệ thống sẽ thử bộ lại lần tới khi bài học này được tải.",
    );
  }

  function copyDraft() {
    if (!draftCode) {
      return;
    }

    void navigator.clipboard.writeText(draftCode);
    setNotice("Code của bạn đã được copy vào clipboard.");
  }

  function resetDraft() {
    setDraftCode(unit.code || "");
    setNotice("Khôi phục code gốc của bài học này thành công.");
  }

  async function handleRunChallenge() {
    if (!isPractice || !runnerSupported) {
      return;
    }

    setNotice("");
    setRunLoading(true);
    try {
      const report = await runAcademyChallenge({ ...unit, code: draftCode });
      setRunReport(report);
      setLastRunSource(draftCode);
      setActiveWorkspaceTab("results");
      setNotice(report.message);
    } catch (error: any) {
      setRunReport({
        supported: true,
        allPassed: false,
        passedCount: 0,
        totalCount: unit.tests.length,
        visiblePassedCount: 0,
        visibleTotalCount: unit.tests.filter((item) => item.hidden !== true)
          .length,
        hiddenPassedCount: 0,
        hiddenTotalCount: unit.tests.filter((item) => item.hidden === true)
          .length,
        primaryFunction: null,
        runtimeLabel: "Thử thách trên trình duyệt",
        message: error?.message || "Có lỗi xảy ra trong lúc thực thi.",
        cases: [],
      });
      setLastRunSource(draftCode);
      setActiveWorkspaceTab("results");
      setNotice(error?.message || "Có lỗi xảy ra trong lúc thực thi.");
    } finally {
      setRunLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 pb-20 pt-8 sm:px-6 lg:px-8">
      {/* Top Bar / Hero */}
      <div className="mb-8 flex flex-col gap-4">
        <Link
          to={`/academy/course/${course.id}`}
          className="inline-flex w-fit items-center gap-2 rounded-full border border-border-main bg-surface px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-text-muted transition-colors hover:bg-main-bg hover:text-text-main shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Course
        </Link>

        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-block rounded-md border border-primary/20 bg-primary/10 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
              {course.title}
            </span>
            <span className="text-border-main text-xs font-bold">/</span>
            <span className="inline-block rounded-md border border-border-main bg-surface px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-text-muted shadow-sm">
              {unit.module_title}
            </span>
            <span className="text-border-main text-xs font-bold">/</span>
            <span className="inline-block rounded-md border border-border-main bg-surface px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-text-muted shadow-sm">
              {isPractice ? practiceModeText(unit) : "Lesson"}
            </span>
            {unitDone && (
              <span className="ml-auto inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-600 shadow-sm">
                <CheckCircle2 className="h-3 w-3" />
                Completed
              </span>
            )}
          </div>

          <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-text-main sm:text-4xl lg:text-5xl uppercase">
            {unit.title}
          </h1>
          <p className="mt-2 text-sm font-medium leading-relaxed text-text-muted sm:text-base max-w-3xl">
            {isPractice
              ? "Read the instructions carefully, write your solution in the editor, and pass all the hidden tests to complete this practical lab."
              : "Study the concepts and techniques in this unit. Take your time to understand the materials before moving on."}
          </p>
        </div>
      </div>

      {notice && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm font-medium text-primary shadow-sm">
          <TerminalSquare className="h-5 w-5 shrink-0" />
          {notice}
        </div>
      )}

      <div
        className={`flex flex-col gap-8 ${isPractice ? "xl:flex-row" : "xl:grid xl:grid-cols-[minmax(0,1fr)_320px]"}`}
      >
        {isPractice && (
          <div className="flex w-full shrink-0 flex-col gap-6 xl:w-[400px] xl:order-1">
            <section className="flex flex-col rounded-xl border border-border-main bg-white shadow-sm xl:sticky xl:top-24">
              <div className="mb-4 flex items-center gap-2  pb-3 p-5">
                <div className="rounded-md border border-border-main bg-surface px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-text-main shadow-sm">
                  Lab Instructions
                </div>
              </div>
              <div className="flexible-container overflow-y-auto  p-5 pt-0">
                <div className="markdown-body prose prose-slate prose-sm max-w-none prose-headings:font-heading prose-headings:font-bold prose-headings:text-text-main prose-headings:uppercase prose-p:text-text-muted hover:prose-a:text-primary prose-strong:font-bold prose-code:font-mono">
                  {renderMd(unit.content_md)}
                </div>
              </div>
            </section>
          </div>
        )}

        <div
          className={`flex min-w-0 flex-col gap-8 ${isPractice ? "flex-1 xl:order-2" : ""}`}
        >
          {!isPractice ? (
            <>
              {embedUrl && (
                <section className="overflow-hidden rounded-xl border border-border-main bg-white shadow-sm">
                  <div className="border-b border-border-main bg-surface px-6 py-4">
                    <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-text-muted">
                      Video Lesson
                    </div>
                    <h2 className="font-heading text-xl font-bold uppercase tracking-tight text-text-main">
                      Watch Tutorial
                    </h2>
                  </div>
                  <div className="relative w-full bg-primary pb-[56.25%] text-primary-foreground">
                    <iframe
                      src={embedUrl}
                      title={unit.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 h-full w-full"
                    />
                  </div>
                </section>
              )}

              <section className="rounded-xl border border-border-main bg-white p-6 shadow-sm sm:p-10">
                <div className="mb-8 flex flex-col gap-4 border-b border-border-main pb-8 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <div className="mb-2 inline-block rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                      Theory Lesson
                    </div>
                    <h2 className="font-heading text-3xl font-bold uppercase tracking-tighter text-text-main sm:text-4xl text-primary">
                      Course Content
                    </h2>
                  </div>
                  {outline.length > 0 && (
                    <div className="shrink-0 rounded-full border border-border-main bg-surface px-4 py-2 text-xs font-medium text-text-main">
                      {outline.length} sections
                    </div>
                  )}
                </div>
                <div className="markdown-body prose prose-slate max-w-[800px] prose-headings:font-heading prose-headings:font-bold prose-headings:text-text-main prose-headings:uppercase prose-p:text-text-muted prose-p:font-medium hover:prose-a:text-primary prose-a:font-bold prose-strong:font-bold">
                  {renderMd(unit.content_md)}
                </div>
              </section>

              {next_unit && (
                <button
                  type="button"
                  onClick={() =>
                    navigate(`/academy/unit/${course.id}/${next_unit.id}`)
                  }
                  className="group flex w-full items-center justify-between gap-4 rounded-xl border border-border-main bg-surface p-6 text-left shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="min-w-0">
                    <div className="mb-2 inline-block rounded-md border border-border-main bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-text-muted shadow-sm">
                      Up Next
                    </div>
                    <h3 className="truncate font-heading text-xl font-bold uppercase text-text-main sm:text-2xl group-hover:text-primary transition-colors">
                      {next_unit.title}
                    </h3>
                    <p className="mt-2 text-sm font-medium leading-relaxed text-text-muted">
                      {next_unit.section === "practice"
                        ? "Next step is a practical lab to apply what you just learned."
                        : "Continue with the next reading unit."}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-border-main bg-white shadow-sm transition-transform group-hover:translate-x-1 group-hover:border-primary group-hover:text-primary">
                    <ChevronRight
                      className="h-6 w-6"
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                  </div>
                </button>
              )}
            </>
          ) : (
            <>
              <section className="relative flex flex-col rounded-xl border border-border-main bg-main-bg shadow-sm overflow-hidden">
                <div className="flex flex-col justify-between gap-4 border-b border-border-main bg-white px-4 py-3 sm:flex-row sm:items-center">
                  <div className="flex flex-wrap items-center gap-2">
                    <LabTabButton
                      label="Editor"
                      active={activeWorkspaceTab === "editor"}
                      onClick={() => setActiveWorkspaceTab("editor")}
                    />
                    {runnerSupported && (
                      <LabTabButton
                        label="Results"
                        active={activeWorkspaceTab === "results"}
                        onClick={() => setActiveWorkspaceTab("results")}
                      />
                    )}
                    {unit.hints && unit.hints.length > 0 && (
                      <LabTabButton
                        label="Hints"
                        active={activeWorkspaceTab === "hints"}
                        onClick={() => setActiveWorkspaceTab("hints")}
                      />
                    )}
                    <LabTabButton
                      label="Solution"
                      active={activeWorkspaceTab === "solution"}
                      onClick={() => setActiveWorkspaceTab("solution")}
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    {runnerSupported && (
                      <button
                        type="button"
                        onClick={() => void handleRunChallenge()}
                        disabled={runLoading}
                        className="inline-flex items-center gap-2 rounded-lg border border-primary bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary shadow-sm transition-all hover:-translate-y-0.5 hover:bg-primary hover:text-white disabled:pointer-events-none disabled:opacity-50"
                      >
                        {runLoading ? (
                          <LoaderCircle className="h-4 w-4 animate-spin" />
                        ) : (
                          <Play className="h-4 w-4 fill-current" />
                        )}
                        {runLoading ? "Running..." : "Run Checks"}
                      </button>
                    )}

                    {activeWorkspaceTab === "editor" && (
                      <div className="flex items-center rounded-lg border border-border-main bg-white shadow-sm overflow-hidden">
                        <button
                          type="button"
                          onClick={copyDraft}
                          className="p-2 text-text-muted transition-colors hover:bg-surface hover:text-text-main"
                          title="Copy Code"
                        >
                          <ClipboardCopy className="h-4 w-4" />
                        </button>
                        <div className="w-px h-4 bg-border-main"></div>
                        <button
                          type="button"
                          onClick={resetDraft}
                          className="p-2 text-text-muted transition-colors hover:bg-surface hover:text-destructive"
                          title="Reset Code"
                        >
                          <AlertTriangle className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto bg-surface px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-text-muted border-b border-border-main">
                  {runnerSupported ? (
                    <span className="flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-emerald-600 shadow-sm border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      {runtimeLabel} Ready
                    </span>
                  ) : (
                    <span className="rounded-md border border-border-main bg-white px-2 py-0.5 shadow-sm text-text-main">
                      Interactive Workspace
                    </span>
                  )}

                  {draftDirty && (
                    <span className="rounded-md border border-border-main bg-white px-2 py-0.5 shadow-sm text-text-main">
                      Modified
                    </span>
                  )}
                  {runReport && !runReportIsFresh && (
                    <span className="rounded-md border border-border-main bg-amber-500/10 text-amber-700 px-2 py-0.5 shadow-sm">
                      Needs Rerun
                    </span>
                  )}
                  {activeRunReport?.allPassed && (
                    <span className="rounded-md border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 px-2 py-0.5 shadow-sm">
                      All Passed
                    </span>
                  )}
                </div>

                <div className="flex-1 bg-white flex flex-col min-h-[600px]">
                  {activeWorkspaceTab === "editor" && (
                    <div className="flex-1 flex flex-col h-full min-h-[700px]">
                      <CodeEditorPane
                        value={draftCode}
                        onChange={setDraftCode}
                        language={unit.language || "text"}
                        placeholder="Start typing your solution here..."
                      />
                    </div>
                  )}

                  {activeWorkspaceTab === "results" && runnerSupported && (
                    <div className="flex-1 flex flex-col min-h-[700px]">
                      {!runReport ? (
                        <div className="flex flex-col flex-1 items-center justify-center p-12 text-center bg-surface">
                          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm border border-border-main">
                            <TerminalSquare
                              className="h-8 w-8 text-text-muted"
                              strokeWidth={2}
                            />
                          </div>
                          <h3 className="mb-2 font-heading text-xl font-bold uppercase text-text-main">
                            No Test Results Yet
                          </h3>
                          <p className="max-w-sm text-sm font-medium text-text-muted">
                            Run your code to see the test results for public and
                            hidden test cases.
                          </p>
                        </div>
                      ) : (
                        <div className="flex-1 p-6 bg-main-bg">
                          <div className="mb-6 flex items-center justify-between gap-4 border-b border-border-main pb-4">
                            <div className="text-sm font-bold uppercase tracking-widest text-text-main">
                              Execution Results
                            </div>
                            <span
                              className={`rounded-md border px-2 py-1 text-[10px] font-bold uppercase tracking-widest shadow-sm ${
                                runReportIsFresh
                                  ? runReport.allPassed
                                    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600"
                                    : "border-destructive/20 bg-destructive/10 text-destructive"
                                  : "border-amber-500/20 bg-amber-500/10 text-amber-700"
                              }`}
                            >
                              {runReportIsFresh
                                ? runReport.allPassed
                                  ? "All Passed"
                                  : "Failed"
                                : "Needs Rerun"}
                            </span>
                          </div>

                          <p className="mb-6 text-sm font-medium leading-relaxed text-text-muted bg-white p-4 rounded-lg border border-border-main">
                            {runReportIsFresh
                              ? runReport.message
                              : "You have modified the code since the last run. Please run the checks again to see updated results."}
                          </p>

                          <div className="mb-6 grid grid-cols-2 gap-4">
                            <div className="rounded-xl border border-border-main bg-white p-4 shadow-sm">
                              <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-text-muted border-b border-border-main pb-2">
                                Passed Tests
                              </div>
                              <div
                                className={`font-heading text-3xl font-bold ${runReport.allPassed ? "text-emerald-500" : "text-text-main"}`}
                              >
                                {runReport.passedCount}{" "}
                                <span className="text-xl text-text-muted">
                                  / {runReport.totalCount}
                                </span>
                              </div>
                            </div>
                            <div className="rounded-xl border border-border-main bg-white p-4 shadow-sm">
                              <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-text-muted border-b border-border-main pb-2">
                                Primary Function
                              </div>
                              <div className="mt-1 truncate font-mono text-sm font-bold text-primary">
                                {runReport.primaryFunction || "Unknown"}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="text-xs font-bold uppercase tracking-widest text-text-main">
                              Test Case Details
                            </div>
                            {(runReport.cases || []).length > 0 ? (
                              runReport.cases.map((caseItem, index) => (
                                <div
                                  key={caseItem.id}
                                  className={`rounded-xl border p-4 shadow-sm transition-all ${
                                    caseItem.passed
                                      ? "border-emerald-500/20 bg-emerald-500/5"
                                      : "border-destructive/20 bg-destructive/5"
                                  }`}
                                >
                                  <div className="mb-3 flex items-center justify-between gap-4 border-b border-border-main/50 pb-2">
                                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-text-main">
                                      {caseItem.passed ? (
                                        <div className="rounded-full bg-emerald-500/20 p-1 text-emerald-600">
                                          <CheckCircle2
                                            className="h-3 w-3"
                                            strokeWidth={3}
                                          />
                                        </div>
                                      ) : (
                                        <div className="rounded-full bg-destructive/20 p-1 text-destructive">
                                          <AlertTriangle
                                            className="h-3 w-3"
                                            strokeWidth={3}
                                          />
                                        </div>
                                      )}
                                      {caseItem.hidden
                                        ? `Hidden Test ${index + 1}`
                                        : `Public Test ${index + 1}`}
                                    </div>
                                  </div>
                                  <div className="text-sm font-medium leading-relaxed text-text-muted">
                                    {caseItem.description}
                                  </div>
                                  {caseItem.error && (
                                    <div className="mt-4">
                                      <CodeSurface
                                        code={caseItem.error}
                                        language="text"
                                        label="error"
                                        maxHeightClass="max-h-[180px]"
                                      />
                                    </div>
                                  )}
                                </div>
                              ))
                            ) : (
                              <div className="rounded-xl border border-border-main bg-surface p-4 text-center text-sm font-medium text-text-muted">
                                The runner did not return structured results for
                                this lab.
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {activeWorkspaceTab === "hints" && (
                  <div className="flex-1 bg-white p-6 sm:p-8 min-h-[600px]">
                    <div className="mb-6 flex items-center justify-between gap-4 border-b border-border-main pb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border-main bg-surface shadow-sm text-amber-500">
                          <Lightbulb className="h-5 w-5" strokeWidth={2} />
                        </div>
                        <h3 className="font-heading text-xl font-bold uppercase text-text-main">
                          Hints
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setRevealedHints((value) =>
                            Math.min(value + 1, unit.hints.length),
                          )
                        }
                        disabled={revealedHints >= unit.hints.length}
                        className="rounded-lg border border-border-main bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-text-main shadow-sm transition-all hover:-translate-y-0.5 hover:bg-surface disabled:pointer-events-none disabled:opacity-50"
                      >
                        Show More
                      </button>
                    </div>
                    <div className="space-y-4">
                      {unit.hints.slice(0, revealedHints).map((hint, index) => (
                        <div
                          key={`${hint}-${index}`}
                          className="rounded-lg border border-amber-500/20 bg-amber-50 p-5 text-sm font-medium text-amber-900 shadow-sm"
                        >
                          {hint}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeWorkspaceTab === "solution" && (
                  <div className="min-h-[600px] bg-white p-6 text-text-main">
                    {!solutionUnlocked ? (
                      <div className="flex h-full flex-col items-center justify-center rounded-xl border  border-border-main bg-surface py-20 text-center">
                        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm border border-border-main">
                          <Lightbulb
                            className="h-8 w-8 text-amber-500 fill-amber-500/20"
                            strokeWidth={2}
                          />
                        </div>
                        <h3 className="mb-2 font-heading text-2xl font-bold uppercase text-text-main">
                          Reference Solution Hidden
                        </h3>
                        <p className="mx-auto mb-8 max-w-md text-sm font-medium leading-relaxed text-text-muted">
                          Try to solve the lab on your own first! The reference
                          solution is here if you get completely stuck or want
                          to compare approaches after finishing.
                        </p>
                        <button
                          type="button"
                          onClick={() => setSolutionUnlocked(true)}
                          className="rounded-lg border border-border-main bg-white px-6 py-3 text-xs font-bold uppercase tracking-widest text-text-main shadow-sm transition-all hover:-translate-y-0.5 hover:bg-surface hover:text-primary"
                        >
                          Reveal Solution
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="mb-4 flex items-center justify-between border-b border-border-main pb-4">
                          <div className="text-sm font-bold uppercase tracking-widest text-text-main">
                            Reference Solution
                          </div>
                          <button
                            type="button"
                            disabled={!unit.solution}
                            onClick={() => {
                              if (unit.solution) {
                                navigator.clipboard.writeText(unit.solution);
                                setNotice("Solution copied to clipboard");
                              }
                            }}
                            className="flex items-center gap-1.5 rounded-lg border border-border-main bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-text-main shadow-sm transition-colors hover:bg-surface disabled:opacity-50"
                          >
                            <ClipboardCopy className="h-3.5 w-3.5" />
                            Copy
                          </button>
                        </div>
                        {unit.solution ? (
                          <CodeSurface
                            code={unit.solution}
                            language={unit.language || "text"}
                            label="reference solution"
                            maxHeightClass="max-h-[500px]"
                          />
                        ) : (
                          <div className="rounded-xl border border-dashed border-border-main bg-surface p-8 text-center text-sm font-bold text-text-muted">
                            No reference solution provided for this lab.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </section>
            </>
          )}
        </div>

        <aside
          className={`space-y-8 ${isPractice ? "xl:order-1 hidden" : "xl:sticky xl:top-24 xl:self-start"}`}
        >
          {outline.length > 0 ? (
            <SidebarPanel
              title="Table of Contents"
              accent="bg-surface"
              headerText="text-text-main"
              footer={`${outline.length} sections`}
            >
              <div className="relative ml-2 space-y-3 py-2 pl-4">
                <div className="absolute top-0 bottom-0 left-[3px] w-px bg-border-main" />
                {outline.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className={`relative block py-1 text-sm font-medium text-text-muted transition-colors hover:text-primary before:absolute before:left-[-21px] before:top-[12px] before:h-2 before:w-2 before:rounded-full before:border before:border-border-main before:bg-white hover:before:border-primary ${
                      item.level > 2 ? "pl-4" : "pl-0"
                    }`}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </SidebarPanel>
          ) : (
            <SidebarPanel
              title="Lab Configuration"
              accent="bg-surface"
              headerText="text-text-main"
              footer={practiceModeText(unit)}
            >
              <div className="space-y-0">
                <ProfileRow
                  label="Test Cases"
                  value={String(unit.tests.length)}
                />
                <ProfileRow label="Hints" value={String(unit.hints.length)} />
                <ProfileRow label="Language" value={unit.language || "None"} />
                <ProfileRow
                  label="Build Type"
                  value={unit.build_type || "Standard"}
                />
              </div>
            </SidebarPanel>
          )}

          <SidebarPanel
            title={currentModule?.title || "Module"}
            accent="bg-surface"
            headerText="text-text-main"
            footer={
              currentModule
                ? `${currentModuleCompleted}/${currentModuleUnits.length} lessons completed`
                : "No module info"
            }
          >
            <div className="mt-4 space-y-3">
              {currentModuleUnits.map((routeUnit) => {
                const done = isAcademyV2UnitCompleted(
                  progress.state.completedLessons,
                  course.id,
                  routeUnit.id,
                );
                const locked = isUnitLocked(
                  progress.state.completedLessons,
                  course.id,
                  flatCourseUnits,
                  routeUnit.id,
                );
                const current = routeUnit.id === unit.id;

                return (
                  <button
                    key={routeUnit.id}
                    type="button"
                    disabled={locked}
                    onClick={() =>
                      !locked &&
                      navigate(`/academy/unit/${course.id}/${routeUnit.id}`)
                    }
                    className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all ${
                      current
                        ? "border-primary/50 bg-primary/5 shadow-sm"
                        : locked
                          ? "cursor-not-allowed border-border-main bg-main-bg opacity-60"
                          : done
                            ? "border-border-main bg-white hover:bg-surface hover:shadow-sm"
                            : "border-border-main bg-white hover:-translate-y-0.5 hover:border-primary/30 hover:bg-surface hover:shadow-sm"
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md border ${
                        current
                          ? "border-primary bg-primary text-white"
                          : done
                            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600"
                            : locked
                              ? "border-border-main bg-surface text-text-muted"
                              : routeUnit.section === "practice"
                                ? "border-border-main bg-white text-text-main"
                                : "border-border-main bg-white text-text-main"
                      }`}
                    >
                      {locked ? (
                        <Lock className="h-4 w-4" strokeWidth={2} />
                      ) : done ? (
                        <CheckCircle2 className="h-4 w-4" strokeWidth={2} />
                      ) : routeUnit.section === "practice" ? (
                        <Code2 className="h-4 w-4" strokeWidth={2} />
                      ) : (
                        <BookOpen className="h-4 w-4" strokeWidth={2} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div
                        className={`truncate text-xs font-bold uppercase tracking-wider ${current ? "text-primary" : "text-text-main"}`}
                      >
                        {routeUnit.title}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </SidebarPanel>
        </aside>
      </div>

      <div className="mt-12 flex flex-col items-center justify-center gap-6 rounded-xl border border-border-main bg-white p-8 shadow-sm">
        <h3 className="font-heading text-2xl font-bold uppercase text-text-main">
          {unitDone ? "Unit Completed" : "Finish This Unit"}
        </h3>
        <p className="max-w-xl text-center text-sm font-medium text-text-muted">
          {unitDone
            ? "Great job! You have already finished this unit. You can proceed to the next unit when ready."
            : isPractice
              ? runnerSupported
                ? "Pass all tests by clicking Run Checks to unlock the Complete button."
                : "Click complete below when you are ready to move on."
              : "Take a moment to absorb the material before marking complete."}
        </p>

        {!unitDone && completionBlocked && (
          <div className="flex items-center gap-2 rounded-md bg-amber-500/10 px-4 py-2 text-sm font-bold uppercase tracking-widest text-amber-700">
            <AlertTriangle className="h-4 w-4" strokeWidth={2} />
            {runLoading ? "Running tests..." : "All tests must pass"}
          </div>
        )}

        {!unitDone ? (
          <button
            type="button"
            onClick={() => void handleComplete()}
            disabled={completionBlocked || runLoading}
            className="flex items-center gap-3 rounded-full bg-primary px-8 py-4 text-sm font-bold uppercase tracking-widest text-primary-foreground shadow-sm transition-all hover:-translate-y-1 hover:shadow-md disabled:pointer-events-none disabled:opacity-50"
          >
            <CheckCircle2 className="h-5 w-5" strokeWidth={3} />
            {isPractice ? "Submit Lab" : "Mark Complete"}
          </button>
        ) : (
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-6 py-3 text-sm font-bold uppercase tracking-widest text-emerald-600">
              <CheckCircle2 className="h-5 w-5" strokeWidth={3} />
              Recorded
            </div>
            {next_unit && (
              <button
                type="button"
                onClick={() =>
                  navigate(`/academy/unit/${course.id}/${next_unit.id}`)
                }
                className="flex items-center gap-3 rounded-full bg-primary px-8 py-3 text-sm font-bold uppercase tracking-widest text-primary-foreground shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
              >
                Next Unit
                <ChevronRight className="h-5 w-5" strokeWidth={3} />
              </button>
            )}
            {!next_unit && (
              <button
                type="button"
                onClick={() => navigate(`/academy/course/${course.id}`)}
                className="flex items-center gap-3 rounded-full border border-border-main bg-white px-8 py-3 text-sm font-bold uppercase tracking-widest text-text-main shadow-sm transition-all hover:-translate-y-1 hover:shadow-md hover:bg-surface"
              >
                Back to Course
              </button>
            )}
          </div>
        )}
      </div>

      <div className="mt-12 mb-20 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between  pt-10">
        <NavUnitLink
          label="Previous"
          unit={previous_unit}
          href={
            previous_unit
              ? `/academy/unit/${course.id}/${previous_unit.id}`
              : "#"
          }
          disabled={!previous_unit}
          align="left"
        />
        <NavUnitLink
          label="Next"
          unit={next_unit}
          href={next_unit ? `/academy/unit/${course.id}/${next_unit.id}` : "#"}
          disabled={!next_unit}
          align="right"
        />
      </div>
    </div>
  );
}

function SidebarPanel({
  title,
  accent,
  headerText,
  footer,
  children,
}: {
  title: string;
  accent: string;
  headerText: string;
  footer?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-xl border border-border-main p-6 shadow-sm ${accent}`}
    >
      <div
        className={`mb-4 border-b border-border-main/50 pb-4 text-xs font-bold uppercase tracking-widest ${headerText}`}
      >
        {title}
      </div>
      <div>{children}</div>
      {footer && (
        <div
          className={`mt-6 border-t border-border-main/50 pt-4 text-[10px] font-bold uppercase tracking-widest ${headerText}`}
        >
          {footer}
        </div>
      )}
    </div>
  );
}

function LabTabButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all rounded-md ${
        active
          ? "bg-surface text-text-main shadow-sm border border-border-main"
          : "bg-transparent text-text-muted hover:bg-surface/50 hover:text-text-main"
      }`}
    >
      {label}
    </button>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border-main/50 py-3 last:border-0 border-dashed">
      <div className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
        {label}
      </div>
      <div className="text-sm font-bold text-text-main">{value}</div>
    </div>
  );
}

function NavUnitLink({
  label,
  unit,
  href,
  disabled,
  align,
}: {
  label: string;
  unit: AcademyV2UnitSummary | null;
  href: string;
  disabled: boolean;
  align: "left" | "right";
}) {
  if (disabled) {
    return (
      <div
        className={`flex w-full flex-col rounded-xl border border-border-main/50 bg-main-bg p-6 opacity-60 sm:w-[48%] ${align === "right" ? "items-start sm:items-end sm:text-right" : "items-start"}`}
      >
        <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-text-muted">
          {label}
        </div>
        <div className="font-heading text-xl font-bold text-text-muted">
          End of Route
        </div>
      </div>
    );
  }

  return (
    <Link
      to={href}
      className={`group flex w-full flex-col rounded-xl border border-border-main bg-white p-6 shadow-sm transition-all hover:bg-surface sm:w-[48%] ${align === "right" ? "items-start sm:items-end sm:text-right" : "items-start"}`}
    >
      <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-text-muted transition-colors group-hover:text-primary">
        {label}
      </div>
      <div className="max-w-full truncate font-heading text-2xl font-bold text-text-main transition-colors group-hover:text-primary">
        {unit?.title}
      </div>
      <div className="mt-4 inline-block rounded-md border border-border-main bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-text-muted shadow-sm">
        {unit?.section === "practice" ? "Interactive Lab" : "Theory Lesson"}
      </div>
    </Link>
  );
}
