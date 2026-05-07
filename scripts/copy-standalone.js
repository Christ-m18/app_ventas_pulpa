/* eslint-disable @typescript-eslint/no-var-requires */
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

// Inject .env.local loader into server.js
const serverJsPath = path.join(cwd, '.next', 'standalone', 'server.js');
if (fs.existsSync(serverJsPath)) {
  const envLoader = `
// --- AUTO-INJECTED ENV LOADER ---
(() => {
  const fs = require('fs');
  const path = require('path');
  const envFile = path.join(__dirname, '.env.local');
  if (fs.existsSync(envFile)) {
    const envConfig = fs.readFileSync(envFile, 'utf8').split('\\n');
    envConfig.forEach(line => {
      const match = line.match(/^\\s*([\\w.-]+)\\s*=\\s*(.*)?\\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || '';
        value = value.replace(/^(['"])(.*)\\1$/, '$2');
        if (process.env[key] === undefined) {
          process.env[key] = value;
        }
      }
    });
  }
})();
// --------------------------------

`;
  const originalServerJs = fs.readFileSync(serverJsPath, 'utf8');
  if (!originalServerJs.includes('AUTO-INJECTED ENV LOADER')) {
    fs.writeFileSync(serverJsPath, envLoader + originalServerJs);
    console.log('Injected .env.local loader into server.js');
  }
}

console.log('Standalone build is ready for deployment!');
