const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push('onnx', 'bin');
config.resolver.blockList = [...config.resolver.blockList, /[\\/]roof-api[\\/].*/];

module.exports = config;
