const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  // Fix import.meta error by ensuring ES5 compatibility
  config.output = {
    ...config.output,
    environment: {
      // Disable all modern features that cause import.meta issues
      arrowFunction: false,
      bigIntLiteral: false,
      const: false,
      destructuring: false,
      dynamicImport: false,
      forOf: false,
      module: false,
    },
  };

  // Target older browsers to avoid ES module issues
  config.target = ['web', 'es5'];

  // Ensure proper module resolution
  config.resolve = {
    ...config.resolve,
    alias: {
      ...config.resolve.alias,
      'react-native$': 'react-native-web',
    },
  };

  // Disable problematic optimizations
  if (config.optimization) {
    config.optimization.usedExports = false;
    config.optimization.sideEffects = false;
    config.optimization.concatenateModules = false;
  }

  // Ensure all modules are transpiled to ES5
  config.module.rules.forEach(rule => {
    if (rule.use && Array.isArray(rule.use)) {
      rule.use.forEach(use => {
        if (use.loader && use.loader.includes('babel-loader')) {
          use.options = {
            ...use.options,
            presets: [
              ['@babel/preset-env', {
                targets: {
                  browsers: ['> 1%', 'last 2 versions', 'ie >= 11']
                },
                modules: false,
                useBuiltIns: 'entry',
                corejs: 3
              }],
              ...(use.options.presets || []).filter(preset => 
                !Array.isArray(preset) || preset[0] !== '@babel/preset-env'
              )
            ]
          };
        }
      });
    }
  });

  return config;
};