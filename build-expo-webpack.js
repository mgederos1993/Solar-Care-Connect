#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting Expo webpack build process...');
console.log('Node version:', process.version);
console.log('Current directory:', process.cwd());

// Set environment variables for webpack build
process.env.NODE_ENV = 'production';
process.env.BABEL_ENV = 'production';
process.env.EXPO_PLATFORM = 'web';
process.env.EXPO_PUBLIC_USE_STATIC = 'true';
process.env.EXPO_USE_STATIC = 'true';
process.env.SKIP_PREFLIGHT_CHECK = 'true';
process.env.NODE_OPTIONS = '--max-old-space-size=4096';
process.env.CI = '1';

function updateAppJsonForWebpack() {
  console.log('Updating app.json for webpack build...');
  
  let appConfig;
  try {
    const appConfigContent = fs.readFileSync('app.json', 'utf8');
    appConfig = JSON.parse(appConfigContent);
  } catch (error) {
    console.error('Error reading app.json:', error.message);
    return false;
  }
  
  // Ensure web configuration with webpack
  if (!appConfig.expo.web) {
    appConfig.expo.web = {};
  }
  
  // Force webpack bundler
  appConfig.expo.web.bundler = 'webpack';
  appConfig.expo.web.favicon = './assets/images/favicon.png';
  
  try {
    fs.writeFileSync('app.json', JSON.stringify(appConfig, null, 2));
    console.log('Updated app.json for webpack build');
    return true;
  } catch (error) {
    console.error('Error writing app.json:', error.message);
    return false;
  }
}

function startExpoWebpackBuild() {
  console.log('Starting Expo webpack build...');
  
  const buildProcess = spawn('npx', ['expo', 'export:web'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'production',
      EXPO_WEB_BUILD_CACHE: 'false'
    }
  });
  
  const timeout = setTimeout(() => {
    console.error('Build process timed out after 15 minutes');
    buildProcess.kill('SIGTERM');
    process.exit(1);
  }, 15 * 60 * 1000);
  
  buildProcess.on('close', (code) => {
    clearTimeout(timeout);
    
    if (code === 0) {
      // Move web-build to dist
      const webBuildPath = path.join(process.cwd(), 'web-build');
      const distPath = path.join(process.cwd(), 'dist');
      
      if (fs.existsSync(webBuildPath)) {
        try {
          // Remove existing dist directory
          if (fs.existsSync(distPath)) {
            fs.rmSync(distPath, { recursive: true, force: true });
          }
          
          // Rename web-build to dist
          fs.renameSync(webBuildPath, distPath);
          
          const indexPath = path.join(distPath, 'index.html');
          if (fs.existsSync(indexPath)) {
            console.log('Build completed successfully!');
            console.log('Output directory:', distPath);
            
            // Verify the index.html has content
            const indexContent = fs.readFileSync(indexPath, 'utf8');
            if (indexContent.length > 100) {
              console.log('index.html appears to have content');
              process.exit(0);
            } else {
              console.error('index.html appears to be empty or too small');
              process.exit(1);
            }
          } else {
            console.error('Build completed but index.html not found');
            process.exit(1);
          }
        } catch (error) {
          console.error('Error moving build output:', error);
          process.exit(1);
        }
      } else {
        console.error('Build completed but web-build directory not found');
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

async function main() {
  try {
    // Step 1: Update app.json for webpack
    const appJsonUpdated = updateAppJsonForWebpack();
    if (!appJsonUpdated) {
      console.error('Failed to update app.json');
      process.exit(1);
    }
    
    // Step 2: Start Expo webpack build
    startExpoWebpackBuild();
    
  } catch (error) {
    console.error('Build process failed:', error);
    process.exit(1);
  }
}

process.on('SIGTERM', () => {
  console.log('Received SIGTERM, exiting gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, exiting gracefully...');
  process.exit(0);
});

main();