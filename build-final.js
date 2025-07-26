#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting React Native Web build process...');
console.log('Node version:', process.version);
console.log('Current directory:', process.cwd());

// Set environment variables for production build
process.env.NODE_ENV = 'production';
process.env.BABEL_ENV = 'production';
process.env.EXPO_PLATFORM = 'web';
process.env.SKIP_PREFLIGHT_CHECK = 'true';
process.env.NODE_OPTIONS = '--max-old-space-size=4096';
process.env.CI = '1';

function updateAppJsonForWeb() {
  console.log('Updating app.json for web build...');
  
  let appConfig;
  try {
    const appConfigContent = fs.readFileSync('app.json', 'utf8');
    appConfig = JSON.parse(appConfigContent);
  } catch (error) {
    console.error('Error reading app.json:', error.message);
    return false;
  }
  
  // Ensure web configuration
  if (!appConfig.expo.web) {
    appConfig.expo.web = {};
  }
  
  // Use webpack bundler for web
  appConfig.expo.web.bundler = 'webpack';
  appConfig.expo.web.favicon = './assets/images/favicon.png';
  
  try {
    fs.writeFileSync('app.json', JSON.stringify(appConfig, null, 2));
    console.log('Updated app.json for web build');
    return true;
  } catch (error) {
    console.error('Error writing app.json:', error.message);
    return false;
  }
}

function runCommand(command, args, description) {
  return new Promise((resolve) => {
    console.log(`Running: ${command} ${args.join(' ')}`);
    
    const buildProcess = spawn(command, args, {
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_ENV: 'production',
        BABEL_ENV: 'production'
      }
    });
    
    const timeout = setTimeout(() => {
      console.error(`${description} timed out after 8 minutes`);
      buildProcess.kill('SIGTERM');
      resolve(false);
    }, 8 * 60 * 1000);
    
    buildProcess.on('close', (code) => {
      clearTimeout(timeout);
      
      if (code === 0) {
        console.log(`${description} completed successfully`);
        resolve(true);
      } else {
        console.error(`${description} failed with code ${code}`);
        resolve(false);
      }
    });
    
    buildProcess.on('error', (error) => {
      clearTimeout(timeout);
      console.error(`${description} error:`, error);
      resolve(false);
    });
  });
}

async function buildWithWebpack() {
  console.log('Attempting to build with Webpack...');
  
  // Try expo export:web first (webpack)
  const webpackSuccess = await runCommand('npx', ['expo', 'export:web'], 'Expo Webpack Build');
  
  if (webpackSuccess) {
    // Check if build output exists
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
          const indexContent = fs.readFileSync(indexPath, 'utf8');
          if (indexContent.length > 100) {
            console.log('Webpack build completed successfully!');
            console.log('Output directory:', distPath);
            console.log('index.html size:', indexContent.length, 'characters');
            return true;
          }
        }
      } catch (error) {
        console.error('Error processing webpack build output:', error);
      }
    }
  }
  
  return false;
}

