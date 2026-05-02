const fs = require('fs');
const path = require('path');

const filePaths = [
   'src/pages/AcademyUnit.tsx',
   'src/pages/AcademyCourse.tsx',
   'src/pages/AcademyPath.tsx',
   'src/pages/AcademyHome.tsx',
   'src/pages/AcademyLesson.tsx',
   'src/pages/AcademyTrack.tsx',
   'src/pages/AcademyAdmin.tsx'
];

for (const relPath of filePaths) {
   const absPath = path.join(process.cwd(), relPath);
   let content = fs.readFileSync(absPath, 'utf8');

   // Additional replacements for cleaner style
   content = content.replace(/border brutal-border/g, 'border border-border-main');
   content = content.replace(/border-b brutal-border/g, 'border-b border-border-main');
   content = content.replace(/border-t brutal-border/g, 'border-t border-border-main');
   content = content.replace(/border-r brutal-border/g, 'border-r border-border-main');
   content = content.replace(/border-l brutal-border/g, 'border-l border-border-main');
   content = content.replace(/bg-brutal-bg/g, 'bg-main-bg');

   // Typographical alignments
   content = content.replace(/font-black/g, 'font-bold');

   fs.writeFileSync(absPath, content, 'utf8');
}

console.log('Cleanup step 2 complete');
