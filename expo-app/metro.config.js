// Default Metro config for Expo SDK 54. Keep this file even if empty — it
// signals to EAS Build and dev tooling that we are using the standard Expo
// Metro pipeline.
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

module.exports = config;
