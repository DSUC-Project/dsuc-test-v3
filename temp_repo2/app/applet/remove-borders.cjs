const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(filePath));
        } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
            results.push(filePath);
        }
    });
    return results;
}

const files = walk(path.join(process.cwd(), 'src'));

function removeBordersFromClassName(className) {
    return className.replace(/\bborder(-[a-z0-9]+)?\b/g, (match) => {
        if (match === 'border-dashed' || match === 'border-primary' || match.includes('transparent')) return match;
        // removing standard tailwind borders
        return '';
    }).replace(/\bbrutal-border\b/g, '')
      .replace(/\bdivide-[a-z0-9]+\b/g, '') // remove divide-x divide-y as well
      .replace(/\s+/g, ' ').trim();
}

let modifiedFiles = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let newContent = content;

    newContent = newContent.replace(/<([a-zA-Z0-9]+)([^>]*?)className=(["'])(.*?)\3([^>]*)>/g, (match, tag, before, quote, className, after) => {
        
        // Skip tags that shouldn't have their borders removed
        const keepTags = ['button', 'input', 'textarea', 'span', 'code', 'a', 'img', 'ActionButton'];
        if (keepTags.includes(tag)) {
            return match;
        }

        const isDivOrStructural = ['div', 'section', 'header', 'footer', 'nav', 'main', 'aside', 'article'].includes(tag);
        
        if (isDivOrStructural) {
            // Keep borders if it has hover:border etc
            if (className.includes('w-2 h-2') || className.includes('w-1.5 h-1.5') || className.includes('rounded-full')) {
                return match; 
            }
            if (className.includes('hover:border-')) {
                return match;
            }

            const cleanedClass = removeBordersFromClassName(className);
            if (cleanedClass !== className) {
                return `<${tag}${before}className=${quote}${cleanedClass}${quote}${after}>`;
            }
        }
        
        return match;
    });

    if (newContent !== content) {
        fs.writeFileSync(file, newContent, 'utf8');
        console.log("Modified " + file);
        modifiedFiles++;
    }
});

console.log(`\nModified ${modifiedFiles} files.`);
