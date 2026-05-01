import fs from 'fs';
import path from 'path';
function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory() && !file.includes('node_modules') && !file.includes('.git')) { 
      results = results.concat(walk(file));
    } else { 
      results.push(file);
    }
  });
  return results;
}
console.log(walk('.').filter(f => f.includes('AppBackground') || f.includes('Navbar') || f.includes('Primitives')));
