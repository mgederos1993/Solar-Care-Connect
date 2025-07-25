#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting web build with Metro bundler...');
console.log('Node version:', process.version);
console.log('Current directory:', process.cwd());

// Set environment variables to optimize for web builds
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
process.env.CI = '1';

// Disable Metro terminal reporter completely
process.env.EXPO_NO_METRO_TERMINAL_REPORTER = 'true';
process.env.METRO_NO_TERMINAL_REPORTER = 'true';
process.env.METRO_NO_TERMINAL = '1';
process.env.EXPO_NO_METRO_LAZY = '1';
process.env.EXPO_NO_FLIPPER = '1';
process.env.EXPO_USE_METRO_REQUIRE = 'true';
process.env.EXPO_NO_IMPORT_META = 'true';
process.env.EXPO_SKIP_MANIFEST_VALIDATION_WARNINGS = 'true';
process.env.EXPO_WEB_BUILD_CACHE = 'false';

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

function createWebAppConfig() {
  console.log('Creating temporary app.json for web build...');
  
  let appConfig;
  try {
    const appConfigContent = fs.readFileSync('app.json', 'utf8');
    appConfig = JSON.parse(appConfigContent);
  } catch (error) {
    console.error('Error reading app.json:', error.message);
    return false;
  }
  
  // Ensure web configuration with metro bundler
  if (!appConfig.expo.web) {
    appConfig.expo.web = {};
  }
  
  // Set bundler to metro for web platform
  appConfig.expo.web.bundler = 'metro';
  
  // Ensure favicon is set
  if (!appConfig.expo.web.favicon) {
    appConfig.expo.web.favicon = './assets/images/favicon.png';
  }
  
  try {
    fs.writeFileSync('app.json', JSON.stringify(appConfig, null, 2));
    console.log('Updated app.json for web build with Metro bundler');
    return true;
  } catch (error) {
    console.error('Error writing app.json:', error.message);
    return false;
  }
}

function createMetroConfig() {
  console.log('Creating metro.config.js...');
  
  const metroConfig = `const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure web platform is supported
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Add web extensions
config.resolver.sourceExts = [...(config.resolver.sourceExts || []), 'web.js', 'web.ts', 'web.tsx'];

// Disable terminal reporter to avoid export issues in CI/CD
config.reporter = {
  update: () => {},
};

// Enable package exports support
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
`;

  try {
    fs.writeFileSync('metro.config.js', metroConfig);
    console.log('Created metro.config.js');
    return true;
  } catch (error) {
    console.warn('Warning: Could not create metro.config.js:', error.message);
    return false;
  }
}

function startExportBuild() {
  console.log('Starting Expo export for web...');
  
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
    cleanupAndExit(1);
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
  // Clean up temporary files
  const filesToCleanup = ['metro.config.js'];
  
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
  
  // Restore original app.json if needed
  // Note: In a real scenario, you might want to backup and restore the original
  
  process.exit(code);
}

// Main execution
async function main() {
  try {
    // Step 1: Preprocess import.meta
    preprocessImportMeta();
    
    // Step 2: Create web app config
    const appConfigCreated = createWebAppConfig();
    if (!appConfigCreated) {
      console.error('Failed to create web app config');
      cleanupAndExit(1);
    }
    
    // Step 3: Create metro config
    const metroConfigCreated = createMetroConfig();
    if (!metroConfigCreated) {
      console.error('Failed to create metro config, continuing without it...');
    }
    
    // Step 4: Start the build
    startExportBuild();
    
  } catch (error) {
    console.error('Build process failed:', error);
    cleanupAndExit(1);
  }
}

// Handle process termination gracefully
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, exiting gracefully...');
  cleanupAndExit(0);
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, exiting gracefully...');
  cleanupAndExit(0);
});

main();