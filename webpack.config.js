const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(
    {
      ...env,
      babel: {
        dangerouslyAddModulePathsToTranspile: [
          // Add any packages here that need to be transpiled
        ],
      },
    },
    argv
  );

  // Customize the config before returning it
  config.resolve.alias = {
    ...config.resolve.alias,
    'react-native$': 'react-native-web',
    'react-native-web$': 'react-native-web',
  };

  // Ensure proper handling of React Native modules
  config.module.rules.push({
    test: /\.(js|jsx|ts|tsx)$/,
    exclude: /node_modules\/(?!(react-native|@react-native|expo|@expo|@unimodules|unimodules|sentry-expo|native-base|react-navigation|@react-navigation|@sentry|lucide-react-native))/,
    use: {
      loader: 'babel-loader',
      options: {
        cacheDirectory: true,
        presets: ['babel-preset-expo'],
        plugins: [
          ['module-resolver', {
            root: ['./'],
            alias: {
              '@': './',
            },
          }],
          'babel-plugin-transform-import-meta',
        ],
      },
    },
  });

  return config;
};