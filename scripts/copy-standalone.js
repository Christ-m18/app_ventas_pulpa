const fs = require('fs');
const path = require('path');

const cwd = process.cwd();

const publicSrc = path.join(cwd, 'public');
const publicDest = path.join(cwd, '.next', 'standalone', 'public');

const staticSrc = path.join(cwd, '.next', 'static');
const staticDest = path.join(cwd, '.next', 'standalone', '.next', 'static');

function copyFolderSync(from, to) {
  if (!fs.existsSync(from)) return;
  if (!fs.existsSync(to)) fs.mkdirSync(to, { recursive: true });
  
  fs.readdirSync(from).forEach(element => {
    const fromPath = path.join(from, element);
    const toPath = path.join(to, element);
    
    if (fs.lstatSync(fromPath).isFile()) {
      fs.copyFileSync(fromPath, toPath);
    } else {
      copyFolderSync(fromPath, toPath);
    }
  });
}

console.log('Copying static assets for standalone build...');
copyFolderSync(publicSrc, publicDest);
console.log('Copied public folder.');
copyFolderSync(staticSrc, staticDest);
console.log('Copied .next/static folder.');

console.log('Standalone build is ready for deployment!');