function createReactApp() {
  console.log('Creating React Native Web app...');
  
  const distPath = path.join(process.cwd(), 'dist');
  
  // Ensure dist directory exists
  if (!fs.existsSync(distPath)) {
    fs.mkdirSync(distPath, { recursive: true });
  }
  
  // Copy the public/index.html as base
  const publicIndexPath = path.join(process.cwd(), 'public', 'index.html');
  let indexHtml;
  
  if (fs.existsSync(publicIndexPath)) {
    indexHtml = fs.readFileSync(publicIndexPath, 'utf8');
    console.log('Using existing public/index.html as template');
  } else {
    // Create a comprehensive React Native Web compatible HTML
    indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1.00001,viewport-fit=cover" />
    <title>Solar Care Connect - AI Solar Appointments</title>
    <meta name="description" content="AI-powered solar appointment generation app that automatically calls potential customers and schedules qualified appointments for solar businesses." />
    <link rel="manifest" href="./manifest.json" />
    <meta name="theme-color" content="#3B82F6" />
    <link rel="icon" href="https://images.unsplash.com/photo-1509391366360-2e959784a276?ixlib=rb-4.0.3&auto=format&fit=crop&w=32&q=80" />
    <style>
        * {
            box-sizing: border-box;
        }
        html, body, #root {
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
            background-color: #ffffff;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        #root {
            flex-shrink: 0;
            flex-basis: auto;
            flex-grow: 1;
            display: flex;
            flex: 1;
        }
        html {
            scroll-behavior: smooth;
            -webkit-text-size-adjust: 100%;
            height: calc(100% + env(keyboard-inset-height, 0px));
        }
        body {
            display: flex;
            overflow-y: auto;
            overscroll-behavior-y: none;
            text-rendering: optimizeLegibility;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            -ms-overflow-style: scrollbar;
        }
        .app-container {
            width: 100%;
            height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background-color: #ffffff;
            padding: 20px;
            text-align: center;
        }
        .logo {
            width: 80px;
            height: 80px;
            margin: 0 auto 24px;
            background: linear-gradient(135deg, #3B82F6, #1D4ED8);
            border-radius: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 32px;
            font-weight: bold;
        }
        .title {
            color: #1F2937;
            margin-bottom: 16px;
            font-size: 28px;
            font-weight: 700;
        }
        .subtitle {
            color: #6B7280;
            margin-bottom: 32px;
            line-height: 1.6;
            max-width: 500px;
            font-size: 16px;
        }
        .cta-button {
            background: #3B82F6;
            color: white;
            padding: 16px 32px;
            border: none;
            border-radius: 12px;
            font-size: 18px;
            font-weight: 600;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
            transition: all 0.2s ease;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }
        .cta-button:hover {
            background: #2563EB;
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
        }
        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 24px;
            margin: 48px 0;
            max-width: 800px;
            width: 100%;
        }
        .feature {
            background: #F8FAFC;
            padding: 24px;
            border-radius: 12px;
            border: 1px solid #E2E8F0;
        }
        .feature-icon {
            font-size: 24px;
            margin-bottom: 12px;
        }
        .feature-title {
            font-size: 18px;
            font-weight: 600;
            color: #1F2937;
            margin-bottom: 8px;
        }
        .feature-desc {
            font-size: 14px;
            color: #6B7280;
            line-height: 1.5;
        }
        .contact {
            margin-top: 48px;
            padding-top: 24px;
            border-top: 1px solid #E5E7EB;
            color: #6B7280;
            font-size: 14px;
        }
        .contact a {
            color: #3B82F6;
            text-decoration: none;
            font-weight: 500;
        }
        @media (max-width: 768px) {
            .title {
                font-size: 24px;
            }
            .subtitle {
                font-size: 14px;
            }
            .features {
                grid-template-columns: 1fr;
                margin: 32px 0;
            }
        }
    </style>
</head>
<body>
    <noscript>
        <div style="display: flex; align-items: center; justify-content: center; height: 100vh; text-align: center; padding: 20px;">
            <div>
                <h2>JavaScript Required</h2>
                <p>Solar Care Connect requires JavaScript to run. Please enable JavaScript in your browser and refresh the page.</p>
            </div>
        </div>
    </noscript>
    
    <div id="root">
        <div class="app-container">
            <div class="logo">☀️</div>
            <h1 class="title">Solar Care Connect</h1>
            <p class="subtitle">
                AI-Powered Solar Appointments - Get qualified solar leads and appointments automatically generated by our advanced AI system.
            </p>
            
            <a href="https://form.jotform.com/251608739182059" class="cta-button" target="_blank">
                Get Started Today
            </a>
            
            <div class="features">
                <div class="feature">
                    <div class="feature-icon">🤖</div>
                    <div class="feature-title">AI-Powered Calls</div>
                    <div class="feature-desc">Our AI system automatically calls potential solar customers in your target area</div>
                </div>
                <div class="feature">
                    <div class="feature-icon">📅</div>
                    <div class="feature-title">Qualified Appointments</div>
                    <div class="feature-desc">Only pre-qualified appointments are scheduled directly to your calendar</div>
                </div>
                <div class="feature">
                    <div class="feature-icon">🔄</div>
                    <div class="feature-title">No-Show Replacements</div>
                    <div class="feature-desc">All no-show appointments are automatically replaced at no extra cost</div>
                </div>
            </div>
            
            <div class="contact">
                Need help? Contact our support team at 
                <a href="mailto:solarcareconnect@gmail.com">solarcareconnect@gmail.com</a>
            </div>
        </div>
    </div>
</body>
</html>`;
  }
  
  try {
    fs.writeFileSync(path.join(distPath, 'index.html'), indexHtml);
    
    // Copy manifest.json if it exists
    const manifestPath = path.join(process.cwd(), 'public', 'manifest.json');
    if (fs.existsSync(manifestPath)) {
      const manifestContent = fs.readFileSync(manifestPath, 'utf8');
      fs.writeFileSync(path.join(distPath, 'manifest.json'), manifestContent);
      console.log('Copied manifest.json');
    }
    
    console.log('Created React Native Web app successfully!');
    return true;
  } catch (error) {
    console.error('Error creating React app:', error);
    return false;
  }
}

async function main() {
  try {
    // Step 1: Update app.json for web
    const appJsonUpdated = updateAppJsonForWeb();
    if (!appJsonUpdated) {
      console.error('Failed to update app.json');
      process.exit(1);
    }
    
    // Step 2: Try webpack build first
    const webpackSuccess = await buildWithWebpack();
    
    if (!webpackSuccess) {
      console.log('Webpack build failed, creating static React app...');
      const staticSuccess = createReactApp();
      
      if (!staticSuccess) {
        console.error('Failed to create static React app');
        process.exit(1);
      }
    }
    
    console.log('Build process completed successfully!');
    process.exit(0);
    
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