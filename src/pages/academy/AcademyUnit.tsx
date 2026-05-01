import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
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
} from 'lucide-react';
import { motion } from 'framer-motion';
import { ActionButton } from '@/components/ui/Primitives';

import type {
  AcademyV2CourseDetail,
  AcademyV2UnitDetail,
  AcademyV2UnitSummary,
} from '@/types';
import {
  canRunAcademyChallenge,
  runAcademyChallenge,
  type ChallengeRunReport,
} from '@/lib/academy/challengeRunner';
import { CodeEditorPane, CodeSurface } from '@/components/academy/CodeSurface';
import { renderMd, slugifyMarkdownHeading } from '@/lib/academy/md';
import { fetchAcademyV2Unit } from '@/lib/academy/v2Api';
import { useAcademyProgressState } from '@/lib/academy/useAcademyProgress';
import {
  countCompletedAcademyV2CourseUnits,
  isAcademyV2UnitCompleted,
} from '@/lib/academy/v2Progress';
import { useStore } from '@/store/useStore';

type OutlineItem = {
  id: string;
  label: string;
  level: number;
};

type FlatUnit = AcademyV2UnitSummary & {
  moduleId: string;
  moduleTitle: string;
};

type WorkspaceTab = 'editor' | 'results' | 'solution';

function draftKey(courseId: string, unitId: string) {
  return `academy-lab-draft:${courseId}:${unitId}`;
}

