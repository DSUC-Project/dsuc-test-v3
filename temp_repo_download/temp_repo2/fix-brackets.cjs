const fs = require('fs');
let c = fs.readFileSync('src/pages/AcademyUnit.tsx', 'utf8');

c = c.replace(/className=`(.*?)`/g, 'className={`$1`}');

fs.writeFileSync('src/pages/AcademyUnit.tsx', c);
