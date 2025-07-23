#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

try {
  console.log('Building web app...');
  console.log('Node version:', process.version);
  console.log('Current directory:', process.cwd());
  console.log('Available memory:', Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB');
  
  // Check if required files exist
  const requiredFiles = ['app.json', 'app/_layout.tsx'];
  for (const file of requiredFiles) {
    if (!fs.existsSync(file)) {
      throw new Error(`Required file missing: ${file}`);
    }
  }
  
  // Set environment variables for the build
  const buildEnv = {
    ...process.env,
    EXPO_USE_FAST_RESOLVER: 'true',
    NODE_ENV: 'production',
    EXPO_NO_DOTENV: '1',
    SKIP_PREFLIGHT_CHECK: 'true',
    // Increase memory limit for Node.js
    NODE_OPTIONS: '--max-old-space-size=4096'
  };
  
  console.log('Starting Expo export...');
  
  execSync('npx expo export --platform web --output-dir dist', { 
    stdio: 'inherit',
    env: buildEnv,
    timeout: 600000, // 10 minutes timeout
    maxBuffer: 1024 * 1024 * 10 // 10MB buffer
  });
  
  // Verify the build output
  const distPath = path.join(process.cwd(), 'dist');
  if (!fs.existsSync(distPath)) {
    throw new Error('Build output directory not found');
  }
  
  const indexPath = path.join(distPath, 'index.html');
  if (!fs.existsSync(indexPath)) {
    throw new Error('index.html not found in build output');
  }
  
  console.log('Build completed successfully!');
  console.log('Output directory:', distPath);
  
} catch (error) {
  console.error('Build failed:', error.message);
  if (error.code) {
    console.error('Error code:', error.code);
  }
  if (error.signal) {
    console.error('Error signal:', error.signal);
  }
  if (error.stdout) {
    console.error('Stdout:', error.stdout.toString());
  }
  if (error.stderr) {
    console.error('Stderr:', error.stderr.toString());
  }
  process.exit(1);
}