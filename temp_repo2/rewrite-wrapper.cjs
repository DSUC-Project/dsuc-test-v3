const fs = require('fs');

let code = fs.readFileSync('src/pages/AcademyUnit.tsx', 'utf8');

code = code.replace(
  '  return (\n    <div className="mx-auto w-full max-w-[1400px] px-4 pb-20 pt-8 sm:px-6 lg:px-8">',
  '  return (\n    <div className="min-h-screen bg-main-bg">\n      <div className="mx-auto w-full max-w-[1400px] px-4 pb-20 pt-8 sm:px-6 lg:px-8">'
);

// We added an extra <div> at the top, we must close it.
// The whole component ends at `        </div>\n      </div>\n    </div>\n  );\n}\n\nfunction NavUnitLink`
// Let's replace the ending piece.
code = code.replace(
  '        </div>\n      </div>\n    </div>\n  );\n}',
  '        </div>\n      </div>\n    </div>\n    </div>\n  );\n}'
);

fs.writeFileSync('src/pages/AcademyUnit.tsx', code, 'utf8');
