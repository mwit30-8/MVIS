const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const webpack = require('webpack');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  // Customize the config before returning it.
  config.plugins.push(new webpack.DefinePlugin({
    'process.env.SERVED_PATH': JSON.stringify(env.locations.servedPath)
  }));
  return config;
};
