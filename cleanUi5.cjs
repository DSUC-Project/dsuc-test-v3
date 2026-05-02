const fs = require('fs');
const path = require('path');

function fix(filePath) {
   let content = fs.readFileSync(filePath, 'utf8');

   content = content.replace(/bg-primary text-white text-text-main/g, 'bg-surface text-text-main');
   content = content.replace(/bg-primary text-white text-white/g, 'bg-primary text-primary-foreground');
   content = content.replace(/bg-primary text-white/g, 'bg-primary text-primary-foreground');
   content = content.replace(/text-text-main bg-primary text-primary-foreground/g, 'bg-primary text-primary-foreground');
   content = content.replace(/bg-surface text-primary-foreground/g, 'bg-surface text-text-main');
   content = content.replace(/bg-primary text-primary-foreground text-text-main/g, 'bg-primary text-primary-foreground');
   content = content.replace(/hover:bg-primary text-primary-foreground hover:text-white/g, 'hover:bg-primary hover:text-primary-foreground');
   content = content.replace(/hover:bg-primary text-primary-foreground hover:text-text-main/g, 'hover:bg-primary hover:text-primary-foreground');
   content = content.replace(/hover:bg-primary text-primary-foreground/g, 'hover:bg-primary hover:text-primary-foreground');
   content = content.replace(/hover:bg-white hover:text-text-main hover:translate-x-1 hover:translate-y-1 hover:shadow-none /g, 'hover:bg-surface hover:-translate-y-1 ');
   content = content.replace(/hover:translate-x-1 hover:translate-y-1 hover:shadow-none /g, 'hover:-translate-y-1 ');
   content = content.replace(/translate-x-1 translate-y-1/g, '-translate-y-1');

   // specifically for graduation dialog
   content = content.replace(/className="relative z-10 w-full max-w-2xl overflow-hidden bg-primary text-primary-foreground p-8 sm:p-12 shadow-sm text-center border border-border-main "/g, 'className="relative z-10 w-full max-w-2xl overflow-hidden bg-surface p-8 sm:p-12 shadow-sm text-center border border-border-main rounded-xl "');
   
   // remove competing texts
   content = content.replace(/text-text-main text-white/g, 'text-white');
   content = content.replace(/text-white text-text-main/g, 'text-white');

   fs.writeFileSync(filePath, content);
}

['src/pages/AcademyUnit.tsx', 'src/pages/AcademyLesson.tsx', 'src/pages/AcademyPath.tsx', 'src/pages/AcademyTrack.tsx'].forEach(fix);
console.log('Fixed Academy elements!');
