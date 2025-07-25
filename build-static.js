#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting static build process...');
console.log('Node version:', process.version);
console.log('Current directory:', process.cwd());

// Set environment variables for static build
process.env.NODE_ENV = 'production';
process.env.BABEL_ENV = 'web';
process.env.EXPO_PLATFORM = 'web';
process.env.EXPO_PUBLIC_USE_STATIC = 'true';
process.env.EXPO_USE_STATIC = 'true';
process.env.SKIP_PREFLIGHT_CHECK = 'true';
process.env.NODE_OPTIONS = '--max-old-space-size=4096';
process.env.EXPO_NO_METRO = 'true';
process.env.EXPO_USE_WEBPACK = 'true';

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
  
  // Ensure web configuration
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

function startStaticBuild() {
  console.log('Starting static build...');
  
  // Try different build commands in order of preference
  const buildCommands = [
    ['expo', 'build:web'],
    ['expo', 'export:web'],
    ['npx', 'expo', 'build:web'],
    ['npx', 'expo', 'export:web']
  ];
  
  let currentCommandIndex = 0;
  
  function tryNextCommand() {
    if (currentCommandIndex >= buildCommands.length) {
      console.error('All build commands failed');
      process.exit(1);
      return;
    }
    
    const [command, ...args] = buildCommands[currentCommandIndex];
    console.log(`Trying build command: ${command} ${args.join(' ')}`);
    
    const buildProcess = spawn(command, args, {
      stdio: 'inherit',
      env: process.env
    });

    // Set a timeout to kill the process if it hangs
    const timeout = setTimeout(() => {
      console.error('Build process timed out after 10 minutes');
      buildProcess.kill('SIGTERM');
      currentCommandIndex++;
      setTimeout(tryNextCommand, 1000);
    }, 10 * 60 * 1000); // 10 minutes

    buildProcess.on('close', (code) => {
      clearTimeout(timeout);
      
      if (code === 0) {
        // Check for build output in various possible locations
        const possibleOutputDirs = ['web-build', 'dist', 'build', 'out'];
        let outputDir = null;
        
        for (const dir of possibleOutputDirs) {
          const fullPath = path.join(process.cwd(), dir);
          if (fs.existsSync(fullPath)) {
            const indexPath = path.join(fullPath, 'index.html');
            if (fs.existsSync(indexPath)) {
              outputDir = fullPath;
              break;
            }
          }
        }
        
        if (outputDir) {
          const distPath = path.join(process.cwd(), 'dist');
          
          // Move output to dist if it's not already there
          if (outputDir !== distPath) {
            try {
              if (fs.existsSync(distPath)) {
                fs.rmSync(distPath, { recursive: true, force: true });
              }
              fs.renameSync(outputDir, distPath);
              console.log(`Moved build output from ${path.basename(outputDir)} to dist`);
            } catch (error) {
              console.error('Error moving build output:', error);
              process.exit(1);
            }
          }
          
          console.log('Build completed successfully!');
          console.log('Output directory:', distPath);
          process.exit(0);
        } else {
          console.error('Build completed but no valid output directory found');
          currentCommandIndex++;
          setTimeout(tryNextCommand, 1000);
        }
      } else {
        console.error(`Build command failed with code ${code}`);
        currentCommandIndex++;
        setTimeout(tryNextCommand, 1000);
      }
    });

    buildProcess.on('error', (error) => {
      clearTimeout(timeout);
      console.error(`Build command error: ${error.message}`);
      currentCommandIndex++;
      setTimeout(tryNextCommand, 1000);
    });
  }
  
  tryNextCommand();
}

// Main execution
async function main() {
  try {
    // Step 1: Preprocess import.meta
    preprocessImportMeta();
    
    // Step 2: Update app.json for web build
    createAppJson();
    
    // Step 3: Start the static build
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