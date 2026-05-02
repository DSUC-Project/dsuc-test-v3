import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
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
 Play
} from 'lucide-react';

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

function getEmbedUrl(url: string): string | null {
 try {
 const value = new URL(url);
 if (value.hostname === 'www.youtube.com' || value.hostname === 'youtube.com') {
 const video = value.searchParams.get('v');
 return video ? `https://www.youtube.com/embed/${video}` : null;
 }
 if (value.hostname === 'youtu.be') {
 const video = value.pathname.slice(1);
 return video ? `https://www.youtube.com/embed/${video}` : null;
 }
 if (value.hostname === 'vimeo.com' || value.hostname === 'www.vimeo.com') {
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

function practiceModeText(unit: AcademyV2UnitDetail) {
 if (unit.language === 'rust' && unit.deployable) {
 return 'Bài Lab Solana';
 }

 if (unit.language === 'rust') {
 return 'Bài thực hành Rust';
 }

 if (unit.language === 'typescript') {
 return 'Thử thách TypeScript';
 }

 return 'Thử thách thực hành';
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
 <div className="space-y-6 pb-20 mt-10 max-w-[1400px] mx-auto w-full px-4 sm:px-6 lg:px-8">
 <div className="h-64 animate-pulse border border-border-main bg-gray-100 shadow-sm" />
 <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
 <div className="space-y-6">
 <div className="h-96 animate-pulse border border-border-main bg-gray-100 shadow-sm" />
 <div className="h-64 animate-pulse border border-border-main bg-gray-100 shadow-sm" />
 </div>
 <div className="h-96 animate-pulse border border-border-main bg-gray-100 shadow-sm" />
 </div>
 </div>
 );
 }

 if (!unitData) {
 return (
 <div className="mx-auto mt-10 max-w-4xl border border-border-main bg-white p-8 text-center shadow-sm">
 <div className="mb-4 inline-flex h-12 w-12 items-center justify-center border border-border-main bg-destructive/10 text-destructive text-white shadow-sm">
 <Code2 className="w-6 h-6" />
 </div>
 <h1 className="font-heading text-2xl font-bold uppercase tracking-tight text-text-main">
 Không thể mở bài học này
 </h1>
 <p className="mt-4 border border-border-main bg-surface/30 p-4 text-sm font-bold text-text-main">
 {error || 'Bài học hiện không mở được. Vui lòng thử lại sau.'}
 </p>
 <div className="mt-8 flex flex-wrap justify-center gap-4">
 <button
 type="button"
 onClick={() => setReloadNonce((value) => value + 1)}
 className="inline-flex items-center gap-2 border border-border-main bg-primary text-primary-foreground px-6 py-3 text-sm font-bold uppercase tracking-wider text-white transition-all hover:-translate-y-1 hover:bg-surface hover:text-text-main hover:text-text-main hover:shadow-sm"
 >
 Tải lại
 </button>
 <Link
 to="/academy"
 className="inline-flex items-center gap-2 border border-border-main bg-white px-6 py-3 text-sm font-bold uppercase tracking-wider text-text-main transition-all hover:-translate-y-1 hover:bg-surface hover:shadow-sm"
 >
 Về trang chủ Học Viện
 </Link>
 </div>
 </div>
 );
 }

 const { course, unit, previous_unit, next_unit, unit_index, total_units } = unitData;
 const embedUrl = unit.video_url ? getEmbedUrl(unit.video_url) : null;
 const flatCourseUnits = flattenCourseUnits(course);
 const currentModule =
 course.modules.find((module) => module.id === unit.module_id) || null;
 const currentModuleUnits = currentModule
 ? [...currentModule.learn_units, ...currentModule.practice_units].sort(
 (left, right) => Number(left.order || 0) - Number(right.order || 0)
 )
 : [];
 const outline = extractMarkdownOutline(unit.content_md);
 const unitDone = isAcademyV2UnitCompleted(progress.state.completedLessons, course.id, unit.id);
 const isPractice = unit.section === 'practice';
 const draftDirty = draftCode !== (unit.code || '');
 const runnerSupported = isPractice && canRunAcademyChallenge(unit);
 const runReportIsFresh = !!runReport && lastRunSource === draftCode;
 const activeRunReport = runReportIsFresh ? runReport : null;
 const completionBlocked = runnerSupported && !unitDone && (!runReportIsFresh || !runReport?.allPassed);
 const runtimeLabel = activeRunReport?.runtimeLabel
 || runReport?.runtimeLabel
 || (unit.language === 'rust'
 ? unit.build_type === 'buildable'
 ? 'Máy ảo biên dịch Rust'
 : 'Trình xác thực mã Rust định hướng'
 : runnerSupported
 ? 'Trình chạy thử thách trên trình duyệt'
 : 'Không gian thực hành');
 const completedCount = countCompletedAcademyV2CourseUnits(progress.state.completedLessons, course.id);
 const courseProgressPercent =
 course.total_unit_count > 0 ? Math.round((completedCount / course.total_unit_count) * 100) : 0;
 const currentModuleCompleted = currentModule
 ? currentModuleUnits.filter((item) =>
 isAcademyV2UnitCompleted(progress.state.completedLessons, course.id, item.id)
 ).length
 : 0;
 const currentModulePercent =
 currentModuleUnits.length > 0
 ? Math.round((currentModuleCompleted / currentModuleUnits.length) * 100)
 : 0;

 async function handleComplete() {
 setNotice('');

 if (completionBlocked) {
 setNotice(
 runLoading
 ? 'Hệ thống đang chạy bài kiểm tra. Vui lòng đợi kết quả trước khi hoàn thành.'
 : 'Hãy vượt qua tất cả các bài kiểm tra kể cả ẩn trước khi hoàn thành chặng này.'
 );
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
 }

 function copyDraft() {
 if (!draftCode) {
 return;
 }

 void navigator.clipboard.writeText(draftCode);
 setNotice('Code của bạn đã được copy vào clipboard.');
 }

 function resetDraft() {
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

 return (
 <div className="space-y-12 pb-20 mt-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
 <section className="bg-primary text-primary-foreground border border-border-main p-8 sm:p-12 relative overflow-hidden rounded-none shadow-lg">
 <div className="absolute right-0 top-0 w-[500px] h-[500px] bg-surface rounded-full border border-border-main translate-x-1/2 -translate-y-1/4 pointer-events-none" />

 <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1.3fr)_360px] lg:items-end z-10">
 <div className="space-y-8">
 <Link
 to={`/academy/course/${course.id}`}
 className="inline-flex min-h-12 items-center justify-center gap-3 bg-white border border-border-main px-6 py-2 text-sm font-bold uppercase tracking-widest text-text-main shadow-sm hover:-translate-y-1 hover:shadow-md transition-all"
 >
 <ArrowLeft className="h-5 w-5" strokeWidth={3} aria-hidden="true" />
 Về lại khóa học
 </Link>

 <div className="flex flex-wrap gap-3">
 <span className="inline-flex items-center justify-center bg-primary text-primary-foreground px-4 py-2 text-xs font-bold uppercase tracking-widest shadow-sm border-2 border-transparent">
 {course.title}
 </span>
 <span className="inline-flex items-center justify-center bg-surface px-4 py-2 text-xs font-bold uppercase tracking-widest text-text-main border border-border-main shadow-sm">
 {unit.module_title}
 </span>
 <span className="inline-flex items-center justify-center bg-surface text-text-main px-4 py-2 text-xs font-bold uppercase tracking-widest text-text-main border border-border-main shadow-sm">
 {isPractice ? practiceModeText(unit) : 'Bài lý thuyết'}
 </span>
 </div>

 <div className="space-y-6">
 <div className="inline-block text-xs font-bold uppercase tracking-widest text-text-main bg-white border border-border-main px-3 py-1 shadow-sm">
 Bài {Math.max(1, unit_index + 1)} trên {total_units}
 </div>
 <div className="inline-block max-w-5xl border border-border-main bg-white px-5 py-4 shadow-sm">
 <h1 className="font-heading text-5xl font-bold text-text-main sm:text-6xl lg:text-7xl leading-none uppercase tracking-tighter">
 {unit.title}
 </h1>
 </div>
 <p className="mt-6 max-w-4xl text-lg font-bold leading-relaxed text-gray-800 bg-white/90 border border-border-main p-5 shadow-sm">
 {isPractice
 ? 'Hãy đọc kỹ hướng dẫn, thực hành trong trình soạn thảo, và vượt qua tất cả bài kiểm tra để hoàn thành Lab này.'
 : 'Đọc và nghiên cứu nội dung bài học này, sau đó tiếp tục thực hành ngay để kiểm tra kiến thức.'}
 </p>
 </div>
 </div>

 <div className="bg-white p-8 border border-border-main shadow-md xl:rotate-2 transform">
 <div className="text-[10px] font-bold uppercase tracking-widest bg-primary text-primary-foreground px-2 py-1 inline-block mb-4 border border-border-main shadow-sm">
 Trạng thái
 </div>
 <div className="font-heading text-4xl font-bold text-text-main uppercase tracking-tight mb-8">
 {unitDone ? 'Đã hoàn thành' : isPractice ? 'Sẵn sàng nộp bài' : 'Đang học...'}
 </div>
 <div className="grid grid-cols-2 gap-4">
 <div className="bg-white border border-border-main p-4 text-center shadow-sm">
 <div className="flex items-center justify-center gap-2 mb-2 text-text-main">
 <BookOpen className="w-5 h-5" strokeWidth={3} />
 <span className="text-[10px] font-bold uppercase tracking-widest">Tiến độ</span>
 </div>
 <div className="text-3xl font-bold text-text-main">{courseProgressPercent}%</div>
 </div>
 <div className="bg-surface border border-border-main p-4 text-center shadow-sm">
 <div className="flex items-center justify-center gap-2 mb-2 text-text-main">
 <Flame className="w-5 h-5" strokeWidth={3} />
 <span className="text-[10px] font-bold uppercase tracking-widest">Thưởng XP</span>
 </div>
 <div className="text-3xl font-bold text-text-main">+{unit.xp_reward}</div>
 </div>
 </div>
 </div>
 </div>
 </section>

 {notice && (
 <div className="border border-border-main bg-surface text-text-main px-6 py-4 text-sm font-bold text-text-main uppercase tracking-widest flex items-center gap-4 shadow-sm">
 <TerminalSquare className="h-6 w-6" strokeWidth={3} />
 {notice}
 </div>
 )}

 <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
 <div className="space-y-6">
 {!isPractice ? (
 <>
 {embedUrl && (
 <section className="overflow-hidden border border-border-main bg-white shadow-sm">
 <div className="border-b border-border-main bg-surface px-6 py-5">
 <div className="text-[10px] font-bold uppercase tracking-widest text-text-main mb-1">
 Video Bài Học
 </div>
 <h2 className="font-heading text-3xl font-bold text-text-main uppercase tracking-tight">
 Xem hướng dẫn
 </h2>
 </div>
 <div className="relative w-full pb-[56.25%] bg-primary text-primary-foreground">
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

 <section className="border border-border-main bg-white shadow-sm p-6 sm:p-8 lg:p-10 mb-8 mt-8">
 <div className="flex flex-col gap-6 border-b border-border-main pb-8 sm:flex-row sm:items-end sm:justify-between mb-8">
 <div>
 <div className="inline-block bg-primary/10 text-primary px-2 py-1 text-xs rounded-full font-medium mb-3">
 Bài lý thuyết
 </div>
 <h2 className="font-heading text-4xl sm:text-5xl font-bold text-text-main uppercase tracking-tighter text-primary">
 Nội dung học
 </h2>
 </div>
 {outline.length > 0 && (
 <div className="bg-surface px-4 py-2 text-xs rounded-full font-medium text-text-main border border-border-main border-border-main shrink-0">
 {outline.length} phần nội dung
 </div>
 )}
 </div>
 <div className="markdown-body prose prose-slate max-w-none prose-headings:font-heading prose-headings:font-bold prose-headings:text-text-main prose-headings:uppercase prose-p:text-gray-800 prose-p:font-medium hover:prose-a:text-primary prose-a:font-bold prose-strong:font-bold">
 {renderMd(unit.content_md)}
 </div>
 </section>

 {next_unit && (
 <button
 type="button"
 onClick={() => navigate(`/academy/unit/${course.id}/${next_unit.id}`)}
 className="mt-12 mb-8 flex w-full items-center justify-between gap-4 border border-border-main bg-surface px-6 py-5 text-left shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
 >
 <div className="min-w-0">
 <div className="mb-2 inline-block border border-border-main bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-text-main shadow-sm">
 Tiếp theo trong lộ trình
 </div>
 <h3 className="truncate font-heading text-2xl font-bold uppercase text-text-main sm:text-3xl">
 {next_unit.title}
 </h3>
 <p className="mt-2 text-sm font-bold leading-relaxed text-text-main">
 {next_unit.section === 'practice'
 ? 'Bước kế tiếp là phần thực hành để áp dụng ngay kiến thức vừa học.'
 : 'Tiếp tục chuỗi bài đọc trước khi sang phần thực hành.'}
 </p>
 </div>
 <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-border-main bg-white shadow-sm">
 <ChevronRight className="h-6 w-6 text-text-main" strokeWidth={3} aria-hidden="true" />
 </div>
 </button>
 )}
 </>
 ) : (
 <>
 <section className="bg-white border border-border-main shadow-sm p-6 sm:p-8 lg:p-10 mb-8 max-h-[60vh] overflow-y-auto brutal-scrollbar">
 <div className="flex flex-col gap-6 border-b border-border-main pb-8 sm:flex-row sm:items-end sm:justify-between mb-8">
 <div>
 <div className="inline-block bg-surface text-text-main px-2 py-1 text-xs rounded-full font-medium mb-3">
 Hướng dẫn thực hành
 </div>
 <h2 className="font-heading text-4xl sm:text-5xl font-bold text-text-main uppercase tracking-tighter text-primary">
 Yêu cầu bài tập
 </h2>
 </div>
 <div className="bg-surface px-4 py-2 text-xs rounded-full font-medium text-text-main border border-border-main border-border-main whitespace-nowrap hidden sm:block transform rotate-2">
 {practiceModeText(unit)}
 </div>
 </div>
 <div className="markdown-body prose prose-slate max-w-none prose-headings:font-heading prose-headings:font-bold prose-headings:text-text-main prose-headings:uppercase prose-p:text-gray-800 prose-p:font-medium hover:prose-a:text-primary prose-a:font-bold prose-strong:font-bold">
 {renderMd(unit.content_md)}
 </div>
 </section>

 <section className="bg-main-bg border border-border-main overflow-visible shadow-sm flex flex-col mb-12 relative">
 <div className="overflow-visible flex flex-col sm:flex-row sm:items-center justify-between border-b border-border-main bg-white px-4 py-3 gap-4">
 <div className="relative z-20 isolate flex flex-wrap items-end gap-3">
 <LabTabButton
 label="Mã nguồn"
 active={activeWorkspaceTab === 'editor'}
 onClick={() => setActiveWorkspaceTab('editor')}
 />
 <LabTabButton
 label="Kết quả"
 active={activeWorkspaceTab === 'results'}
 onClick={() => setActiveWorkspaceTab('results')}
 />
 <LabTabButton
 label="Đáp án"
 active={activeWorkspaceTab === 'solution'}
 onClick={() => setActiveWorkspaceTab('solution')}
 />
 </div>
 
 <div className="flex items-center gap-3">
 {runnerSupported && (
 <button
 type="button"
 onClick={() => void handleRunChallenge()}
 disabled={runLoading}
 className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-600 hover:bg-surface hover:text-text-main border border-border-main shadow-sm px-4 py-1.5 text-xs font-bold uppercase tracking-widest transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
 >
 {runLoading ? (
 <LoaderCircle className="w-4 h-4 animate-spin" />
 ) : (
 <Play className="w-4 h-4 fill-current" />
 )}
 {runLoading ? 'Đang chạy' : 'Chạy code'}
 </button>
 )}
 
 {activeWorkspaceTab === 'editor' && (
 <div className="flex flex-row bg-white border border-border-main shadow-sm">
 <button
 type="button"
 onClick={copyDraft}
 className="p-2 hover:bg-surface hover:text-text-main border border-border-main transition-colors"
 title="Sao chép"
 >
 <ClipboardCopy className="w-4 h-4" />
 </button>
 <button
 type="button"
 onClick={resetDraft}
 className="p-2 hover:bg-surface hover:text-text-main transition-colors"
 title="Khôi phục code gốc"
 >
 <AlertTriangle className="w-4 h-4" />
 </button>
 </div>
 )}
 </div>
 </div>

 <div className="flex items-center gap-2 bg-main-bg px-4 py-3 text-[10px] font-bold tracking-widest uppercase overflow-x-auto text-text-main">
 {runnerSupported ? (
 <span className="text-text-main border border-border-main bg-emerald-500/10 text-emerald-600 px-2 py-0.5 shadow-sm">● {runtimeLabel} Sẵn sàng</span>
 ) : (
 <span className="text-white border border-border-main bg-primary text-primary-foreground px-2 py-0.5 shadow-sm">Không gian hướng dẫn</span>
 )}

 {draftDirty && (
 <span className="text-text-main border border-border-main bg-surface px-2 py-0.5 shadow-sm">Đã sửa đổi</span>
 )}
 {runReport && !runReportIsFresh && (
 <span className="text-text-main border border-border-main bg-surface text-text-main px-2 py-0.5 shadow-sm">Cần chạy lại</span>
 )}
 {activeRunReport?.allPassed && (
 <span className="text-text-main border border-border-main bg-emerald-500/10 text-emerald-600 px-2 py-0.5 shadow-sm">Đã vượt qua</span>
 )}
 </div>

 <div className="flex-1 bg-white">
 {activeWorkspaceTab === 'editor' && (
 <CodeEditorPane
 value={draftCode}
 onChange={setDraftCode}
 language={unit.language || 'text'}
 placeholder="Bắt đầu viết code ở đây..."
 />
 )}

 {activeWorkspaceTab === 'results' && (
 <div className="p-6 text-text-main min-h-[600px] max-h-[600px] overflow-y-auto">
 {!runReport ? (
 <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed rounded-xl border-border-main bg-gray-50 h-full">
 <div className="w-16 h-16 bg-white border border-border-main shadow-sm flex items-center justify-center mb-6">
 <TerminalSquare className="w-8 h-8 text-text-main" strokeWidth={2} />
 </div>
 <h3 className="font-heading text-2xl font-bold uppercase text-text-main mb-2">Chưa có kết quả</h3>
 <p className="text-sm font-bold text-gray-700 max-w-sm">Chạy code của bạn để xem kết quả kiểm tra với các ca kiểm thử công khai và ẩn.</p>
 </div>
 ) : (
 <div className="space-y-6">
 <div className="bg-white p-6 border border-border-main shadow-sm">
 <div className="flex items-center justify-between gap-4 mb-4 border-b border-border-main pb-4">
 <div className="text-sm font-bold uppercase tracking-widest text-text-main flex items-center gap-2">
 Kết quả chạy
 </div>
 <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-widest border border-border-main shadow-sm ${runReportIsFresh ? runReport.allPassed ? 'bg-emerald-500/10 text-emerald-600 text-text-main' : 'bg-surface text-text-main' : 'bg-surface text-text-main'}`}>
 {runReportIsFresh ? runReport.allPassed ? 'Thành công toàn bộ' : 'Thất bại' : 'Cần chạy lại'}
 </span>
 </div>

 <p className="text-base font-bold text-gray-800 leading-relaxed mb-6">
 {runReportIsFresh ? runReport.message : 'Bạn đã chỉnh sửa trình soạn thảo sau lần chạy gần nhất. Hãy chạy lại để kết quả phản ánh đoạn code mới nhất.'}
 </p>

 <div className="grid grid-cols-2 gap-4">
 <div className="bg-gray-100 p-4 border border-border-main shadow-sm">
 <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest w-full pb-1 mb-2">
 Thành công
 </div>
 <div className={`font-heading text-3xl font-bold ${runReport.allPassed ? 'text-emerald-500' : 'text-text-main'}`}>
 {runReport.passedCount} <span className="text-gray-500 text-xl">/ {runReport.totalCount}</span>
 </div>
 </div>
 <div className="bg-gray-100 p-4 border border-border-main shadow-sm">
 <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest w-full pb-1 mb-2">
 Hàm gọi chính
 </div>
 <div className="font-mono text-sm font-bold text-primary mt-1.5 truncate">
 {runReport.primaryFunction || 'Không xác định'}
 </div>
 </div>
 </div>
 </div>

 <div className="space-y-4">
 <div className="flex items-center gap-2">
 <div className="text-xs font-bold tracking-widest uppercase text-text-main">
 Chi tiết Test Cases
 </div>
 </div>
 {(runReport.cases || []).length > 0 ? (
 runReport.cases.map((caseItem, index) => (
 <div
 key={caseItem.id}
 className={`p-5 border border-border-main transition-transform hover:-translate-y-0.5 ${caseItem.passed ? 'bg-emerald-500/10 text-emerald-600/20' : 'bg-surface text-text-main/20'}`}
 >
 <div className="flex items-center justify-between gap-4 mb-3 border-b border-border-main pb-2">
 <div className="text-[10px] font-bold uppercase tracking-widest text-text-main flex items-center gap-2">
 {caseItem.passed ? (
 <div className="bg-emerald-500/10 text-emerald-600 border border-border-main p-0.5"><CheckCircle2 className="w-3 h-3 text-text-main" strokeWidth={3} /></div>
 ) : (
 <div className="bg-surface text-text-main border border-border-main p-0.5"><AlertTriangle className="w-3 h-3 text-text-main" strokeWidth={3} /></div>
 )}
 {caseItem.hidden ? `Test Ẩn ${index + 1}` : `Test Công Khai ${index + 1}`}
 </div>
 </div>
 <div className="text-sm text-text-main font-bold leading-relaxed">
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
 <div className="p-4 border border-dashed rounded-xl border-border-main bg-gray-50 text-sm font-bold text-gray-500 text-center">
 Trình chạy không trả về kết quả cấu trúc cho bài lab này.
 </div>
 )}
 </div>
 </div>
 )}
 </div>
 )}

 {activeWorkspaceTab === 'solution' && (
 <div className="p-6 min-h-[600px] bg-white text-text-main">
 {!solutionUnlocked ? (
 <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed rounded-xl border-border-main bg-gray-50 h-full">
 <div className="w-16 h-16 bg-white border border-border-main shadow-sm flex items-center justify-center mb-6">
 <Lightbulb className="w-8 h-8 text-primary fill-current" strokeWidth={2} />
 </div>
 <h3 className="font-heading font-bold text-2xl uppercase text-text-main mb-2">Đáp án tham khảo đã bị ẩn</h3>
 <p className="text-sm font-bold text-gray-700 max-w-md mx-auto mb-8 leading-relaxed">
 Hãy tự mình thử sức trước tiên. Giải pháp tham khảo chỉ dùng khi bạn muốn so sánh cách làm hoặc khi đã cố gắng nhưng vẫn bế tắc.
 </p>
 <button
 type="button"
 onClick={() => setSolutionUnlocked(true)}
 className="bg-primary text-primary-foreground text-xs font-bold uppercase tracking-widest px-6 py-3 border border-border-main hover:bg-surface hover:text-text-main shadow-sm hover:-translate-y-1 transition-all"
 >
 Hiển thị đáp án
 </button>
 </div>
 ) : (
 <div className="space-y-4">
 <div className="flex items-center justify-between pb-4 mb-4">
 <div className="text-sm font-bold uppercase tracking-widest text-text-main">Bài giải mẫu</div>
 <button
 type="button"
 disabled={!unit.solution}
 onClick={() => {
 if (unit.solution) {
 navigator.clipboard.writeText(unit.solution);
 setNotice('Đáp án đã được copy');
 }
 }}
 className="text-[10px] font-bold tracking-widest text-text-main bg-white border border-border-main px-3 py-1.5 shadow-sm uppercase hover:bg-surface disabled:opacity-50 transition-colors flex items-center gap-1.5"
 >
 <ClipboardCopy className="w-3.5 h-3.5" />
 Copy
 </button>
 </div>
 {unit.solution ? (
 <CodeSurface
 code={unit.solution}
 language={unit.language || 'text'}
 label="reference solution"
 maxHeightClass="max-h-[500px]"
 />
 ) : (
 <div className="p-8 text-center bg-gray-50 border border-dashed rounded-xl border-border-main text-gray-600 font-bold text-sm">
 Chưa có đáp án mẫu cho bài lab này.
 </div>
 )}
 </div>
 )}
 </div>
 )}
 </div>
 </section>
 
 <div className="grid md:grid-cols-2 gap-8 mt-10">
 {unit.hints.length > 0 && (
 <section className="bg-white border border-border-main shadow-sm p-6 sm:p-8 h-fit">
 <div className="flex items-center justify-between gap-4 mb-8 pb-4">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 border border-border-main bg-surface flex items-center justify-center shadow-sm">
 <Lightbulb className="h-6 w-6 text-text-main" strokeWidth={3} aria-hidden="true" />
 </div>
 <h3 className="font-heading font-bold text-2xl uppercase text-text-main">Gợi ý</h3>
 </div>
 <button
 type="button"
 onClick={() =>
 setRevealedHints((value) => Math.min(value + 1, unit.hints.length))
 }
 disabled={revealedHints >= unit.hints.length}
 className="text-[10px] font-bold uppercase tracking-widest text-text-main bg-white border border-border-main px-4 py-2 hover:bg-surface transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:-translate-y-0.5"
 >
 Xem thêm
 </button>
 </div>
 <div className="space-y-4">
 {unit.hints.slice(0, revealedHints).map((hint, index) => (
 <div key={`${hint}-${index}`} className="bg-gray-100 p-5 border border-border-main text-sm text-text-main shadow-sm font-bold">
 {hint}
 </div>
 ))}
 </div>
 </section>
 )}
 </div>
 </>
 )}
 </div>

 <aside className="space-y-8 xl:sticky xl:top-24 xl:self-start">
 {outline.length > 0 ? (
 <SidebarPanel
 title="Mục lục"
 accent="bg-emerald-500/10 text-emerald-600"
 headerText="text-text-main"
 footer={`${outline.length} danh mục`}
 >
 <div className="space-y-3 pl-4 relative ml-2 py-2">
 {outline.map((item) => (
 <a
 key={item.id}
 href={`#${item.id}`}
 className={`block py-1 text-sm font-bold text-gray-800 hover:text-text-main transition-colors relative before:absolute before:left-[-22px] before:top-[10px] before:w-3 before:h-3 before:bg-white before:border-2 before:border-border-main hover:before:bg-surface ${
 item.level > 2 ? 'pl-4' : 'pl-0'
 }`}
 >
 {item.label}
 </a>
 ))}
 </div>
 </SidebarPanel>
 ) : (
 <SidebarPanel
 title="Cấu hình thử thách"
 accent="bg-white"
 headerText="text-text-main"
 footer={practiceModeText(unit)}
 >
 <div className="space-y-0">
 <ProfileRow label="Số kiểm tra" value={String(unit.tests.length)} />
 <ProfileRow label="Gợi ý" value={String(unit.hints.length)} />
 <ProfileRow label="Ngôn ngữ" value={unit.language || 'Trống'} />
 <ProfileRow label="Kiểu build" value={unit.build_type || 'chuẩn'} />
 </div>
 </SidebarPanel>
 )}

 <SidebarPanel
 title={currentModule?.title || "Chương"}
 accent="bg-white"
 headerText="text-text-main"
 footer={
 currentModule
 ? `${currentModuleCompleted}/${currentModuleUnits.length} bài hoàn thành`
 : 'Không có thông tin chương'
 }
 >
 <div className="space-y-3 mt-4">
 {currentModuleUnits.map((routeUnit) => {
 const done = isAcademyV2UnitCompleted(
 progress.state.completedLessons,
 course.id,
 routeUnit.id
 );
 const locked = isUnitLocked(
 progress.state.completedLessons,
 course.id,
 flatCourseUnits,
 routeUnit.id
 );
 const current = routeUnit.id === unit.id;

 return (
 <button
 key={routeUnit.id}
 type="button"
 disabled={locked}
 onClick={() => !locked && navigate(`/academy/unit/${course.id}/${routeUnit.id}`)}
 className={`flex w-full items-center gap-4 p-3 text-left transition-all border border-border-main rounded-xl ${
 current
 ? 'border-border-main bg-surface shadow-sm transform -translate-y-1'
 : locked
 ? 'cursor-not-allowed border-border-main bg-gray-200 opacity-60'
 : done
 ? 'border-border-main bg-white hover:bg-gray-50 hover:shadow-sm'
 : 'border-border-main bg-white hover:bg-primary hover:text-primary-foreground hover:shadow-sm hover:-translate-y-1'
 }`}
 >
 <div
 className={`flex h-10 w-10 shrink-0 border border-border-main items-center justify-center ${
 current
 ? 'bg-white text-text-main'
 : done
 ? 'bg-emerald-500/10 text-emerald-600 text-text-main'
 : locked
 ? 'bg-gray-300 text-gray-500'
 : routeUnit.section === 'practice'
 ? 'bg-surface text-text-main'
 : 'bg-primary text-primary-foreground'
 }`}
 >
 {locked ? (
 <Lock className="h-5 w-5" strokeWidth={3} aria-hidden="true" />
 ) : done ? (
 <CheckCircle2 className="h-5 w-5" strokeWidth={3} />
 ) : routeUnit.section === 'practice' ? (
 <Code2 className="h-5 w-5" strokeWidth={3} aria-hidden="true" />
 ) : (
 <BookOpen className="h-5 w-5" strokeWidth={3} aria-hidden="true" />
 )}
 </div>
 <div className="min-w-0 flex-1">
 <div className={`truncate text-xs font-bold uppercase ${current ? 'text-text-main' : 'text-text-main'}`}>
 {routeUnit.title}
 </div>
 <div className="text-[10px] uppercase font-bold tracking-widest text-gray-600 mt-1">
 {current ? 'Đang học' : done ? 'Hoàn thành' : locked ? 'Đã khóa' : routeUnit.section === 'practice' ? 'Thực hành' : 'Lý thuyết'}
 </div>
 </div>
 </button>
 );
 })}
 </div>
 </SidebarPanel>

 <SidebarPanel
 title={unitDone ? 'Đã hoàn tất' : 'Xác nhận hoàn thành'}
 accent={unitDone ? 'bg-emerald-500/10 text-emerald-600' : 'bg-primary text-primary-foreground'}
 headerText={unitDone ? "text-text-main" : "text-white"}
 >
 <div className="space-y-6 mt-4">
 <div className="grid grid-cols-2 gap-4">
 <div className="bg-white p-4 border border-border-main text-center shadow-sm">
 <div className="text-[10px] font-bold uppercase tracking-widest text-text-main mb-2">Khóa học</div>
 <div className="font-heading font-bold text-2xl text-text-main">{courseProgressPercent}%</div>
 </div>
 <div className="bg-surface p-4 border border-border-main text-center shadow-sm">
 <div className="text-[10px] font-bold uppercase tracking-widest text-text-main mb-2">Chương</div>
 <div className="font-heading font-bold text-2xl text-text-main">{currentModulePercent}%</div>
 </div>
 </div>

 <p className={`text-sm font-bold leading-relaxed text-center px-2 py-4 border border-border-main ${unitDone ? 'bg-white text-text-main' : 'bg-main-bg text-text-main'}`}>
 {unitDone
 ? 'Bài học đã lưu dấu. Tiến thẳng lên bài học kế tiếp.'
 : isPractice
 ? runnerSupported
 ? 'Hoàn tất các bước kiểm tra (Run Checks). Bạn cần pass hết các test case mới có thể Nộp bài.'
 : 'Khi hoàn tất việc thực hành, nhấn Nộp bài để tiếp tục.'
 : 'Hãy nhấn Hoàn Thành để lưu vào hệ thống.'}
 </p>

 {!unitDone ? (
 <button
 type="button"
 onClick={() => void handleComplete()}
 disabled={completionBlocked || runLoading}
 className="inline-flex w-full items-center justify-center gap-3 bg-primary text-primary-foreground px-6 py-4 text-sm font-bold uppercase tracking-widest shadow-sm hover:-translate-y-1 hover:shadow-md transition-all focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 disabled:shadow-none border border-border-main disabled:border-gray-400"
 >
 <CheckCircle2 className="h-5 w-5" strokeWidth={3} aria-hidden="true" />
 {isPractice ? 'Nộp bài thực hành' : 'Xác nhận hoàn thành'}
 </button>
 ) : (
 <div className="inline-flex w-full items-center justify-center gap-3 bg-white px-6 py-4 text-sm font-bold tracking-widest uppercase text-text-main border border-border-main shadow-sm">
 <CheckCircle2 className="h-6 w-6 text-emerald-500" strokeWidth={3} aria-hidden="true" />
 Đã ghi nhận điểm
 </div>
 )}

 {!unitDone && completionBlocked && (
 <div className="px-4 py-3 bg-surface border border-border-main text-sm text-text-main font-bold uppercase tracking-wider text-center shadow-sm">
 <AlertTriangle className="w-5 h-5 inline-block mr-2 -translate-y-0.5" strokeWidth={3} />
 {runLoading
 ? 'Đang chấm bài. Vui lòng chờ vài giây.'
 : 'Yêu cầu vượt qua hết bộ test case.'}
 </div>
 )}

 {next_unit && (
 <button
 type="button"
 onClick={() => navigate(`/academy/unit/${course.id}/${next_unit.id}`)}
 className="inline-flex w-full items-center justify-center gap-3 bg-surface px-6 py-4 text-sm font-bold uppercase tracking-widest text-text-main shadow-sm hover:-translate-y-1 hover:shadow-md transition-all focus-visible:outline-none border border-border-main mt-4"
 >
 Bài học tiếp theo
 <ChevronRight className="h-5 w-5" strokeWidth={3} aria-hidden="true" />
 </button>
 )}
 </div>
 </SidebarPanel>
 </aside>
 </div>

 <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between border-t border-border-main py-10 mt-12 mb-20 ">
 <NavUnitLink
 label="Bài trước"
 unit={previous_unit}
 href={previous_unit ? `/academy/unit/${course.id}/${previous_unit.id}` : '#'}
 disabled={!previous_unit}
 align="left"
 />
 <NavUnitLink
 label="Bài tiếp theo"
 unit={next_unit}
 href={next_unit ? `/academy/unit/${course.id}/${next_unit.id}` : '#'}
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
 <div className={`border border-border-main p-6 shadow-sm ${accent}`}>
 <div className={`text-base font-bold uppercase tracking-widest mb-6 pb-4 ${headerText}`}>
 {title}
 </div>
 <div>{children}</div>
 {footer && (
 <div className={`mt-6 pt-4 text-xs font-bold uppercase tracking-widest text-center ${headerText}`}>{footer}</div>
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
 className={`relative text-[10px] sm:text-xs font-bold uppercase tracking-widest px-3 sm:px-4 py-2 transition-all border border-border-main rounded-xl ${
 active
 ? 'z-30 -translate-y-1 bg-surface text-text-main border-border-main shadow-sm'
 : 'z-10 bg-white text-text-main border-border-main shadow-sm hover:z-20 hover:-translate-y-0.5 hover:bg-surface hover:shadow-sm'
 }`}
 >
 {label}
 </button>
 );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
 return (
 <div className="flex items-center justify-between py-3 last:border-0">
 <div className="text-xs font-bold uppercase tracking-widest text-gray-600">{label}</div>
 <div className="font-bold text-sm text-text-main">
 {value}
 </div>
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
 align: 'left' | 'right';
}) {
 if (disabled) {
 return (
 <div className={`w-full sm:w-[48%] opacity-60 p-8 border border-border-main bg-gray-200 flex flex-col ${align === 'right' ? 'sm:text-right sm:items-end items-start' : 'items-start'}`}>
 <div className="text-xs uppercase font-bold tracking-widest text-gray-500 mb-2">{label}</div>
 <div className="font-heading font-bold text-2xl text-text-main">Hết lộ trình</div>
 </div>
 );
 }

 return (
 <Link
 to={href}
 className={`w-full sm:w-[48%] group p-8 border border-border-main bg-white hover:bg-primary hover:text-primary-foreground shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex flex-col ${align === 'right' ? 'sm:text-right sm:items-end items-start' : 'items-start'}`}
 >
 <div className="text-xs uppercase font-bold tracking-widest text-gray-500 group-hover:text-primary mb-2">{label}</div>
 <div className="font-heading font-bold text-3xl text-text-main group-hover:text-white truncate max-w-full">
 {unit?.title}
 </div>
 <div className="text-xs mt-3 uppercase font-bold tracking-widest bg-surface text-text-main px-3 py-1 border border-border-main shadow-sm inline-block">
 {unit?.section === 'practice' ? 'Thực hành' : 'Lý thuyết'}
 </div>
 </Link>
 );
}
