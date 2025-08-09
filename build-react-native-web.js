#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Building React Native Web app...');
console.log('Node version:', process.version);
console.log('Current directory:', process.cwd());

function preprocessFiles() {
  console.log('Pre-processing files to handle import.meta...');
  
  const directories = ['./app', './components', './constants', './store', './types', './utils'];
  
  directories.forEach(dir => {
    if (fs.existsSync(dir)) {
      console.log(`Processing directory: ${dir}`);
      processDirectory(dir);
    }
  });
  
  // Process expo-router specifically
  console.log('Processing expo-router for import.meta...');
  const nodeModulesPath = './node_modules/expo-router';
  if (fs.existsSync(nodeModulesPath)) {
    processDirectory(nodeModulesPath);
  }
}

function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath, { withFileTypes: true });
  
  files.forEach(file => {
    const fullPath = path.join(dirPath, file.name);
    
    if (file.isDirectory()) {
      processDirectory(fullPath);
    } else if (file.name.endsWith('.js') || file.name.endsWith('.ts') || file.name.endsWith('.tsx')) {
      try {
        let content = fs.readFileSync(fullPath, 'utf8');
        
        // Replace import.meta.hot with a safe fallback
        if (content.includes('import.meta.hot')) {
          content = content.replace(
            /import\.meta\.hot/g,
            '(typeof module !== "undefined" && module.hot)'
          );
          fs.writeFileSync(fullPath, content);
        }
        
        // Replace other import.meta usage
        if (content.includes('import.meta')) {
          content = content.replace(
            /import\.meta/g,
            '({})'
          );
          fs.writeFileSync(fullPath, content);
        }
      } catch (_error) {
        // Ignore files we can't process
      }
    }
  });
}

function createWebpackConfig() {
  console.log('Creating webpack.config.js...');
  
  const webpackConfig = `
const path = require('path');
const { createExpoWebpackConfigAsync } = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync({
    ...env,
    babel: {
      dangerouslyAddModulePathsToTranspile: [
        '@expo/vector-icons',
        'react-native-svg',
        'expo-router',
        'expo-constants',
        'expo-modules-core',
        'lucide-react-native'
      ]
    }
  }, argv);
  
  // Add fallbacks for Node.js modules
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "crypto": false,
    "stream": false,
    "buffer": false,
    "util": false,
    "assert": false,
    "url": false,
    "fs": false,
    "path": false
  };
  
  // Handle import.meta
  config.module.rules.push({
    test: /\.(js|jsx|ts|tsx)$/,
    use: {
      loader: 'babel-loader',
      options: {
        presets: ['babel-preset-expo'],
        plugins: [
          ['babel-plugin-transform-import-meta', {
            module: 'ES6'
          }]
        ]
      }
    },
    exclude: /node_modules\/(?!(expo-router|@expo|expo-constants|expo-modules-core)\/)/
  });
  
  return config;
};
`;
  
  fs.writeFileSync('webpack.config.js', webpackConfig);
  console.log('Created webpack.config.js');
}

function createAppJson() {
  console.log('Creating temporary app.json for web build...');
  
  const appConfig = {
    "expo": {
      "name": "Solar Care Connect",
      "slug": "solar-care-connect",
      "version": "1.0.0",
      "orientation": "portrait",
      "icon": "./assets/images/icon.png",
      "userInterfaceStyle": "light",
      "splash": {
        "image": "./assets/images/splash-icon.png",
        "resizeMode": "contain",
        "backgroundColor": "#ffffff"
      },
      "assetBundlePatterns": [
        "**/*"
      ],
      "ios": {
        "supportsTablet": true
      },
      "android": {
        "adaptiveIcon": {
          "foregroundImage": "./assets/images/adaptive-icon.png",
          "backgroundColor": "#ffffff"
        }
      },
      "web": {
        "bundler": "webpack",
        "favicon": "./assets/images/favicon.png"
      },
      "platforms": ["ios", "android", "web"]
    }
  };
  
  // Backup original app.json if it exists
  if (fs.existsSync('app.json')) {
    fs.copyFileSync('app.json', 'app.json.backup');
  }
  
  fs.writeFileSync('app.json', JSON.stringify(appConfig, null, 2));
  console.log('Updated app.json for web build');
}

function buildApp() {
  console.log('Starting Expo web build...');
  
  try {
    // Use the correct Expo command for web export
    console.log('Running: npx expo export:web');
    execSync('npx expo export:web', { 
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_ENV: 'production',
        BABEL_ENV: 'production',
        EXPO_PLATFORM: 'web'
      }
    });
    
    // Move web-build to dist if it exists
    if (fs.existsSync('web-build')) {
      console.log('Moving web-build to dist...');
      if (fs.existsSync('dist')) {
        execSync('rm -rf dist');
      }
      fs.renameSync('web-build', 'dist');
    }
    
    console.log('✅ Build completed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    return false;
  }
}

function cleanup() {
  console.log('Cleaning up temporary files...');
  
  // Restore original app.json if backup exists
  if (fs.existsSync('app.json.backup')) {
    fs.renameSync('app.json.backup', 'app.json');
    console.log('Restored original app.json');
  }
  
  // Remove temporary webpack config
  if (fs.existsSync('webpack.config.js')) {
    fs.unlinkSync('webpack.config.js');
    console.log('Cleaned up temporary webpack.config.js');
  }
}

function main() {
  try {
    preprocessFiles();
    createAppJson();
    createWebpackConfig();
    
    const success = buildApp();
    
    cleanup();
    
    if (success) {
      console.log('🎉 Build process completed successfully!');
      process.exit(0);
    } else {
      console.error('💥 Build process failed');
      process.exit(1);
    }
  } catch (error) {
    console.error('💥 Build process failed:', error);
    cleanup();
    process.exit(1);
  }
}

main();