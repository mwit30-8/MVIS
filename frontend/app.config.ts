import 'dotenv/config';

export default {
  "expo": {
    "name": "MVIS",
    "description": "MWIT Very Intelligent System",
    "slug": "MVIS",
    "version": "0.0.0",
    "platforms": [
      "ios",
      "android",
      "web"
    ],
    "githubUrl": "https://github.com/mwit30-8/MVIS.git",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "entryPoint": "./index.ts",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "updates": {
      "fallbackToCacheTimeout": 0
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      }
    },
    "web": {
      "favicon": "./assets/favicon.png",
      "scope": ".",
      "startUrl": "./"
    },
    "extra": {
      'BACKEND_URL': process.env.BACKEND_URL,
      'AUTH0_CLIENT_ID': process.env.AUTH0_CLIENT_ID,
      'AUTH0_DOMAIN': process.env.AUTH0_DOMAIN,
      'BACKEND_API_KEY': process.env.BACKEND_API_KEY,
      'RUN_STORYBOOK': process.env.__RUN__ === 'storybook',
    }
  }
};