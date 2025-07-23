const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  // Force ES5 output to avoid import.meta errors
  config.output = {
    ...config.output,
    environment: {
      arrowFunction: false,
      bigIntLiteral: false,
      const: false,
      destructuring: false,
      dynamicImport: false,
      forOf: false,
      module: false,
    },
  };

  // Target ES5 specifically
  config.target = ['web', 'es5'];

  // Add babel-loader configuration to ensure ES5 transpilation
  config.module.rules.push({
    test: /\.(js|jsx|ts|tsx)$/,
    exclude: /node_modules\/(?!(expo|@expo|react-native|@react-native|@unimodules|unimodules|expo-router|@react-navigation))/,
    use: {
      loader: 'babel-loader',
      options: {
        presets: [
          ['@babel/preset-env', {
            targets: {
              browsers: ['> 1%', 'last 2 versions', 'ie >= 11']
            },
            modules: false,
            useBuiltIns: 'entry',
            corejs: 3,
            exclude: ['transform-typeof-symbol']
          }],
          '@babel/preset-react',
          '@babel/preset-typescript'
        ],
        plugins: [
          '@babel/plugin-proposal-class-properties',
          '@babel/plugin-transform-runtime',
          ['@babel/plugin-transform-modules-commonjs', { allowTopLevelThis: true }]
        ]
      }
    }
  });

  // Disable problematic optimizations that can cause import.meta issues
  if (config.optimization) {
    config.optimization.usedExports = false;
    config.optimization.sideEffects = false;
    config.optimization.concatenateModules = false;
    config.optimization.minimize = false; // Disable minification to avoid ES6+ syntax
  }

  // Ensure proper module resolution
  config.resolve = {
    ...config.resolve,
    alias: {
      ...config.resolve.alias,
      'react-native$': 'react-native-web',
    },
  };

  return config;
};