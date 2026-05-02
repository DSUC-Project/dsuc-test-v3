const fs = require('fs');

function fix(filePath) {
   let content = fs.readFileSync(filePath, 'utf8');

   content = content.replace(/border-4 border-dashed/g, 'border border-dashed rounded-xl');
   
   // We should remove bold text and uppercase in a lot of places because it's part of brutalism.
   // Or at least make sure bg-surface, text-text-muted is used instead of brutal-border, etc.
   // Because I already ran cleanUi scripts, the brutalist class names are gone, but some logic might still be bold uppercase.
   content = content.replace(/font-display/g, 'font-heading');
   content = content.replace(/hover:bg-surface text-text-main /g, 'hover:bg-surface hover:text-text-main ');
   content = content.replace(/decoration-brutal-[a-z]+ decoration-4 underline underline-offset-8/g, 'text-primary');
   content = content.replace(/shadow-sm-sm/g, 'shadow-sm');
   content = content.replace(/border-4/g, 'border border-border-main rounded-xl');

   // "Bài lý thuyết" Box style
   content = content.replace(/className="inline-block bg-primary text-primary-foreground px-2 py-1 text-\[10px\] font-bold uppercase tracking-widest border border-border-main shadow-sm mb-3"/g, 'className="inline-block bg-primary/10 text-primary px-2 py-1 text-xs rounded-full font-medium mb-3"');
   content = content.replace(/className="inline-block bg-surface text-text-main px-2 py-1 text-\[10px\] font-bold uppercase tracking-widest border border-border-main shadow-[a-z]+ mb-3"/g, 'className="inline-block bg-surface text-text-main px-2 py-1 text-xs rounded-full font-medium mb-3"');
   content = content.replace(/className="bg-surface px-4 py-2 text-xs font-bold uppercase tracking-wider text-text-main border border-border-main shadow-sm/g, 'className="bg-surface px-4 py-2 text-xs rounded-full font-medium text-text-main border border-border-main border-border-main');

   content = content.replace(/text-white shadow-sm hover:-translate-y-1 hover:shadow-md/g, 'shadow-sm hover:-translate-y-1 hover:shadow-md');
   content = content.replace(/bg-primary text-primary-foreground text-white/g, 'bg-primary text-primary-foreground');
   content = content.replace(/bg-primary text-primary-foreground px-4 py-2 text-xs font-bold uppercase tracking-widest text-white/g, 'bg-primary text-primary-foreground px-4 py-2 text-xs font-bold uppercase tracking-widest');
   
   // The big heading
   content = content.replace(/font-display text-5xl font-bold text-text-main sm:text-6xl lg:text-7xl leading-none uppercase tracking-tighter/g, 'font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-text-main');

   fs.writeFileSync(filePath, content);
}

fix('src/pages/AcademyUnit.tsx');
fix('src/pages/AcademyPath.tsx');
fix('src/pages/AcademyCourse.tsx');
