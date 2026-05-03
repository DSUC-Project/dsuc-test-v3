const fs = require('fs');
let c = fs.readFileSync('src/pages/AcademyUnit.tsx', 'utf8');

// Change `setActiveWorkspaceTab('results')` to `setActiveWorkspaceTab('editor')`
c = c.replace(/setActiveWorkspaceTab\('results'\)/g, "setActiveWorkspaceTab('editor')");

// Also ensure we remove any remaining Results workspace logic that's not needed, but right now Editor stays on 'editor' and Results renders via `runReport`.
// Wait, what if activeWorkspaceTab is 'editor' AND runReport is true? Both will render! Because Results renders on `|| runReport`.
// But what if we are on 'solution' tab? runReport is true, so Results will STILL SHOW below the solution! We don't want Results to show below Solution!
// Let's constrain Results to only show if we are on Editor!

c = c.replace(/\{\(activeWorkspaceTab === 'results' \|\| runReport\) && \(/, "{activeWorkspaceTab === 'editor' && runReport && (");

fs.writeFileSync('src/pages/AcademyUnit.tsx', c);
