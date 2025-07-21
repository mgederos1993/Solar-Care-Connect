const fs = require('fs');
const path = require('path');

// Define source and destination directories
const sourceDir = path.join(__dirname, '..', 'dist');
const destDir = path.join(__dirname, '..', 'build');

// Check if source directory exists
if (!fs.existsSync(sourceDir)) {
  console.error('Dist directory not found. Make sure to run "expo export:web" first.');
  process.exit(1);
}

// Create destination directory if it doesn't exist
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
  console.log('Created build directory.');
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

// Copy files from dist to build
console.log('Copying dist to build folder...');
copyRecursiveSync(sourceDir, destDir);
console.log('Build files copied to build/ successfully!');