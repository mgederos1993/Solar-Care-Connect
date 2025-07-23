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

// Set environment variables
process.env.EXPO_USE_FAST_RESOLVER = 'true';
process.env.NODE_ENV = 'production';
process.env.BABEL_ENV = 'production';
process.env.EXPO_NO_DOTENV = '1';
process.env.SKIP_PREFLIGHT_CHECK = 'true';
process.env.EXPO_CLEAR_CACHE = 'true';
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
  const buildArgs = [
    'expo', 'export', 
    '--platform', 'web', 
    '--output-dir', 'dist', 
    '--clear'
  ];

  const buildProcess = spawn('npx', buildArgs, {
    stdio: 'inherit',
    env: process.env
  });

  // Set a timeout to kill the process if it hangs
  const timeout = setTimeout(() => {
    console.error('Build process timed out after 10 minutes');
    buildProcess.kill('SIGTERM');
    process.exit(1);
  }, 10 * 60 * 1000); // 10 minutes

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