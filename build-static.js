#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting static build process...');
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
process.env.EXPO_USE_FAST_RESOLVER = 'true';
process.env.EXPO_NO_DOTENV = '1';
process.env.EXPO_CLEAR_CACHE = 'true';

function preprocessImportMeta() {
  console.log('Pre-processing files to handle import.meta...');
  
  const processFile = (filePath) => {
    if (!fs.existsSync(filePath)) return;
    
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;
      
      // Replace import.meta.env with process.env
      if (content.includes('import.meta.env')) {
        content = content.replace(/import\.meta\.env/g, 'process.env');
        modified = true;
      }
      
      // Replace import.meta.url with a fallback
      if (content.includes('import.meta.url')) {
        content = content.replace(/import\.meta\.url/g, '""');
        modified = true;
      }
      
      // Replace import.meta.hot with undefined
      if (content.includes('import.meta.hot')) {
        content = content.replace(/import\.meta\.hot/g, 'undefined');
        modified = true;
      }
      
      // Replace any remaining import.meta usages
      if (content.includes('import.meta')) {
        content = content.replace(/import\.meta/g, '{}');
        modified = true;
      }
      
      if (modified) {
        fs.writeFileSync(filePath, content);
        console.log(`Processed import.meta in: ${filePath}`);
      }
    } catch (error) {
      console.warn(`Warning: Could not process file ${filePath}:`, error.message);
    }
  };
  
  const processDirectory = (dir) => {
    if (!fs.existsSync(dir)) return;
    
    try {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        
        try {
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules' && item !== 'dist') {
            processDirectory(fullPath);
          } else if (stat.isFile() && (item.endsWith('.js') || item.endsWith('.ts') || item.endsWith('.tsx') || item.endsWith('.jsx'))) {
            processFile(fullPath);
          }
        } catch (statError) {
          console.warn(`Warning: Could not stat ${fullPath}:`, statError.message);
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not read directory ${dir}:`, error.message);
    }
  };
  
  // Process all relevant directories
  const dirsToProcess = ['./app', './components', './constants', './store', './types', './utils'];
  
  for (const dir of dirsToProcess) {
    if (fs.existsSync(dir)) {
      console.log(`Processing directory: ${dir}`);
      processDirectory(dir);
    }
  }
  
  // Also process node_modules/expo-router if it exists and contains import.meta
  const expoRouterPath = './node_modules/expo-router';
  if (fs.existsSync(expoRouterPath)) {
    console.log('Processing expo-router for import.meta...');
    processDirectory(expoRouterPath);
  }
}

function createAppJson() {
  console.log('Creating temporary app.json for web build...');
  
  const appJsonPath = './app.json';
  let appConfig = {};
  
  // Read existing app.json if it exists
  if (fs.existsSync(appJsonPath)) {
    try {
      const content = fs.readFileSync(appJsonPath, 'utf8');
      appConfig = JSON.parse(content);
    } catch (error) {
      console.warn('Warning: Could not parse existing app.json:', error.message);
    }
  }
  
  // Ensure web configuration with webpack bundler to avoid metro issues
  appConfig.expo = appConfig.expo || {};
  appConfig.expo.web = appConfig.expo.web || {};
  appConfig.expo.web.bundler = 'webpack';
  appConfig.expo.web.build = appConfig.expo.web.build || {};
  appConfig.expo.web.build.babel = appConfig.expo.web.build.babel || {};
  appConfig.expo.web.build.babel.dangerouslyAllowSyntaxErrors = true;
  
  try {
    fs.writeFileSync(appJsonPath, JSON.stringify(appConfig, null, 2));
    console.log('Updated app.json for web build');
    return true;
  } catch (error) {
    console.warn('Warning: Could not update app.json:', error.message);
    return false;
  }
}

function createMetroConfig() {
  console.log('Creating custom metro.config.js...');
  
  const metroConfigContent = `
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Disable terminal reporter to avoid export issues
config.reporter = {
  update: () => {},
};

// Add web support
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Handle import.meta
config.transformer.babelTransformerPath = require.resolve('metro-react-native-babel-transformer');

module.exports = withNativeWind(config, { input: './global.css' });
`;
  
  try {
    fs.writeFileSync('./metro.config.js', metroConfigContent);
    console.log('Created custom metro.config.js');
    return true;
  } catch (error) {
    console.warn('Warning: Could not create metro.config.js:', error.message);
    return false;
  }
}

function startStaticBuild() {
  console.log('Starting static build...');
  
  // Set additional environment variables to disable problematic features
  process.env.EXPO_NO_METRO_TERMINAL_REPORTER = '1';
  process.env.METRO_NO_TERMINAL_REPORTER = '1';
  process.env.METRO_NO_TERMINAL = '1';
  process.env.CI = '1';
  
  // Use the correct export command with web bundler
  const command = 'npx';
  const args = ['expo', 'export:web', '--output-dir', 'dist'];
  
  console.log(`Running build command: ${command} ${args.join(' ')}`);
  
  const buildProcess = spawn(command, args, {
    stdio: 'inherit',
    env: process.env
  });

  // Set a timeout to kill the process if it hangs
  const timeout = setTimeout(() => {
    console.error('Build process timed out after 15 minutes');
    buildProcess.kill('SIGTERM');
    process.exit(1);
  }, 15 * 60 * 1000); // 15 minutes

  buildProcess.on('close', (code) => {
    clearTimeout(timeout);
    
    if (code === 0) {
      const distPath = path.join(process.cwd(), 'dist');
      const indexPath = path.join(distPath, 'index.html');
      
      if (fs.existsSync(indexPath)) {
        console.log('Build completed successfully!');
        console.log('Output directory:', distPath);
        
        // Clean up temporary metro config
        try {
          if (fs.existsSync('./metro.config.js')) {
            fs.unlinkSync('./metro.config.js');
            console.log('Cleaned up temporary metro.config.js');
          }
        } catch (error) {
          console.warn('Warning: Could not clean up metro.config.js:', error.message);
        }
        
        process.exit(0);
      } else {
        console.error('Build completed but no index.html found in dist directory');
        process.exit(1);
      }
    } else {
      console.error(`Build command failed with code ${code}`);
      
      // Clean up temporary metro config on failure
      try {
        if (fs.existsSync('./metro.config.js')) {
          fs.unlinkSync('./metro.config.js');
          console.log('Cleaned up temporary metro.config.js');
        }
      } catch (error) {
        console.warn('Warning: Could not clean up metro.config.js:', error.message);
      }
      
      process.exit(1);
    }
  });

  buildProcess.on('error', (error) => {
    clearTimeout(timeout);
    console.error(`Build command error: ${error.message}`);
    
    // Clean up temporary metro config on error
    try {
      if (fs.existsSync('./metro.config.js')) {
        fs.unlinkSync('./metro.config.js');
        console.log('Cleaned up temporary metro.config.js');
      }
    } catch (error) {
      console.warn('Warning: Could not clean up metro.config.js:', error.message);
    }
    
    process.exit(1);
  });
}

// Main execution
async function main() {
  try {
    // Step 1: Preprocess import.meta
    preprocessImportMeta();
    
    // Step 2: Update app.json for web build
    createAppJson();
    
    // Step 3: Create custom metro config to avoid terminal reporter issues
    createMetroConfig();
    
    // Step 4: Start the static build
    startStaticBuild();
    
  } catch (error) {
    console.error('Build process failed:', error);
    process.exit(1);
  }
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

main();