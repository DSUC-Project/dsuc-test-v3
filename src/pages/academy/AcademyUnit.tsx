import React, { useEffect, useMemo, useState, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Circle,
  ClipboardCopy,
  Code2,
  Loader2,
  Lock,
  Play,
  XCircle,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import { ActionButton } from "@/components/ui/Primitives";

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

type WorkspaceTab = "editor" | "solution";

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

  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [activeHeading, setActiveHeading] = useState<string>("");
  const resultsRef = useRef<HTMLDivElement>(null);

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
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!unitData) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-xl font-bold mb-4">Không thể mở bài học này</h1>
        <p className="text-text-muted">{error || "Vui lòng thử lại sau."}</p>
        <div className="mt-8">
          <button
            onClick={() => setReloadNonce((n) => n + 1)}
            className="px-4 py-2 bg-primary text-white font-bold mr-4"
          >
            Thử Lại
          </button>
          <Link to="/academy" className="px-4 py-2 border font-bold">
            Về Trang Chủ
          </Link>
        </div>
      </div>
    );
  }

  const { course, unit, previous_unit, next_unit, unit_index, total_units } =
    unitData;
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
  const runnerSupported = isPractice && canRunAcademyChallenge(unit);
  const runReportIsFresh = !!runReport && lastRunSource === draftCode;
  const activeRunReport = runReportIsFresh ? runReport : null;
  const completionBlocked =
    runnerSupported &&
    !unitDone &&
    (!runReportIsFresh || !runReport?.allPassed);

  async function handleComplete() {
    setNotice("");

    if (completionBlocked) {
      setNotice(
        runLoading
          ? "Hệ thống đang chạy bài kiểm tra. Vui lòng đợi kết quả trước khi hoàn thành."
          : "Hãy vượt qua tất cả các bài kiểm tra kể cả ẩn trước khi hoàn thành chặng này.",
      );
      if (!isPractice) {
        // Instead of alert, the notice state can be displayed in the UI
        console.warn(notice);
      }
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

    if (saved && !unitDone) {
      try {
        const confetti = (await import("canvas-confetti")).default;
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {}
    }
  }

  function handleReset() {
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
      setNotice(report.message);
      setTimeout(
        () => resultsRef.current?.scrollIntoView({ behavior: "smooth" }),
        100,
      );
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
      setNotice(error?.message || "Có lỗi xảy ra trong lúc thực thi.");
      setTimeout(
        () => resultsRef.current?.scrollIntoView({ behavior: "smooth" }),
        100,
      );
    } finally {
      setRunLoading(false);
    }
  }

  // Visual Mappings
  const estimatedMinutes = Math.max(
    1,
    Math.ceil((unit.content_md?.length || 0) / 1000),
  );
  const moduleInfo = currentModule;
  const tocItems = outline.map((item) => ({ ...item, text: item.label }));
  const isGuest = !currentUser;

  const isRunning = runLoading;
  const hasRunOnce = !!runReport;
  const allRequiredChecksPassed = !!activeRunReport?.allPassed;
  const canComplete = !completionBlocked;
  const isCompleted = unitDone;
  const checkResults: Record<string, boolean> = {};
  if (runReport) {
    runReport.cases?.forEach((c) => {
      checkResults[c.id] = c.passed;
    });
  }
  const passedCount = runReport?.passedCount || 0;
  const totalChecks = runReport?.totalCount || unit.tests?.length || 0;

  const prevUnit = previous_unit;
  const nextUnit = next_unit;
  const currentIndex = unit_index;

  function scrollToHeading(id: string) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // Derive run output
  let runOutput = runReport?.message || "Run your code to see output.";
  if (runReport?.cases?.length) {
    const failed = runReport.cases.filter((c) => !c.passed);
    if (failed.length > 0) {
      runOutput +=
        "\n\nFailures:\n" +
        failed
          .map((f) => `- ${f.description}${f.error ? ":\n  " + f.error : ""}`)
          .join("\n");
    }
  }

  return (
    <div className="w-full min-h-screen flex flex-col bg-main-bg">
      {/* STICKY TOP BAR */}
      <div className="h-14 border-b brutal-border bg-surface/90 backdrop-blur flex items-center justify-between px-4 shrink-0 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link
            to={`/academy/course/${courseId}`}
            className="font-mono text-xs uppercase hover:text-primary transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-3 h-3" /> Exit
          </Link>
          <div className="w-px h-4 bg-border-main hidden md:block" />
          <h1 className="font-heading font-bold text-sm hidden md:block line-clamp-1 max-w-xs">
            {unit?.title}
          </h1>
          <span
            className={`px-2 py-0.5 border font-mono text-[10px] uppercase
            ${isPractice ? "border-primary text-primary bg-primary/5" : "border-border-main text-text-muted"}`}
          >
            {isPractice ? "Practice" : "Lesson"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* XP badge */}
          {unit?.xp_reward > 0 && (
            <span className="font-mono text-xs text-text-muted hidden sm:block">
              +{unit.xp_reward} XP
            </span>
          )}
          {/* Completion status */}
          {isCompleted && (
            <span className="flex items-center gap-1 font-mono text-xs uppercase text-green-500">
              <CheckCircle className="w-3 h-3" /> Complete
            </span>
          )}
        </div>
      </div>

      {!isPractice ? (
        <div className="flex-1 w-full flex flex-row">
          {/* TOC Sidebar */}
          <aside className="hidden lg:block w-60 shrink-0">
            <div className="sticky top-14 max-h-[calc(100vh-3.5rem)] overflow-y-auto pr-2 py-6">
              <p className="font-mono text-[10px] uppercase text-text-muted mb-4 px-3">
                On this page
              </p>
              <nav className="space-y-0.5">
                {tocItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToHeading(item.id)}
                    className={`w-full text-left px-3 py-1.5 text-xs transition-colors rounded
                        ${item.level === 3 ? "pl-6" : ""}
                        ${activeHeading === item.id ? "text-primary font-medium" : "text-text-muted hover:text-text-main"}`}
                  >
                    {item.text}
                  </button>
                ))}
              </nav>
            </div>
          </aside>
          {/* Lesson content area */}
          <main className="flex-1 min-w-0 py-10 px-4 lg:px-8 mb-16">
            <div className="max-w-[760px]">
              {/* Lesson header */}
              <div className="mb-10">
                <p className="font-mono text-xs uppercase text-text-muted mb-3">
                  {moduleInfo?.title}
                </p>
                <h1 className="font-display font-bold text-4xl md:text-5xl uppercase tracking-tighter mb-4">
                  {unit.title}
                </h1>
                <div className="flex items-center gap-4 font-mono text-xs text-text-muted">
                  <span>~{estimatedMinutes} min read</span>
                  <span className="px-2 py-0.5 border brutal-border uppercase">
                    Lesson
                  </span>
                  <span>+{unit.xp_reward} XP</span>
                </div>
                <div className="mt-6 border-t brutal-border" />
              </div>

              {/* Rendered markdown */}
              <div className="prose-dsuc">{renderMd(unit.content_md)}</div>

              {notice && !isPractice && (
                <div className="mt-4 p-3 border border-dashed border-red-500/40 bg-red-500/5 text-red-400 text-sm font-mono">
                  {notice}
                </div>
              )}

              {/* Complete button */}
              <div className="mt-16 pt-8 border-t brutal-border">
                {isCompleted ? (
                  <div className="flex items-center gap-3 text-green-500">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-heading font-bold">
                      Unit Completed!
                    </span>
                  </div>
                ) : (
                  <ActionButton
                    variant="primary"
                    onClick={handleComplete}
                    className="w-full md:w-auto"
                  >
                    Mark as Complete →
                  </ActionButton>
                )}

                {/* Guest reminder */}
                {isGuest && (
                  <p className="text-xs text-text-muted mt-3">
                    Sign in to save your progress and earn XP.
                  </p>
                )}
              </div>
            </div>
          </main>
        </div>
      ) : (
        <div className="flex-1 flex flex-col lg:flex-row pb-12 w-full overflow-hidden">
          {/* Left panel - Instructions */}
          <div className="w-full lg:w-[35%] shrink-0 border-r brutal-border flex flex-col bg-surface overflow-hidden">
            <div className="h-10 border-b brutal-border flex items-center px-4 shrink-0">
              <span className="font-mono text-xs uppercase text-text-muted">
                Instructions
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              <h2 className="font-heading font-bold text-xl mb-4">
                {unit.title}
              </h2>

              <div className="prose-dsuc mb-6">{renderMd(unit.content_md)}</div>

              {/* Checks list */}
              <div className="border-t brutal-border pt-4">
                <p className="font-mono text-[10px] uppercase text-text-muted mb-3">
                  Test Cases
                </p>
                <div className="space-y-2">
                  {unit.tests?.map((check, index) => {
                    const checkId = check.id || `test-${index}`;
                    const checkResult =
                      checkResults[checkId] !== undefined
                        ? checkResults[checkId]
                        : checkResults[index] !== undefined
                          ? checkResults[index]
                          : null;
                    return (
                      <div
                        key={checkId}
                        className={`flex items-start gap-3 p-3 border text-sm
                          ${
                            checkResult === true
                              ? "border-green-500/30 bg-green-500/5"
                              : checkResult === false
                                ? "border-red-500/30 bg-red-500/5"
                                : "border-border-main bg-main-bg"
                          }`}
                      >
                        <span className="shrink-0 mt-0.5">
                          {checkResult === true ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : checkResult === false ? (
                            <XCircle className="w-4 h-4 text-red-500" />
                          ) : (
                            <Circle className="w-4 h-4 text-text-muted" />
                          )}
                        </span>

                        <div className="flex-1 min-w-0">
                          <p
                            className={`font-mono text-xs ${!check.hidden ? "" : "text-text-muted italic"}`}
                          >
                            {!check.hidden ? check.description : "Hidden test"}
                          </p>
                          {/* If we had specific test hints we could show them here */}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Completion gate message */}
              {!allRequiredChecksPassed && hasRunOnce && (
                <div className="mt-4 p-3 border border-dashed border-border-main bg-main-bg text-center">
                  <p className="font-mono text-xs text-text-muted uppercase">
                    Pass all required checks to complete this unit.
                  </p>
                </div>
              )}

              {isRunning && (
                <div className="mt-4 p-3 border border-dashed border-primary/30 bg-primary/5 text-center">
                  <p className="font-mono text-xs text-primary uppercase animate-pulse">
                    Running checks...
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Center + Bottom panel - Editor & Results */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Editor Section */}
            <div className="flex-1 flex flex-col bg-[#0B0F17] min-h-[300px]">
              {/* Editor toolbar */}
              <div className="h-10 border-b border-gray-800 flex items-center justify-between px-4 shrink-0">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-gray-500">
                    {unit.language === "rust" ? "lib.rs" : "index.ts"}
                  </span>
                  <span className="w-px h-4 bg-gray-800" />
                  <span className="font-mono text-[10px] text-gray-600 uppercase">
                    {unit.language || "text"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleReset}
                    className="font-mono text-[10px] uppercase text-gray-500 hover:text-gray-300 px-2 py-1 transition-colors"
                  >
                    Reset
                  </button>
                  <button
                    onClick={handleRunChallenge}
                    disabled={isRunning}
                    className={`flex items-center gap-2 px-3 py-1 font-mono text-xs uppercase font-bold transition-all
                      ${
                        isRunning
                          ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                          : "bg-primary text-main-bg hover:brightness-110 brutal-border brutal-shadow-sm"
                      }`}
                  >
                    {isRunning ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" /> Running...
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3" /> Run Checks
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Editor tabs */}
              <div className="flex border-b border-gray-800 shrink-0">
                {(["editor", "solution"] as WorkspaceTab[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveWorkspaceTab(tab)}
                    className={`px-4 py-2 font-mono text-[10px] uppercase transition-colors
                      ${activeWorkspaceTab === tab ? "text-primary border-b border-primary" : "text-gray-500 hover:text-gray-300"}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Editor area */}
              <div className="flex-1 overflow-hidden relative">
                <div
                  className={`absolute inset-0 ${activeWorkspaceTab === "editor" ? "visible" : "invisible"}`}
                >
                  <CodeEditorPane
                    value={draftCode}
                    onChange={setDraftCode}
                    language={unit.language || "text"}
                    placeholder="Start typing your code here..."
                  />
                </div>

                {activeWorkspaceTab === "solution" && (
                  <div className="h-full overflow-auto absolute inset-0 bg-[#0B0F17] flex flex-col">
                    <div className="p-3 bg-gray-900/50 border-b border-gray-800 shrink-0">
                      <p className="font-mono text-xs text-yellow-500/70 uppercase">
                        Reference Solution — Try on your own first!
                      </p>
                    </div>
                    <div className="flex-1 relative">
                      {!solutionUnlocked ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-[#0B0F17] z-10">
                          <Lock className="w-12 h-12 text-gray-700 mb-4" />
                          <h3 className="font-heading font-bold text-gray-300 text-lg mb-2 uppercase">
                            Unlock Solution
                          </h3>
                          <p className="text-gray-500 text-sm text-center font-mono mb-6 max-w-sm">
                            Viewing the solution will reveal the complete
                            answer. Try to solve the challenge yourself first!
                          </p>
                          <button
                            onClick={() => setSolutionUnlocked(true)}
                            className="px-6 py-2 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white font-mono text-xs uppercase transition-colors brutal-border border"
                          >
                            Reveal Solution
                          </button>
                        </div>
                      ) : (
                        <div className="p-0 font-mono text-sm text-gray-300 h-full">
                          <CodeSurface
                            code={unit.solution || "// No solution provided"}
                            language={unit.language || "text"}
                            label="solution"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Results Bottom Panel */}
            <div
              ref={resultsRef}
              className={`shrink-0 border-t brutal-border flex flex-col bg-surface transition-all ${
                !hasRunOnce && !isCompleted
                  ? "h-12"
                  : isCompleted
                    ? "h-auto"
                    : "h-64"
              }`}
            >
              <div className="h-12 border-b brutal-border flex items-center justify-between px-4 shrink-0 bg-surface z-10">
                <span className="font-mono text-xs uppercase text-text-muted">
                  Results
                </span>
                <div className="flex items-center gap-4">
                  {isCompleted ? (
                    <div className="flex items-center gap-4 text-green-500">
                      <span className="font-heading font-bold text-xs uppercase hidden sm:inline-block">
                        Unit Complete!
                      </span>
                      {nextUnit ? (
                        <Link
                          to={`/academy/unit/${courseId}/${nextUnit.id}`}
                          className="px-4 py-1.5 bg-primary text-main-bg font-bold font-heading text-[10px] uppercase transition-all brutal-border hover:brightness-110"
                        >
                          Next Unit →
                        </Link>
                      ) : (
                        <Link
                          to={`/academy/course/${courseId}`}
                          className="px-4 py-1.5 border border-primary text-primary font-bold font-heading text-[10px] uppercase transition-all hover:bg-primary/10"
                        >
                          Finish Course →
                        </Link>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={handleComplete}
                      disabled={!canComplete}
                      className={`px-4 py-1.5 font-heading font-bold uppercase text-[10px] transition-all brutal-border border
                        ${
                          canComplete
                            ? "bg-primary text-main-bg hover:opacity-90"
                            : "bg-transparent text-text-muted cursor-not-allowed opacity-50"
                        }`}
                    >
                      {canComplete
                        ? "Complete Unit ✓"
                        : "Pass all checks first"}
                    </button>
                  )}
                </div>
              </div>

              {(hasRunOnce || isCompleted) && (
                <div className="flex-1 overflow-y-auto p-4 flex flex-col sm:flex-row gap-6">
                  <div className="w-full sm:w-[200px] shrink-0 flex flex-col justify-start items-center border-r border-transparent sm:border-border-main pr-0 sm:pr-4">
                    {isRunning ? (
                      <div className="flex flex-col items-center justify-center p-4">
                        <Loader2 className="w-5 h-5 animate-spin text-primary mb-2" />
                        <p className="font-mono text-[10px] text-text-muted uppercase text-center mt-2">
                          Running tests...
                        </p>
                      </div>
                    ) : (
                      <>
                        <div
                          className={`p-4 border text-center w-full mb-4
                           ${allRequiredChecksPassed ? "border-green-500/40 bg-green-500/5" : "border-red-500/40 bg-red-500/5"}`}
                        >
                          {allRequiredChecksPassed ? (
                            <>
                              <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
                              <p className="font-heading font-bold text-green-500 text-xs">
                                All checks passed!
                              </p>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
                              <p className="font-heading font-bold text-red-400 text-xs leading-tight">
                                {passedCount}/{totalChecks} checks failed
                              </p>
                            </>
                          )}
                        </div>
                        {runOutput && (
                          <div className="w-full text-left font-mono text-[10px] text-gray-400 p-2 bg-[#0B0F17] rounded border border-gray-800 break-words max-h-32 overflow-y-auto">
                            <pre className="whitespace-pre-wrap">
                              {runOutput}
                            </pre>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 overflow-y-auto">
                    {!hasRunOnce ? null : isRunning ? null : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-8">
                        {unit.tests?.map((check, index) => {
                          const checkId = check.id || `test-${index}`;
                          const checkResult =
                            checkResults[checkId] !== undefined
                              ? checkResults[checkId]
                              : checkResults[index] !== undefined
                                ? checkResults[index]
                                : null;
                          return (
                            <div
                              key={checkId}
                              className={`flex items-start gap-3 p-3 text-sm border
                                 ${
                                   checkResult === true
                                     ? "text-green-500 border-green-500/20 bg-green-500/5"
                                     : checkResult === false
                                       ? "text-red-400 border-red-500/20 bg-red-500/5"
                                       : "text-text-muted border-border-main"
                                 }`}
                            >
                              <div className="mt-0.5 shrink-0">
                                {checkResult === true ? (
                                  <CheckCircle className="w-4 h-4" />
                                ) : checkResult === false ? (
                                  <XCircle className="w-4 h-4" />
                                ) : (
                                  <Circle className="w-4 h-4" />
                                )}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="font-mono text-xs line-clamp-3 leading-relaxed">
                                  {!check.hidden
                                    ? check.description
                                    : "Hidden test case"}
                                </span>
                                {check.hidden && (
                                  <span className="text-[10px] uppercase mt-1 opacity-70 border inline-block px-1 w-max">
                                    Hidden
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sticky prev/next bar (bottom) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-surface/90 backdrop-blur border-t brutal-border">
        <div className="flex items-center justify-between px-4 h-12">
          {prevUnit ? (
            <Link
              to={`/academy/unit/${courseId}/${prevUnit.id}`}
              className="flex items-center gap-2 font-mono text-xs uppercase hover:text-primary transition-colors"
            >
              <ChevronLeft className="w-3 h-3" />
              <span className="hidden sm:block max-w-[160px] truncate">
                {prevUnit.title}
              </span>
              <span className="sm:hidden">Prev</span>
            </Link>
          ) : (
            <div />
          )}

          <span className="font-mono text-xs text-text-muted px-4">
            {currentIndex + 1} / {total_units} - {unit.title}
          </span>

          {nextUnit ? (
            <Link
              to={`/academy/unit/${courseId}/${nextUnit.id}`}
              className="flex items-center gap-2 font-mono text-xs uppercase hover:text-primary transition-colors"
            >
              <span className="hidden sm:block max-w-[160px] truncate">
                {nextUnit.title}
              </span>
              <span className="sm:hidden">Next</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          ) : (
            <Link
              to={`/academy/course/${courseId}`}
              className="flex items-center gap-2 font-mono text-xs uppercase text-primary hover:underline transition-colors"
            >
              <span>Finish Course</span>
              <Zap className="w-3 h-3" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
