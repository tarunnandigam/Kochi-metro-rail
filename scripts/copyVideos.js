const fs = require('fs');
const path = require('path');

const srcDir = path.resolve(__dirname, '..', 'Image');
const destDir = path.resolve(__dirname, '..', 'frontend', 'public', 'videos');

if (!fs.existsSync(srcDir)) {
  console.error('Source Image directory not found at', srcDir);
  process.exit(1);
}

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const copyFile = (file) => {
  const a = path.join(srcDir, file);
  const b = path.join(destDir, file);
  fs.copyFileSync(a, b);
  console.log('Copied', file);
};

const files = fs.readdirSync(srcDir).filter(f => /\.(mp4|webm|gif|ogg)$/i.test(f));
if (files.length === 0) {
  console.log('No video/gif files found in', srcDir);
  // Ensure index.json empty
  fs.writeFileSync(path.join(destDir, 'index.json'), JSON.stringify([]));
  process.exit(0);
}

files.forEach(copyFile);

// write index.json listing available files for the frontend to consume
const indexPath = path.join(destDir, 'index.json');
fs.writeFileSync(indexPath, JSON.stringify(files, null, 2));
console.log('All videos copied to', destDir);
console.log('Generated', indexPath);
