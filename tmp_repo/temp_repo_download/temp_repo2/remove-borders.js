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

const files = walk('./src');

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

    // Use regex to find tags with className
    // We match <TAG ... className="... " ... >
    newContent = newContent.replace(/<([a-zA-Z0-9]+)([^>]*?)className=(["'])(.*?)\3([^>]*)>/g, (match, tag, before, quote, className, after) => {
        
        // Skip tags that shouldn't have their borders removed (buttons, inputs, etc.)
        const keepTags = ['button', 'input', 'textarea', 'span', 'code', 'a', 'img', 'ActionButton'];
        if (keepTags.includes(tag)) {
            return match;
        }

        const isDivOrStructural = ['div', 'section', 'header', 'footer', 'nav', 'main', 'aside', 'article'].includes(tag);
        
        // Only strip heavily structural ones or if they definitely look like wrappers
        // To be safe, if it's a div/section, we only strip if it doesn't look like a tiny interactive element
        // Since we want to remove wrapper borders, let's just aggressively remove borders from sections, nav, header, footer
        // For divs, we remove if it has common wrapper classes.
        // Actually, user said ALL wrappers. So anything that isn't a button/input.
        
        if (isDivOrStructural) {
            // Keep borders if it has hover:border or it's an explicit "Avatar" or something tiny?
            if (className.includes('w-2 h-2') || className.includes('w-1.5 h-1.5') || className.includes('rounded-full')) {
                // Keep if it's a tiny dot indicator
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
        modifiedFiles++;
    }
});

console.log(`Modified ${modifiedFiles} files.`);
