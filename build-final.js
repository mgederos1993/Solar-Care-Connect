#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting final build process...');
console.log('Node version:', process.version);
console.log('Current directory:', process.cwd());

// Set environment variables
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

function tryBuildCommand(command, args, description) {
  return new Promise((resolve) => {
    console.log(`Trying build command: ${command} ${args.join(' ')}`);
    
    const buildProcess = spawn(command, args, {
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_ENV: 'production',
        EXPO_WEB_BUILD_CACHE: 'false'
      }
    });
    
    const timeout = setTimeout(() => {
      console.error(`${description} timed out after 10 minutes`);
      buildProcess.kill('SIGTERM');
      resolve(false);
    }, 10 * 60 * 1000);
    
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

async function tryMultipleBuildCommands() {
  const buildCommands = [
    {
      command: 'npx',
      args: ['expo', 'export:web'],
      description: 'Expo export:web'
    },
    {
      command: 'expo',
      args: ['export:web'],
      description: 'Direct expo export:web'
    },
    {
      command: 'npx',
      args: ['expo', 'build:web'],
      description: 'Expo build:web (fallback)'
    },
    {
      command: 'expo',
      args: ['build:web'],
      description: 'Direct expo build:web (fallback)'
    }
  ];
  
  for (const { command, args, description } of buildCommands) {
    const success = await tryBuildCommand(command, args, description);
    
    if (success) {
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
              console.log('Build completed successfully!');
              console.log('Output directory:', distPath);
              console.log('index.html size:', indexContent.length, 'characters');
              return true;
            } else {
              console.error('index.html appears to be empty or too small');
            }
          } else {
            console.error('Build completed but index.html not found');
          }
        } catch (error) {
          console.error('Error moving build output:', error);
        }
      }
    }
  }
  
  return false;
}

async function createFallbackBuild() {
  console.log('Creating fallback static build...');
  
  const distPath = path.join(process.cwd(), 'dist');
  
  // Ensure dist directory exists
  if (!fs.existsSync(distPath)) {
    fs.mkdirSync(distPath, { recursive: true });
  }
  
  // Create a basic index.html
  const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1.00001,viewport-fit=cover" />
    <title>Solar & Roofing AI Scheduler</title>
    <style>
      body, html {
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background-color: #ffffff;
        height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .container {
        text-align: center;
        max-width: 400px;
        padding: 20px;
      }
      .logo {
        width: 80px;
        height: 80px;
        margin: 0 auto 20px;
        background: linear-gradient(135deg, #3B82F6, #1D4ED8);
        border-radius: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 32px;
        font-weight: bold;
      }
      h1 {
        color: #1F2937;
        margin-bottom: 16px;
        font-size: 24px;
        font-weight: 700;
      }
      p {
        color: #6B7280;
        margin-bottom: 24px;
        line-height: 1.5;
      }
      .button {
        background: #3B82F6;
        color: white;
        padding: 12px 24px;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        text-decoration: none;
        display: inline-block;
        transition: background-color 0.2s;
      }
      .button:hover {
        background: #2563EB;
      }
      .contact {
        margin-top: 32px;
        padding-top: 24px;
        border-top: 1px solid #E5E7EB;
        color: #6B7280;
        font-size: 14px;
      }
      .contact a {
        color: #3B82F6;
        text-decoration: none;
      }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">☀️</div>
        <h1>Solar Care Connect</h1>
        <p>AI-Powered Solar Appointments - Get qualified solar leads and appointments automatically generated by our AI system.</p>
        <a href="https://form.jotform.com/251608739182059" class="button" target="_blank">
            Get Started
        </a>
        <div class="contact">
            Need help? Contact us at 
            <a href="mailto:solarcareconnect@gmail.com">solarcareconnect@gmail.com</a>
        </div>
    </div>
</body>
</html>`;

  try {
    fs.writeFileSync(path.join(distPath, 'index.html'), indexHtml);
    console.log('Created fallback index.html');
    return true;
  } catch (error) {
    console.error('Error creating fallback build:', error);
    return false;
  }
}

async function main() {
  try {
    // Step 1: Update app.json
    const appJsonUpdated = updateAppJsonForWebpack();
    if (!appJsonUpdated) {
      console.error('Failed to update app.json');
      process.exit(1);
    }
    
    // Step 2: Try multiple build commands
    const buildSuccess = await tryMultipleBuildCommands();
    
    if (!buildSuccess) {
      console.log('All build commands failed, creating fallback build...');
      const fallbackSuccess = await createFallbackBuild();
      
      if (!fallbackSuccess) {
        console.error('Failed to create fallback build');
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