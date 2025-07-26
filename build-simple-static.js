#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting simple static build process...');
console.log('Node version:', process.version);
console.log('Current directory:', process.cwd());

// Set environment variables for static build
process.env.NODE_ENV = 'production';
process.env.BABEL_ENV = 'production';
process.env.EXPO_PLATFORM = 'web';
process.env.EXPO_PUBLIC_USE_STATIC = 'true';
process.env.EXPO_USE_STATIC = 'true';
process.env.SKIP_PREFLIGHT_CHECK = 'true';
process.env.NODE_OPTIONS = '--max-old-space-size=4096';
process.env.CI = '1';

// Disable all Metro-related features
process.env.EXPO_NO_METRO = '1';
process.env.EXPO_USE_WEBPACK = '1';

function createWebpackConfig() {
  console.log('Creating webpack.config.js...');
  
  const webpackConfig = `const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync({
    ...env,
    mode: 'production',
    https: false,
  }, argv);
  
  // Ensure output directory is dist
  config.output.path = path.resolve(__dirname, 'dist');
  
  // Add fallbacks for Node.js modules
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "crypto": false,
    "stream": false,
    "assert": false,
    "http": false,
    "https": false,
    "os": false,
    "url": false,
    "zlib": false,
    "path": false,
    "fs": false,
  };
  
  // Ignore Node.js specific modules
  config.externals = {
    ...config.externals,
    'react-native': 'react-native-web',
  };
  
  return config;
};
`;

  try {
    fs.writeFileSync('webpack.config.js', webpackConfig);
    console.log('Created webpack.config.js');
    return true;
  } catch (error) {
    console.warn('Warning: Could not create webpack.config.js:', error.message);
    return false;
  }
}

function createBabelConfig() {
  console.log('Creating .babelrc...');
  
  const babelConfig = {
    "presets": [
      ["babel-preset-expo", { "web": { "useTransformReactJSXExperimental": true } }],
      ["@babel/preset-env", {
        "targets": {
          "browsers": ["last 2 versions", "ie >= 11"]
        }
      }]
    ],
    "plugins": [
      ["babel-plugin-transform-import-meta", {
        "module": "ES6"
      }],
      ["module-resolver", {
        "alias": {
          "@": "./",
          "^react-native$": "react-native-web"
        }
      }]
    ]
  };

  try {
    fs.writeFileSync('.babelrc', JSON.stringify(babelConfig, null, 2));
    console.log('Created .babelrc');
    return true;
  } catch (error) {
    console.warn('Warning: Could not create .babelrc:', error.message);
    return false;
  }
}

function createIndexHtml() {
  console.log('Creating public/index.html...');
  
  // Ensure public directory exists
  if (!fs.existsSync('public')) {
    fs.mkdirSync('public', { recursive: true });
  }
  
  const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1.00001,viewport-fit=cover" />
    <title>Solar & Roofing AI Scheduler</title>
    <style>
      #root, body, html {
        width: 100%;
        height: 100%;
        margin: 0;
        padding: 0;
        background-color: #ffffff;
      }
      #root {
        display: flex;
        flex: 1;
      }
      .expo-loading-indicator {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
    </style>
</head>
<body>
    <div id="root">
        <div class="expo-loading-indicator">
            <div>Loading...</div>
        </div>
    </div>
</body>
</html>`;

  try {
    fs.writeFileSync('public/index.html', indexHtml);
    console.log('Created public/index.html');
    return true;
  } catch (error) {
    console.warn('Warning: Could not create public/index.html:', error.message);
    return false;
  }
}

function updateAppJson() {
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

function startWebpackBuild() {
  console.log('Starting webpack build...');
  
  const buildProcess = spawn('npx', ['webpack', '--mode=production'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'production'
    }
  });
  
  const timeout = setTimeout(() => {
    console.error('Build process timed out after 10 minutes');
    buildProcess.kill('SIGTERM');
    cleanupAndExit(1);
  }, 10 * 60 * 1000);
  
  buildProcess.on('close', (code) => {
    clearTimeout(timeout);
    
    if (code === 0) {
      const distPath = path.join(process.cwd(), 'dist');
      const indexPath = path.join(distPath, 'index.html');
      
      if (fs.existsSync(indexPath)) {
        console.log('Build completed successfully!');
        console.log('Output directory:', distPath);
        cleanupAndExit(0);
      } else {
        console.error('Build completed but index.html not found');
        cleanupAndExit(1);
      }
    } else {
      console.error(`Build process exited with code ${code}`);
      cleanupAndExit(code);
    }
  });
  
  buildProcess.on('error', (error) => {
    clearTimeout(timeout);
    console.error('Build process error:', error);
    cleanupAndExit(1);
  });
}

function cleanupAndExit(code) {
  const filesToCleanup = ['webpack.config.js', '.babelrc'];
  
  for (const file of filesToCleanup) {
    if (fs.existsSync(file)) {
      try {
        fs.unlinkSync(file);
        console.log(`Cleaned up temporary ${file}`);
      } catch (error) {
        console.warn(`Warning: Could not clean up ${file}:`, error.message);
      }
    }
  }
  
  process.exit(code);
}

async function main() {
  try {
    // Step 1: Create webpack config
    const webpackConfigCreated = createWebpackConfig();
    if (!webpackConfigCreated) {
      console.error('Failed to create webpack config');
      cleanupAndExit(1);
    }
    
    // Step 2: Create babel config
    const babelConfigCreated = createBabelConfig();
    if (!babelConfigCreated) {
      console.error('Failed to create babel config');
      cleanupAndExit(1);
    }
    
    // Step 3: Create index.html
    const indexHtmlCreated = createIndexHtml();
    if (!indexHtmlCreated) {
      console.error('Failed to create index.html');
      cleanupAndExit(1);
    }
    
    // Step 4: Update app.json
    const appJsonUpdated = updateAppJson();
    if (!appJsonUpdated) {
      console.error('Failed to update app.json');
      cleanupAndExit(1);
    }
    
    // Step 5: Start webpack build
    startWebpackBuild();
    
  } catch (error) {
    console.error('Build process failed:', error);
    cleanupAndExit(1);
  }
}

process.on('SIGTERM', () => {
  console.log('Received SIGTERM, exiting gracefully...');
  cleanupAndExit(0);
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, exiting gracefully...');
  cleanupAndExit(0);
});

main();