function extractMarkdownOutline(md: string): OutlineItem[] {
  return String(md || '')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => /^#{1,4}\s+/.test(line))
    .map((line) => {
      const match = /^(#{1,4})\s+(.+)$/.exec(line);
      if (!match) {
        return null;
      }

      const label = match[2].replace(/[`*_~]/g, '').trim();
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
      }))
  );
}

function isUnitLocked(
  completedLessons: Record<string, boolean>,
  courseId: string,
  flatUnits: FlatUnit[],
  unitId: string
) {
  const flatIndex = flatUnits.findIndex((item) => item.id === unitId);
  const previous = flatIndex > 0 ? flatUnits[flatIndex - 1] : null;

  return previous ? !isAcademyV2UnitCompleted(completedLessons, courseId, previous.id) : false;
}

export function AcademyUnit() {
  const { courseId = '', unitId = '' } = useParams<{ courseId: string; unitId: string }>();
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
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [draftCode, setDraftCode] = useState('');
  const [revealedHints, setRevealedHints] = useState(1);
  const [reloadNonce, setReloadNonce] = useState(0);
  const [runLoading, setRunLoading] = useState(false);
  const [runReport, setRunReport] = useState<ChallengeRunReport | null>(null);
  const [lastRunSource, setLastRunSource] = useState('');
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<WorkspaceTab>('editor');
  const [solutionUnlocked, setSolutionUnlocked] = useState(false);
  
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [activeHeading, setActiveHeading] = useState<string>('');

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

    async function loadUnit() {
      setLoading(true);
      setError('');
      setNotice('');
      try {
        const base = (import.meta as any).env.VITE_API_BASE_URL || '';
        const result = await fetchAcademyV2Unit(
          base,
          courseId,
          unitId,
          authToken || localStorage.getItem('auth_token'),
          walletAddress
        );

        if (!cancelled) {
          setUnitData(result);
          const nextDraft =
            typeof window !== 'undefined'
              ? window.localStorage.getItem(draftKey(courseId, unitId)) || result.unit.code || ''
              : result.unit.code || '';
          setDraftCode(nextDraft);
          setRevealedHints(1);
          setRunReport(null);
          setLastRunSource('');
          setActiveWorkspaceTab('editor');
          setSolutionUnlocked(false);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || 'Không thể tải bài học.');
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
    if (!unitData || typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(draftKey(courseId, unitId), draftCode);
  }, [courseId, draftCode, unitData, unitId]);

  const previewUnit = unitData?.unit ?? null;
  const previewPracticeRunnable =
    !!previewUnit &&
    previewUnit.section === 'practice' &&
    canRunAcademyChallenge(previewUnit);

  useEffect(() => {
    if (!previewUnit || previewUnit.section !== 'practice' || !previewPracticeRunnable || typeof window === 'undefined') {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        event.preventDefault();
        void handleRunChallenge();
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
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
        <p className="text-text-muted">{error || 'Vui lòng thử lại sau.'}</p>
        <div className="mt-8">
           <button onClick={() => setReloadNonce(n => n + 1)} className="px-4 py-2 bg-primary text-white font-bold mr-4">Thử Lại</button>
           <Link to="/academy" className="px-4 py-2 border font-bold">Về Trang Chủ</Link>
        </div>
      </div>
    );
  }

  const { course, unit, previous_unit, next_unit, unit_index, total_units } = unitData;
  const flatCourseUnits = flattenCourseUnits(course);
  const currentModule = course.modules.find((module) => module.id === unit.module_id) || null;
  const currentModuleUnits = currentModule
    ? [...currentModule.learn_units, ...currentModule.practice_units].sort(
        (left, right) => Number(left.order || 0) - Number(right.order || 0)
      )
    : [];
  const outline = extractMarkdownOutline(unit.content_md);
  const unitDone = isAcademyV2UnitCompleted(progress.state.completedLessons, course.id, unit.id);
  const isPractice = unit.section === 'practice';
  const runnerSupported = isPractice && canRunAcademyChallenge(unit);
  const runReportIsFresh = !!runReport && lastRunSource === draftCode;
  const activeRunReport = runReportIsFresh ? runReport : null;
  const completionBlocked = runnerSupported && !unitDone && (!runReportIsFresh || !runReport?.allPassed);

  async function handleComplete() {
    setNotice('');

    if (completionBlocked) {
      setNotice(
        runLoading
          ? 'Hệ thống đang chạy bài kiểm tra. Vui lòng đợi kết quả trước khi hoàn thành.'
          : 'Hãy vượt qua tất cả các bài kiểm tra kể cả ẩn trước khi hoàn thành chặng này.'
      );
      if (!isPractice) {
         alert(notice); // For content unit if there is something blocked
      }
      return;
    }

    const saved = await progress.persistUnitCompletion(course.id, unit.id, {
      quizPassed: isPractice,
      xpAwarded: unit.xp_reward,
    });

    setNotice(
      saved
        ? 'Tiến độ được đồng bộ. Hoạt động luyện tập đã được lưu lại.'
        : 'Tiến độ đã được lưu cục bộ. Hệ thống sẽ thử bộ lại lần tới khi bài học này được tải.'
    );
    
    if (saved && !unitDone) {
        setShowCompletionModal(true);
        try {
          const confetti = (await import('canvas-confetti')).default;
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch(e) {}
    } else if (!unitDone) {
        setShowCompletionModal(true);
    }
  }

  function handleReset() {
    setDraftCode(unit.code || '');
    setNotice('Khôi phục code gốc của bài học này thành công.');
  }

  async function handleRunChallenge() {
    if (!isPractice || !runnerSupported) {
      return;
    }

    setNotice('');
    setRunLoading(true);
    try {
      const report = await runAcademyChallenge({ ...unit, code: draftCode });
      setRunReport(report);
      setLastRunSource(draftCode);
      setActiveWorkspaceTab('results');
      setNotice(report.message);
    } catch (error: any) {
      setRunReport({
        supported: true,
        allPassed: false,
        passedCount: 0,
        totalCount: unit.tests.length,
        visiblePassedCount: 0,
        visibleTotalCount: unit.tests.filter((item) => item.hidden !== true).length,
        hiddenPassedCount: 0,
        hiddenTotalCount: unit.tests.filter((item) => item.hidden === true).length,
        primaryFunction: null,
        runtimeLabel: 'Thử thách trên trình duyệt',
        message: error?.message || 'Có lỗi xảy ra trong lúc thực thi.',
        cases: [],
      });
      setLastRunSource(draftCode);
      setActiveWorkspaceTab('results');
      setNotice(error?.message || 'Có lỗi xảy ra trong lúc thực thi.');
    } finally {
      setRunLoading(false);
    }
  }

  // Visual Mappings
  const estimatedMinutes = Math.max(1, Math.ceil((unit.content_md?.length || 0) / 1000));
  const moduleInfo = currentModule;
  const tocItems = outline.map(item => ({...item, text: item.label}));
  const isGuest = !currentUser;
  
  const isRunning = runLoading;
  const hasRunOnce = !!runReport;
  const allRequiredChecksPassed = !!activeRunReport?.allPassed;
  const canComplete = !completionBlocked;
  const isCompleted = unitDone;
  const checkResults: Record<string, boolean> = {};
  if (runReport) {
     runReport.cases?.forEach(c => {
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
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Derive run output
  let runOutput = runReport?.message || 'Run your code to see output.';
  if (runReport?.cases?.length) {
     const failed = runReport.cases.filter(c => !c.passed);
     if (failed.length > 0) {
        runOutput += '\n\nFailures:\n' + failed.map(f => `- ${f.description}${f.error ? ':\n  ' + f.error : ''}`).join('\n');
     }
  }

  return (
    <div className="w-full min-h-screen flex flex-col bg-main-bg">
      {/* STICKY TOP BAR */}
      <div className="h-14 border-b brutal-border bg-surface/90 backdrop-blur flex items-center justify-between px-4 shrink-0 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link to={`/academy/course/${courseId}`}
            className="font-mono text-xs uppercase hover:text-primary transition-colors flex items-center gap-2">
            <ArrowLeft className="w-3 h-3" /> Exit
          </Link>
          <div className="w-px h-4 bg-border-main hidden md:block" />
          <h1 className="font-heading font-bold text-sm hidden md:block line-clamp-1 max-w-xs">
            {unit?.title}
          </h1>
          <span className={`px-2 py-0.5 border font-mono text-[10px] uppercase
            ${isPractice ? 'border-primary text-primary bg-primary/5' : 'border-border-main text-text-muted'}`}>
            {isPractice ? 'Practice' : 'Lesson'}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* XP badge */}
          {unit?.xp_reward > 0 && (
            <span className="font-mono text-xs text-text-muted hidden sm:block">+{unit.xp_reward} XP</span>
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
                <p className="font-mono text-[10px] uppercase text-text-muted mb-4 px-3">On this page</p>
                <nav className="space-y-0.5">
                  {tocItems.map(item => (
                    <button key={item.id}
                      onClick={() => scrollToHeading(item.id)}
                      className={`w-full text-left px-3 py-1.5 text-xs transition-colors rounded
                        ${item.level === 3 ? 'pl-6' : ''}
                        ${activeHeading === item.id ? 'text-primary font-medium' : 'text-text-muted hover:text-text-main'}`}>
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
                  <p className="font-mono text-xs uppercase text-text-muted mb-3">{moduleInfo?.title}</p>
                  <h1 className="font-display font-bold text-4xl md:text-5xl uppercase tracking-tighter mb-4">{unit.title}</h1>
                  <div className="flex items-center gap-4 font-mono text-xs text-text-muted">
                    <span>~{estimatedMinutes} min read</span>
                    <span className="px-2 py-0.5 border brutal-border uppercase">Lesson</span>
                    <span>+{unit.xp_reward} XP</span>
                  </div>
                  <div className="mt-6 border-t brutal-border" />
                </div>
                
                {/* Rendered markdown */}
                <div className="prose-dsuc">
                  {renderMd(unit.content_md)}
                </div>
                
                {/* Complete button */}
                <div className="mt-16 pt-8 border-t brutal-border">
                  {isCompleted ? (
                    <div className="flex items-center gap-3 text-green-500">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-heading font-bold">Unit Completed!</span>
                    </div>
                  ) : (
                    <ActionButton variant="primary" onClick={handleComplete} className="w-full md:w-auto">
                      Mark as Complete →
                    </ActionButton>
                  )}
                  
                  {/* Guest reminder */}
                  {isGuest && (
                    <p className="text-xs text-text-muted mt-3">Sign in to save your progress and earn XP.</p>
                  )}
                </div>
              </div>
            </main>
         </div>
      ) : (
          <div className="flex-1 flex flex-col lg:flex-row pb-12 w-full overflow-hidden">
             {/* Left panel - Instructions */}
            <div className="w-full lg:w-80 xl:w-96 shrink-0 border-r brutal-border flex flex-col bg-surface overflow-hidden">
              <div className="h-10 border-b brutal-border flex items-center px-4 shrink-0">
                <span className="font-mono text-xs uppercase text-text-muted">Instructions</span>
              </div>
              
              <div className="flex-1 overflow-y-auto p-5">
                <h2 className="font-heading font-bold text-xl mb-4">{unit.title}</h2>
                
                <div className="prose-dsuc mb-6">
                  {renderMd(unit.content_md)}
                </div>
                
                {/* Checks list */}
                <div className="border-t brutal-border pt-4">
                  <p className="font-mono text-[10px] uppercase text-text-muted mb-3">Test Cases</p>
                  <div className="space-y-2">
                    {unit.tests?.map((check, index) => {
                       const checkId = check.id || `test-${index}`;
                       const checkResult = checkResults[checkId] !== undefined ? checkResults[checkId] : (checkResults[index] !== undefined ? checkResults[index] : null);
                       return (
                      <div key={checkId}
                        className={`flex items-start gap-3 p-3 border text-sm
                          ${checkResult === true ? 'border-green-500/30 bg-green-500/5' :
                            checkResult === false ? 'border-red-500/30 bg-red-500/5' :
                            'border-border-main bg-main-bg'}`}>
                        
                        <span className="shrink-0 mt-0.5">
                          {checkResult === true ? <CheckCircle className="w-4 h-4 text-green-500" /> :
                           checkResult === false ? <XCircle className="w-4 h-4 text-red-500" /> :
                           <Circle className="w-4 h-4 text-text-muted" />}
                        </span>
                        
                        <div className="flex-1 min-w-0">
                          <p className={`font-mono text-xs ${!check.hidden ? '' : 'text-text-muted italic'}`}>
                            {!check.hidden ? check.description : 'Hidden test'}
                          </p>
                          {/* If we had specific test hints we could show them here */}
                        </div>
                      </div>
                    )})}
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
                    <p className="font-mono text-xs text-primary uppercase animate-pulse">Running checks...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Center panel - Editor */}
            <div className="flex-1 flex flex-col bg-[#0B0F17] min-w-0 min-h-[500px]">
              {/* Editor toolbar */}
              <div className="h-10 border-b border-gray-800 flex items-center justify-between px-4 shrink-0">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-gray-500">{unit.language === 'rust' ? 'lib.rs' : 'index.ts'}</span>
                  <span className="w-px h-4 bg-gray-800" />
                  <span className="font-mono text-[10px] text-gray-600 uppercase">{unit.language || 'text'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={handleReset}
                    className="font-mono text-[10px] uppercase text-gray-500 hover:text-gray-300 px-2 py-1 transition-colors">
                    Reset
                  </button>
                  <button onClick={handleRunChallenge} disabled={isRunning}
                    className={`flex items-center gap-2 px-3 py-1 font-mono text-xs uppercase font-bold transition-all
                      ${isRunning
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        : 'bg-primary text-main-bg hover:brightness-110 brutal-border brutal-shadow-sm'}`}>
                    {isRunning ? (
                      <><Loader2 className="w-3 h-3 animate-spin" /> Running...</>
                    ) : (
                      <><Play className="w-3 h-3" /> Run Checks</>
                    )}
                  </button>
                </div>
              </div>
              
              {/* Editor tabs */}
              <div className="flex border-b border-gray-800 shrink-0">
                {(['editor', 'results', 'solution'] as WorkspaceTab[]).map(tab => (
                  <button key={tab}
                    onClick={() => setActiveWorkspaceTab(tab)}
                    className={`px-4 py-2 font-mono text-[10px] uppercase transition-colors
                      ${activeWorkspaceTab === tab ? 'text-primary border-b border-primary' : 'text-gray-500 hover:text-gray-300'}`}>
                    {tab}
                  </button>
                ))}
              </div>
              
              {/* Editor area */}
              <div className="flex-1 overflow-hidden relative">
                 <div className={`absolute inset-0 ${activeWorkspaceTab === 'editor' ? 'visible' : 'invisible'}`}>
                      <CodeEditorPane
                        value={draftCode}
                        onChange={setDraftCode}
                        language={unit.language || 'text'}
                        placeholder="Start typing your code here..."
                      />
                 </div>
                
                {activeWorkspaceTab === 'results' && (
                  <div className="h-full overflow-auto p-4 font-mono text-sm text-gray-300 absolute inset-0 bg-[#0B0F17]">
                    <pre className="whitespace-pre-wrap">{runOutput || 'Run your code to see output.'}</pre>
                  </div>
                )}
                
                {activeWorkspaceTab === 'solution' && (
                  <div className="h-full overflow-auto absolute inset-0 bg-[#0B0F17]">
                    <div className="p-3 bg-gray-900/50 border-b border-gray-800">
                      <p className="font-mono text-xs text-yellow-500/70 uppercase">Reference Solution — Try on your own first!</p>
                    </div>
                    <div className="p-0 font-mono text-sm text-gray-300 h-full">
                       <CodeSurface
                           code={unit.solution || '// No solution provided'}
                           language={unit.language || 'text'}
                           label="solution"
                       />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right panel - Results */}
            <div className="w-full lg:w-64 xl:w-72 shrink-0 border-l brutal-border flex flex-col bg-surface">
              <div className="h-10 border-b brutal-border flex items-center px-4 shrink-0">
                <span className="font-mono text-xs uppercase text-text-muted">Results</span>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4">
                {!hasRunOnce ? (
                  <div className="text-center py-8">
                    <p className="font-mono text-xs text-text-muted uppercase">Run your code to see results.</p>
                  </div>
                ) : isRunning ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
                    <p className="font-mono text-xs text-text-muted uppercase">Running...</p>
                  </div>
                ) : (
                  <>
                    <div className={`p-4 border mb-4 text-center
                      ${allRequiredChecksPassed ? 'border-green-500/40 bg-green-500/5' : 'border-red-500/40 bg-red-500/5'}`}>
                      {allRequiredChecksPassed ? (
                        <>
                          <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
                          <p className="font-heading font-bold text-green-500">All checks passed!</p>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
                          <p className="font-heading font-bold text-red-400">
                            {passedCount}/{totalChecks} checks passed
                          </p>
                        </>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                       {unit.tests?.map((check, index) => {
                          const checkId = check.id || `test-${index}`;
                          const checkResult = checkResults[checkId] !== undefined ? checkResults[checkId] : (checkResults[index] !== undefined ? checkResults[index] : null);
                          return (
                          <div key={checkId}
                            className={`flex items-center gap-2 p-2 text-xs
                              ${checkResult === true ? 'text-green-500' :
                                checkResult === false ? 'text-red-400' : 'text-text-muted'}`}>
                            {checkResult === true ? <CheckCircle className="w-3.5 h-3.5" /> :
                             checkResult === false ? <XCircle className="w-3.5 h-3.5" /> :
                             <Circle className="w-3.5 h-3.5" />}
                            <span className="font-mono line-clamp-1">
                              {!check.hidden ? check.description : 'Hidden test'}
                            </span>
                          </div>
                        )})}
                    </div>
                  </>
                )}
              </div>
              
              <div className="p-4 border-t brutal-border">
                {isCompleted ? (
                  <div className="flex items-center gap-2 text-green-500 justify-center py-2">
                    <CheckCircle className="w-4 h-4" />
                    <span className="font-heading font-bold text-sm">Complete!</span>
                  </div>
                ) : (
                  <button
                    onClick={handleComplete}
                    disabled={!canComplete}
                    className={`w-full py-3 font-heading font-bold uppercase text-sm transition-all brutal-border
                      ${canComplete
                        ? 'bg-primary text-main-bg brutal-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none'
                        : 'bg-surface text-text-muted cursor-not-allowed opacity-50'}`}>
                    {canComplete ? 'Complete Unit ✓' : 'Pass all checks first'}
                  </button>
                )}
                
                {isGuest && (
                  <p className="text-[10px] text-text-muted text-center mt-2 font-mono">
                    Sign in to save progress
                  </p>
                )}
              </div>
            </div>
          </div>
      )}

      {/* Sticky prev/next bar (bottom) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-surface/90 backdrop-blur border-t brutal-border">
        <div className="flex items-center justify-between px-4 h-12">
          {prevUnit ? (
            <Link to={`/academy/unit/${courseId}/${prevUnit.id}`}
              className="flex items-center gap-2 font-mono text-xs uppercase hover:text-primary transition-colors">
              <ChevronLeft className="w-3 h-3" />
              <span className="hidden sm:block max-w-[160px] truncate">{prevUnit.title}</span>
              <span className="sm:hidden">Prev</span>
            </Link>
          ) : <div />}
          
          <span className="font-mono text-xs text-text-muted">
            {currentIndex + 1} / {total_units}
          </span>
          
          {nextUnit ? (
            <Link to={`/academy/unit/${courseId}/${nextUnit.id}`}
              className="flex items-center gap-2 font-mono text-xs uppercase hover:text-primary transition-colors">
              <span className="hidden sm:block max-w-[160px] truncate">{nextUnit.title}</span>
              <span className="sm:hidden">Next</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          ) : (
            <Link to={`/academy/course/${courseId}`}
              className="font-mono text-xs uppercase text-primary hover:underline">
              Finish Course →
            </Link>
          )}
        </div>
      </div>

      {showCompletionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-surface brutal-border brutal-shadow-lg p-10 max-w-sm w-full mx-4 text-center flex flex-col items-center">
            
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="font-display font-bold text-3xl uppercase mb-2">Unit Complete!</h2>
            <p className="text-text-muted mb-2">{unit.title}</p>
            <div className="inline-flex items-center gap-2 px-4 py-2 border brutal-border bg-main-bg font-mono text-sm mb-8">
              <Zap className="w-4 h-4 text-primary" />
              +{unit.xp_reward} XP earned
            </div>
            
            <div className="flex flex-col gap-3 w-full">
              {nextUnit ? (
                <Link to={`/academy/unit/${courseId}/${nextUnit.id}`} className="w-full">
                  <ActionButton variant="primary" className="w-full">
                    Next: {nextUnit.title} →
                  </ActionButton>
                </Link>
              ) : (
                <Link to={`/academy/course/${courseId}`} className="w-full">
                  <ActionButton variant="primary" className="w-full">Course Complete! →</ActionButton>
                </Link>
              )}
              <button onClick={() => setShowCompletionModal(false)}
                className="font-mono text-xs text-text-muted uppercase hover:text-text-main transition-colors">
                Stay on this unit
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
