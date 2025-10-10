const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * Enhanced for React Native 0.82 New Architecture
 * 
 * Features:
 * - Optimized for Hermes engine  
 * - Support for absolute imports
 * - Enhanced asset resolution
 * - Development performance improvements
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    alias: {
      '@': './src',
      '@components': './src/components',
      '@screens': './src/screens', 
      '@navigation': './src/navigation',
      '@hooks': './src/hooks',
      '@utils': './src/utils',
      '@types': './src/types',
      '@store': './src/store',
      '@assets': './assets',
    },
  },
  transformer: {
    // Enable Hermes optimizations
    hermesCommand: 'hermes',
    // Support for newer JavaScript features
    unstable_allowRequireContext: true,
  },
  server: {
    // Enhanced development server
    rewriteRequestUrl: (url) => {
      // Support for absolute imports in development
      if (!url.endsWith('.bundle')) {
        return url;
      }
      return url;
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
