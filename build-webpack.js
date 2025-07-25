#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting webpack-based build process...');
console.log('Node version:', process.version);
console.log('Current directory:', process.cwd());

// Set environment variables for webpack build
process.env.NODE_ENV = 'production';
process.env.BABEL_ENV = 'web';
process.env.EXPO_PLATFORM = 'web';
process.env.EXPO_PUBLIC_USE_STATIC = 'true';
process.env.EXPO_USE_STATIC = 'true';
process.env.SKIP_PREFLIGHT_CHECK = 'true';
process.env.NODE_OPTIONS = '--max-old-space-size=4096';

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

function createWebpackConfig() {
  console.log('Creating webpack.config.js...');
  
  const webpackConfig = `const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync({
    ...env,
    mode: 'production',
    https: false,
  }, argv);
  
  // Disable source maps for production
  config.devtool = false;
  
  // Optimize bundle
  config.optimization = {
    ...config.optimization,
    minimize: true,
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\\\/]node_modules[\\\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  };
  
  // Handle import.meta
  config.module.rules.push({
    test: /\.(js|jsx|ts|tsx)$/,
    use: {
      loader: 'babel-loader',
      options: {
        presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript'],
        plugins: [
          ['@babel/plugin-transform-runtime', { regenerator: true }],
          ['babel-plugin-transform-import-meta', { module: 'ES6' }]
        ]
      }
    }
  });
  
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

function startWebpackBuild() {
  console.log('Starting webpack build...');
  
  const buildArgs = [
    'expo', 'build:web',
    '--no-pwa'
  ];

  const buildProcess = spawn('npx', buildArgs, {
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
    
    // Clean up temporary webpack config
    if (fs.existsSync('webpack.config.js')) {
      try {
        fs.unlinkSync('webpack.config.js');
        console.log('Cleaned up temporary webpack.config.js');
      } catch (error) {
        console.warn('Warning: Could not clean up webpack.config.js:', error.message);
      }
    }
    
    if (code === 0) {
      // Check for build output in web-build directory
      const webBuildPath = path.join(process.cwd(), 'web-build');
      const distPath = path.join(process.cwd(), 'dist');
      
      if (fs.existsSync(webBuildPath)) {
        // Move web-build to dist
        try {
          if (fs.existsSync(distPath)) {
            fs.rmSync(distPath, { recursive: true, force: true });
          }
          fs.renameSync(webBuildPath, distPath);
          console.log('Build completed successfully!');
          console.log('Output directory:', distPath);
          process.exit(0);
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
    
    // Clean up temporary webpack config
    if (fs.existsSync('webpack.config.js')) {
      try {
        fs.unlinkSync('webpack.config.js');
        console.log('Cleaned up temporary webpack.config.js');
      } catch (cleanupError) {
        console.warn('Warning: Could not clean up webpack.config.js:', cleanupError.message);
      }
    }
    
    console.error('Build process error:', error);
    process.exit(1);
  });
}

// Main execution
async function main() {
  try {
    // Step 1: Preprocess import.meta
    preprocessImportMeta();
    
    // Step 2: Create webpack config
    const webpackConfigCreated = createWebpackConfig();
    
    if (!webpackConfigCreated) {
      console.error('Failed to create webpack config, continuing without it...');
    }
    
    // Step 3: Start the webpack build
    startWebpackBuild();
    
  } catch (error) {
    console.error('Build process failed:', error);
    process.exit(1);
  }
}

// Handle process termination gracefully
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, exiting gracefully...');
  if (fs.existsSync('webpack.config.js')) {
    try {
      fs.unlinkSync('webpack.config.js');
    } catch (error) {
      console.warn('Could not clean up webpack.config.js:', error.message);
    }
  }
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, exiting gracefully...');
  if (fs.existsSync('webpack.config.js')) {
    try {
      fs.unlinkSync('webpack.config.js');
    } catch (error) {
      console.warn('Could not clean up webpack.config.js:', error.message);
    }
  }
  process.exit(0);
});

main();