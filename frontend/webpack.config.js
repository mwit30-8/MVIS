const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const webpack = require('webpack');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  // Customize the config before returning it.
  config.plugins.push(new webpack.DefinePlugin({
    'process.env.BACKEND_URL': JSON.stringify(process.env.BACKEND_URL),
    'process.env.AUTH0_CLIENT_ID': JSON.stringify(process.env.AUTH0_CLIENT_ID),
    'process.env.AUTH0_URL': JSON.stringify(process.env.AUTH0_URL),
    'process.env.SERVED_PATH': JSON.stringify(env.locations.servedPath)
  }));
  return config;
};
