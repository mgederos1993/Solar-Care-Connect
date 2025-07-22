const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  // Fix the import.meta error by disabling ES modules in output
  config.output = {
    ...config.output,
    environment: {
      module: false,
      dynamicImport: false,
    },
  };

  // Ensure compatibility with older browsers
  config.target = ['web', 'es5'];

  // Better module resolution
  config.resolve.alias = {
    ...config.resolve.alias,
    'react-native$': 'react-native-web',
  };

  // Disable problematic optimizations that cause module issues
  if (config.optimization) {
    config.optimization.usedExports = false;
    config.optimization.sideEffects = false;
  }

  return config;
};