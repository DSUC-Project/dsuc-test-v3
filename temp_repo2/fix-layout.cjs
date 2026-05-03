const fs = require('fs');
let c = fs.readFileSync('src/pages/AcademyUnit.tsx', 'utf8');

const s1 = '      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">';
const s2 = '        <div className="space-y-6">';
const s3 = '          {!isPractice ? (';

const rep1 = `      <div className={\`flex flex-col gap-6 \${isPractice ? 'xl:flex-row' : 'xl:grid xl:grid-cols-[minmax(0,1fr)_320px]'}\`}>
        {isPractice && (
          <div className="w-full xl:w-[400px] shrink-0 space-y-6 xl:sticky xl:top-24 xl:max-h-[calc(100vh-100px)] xl:overflow-y-auto brutal-scrollbar pb-6 pr-2 xl:order-1">
            <section className="bg-white border border-border-main p-6 shadow-sm flex flex-col xl:max-h-[50vh]">
              <div className="flex items-center gap-2 mb-4 shrink-0 border-b border-border-main pb-3">
                <div className="inline-block bg-surface text-text-main py-1 px-2 text-[10px] uppercase font-bold shadow-sm border border-border-main">
                  Hướng dẫn Lab
                </div>
              </div>
              <div className="overflow-y-auto brutal-scrollbar pr-2 flex-1 relative rounded-xl border-dashed border-border-main bg-gray-50 p-4 border block">
                <div className="markdown-body prose prose-slate max-w-none prose-headings:font-heading prose-headings:font-bold prose-headings:text-text-main prose-headings:uppercase prose-p:text-gray-800 hover:prose-a:text-primary prose-strong:font-bold text-sm prose-pre:bg-white prose-pre:border prose-pre:border-border-main prose-pre:shadow-sm">
                  {renderMd(unit.content_md)}
                </div>
              </div>
            </section>
          </div>
        )}
        <div className={\`space-y-6 flex flex-col min-w-0 \${isPractice ? 'flex-1 xl:order-2' : ''}\`}>
          {!isPractice ? (`;

c = c.replace(s1 + '\n' + s2 + '\n' + s3, rep1);

const r1 = '<aside className="space-y-8 xl:sticky xl:top-24 xl:self-start">';
const rep2 = '<aside className={`space-y-8 ${isPractice ? \'xl:order-1\' : \'xl:sticky xl:top-24 xl:self-start\'}`}>';
c = c.replace(r1, rep2);

// Remove the old instructions block specifically
const strInstrStart = '            ) : (\n              <>\n                <section className="bg-white border border-border-main shadow-sm p-6 sm:p-8 lg:p-10 mb-8 max-h-[60vh] overflow-y-auto brutal-scrollbar">';
const idxStart = c.indexOf(strInstrStart);

if (idxStart !== -1) {
  const nextSectionStr = '                <section className="bg-main-bg border border-border-main overflow-visible shadow-sm flex flex-col mb-12 relative">';
  const idxNext = c.indexOf(nextSectionStr, idxStart);
  
  if (idxNext !== -1) {
    const toRemove = c.substring(idxStart + 36, idxNext); 
    // keep ') : (\n              <>\n' which is length 36
    c = c.slice(0, idxStart + 36) + c.slice(idxNext);
  }
}

// Inline results and remove tab logic
c = c.replace(/<LabTabButton\s*\n\s*label="Kết quả"\s*\n\s*active=\{activeWorkspaceTab === 'results'\}\s*\n\s*onClick=\{.*?\}\s*\n\s*\/>/m, '');

c = c.replace(/\{activeWorkspaceTab === 'results' && \(/, '{(activeWorkspaceTab === \'results\' || runReport) && (');
// Removing the min-h max-h from the results div
c = c.replace(/className="p-6 text-text-main min-h-\[600px\] max-h-\[600px\] overflow-y-auto"/, 'className="p-6 text-text-main"');

// Fix Solution confirm dialog as requested: "- hide Solution behind: "Reference Solution — Try on your own first!" user must confirm before solution is shown"
// The current code already does exactly this:
// `{!solutionUnlocked ? ( ... Hãy tự mình thử sức trước tiên ... <button onClick={() => setSolutionUnlocked(true)}>Hiển thị đáp án</button>) : ( <CodeSurface code={unit.solution} /> )}`
// So that is already handled successfully by previous owner!

fs.writeFileSync('src/pages/AcademyUnit.tsx', c);
