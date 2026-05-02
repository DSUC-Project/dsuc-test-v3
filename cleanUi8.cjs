const fs = require('fs');

function fix(filePath) {
   let content = fs.readFileSync(filePath, 'utf8');
   content = content.replace(/fill-brutal-black/g, 'fill-text-main');
   content = content.replace(/decoration-brutal-yellow/g, 'decoration-primary/30');
   fs.writeFileSync(filePath, content);
}
fix('src/pages/AcademyLesson.tsx');
