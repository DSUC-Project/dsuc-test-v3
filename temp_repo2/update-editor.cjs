import fs from 'fs';

const p = 'src/components/academy/CodeSurface.tsx';
let code = fs.readFileSync(p, 'utf8');

// replace the textarea with react-simple-code-editor
// first add the import
if (!code.includes('import Editor')) {
    code = `import Editor from 'react-simple-code-editor';\nimport Prism from 'prismjs';\nimport 'prismjs/components/prism-typescript';\nimport 'prismjs/themes/prism-tomorrow.css';\n` + code;
}

// Then update CodeEditorPane
/*
We need to replace textarea and gutter. Wait, Editor itself doesn't have a gutter hook natively except through extra plugins, but Prism + react-simple-code-editor usually doesn't show line numbers natively easily. But we can build a gutter around Editor.
*/

fs.writeFileSync(p, code, 'utf8');
