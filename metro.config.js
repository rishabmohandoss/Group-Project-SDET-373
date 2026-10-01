const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Parse 8 uses Node's randomUUID in its React Native build.
  // Expo Crypto supplies the same function inside Expo Go.
  if (moduleName === 'crypto' && context.originModulePath.includes('/parse/lib/react-native/uuid.js')) {
    return context.resolveRequest(context, 'expo-crypto', platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};
module.exports = config;
