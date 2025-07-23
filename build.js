#!/usr/bin/env node

const { execSync } = require('child_process');

try {
  console.log('Building web app...');
  console.log('Node version:', process.version);
  console.log('Current directory:', process.cwd());
  
  // Set environment variables for the build
  process.env.EXPO_USE_FAST_RESOLVER = 'true';
  process.env.NODE_ENV = 'production';
  
  execSync('npx expo export --platform web', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      EXPO_USE_FAST_RESOLVER: 'true',
      NODE_ENV: 'production'
    }
  });
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error.message);
  console.error('Error details:', error);
  process.exit(1);
}