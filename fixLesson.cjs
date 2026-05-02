const fs = require('fs');

function fix(filePath) {
   let content = fs.readFileSync(filePath, 'utf8');

   content = content.replace(/border-4 border-dashed/g, 'border border-dashed rounded-xl');
   content = content.replace(/font-display/g, 'font-heading');
   content = content.replace(/hover:bg-surface text-text-main hover:text-text-main/g, 'hover:bg-surface hover:text-text-main');
   content = content.replace(/hover:bg-surface text-text-main/g, 'hover:bg-surface hover:text-text-main');
   content = content.replace(/decoration-brutal-[a-z]+ decoration-4 underline underline-offset-8/g, 'text-primary');
   content = content.replace(/shadow-sm-sm/g, 'shadow-sm');
   content = content.replace(/border-4/g, 'border border-border-main rounded-xl');

   content = content.replace(/className="inline-block bg-primary text-primary-foreground px-2 py-1 text-\[10px\] font-bold uppercase tracking-widest border border-border-main shadow-sm mb-3"/g, 'className="inline-block bg-primary/10 text-primary px-2 py-1 text-xs rounded-full font-medium mb-3"');
   content = content.replace(/className="inline-block bg-surface text-text-main px-2 py-1 text-\[10px\] font-bold uppercase tracking-widest border border-border-main shadow-[a-z]+ mb-3"/g, 'className="inline-block bg-surface text-text-main px-2 py-1 text-xs rounded-full font-medium mb-3"');
   content = content.replace(/className="bg-surface px-4 py-2 text-xs font-bold uppercase tracking-wider text-text-main border border-border-main shadow-sm/g, 'className="bg-surface px-4 py-2 text-xs rounded-full font-medium text-text-main border border-border-main border-border-main');

   content = content.replace(/text-white shadow-sm hover:-translate-y-1 hover:shadow-md/g, 'shadow-sm hover:-translate-y-1 hover:shadow-md');
   content = content.replace(/bg-primary text-primary-foreground text-white/g, 'bg-primary text-primary-foreground');
   content = content.replace(/bg-primary text-primary-foreground px-4 py-2 text-xs font-bold uppercase tracking-widest text-white/g, 'bg-primary text-primary-foreground px-4 py-2 text-xs font-bold uppercase tracking-widest');
   
   content = content.replace(/font-heading text-5xl font-bold text-text-main sm:text-6xl lg:text-7xl leading-none uppercase tracking-tighter/g, 'font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-text-main');
   
   content = content.replace(/bg-primary text-primary-foreground px-8 py-4 text-sm font-bold uppercase tracking-widest text-white/g, 'bg-primary text-primary-foreground px-8 py-4 text-sm font-bold uppercase tracking-widest text-white tracking-widest');

   fs.writeFileSync(filePath, content);
}

fix('src/pages/AcademyLesson.tsx');
