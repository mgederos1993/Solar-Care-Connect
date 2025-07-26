#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting safe web build process...');
console.log('Node version:', process.version);
console.log('Current directory:', process.cwd());

// Set environment variables to optimize for web builds and avoid Node.js v22 issues
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

// Completely disable all Metro terminal reporting to avoid Node.js v22 export issues
process.env.EXPO_NO_METRO_TERMINAL_REPORTER = 'true';
process.env.METRO_NO_TERMINAL_REPORTER = 'true';
process.env.METRO_NO_TERMINAL = '1';
process.env.METRO_DISABLE_TERMINAL_REPORTER = '1';
process.env.EXPO_DISABLE_METRO_TERMINAL = '1';
process.env.METRO_SILENT = '1';
process.env.EXPO_NO_METRO_REPORTER = '1';
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

function createSafeMetroConfig() {
  console.log('Creating safe metro.config.js...');
  
  const metroConfig = `const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure web platform is supported
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Add web extensions
config.resolver.sourceExts = [...(config.resolver.sourceExts || []), 'web.js', 'web.ts', 'web.tsx'];

// Completely disable terminal reporter to avoid Node.js v22 export issues
config.reporter = {
  update: () => {},
};

// Disable package exports support to avoid Node.js v22 compatibility issues
config.resolver.unstable_enablePackageExports = false;

// Add resolver configuration to handle Node.js v22 compatibility
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];
config.resolver.resolveRequest = null;

// Override transformer to handle Node.js v22 compatibility
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('metro-react-native-babel-transformer'),
  minifierPath: 'metro-minify-terser',
  minifierConfig: {
    keep_fnames: true,
    mangle: {
      keep_fnames: true,
    },
  },
};

module.exports = config;
`;

  try {
    fs.writeFileSync('metro.config.js', metroConfig);
    console.log('Created safe metro.config.js');
    return true;
  } catch (error) {
    console.warn('Warning: Could not create metro.config.js:', error.message);
    return false;
  }
}

function createWebAppConfig() {
  console.log('Creating app.json for web build...');
  
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
  
  // Use webpack as it's more stable with Node.js v22
  appConfig.expo.web.bundler = 'webpack';
  
  // Ensure favicon is set
  if (!appConfig.expo.web.favicon) {
    appConfig.expo.web.favicon = './assets/images/favicon.png';
  }
  
  try {
    fs.writeFileSync('app.json', JSON.stringify(appConfig, null, 2));
    console.log('Updated app.json for web build');
    return true;
  } catch (error) {
    console.error('Error writing app.json:', error.message);
    return false;
  }
}

function startWebpackBuild() {
  console.log('Starting Expo webpack build...');
  
  const buildArgs = ['expo', 'export:web'];
  
  const buildProcess = spawn('npx', buildArgs, {
    stdio: 'inherit',
    env: {
      ...process.env,
      EXPO_WEB_BUILD_CACHE: 'false'
    }
  });
  
  // Set a timeout to kill the process if it hangs
  const timeout = setTimeout(() => {
    console.error('Build process timed out after 15 minutes');
    buildProcess.kill('SIGTERM');
    cleanupAndExit(1);
  }, 15 * 60 * 1000); // 15 minutes
  
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
            cleanupAndExit(0);
          } else {
            console.error('Build completed but index.html not found');
            cleanupAndExit(1);
          }
        } catch (error) {
          console.error('Error moving build output:', error);
          cleanupAndExit(1);
        }
      } else {
        console.error('Build completed but web-build directory not found');
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
  
  process.exit(code);
}

// Main execution
async function main() {
  try {
    // Step 1: Preprocess import.meta
    preprocessImportMeta();
    
    // Step 2: Create web app config (using webpack)
    const appConfigCreated = createWebAppConfig();
    if (!appConfigCreated) {
      console.error('Failed to create web app config');
      cleanupAndExit(1);
    }
    
    // Step 3: Create safe metro config (just in case)
    createSafeMetroConfig();
    
    // Step 4: Start webpack build
    startWebpackBuild();
    
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