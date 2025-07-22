const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(
    {
      ...env,
      babel: {
        dangerouslyAllowInsecureHttpRequests: false,
      },
    },
    argv
  );

  // Ensure proper module handling
  config.output = {
    ...config.output,
    environment: {
      module: false, // Disable ES modules in output to avoid import.meta issues
      dynamicImport: false,
    },
  };

  // Configure module rules for better compatibility
  config.module.rules = config.module.rules.map(rule => {
    if (rule.test && rule.test.toString().includes('js')) {
      return {
        ...rule,
        exclude: /node_modules\/(?!(react-native|@expo|expo|@react-native|@react-navigation)\/).*/,
      };
    }
    return rule;
  });

  // Customize the config before returning it
  config.resolve.alias = {
    ...config.resolve.alias,
    'react-native$': 'react-native-web',
  };

  // Ensure proper handling of async storage on web
  config.resolve.fallback = {
    ...config.resolve.fallback,
    crypto: false,
    stream: false,
    buffer: false,
    fs: false,
    path: false,
    os: false,
  };

  // Add better error handling
  config.stats = {
    errorDetails: true,
    warnings: false,
  };

  // Optimize for web deployment
  if (argv.mode === 'production') {
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      },
    };
  }

  return config;
};