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

// Pre-process files to handle import.meta
console.log('Pre-processing files to handle import.meta...');
preprocessImportMeta();

// Create a temporary metro config if it doesn't exist
const metroConfigExisted = fs.existsSync('metro.config.js');
if (!metroConfigExisted) {
  console.log('Creating temporary metro.config.js...');
  createMetroConfig();
}

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
process.env.EXPO_USE_STATIC = 'true';
process.env.EXPO_SKIP_MANIFEST_VALIDATION_WARNINGS = 'true';

function preprocessImportMeta() {
  const processFile = (filePath) => {
    if (!fs.existsSync(filePath)) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace import.meta.env with process.env
    content = content.replace(/import\.meta\.env/g, 'process.env');
    
    // Replace import.meta.url with a fallback
    content = content.replace(/import\.meta\.url/g, '""');
    
    // Replace other import.meta usages
    content = content.replace(/import\.meta/g, '{}');
    
    fs.writeFileSync(filePath, content);
  };
  
  const processDirectory = (dir) => {
    if (!fs.existsSync(dir)) return;
    
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        processDirectory(fullPath);
      } else if (stat.isFile() && (item.endsWith('.js') || item.endsWith('.ts') || item.endsWith('.tsx'))) {
        processFile(fullPath);
      }
    }
  };
  
  // Process app directory
  processDirectory('./app');
  processDirectory('./components');
  processDirectory('./constants');
  processDirectory('./store');
  processDirectory('./types');
  processDirectory('./utils');
}

function createMetroConfig() {
  const metroConfig = `const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add support for path aliases
config.resolver.alias = {
  '@': path.resolve(__dirname, './'),
};

// Ensure proper module resolution
config.resolver.platforms = ['web', 'native', 'ios', 'android'];

// Add web-specific configurations
if (process.env.EXPO_PLATFORM === 'web') {
  config.resolver.resolverMainFields = ['browser', 'main'];
  config.resolver.platforms = ['web', 'native'];
}

module.exports = config;`;
  
  fs.writeFileSync('metro.config.js', metroConfig);
}

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
    
    // Clean up temporary metro config only if we created it
    if (!metroConfigExisted && fs.existsSync('metro.config.js')) {
      fs.unlinkSync('metro.config.js');
    }
    
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
    
    // Clean up temporary metro config only if we created it
    if (!metroConfigExisted && fs.existsSync('metro.config.js')) {
      fs.unlinkSync('metro.config.js');
    }
    
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