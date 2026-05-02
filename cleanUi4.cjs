const fs = require('fs');
const path = require('path');

function fix(filePath) {
   let content = fs.readFileSync(filePath, 'utf8');

   // Fix text-white + bg-primary text-primary-foreground to just bg-primary text-white
   content = content.replace(/bg-primary text-primary-foreground text-white/g, 'bg-primary text-white');
   content = content.replace(/text-white bg-primary text-primary-foreground/g, 'bg-primary text-white');

   // Fix bg-primary text-primary-foreground
   content = content.replace(/bg-primary text-primary-foreground/g, 'bg-primary text-white');
   content = content.replace(/bg-accent text-accent-foreground text-text-main/g, 'bg-surface text-text-main');
   content = content.replace(/bg-accent text-accent-foreground/g, 'bg-surface text-text-main');

   // Add borders back where missing due to removeLines
   content = content.replace(/className="flex flex-col gap-6 pb-8 sm:flex-row sm:items-end sm:justify-between mb-8"/g, 'className="flex flex-col gap-6 border-b border-border-main pb-8 sm:flex-row sm:items-end sm:justify-between mb-8"');
   content = content.replace(/className=" bg-surface px-6 py-5"/g, 'className="border-b border-border-main bg-surface px-6 py-5"');
   content = content.replace(/className="overflow-visible flex flex-col sm:flex-row sm:items-center justify-between bg-white px-4 py-3 gap-4"/g, 'className="overflow-visible flex flex-col sm:flex-row sm:items-center justify-between border-b border-border-main bg-white px-4 py-3 gap-4"');
   content = content.replace(/className="flex items-center justify-between gap-4 mb-4 pb-4"/g, 'className="flex items-center justify-between gap-4 mb-4 border-b border-border-main pb-4"');
   content = content.replace(/className="flex items-center justify-between gap-4 mb-3 pb-2"/g, 'className="flex items-center justify-between gap-4 mb-3 border-b border-border-main pb-2"');
   content = content.replace(/className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between py-10 mt-12 mb-20 "/g, 'className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between border-t border-border-main py-10 mt-12 mb-20 "');
   
   fs.writeFileSync(filePath, content);
}

function traverseDir(dir) {
   const files = fs.readdirSync(dir);
   for (const file of files) {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
         // pass
      } else if (file.startsWith('Academy') && fullPath.endsWith('.tsx')) {
         fix(fullPath);
      }
   }
}

traverseDir(path.join(process.cwd(), 'src/pages'));
console.log('Fixed Academy pages!');
