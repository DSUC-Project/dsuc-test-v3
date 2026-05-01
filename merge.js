import fs from 'fs';
import path from 'path';

function copyRecursiveSync(src, dest) {
  var exists = fs.existsSync(src);
  var stats = exists && fs.statSync(src);
  var isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach(function(childItemName) {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

// 1. Copy backend from product-repo
copyRecursiveSync('./product-repo/backend/src', './backend');

// 2. Copy frontend framework from product-repo
copyRecursiveSync('./product-repo/frontend/store', './src/store');
copyRecursiveSync('./product-repo/frontend/lib', './src/lib');
copyRecursiveSync('./product-repo/frontend/App.tsx', './src/App.tsx');
if (!fs.existsSync('./src/components')) fs.mkdirSync('./src/components', { recursive: true });
copyRecursiveSync('./product-repo/frontend/components/Layout.tsx', './src/components/orig_Layout.tsx'); // Store original just in case

// 3. Copy UI from prototype-repo
copyRecursiveSync('./prototype-repo/src/components', './src/components');
copyRecursiveSync('./prototype-repo/src/pages', './src/pages');
copyRecursiveSync('./prototype-repo/src/index.css', './src/index.css');

// Rename Home to Dashboard for compatibility or update App.tsx?
// We will update App.tsx later.

console.log('Merge complete.');
