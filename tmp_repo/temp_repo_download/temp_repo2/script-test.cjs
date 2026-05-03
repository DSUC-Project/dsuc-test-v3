const Prism = require('prismjs');
require('prismjs/components/prism-typescript');
console.log(Prism.highlight('const a = 1;', Prism.languages.typescript, 'typescript'));
