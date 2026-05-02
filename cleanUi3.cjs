const fs = require('fs');
const path = require('path');

function replaceBrutalist(filePath) {
   let content = fs.readFileSync(filePath, 'utf8');

   content = content.replace(/border-4 border-brutal-black/g, 'border border-border-main');
   content = content.replace(/border-[bltr]-4 border-brutal-black/g, 'border border-border-main');
   content = content.replace(/border-4 px-4/g, 'border border-border-main px-4');
   content = content.replace(/border-2 border-brutal-black/g, 'border border-border-main');
   content = content.replace(/border-[bltr]-2 border-brutal-black/g, 'border border-border-main');
   content = content.replace(/border-8 border-brutal-black/g, 'border border-border-main');
   
   content = content.replace(/border-brutal-black/g, 'border-border-main');
   content = content.replace(/text-brutal-black/g, 'text-text-main');
   content = content.replace(/text-brutal-[a-z]+/g, 'text-primary');

   content = content.replace(/bg-brutal-[a-z]+/g, 'bg-primary text-primary-foreground');
   content = content.replace(/bg-brutal-bg/g, 'bg-main-bg');
   
   content = content.replace(/shadow-neo-[a-z]+/g, 'shadow-sm');
   content = content.replace(/shadow-neo/g, 'shadow-sm');

   content = content.replace(/brutal-card/g, '');
   content = content.replace(/brutal-btn/g, '');
   
   content = content.replace(/font-black/g, 'font-bold');
   
   content = content.replace(/w-10 h-2 bg-primary/g, ''); // the old `w-10 h-2 bg-brutal-black`
   content = content.replace(/w-10 h-2 bg-brutal-black/g, '');

   fs.writeFileSync(filePath, content, 'utf8');
}

function traverseDir(dir) {
   const files = fs.readdirSync(dir);
   for (const file of files) {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
         traverseDir(fullPath);
      } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
         replaceBrutalist(fullPath);
      }
   }
}

traverseDir(path.join(process.cwd(), 'src/pages'));
console.log('Cleanup script 3 complete!');
