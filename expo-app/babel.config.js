module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    // react-native-reanimated/plugin is required and must be listed last.
    plugins: ["react-native-reanimated/plugin"],
  };
};
