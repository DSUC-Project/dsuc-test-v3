const fs = require('fs');

let code = fs.readFileSync('src/pages/AcademyUnit.tsx', 'utf8');

code = code.replace(/setActiveWorkspaceTab\('editor'\);\n\s*setNotice\(report.message\);/, "setActiveWorkspaceTab('results');\n  setNotice(report.message);");
code = code.replace(/setActiveWorkspaceTab\('editor'\);\n\s*setNotice\(error\?\.message \|\| (.*?)\);/, "setActiveWorkspaceTab('results');\n  setNotice(error?.message || $1);");

// Panel of hint and solution are too short.
// The panel in `activeWorkspaceTab === 'hints'` currently is `<div className="flex-1 bg-white p-6 sm:p-8">`
// Wait, the main container is `.flex-1.bg-white.flex.flex-col.min-h-[600px]`
code = code.replace(
  /<div className="flex-1 flex flex-col min-h-\[500px\]">/g,
  '<div className="flex-1 flex flex-col h-full min-h-[700px]">'
);

code = code.replace(
  /<div className="flex min-h-\[400px\] flex-col items-center justify-center/g,
  '<div className="flex min-h-[700px] flex-col items-center justify-center'
);

code = code.replace(
  /<div className="flex-1 flex flex-col min-h-\[600px\]">/g,
  '<div className="flex-1 flex flex-col min-h-[750px]">'
);

// We need to apply min-h-[700px] to hints and solution.
// Hint wrapper: `<div className="flex-1 bg-white p-6 sm:p-8">`
// Let's change it to `<div className="flex-1 bg-white p-6 sm:p-8 min-h-[700px]">`
code = code.replace(
  /\{activeWorkspaceTab === 'hints' && \(\n\s*<div className="flex-1 bg-white p-6 sm:p-8">/g,
  `{activeWorkspaceTab === 'hints' && (\n                  <div className="flex-1 bg-white p-6 sm:p-8 min-h-[700px]">`
);

code = code.replace(
  /\{activeWorkspaceTab === 'solution' && \(\n\s*<div className="flex-1 p-6 bg-main-bg">/g,
  `{activeWorkspaceTab === 'solution' && (\n                  <div className="flex-1 p-6 bg-main-bg min-h-[700px]">`
);

code = code.replace(
    /\{activeWorkspaceTab === 'results' && runnerSupported && \(\n\s*<div className="flex-1 flex flex-col">/g,
    `{activeWorkspaceTab === 'results' && runnerSupported && (\n                    <div className="flex-1 flex flex-col min-h-[700px]">`
);


fs.writeFileSync('src/pages/AcademyUnit.tsx', code, 'utf8');
