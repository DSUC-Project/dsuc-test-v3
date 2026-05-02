const fs = require('fs');

function fix(filePath) {
   let content = fs.readFileSync(filePath, 'utf8');

   content = content.replace(/bg-primary text-primary-foreground border-border-main text-text-main/g, 'bg-surface text-text-main border-border-main');
   content = content.replace(/bg-primary text-primary-foreground border border-border-main text-text-main/g, 'bg-surface text-text-main border-border-main');
   content = content.replace(/border-border-main bg-primary text-primary-foreground text-primary/g, 'bg-primary text-primary-foreground border-border-main');
   content = content.replace(/bg-primary text-primary-foreground border border-border-main text-white/g, 'bg-primary text-primary-foreground border-border-main');
   content = content.replace(/bg-primary text-primary-foreground border-border-main text-white/g, 'bg-primary text-primary-foreground border-border-main');
   content = content.replace(/bg-primary text-primary-foreground px-5 py-4 font-mono text-\[13px\] font-bold uppercase tracking-widest text-white/g, 'bg-primary text-primary-foreground px-5 py-4 font-mono text-[13px] font-bold uppercase tracking-widest');
   content = content.replace(/bg-primary text-primary-foreground border border-border-main px-4 py-2 font-mono text-sm font-bold tracking-widest text-text-main/g, 'bg-surface text-text-main border border-border-main px-4 py-2 font-mono text-sm font-bold tracking-widest');
   
   // The callouts box
   content = content.replace(/className="relative overflow-hidden border border-border-main bg-primary text-primary-foreground p-6 shadow-sm"/g, 'className="relative overflow-hidden border border-border-main bg-surface p-6 shadow-sm rounded-xl"');

   // The header quiz prompt
   content = content.replace(/className="mb-8 text-xl font-bold leading-relaxed bg-primary text-primary-foreground border border-border-main p-6 shadow-sm"/g, 'className="mb-8 text-xl font-bold leading-relaxed bg-surface border border-border-main p-6 shadow-sm rounded-xl"');

   // Buttons with text-text-main
   content = content.replace(/bg-primary text-primary-foreground border border-border-main px-8 py-4 text-sm font-bold uppercase tracking-widest text-text-main/g, 'bg-surface text-text-main border border-border-main px-8 py-4 text-sm font-bold uppercase tracking-widest');
   content = content.replace(/bg-primary text-primary-foreground px-6 py-4 text-sm font-bold uppercase tracking-wider text-text-main/g, 'bg-primary text-primary-foreground px-6 py-4 text-sm font-bold uppercase tracking-wider');
   content = content.replace(/bg-primary text-primary-foreground border border-border-main px-6 py-3 text-xs font-bold uppercase tracking-widest text-text-main/g, 'bg-surface text-text-main border border-border-main px-6 py-3 text-xs font-bold uppercase tracking-widest');
   content = content.replace(/text-text-main shadow-sm/g, 'text-text-main shadow-sm');
   
   fs.writeFileSync(filePath, content);
}

fix('src/pages/AcademyLesson.tsx');
console.log('Fixed Academy elements!');
