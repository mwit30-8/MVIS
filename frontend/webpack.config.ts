import createExpoWebpackConfigAsync from "@expo/webpack-config/webpack";
import type {
  Arguments,
  Environment,
} from "@expo/webpack-config/webpack/types";
import "dotenv/config";
import path from "path";
import webpack from "webpack";
import WorkboxWebpackPlugin from "workbox-webpack-plugin";

module.exports = async function (env: Environment, argv: Arguments) {
  const isEnvProduction = process.env.NODE_ENV === "production";
  const config = await createExpoWebpackConfigAsync(env, argv);
  // Customize the config before returning it.
  config.plugins = config.plugins ?? [];
  config.plugins.push(
    new webpack.DefinePlugin({
      "process.env.SERVED_PATH": JSON.stringify(env.locations.servedPath),
    })
  );
  if (isEnvProduction)
    config.plugins.push(
      // Generate a service worker script that will precache, and keep up to date,
      // the HTML & assets that are part of the webpack build.
      new WorkboxWebpackPlugin.InjectManifest({
        swSrc: path.resolve(__dirname, "src/service-worker.ts"),
        dontCacheBustURLsMatching: /\.[0-9a-f]{8}\./,
        exclude: [
          /\.map$/,
          /asset-manifest\.json$/,
          /LICENSE/,
          /\.js\.gz$/,
          // Exclude all apple touch and chrome images because they're cached locally after the PWA is added.
          /(apple-touch-startup-image|chrome-icon|apple-touch-icon).*\.png$/,
        ],
        // Bump up the default maximum size (2mb) that's precached,
        // to make lazy-loading failure scenarios less likely.
        // See https://github.com/cra-template/pwa/issues/13#issuecomment-722667270
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      })
    );
  config.module = config.module ?? { rules: [] };
  return config;
};
