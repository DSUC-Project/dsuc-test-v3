const fs = require('fs');
const path = require('path');

function replaceBrutalist(filePath) {
   let content = fs.readFileSync(filePath, 'utf8');

   content = content.replace(/border-4 border-brutal-[a-z]+/g, 'border border-border-main');
   content = content.replace(/border-[bltr]-4 border-brutal-[a-z]+/g, 'border border-border-main');
   content = content.replace(/border-[lrtb]-8 border-brutal-[a-z]+/g, 'border border-border-main');
   content = content.replace(/border-4 px-4/g, 'border border-border-main px-4');
   content = content.replace(/border-2 border-brutal-[a-z]+/g, 'border border-border-main');
   content = content.replace(/border-[bltr]-2 border-brutal-[a-z]+/g, 'border border-border-main');
   content = content.replace(/border-8 border-brutal-[a-z]+/g, 'border border-border-main');
   
   content = content.replace(/border-brutal-[a-z]+/g, 'border-border-main');
   content = content.replace(/text-brutal-[a-z]+/g, 'text-primary');

   content = content.replace(/bg-brutal-[a-z]+/g, 'bg-primary text-primary-foreground');
   content = content.replace(/bg-brutal-bg/g, 'bg-main-bg');
   
   content = content.replace(/shadow-neo-[a-z]+/g, 'shadow-sm');
   content = content.replace(/shadow-neo/g, 'shadow-sm');

   content = content.replace(/brutal-card/g, '');
   content = content.replace(/brutal-btn/g, '');
   
   content = content.replace(/font-black/g, 'font-bold');

   fs.writeFileSync(filePath, content, 'utf8');
}

replaceBrutalist('src/lib/academy/md.tsx');
console.log('Cleanup script 6 complete!');
