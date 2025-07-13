const fs = require('fs');
const path = require('path');

// Define source and destination directories
const sourceDir = path.join(__dirname, '..', 'web-build');
const destDir = path.join(__dirname, '..', 'dist');

// Check if source directory exists
if (!fs.existsSync(sourceDir)) {
  console.error('Web build directory not found. Make sure to run "expo build:web" first.');
  process.exit(1);
}

// Create destination directory if it doesn't exist
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
  console.log('Created dist directory.');
}

// Function to copy directory recursively
function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest);
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

// Copy files from web-build to dist
console.log('Copying web build to dist folder...');
copyRecursiveSync(sourceDir, destDir);
console.log('Build files copied to dist/ successfully!');