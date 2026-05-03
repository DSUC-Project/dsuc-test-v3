const fs = require('fs');
let content = fs.readFileSync('src/pages/AcademyUnit.tsx', 'utf8');

// Replace `-main\b` or similar with `border border-border-main` where it makes sense, or just remove `-main`.
// Wait, the instances in AcademyUnit.tsx are literally `className="... -main ..."`
content = content.replace(/\b-main\b/g, 'border border-border-main');

// Wait, text-text-main and border-border-main also end with -main.
// \b-main\b won't match the leading hyphen as a word boundary.
// Let's replace ` -main ` with ` border border-border-main `
content = content.replace(/ -main /g, ' border border-border-main ');
content = content.replace(/"-main /g, '"border border-border-main ');
content = content.replace(/ -main"/g, ' border border-border-main"');

fs.writeFileSync('src/pages/AcademyUnit.tsx', content, 'utf8');
console.log('Fixed -main classes');
