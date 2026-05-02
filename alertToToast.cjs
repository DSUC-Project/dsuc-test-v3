const fs = require('fs');
const path = require('path');

function replaceAlertsInFile(filePath) {
   let content = fs.readFileSync(filePath, 'utf8');
   
   if (!content.includes('alert(')) return;

   // Add import if missing
   if (!content.includes("import toast from 'react-hot-toast'") && !content.includes('import { toast } from')) {
      content = "import toast from 'react-hot-toast';\n" + content;
   }

   // Very basic replace of alert( to toast(
   // For simple strings alert('Message') -> toast('Message')
   // To be safe we will just replace alert( with toast( for inline ones too.
   // Or better, let's just do toast.error for things that say "failed" or "please login", and toast.success for "successfully"
   
   content = content.replace(/alert\('([^']*(?:failed|error|Cannot|Please)[^']*)'\)/gi, "toast.error('$1')");
   content = content.replace(/alert\("([^"]*(?:failed|error|Cannot|Please)[^"]*)"\)/gi, 'toast.error("$1")');
   
   content = content.replace(/alert\('([^']*(?:success)[^']*)'\)/gi, "toast.success('$1')");
   content = content.replace(/alert\("([^"]*(?:success)[^"]*)"\)/gi, 'toast.success("$1")');

   // Fallback for remaining alerts
   content = content.replace(/alert\(/g, "toast(");

   fs.writeFileSync(filePath, content, 'utf8');
}

function traverseDir(dir) {
   const files = fs.readdirSync(dir);
   for (const file of files) {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
         traverseDir(fullPath);
      } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
         replaceAlertsInFile(fullPath);
      }
   }
}

traverseDir(path.join(process.cwd(), 'src'));
console.log('Finished replacing alerts');
