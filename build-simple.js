#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting simple build process...');
console.log('Node version:', process.version);
console.log('Current directory:', process.cwd());
console.log('Project structure check:');
console.log('- app directory exists:', fs.existsSync('app'));
console.log('- package.json exists:', fs.existsSync('package.json'));
console.log('- app.json exists:', fs.existsSync('app.json'));

// Function to replace import.meta in files
function replaceImportMeta(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      replaceImportMeta(filePath);
    } else if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.tsx')) {
      try {
        let content = fs.readFileSync(filePath, 'utf8');
        if (content.includes('import.meta')) {
          console.log(`Replacing import.meta in ${filePath}`);
          content = content.replace(/import\.meta/g, '({})'); // Replace with empty object
          fs.writeFileSync(filePath, content, 'utf8');
        }
      } catch (error) {
        console.warn(`Could not process file ${filePath}:`, error.message);
      }
    }
  });
}

// Pre-process files to remove import.meta
try {
  console.log('Pre-processing files to handle import.meta...');
  replaceImportMeta('./app');
  replaceImportMeta('./components');
  if (fs.existsSync('./constants')) replaceImportMeta('./constants');
  if (fs.existsSync('./utils')) replaceImportMeta('./utils');
  if (fs.existsSync('./store')) replaceImportMeta('./store');
  if (fs.existsSync('./types')) replaceImportMeta('./types');
} catch (error) {
  console.warn('Error during pre-processing:', error.message);
}

// Set environment variables
process.env.EXPO_USE_FAST_RESOLVER = 'true';
process.env.NODE_ENV = 'production';
process.env.EXPO_NO_DOTENV = '1';
process.env.SKIP_PREFLIGHT_CHECK = 'true';
process.env.EXPO_CLEAR_CACHE = 'true';
process.env.BABEL_ENV = 'production';
process.env.NODE_OPTIONS = '--max-old-space-size=4096';
process.env.EXPO_NO_METRO_LAZY = '1';
process.env.EXPO_NO_FLIPPER = '1';
process.env.EXPO_PLATFORM = 'web';
process.env.EXPO_PUBLIC_USE_STATIC = 'true';
process.env.EXPO_USE_METRO_REQUIRE = 'true';
process.env.EXPO_NO_IMPORT_META = 'true';

// Start the build process
startBuild();

function startBuild() {
  // Try to use expo export with additional flags to handle import.meta
  const buildArgs = [
    'expo', 'export', 
    '--platform', 'web', 
    '--output-dir', 'dist', 
    '--clear',
    '--no-minify' // Disable minification to avoid import.meta issues
  ];

  const buildProcess = spawn('npx', buildArgs, {
    stdio: 'inherit',
    env: process.env
  });

  // Set a timeout to kill the process if it hangs
  const timeout = setTimeout(() => {
    console.error('Build process timed out after 8 minutes');
    buildProcess.kill('SIGTERM');
    process.exit(1);
  }, 8 * 60 * 1000); // 8 minutes

  buildProcess.on('close', (code) => {
    clearTimeout(timeout);
    
    if (code === 0) {
      // Verify the build output
      const distPath = path.join(process.cwd(), 'dist');
      const indexPath = path.join(distPath, 'index.html');
      
      if (fs.existsSync(indexPath)) {
        console.log('Build completed successfully!');
        console.log('Output directory:', distPath);
        process.exit(0);
      } else {
        console.error('Build completed but index.html not found');
        process.exit(1);
      }
    } else {
      console.error(`Build process exited with code ${code}`);
      process.exit(code);
    }
  });

  buildProcess.on('error', (error) => {
    clearTimeout(timeout);
    console.error('Build process error:', error);
    process.exit(1);
  });
}

// Handle process termination gracefully
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, exiting gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, exiting gracefully...');
  process.exit(0);
});