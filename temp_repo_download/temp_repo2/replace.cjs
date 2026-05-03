const fs = require('fs');
const path = require('path');

function replaceRecursively(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceRecursively(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.css')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      content = content.replace(/brutal-black/g, 'text-main');
      content = content.replace(/brutal-blue/g, 'primary');
      content = content.replace(/brutal-yellow/g, 'accent');
      content = content.replace(/brutal-green/g, 'emerald-400');
      content = content.replace(/brutal-pink/g, 'pink-400');
      content = content.replace(/brutal-red/g, 'red-500');
      
      content = content.replace(/shadow-neo-lg/g, 'shadow-lg');
      content = content.replace(/shadow-neo-sm/g, 'shadow-sm');
      content = content.replace(/shadow-neo/g, 'shadow-md');
      content = content.replace(/brutal-scrollbar/g, '');
      content = content.replace(/shadow-brutal/g, 'shadow-md');

      fs.writeFileSync(fullPath, content, 'utf8');
    }
  }
}

replaceRecursively('./src');
console.log('Replacements completed successfully!');
