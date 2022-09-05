const webpack = require('webpack');
const createExpoWebpackConfigAsync = require('@expo/webpack-config');
require('dotenv').config();

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  // Customize the config before returning it.
  if (!config.plugins)
    config.plugins = [];
  config.plugins?.push(new webpack.DefinePlugin({
    'process.env.BACKEND_URL': JSON.stringify(process.env.BACKEND_URL),
    'process.env.AUTH0_CLIENT_ID': JSON.stringify(process.env.AUTH0_CLIENT_ID),
    'process.env.AUTH0_DOMAIN': JSON.stringify(process.env.AUTH0_DOMAIN),
    'process.env.SERVED_PATH': JSON.stringify(env.locations.servedPath),
    'process.env.BACKEND_API_KEY': JSON.stringify(process.env.BACKEND_API_KEY)
  }));
  if (!config.module)
    config.module = { rules: [] };
  return config;
};
