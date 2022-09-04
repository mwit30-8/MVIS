module.exports = function (api) {
  api.cache(true);
  console.warn('This could leak super secret stuffs!');
  return {
    presets: ['babel-preset-expo'],
    plugins: [['inline-dotenv', {
      unsafe: true,
      systemVar: 'all'
    }]]
  };
};
