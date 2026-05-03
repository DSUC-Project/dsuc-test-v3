const fs = require('fs');
let content = fs.readFileSync('src/pages/AcademyUnit.tsx', 'utf8');

content = content.replace(/text-textborder border-border-main/g, 'text-text-main');
content = content.replace(/border-borderborder border-border-main/g, 'border-border-main');
content = content.replace(/bgborder border-border-main-bg/g, 'bg-main-bg');
content = content.replace(/border border-borderborder border-border-main/g, 'border border-border-main');

fs.writeFileSync('src/pages/AcademyUnit.tsx', content, 'utf8');
console.log('Fixed regex mess');
