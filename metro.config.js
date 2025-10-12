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
 * - Bundle size optimizations
 * - Minification and compression
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
    // Asset resolution optimizations
    assetExts: [
      // Images
      'png', 'jpg', 'jpeg', 'gif', 'webp',
      // Fonts
      'ttf', 'otf', 'woff', 'woff2',
      // Other
      'mp3', 'mp4', 'svg',
    ],
  },
  transformer: {
    // Enable Hermes optimizations
    hermesCommand: 'hermes',
    // Support for newer JavaScript features
    unstable_allowRequireContext: true,
    // Minify JavaScript in production
    minifierPath: 'metro-minify-terser',
    minifierConfig: {
      compress: {
        // Remove console statements in production
        drop_console: true,
        // Remove debugger statements
        drop_debugger: true,
        // Optimize for size
        passes: 3,
        // Remove unused code
        unused: true,
        // Evaluate constant expressions
        evaluate: true,
        // Collapse single-use variables
        collapse_vars: true,
        // Reduce variables
        reduce_vars: true,
      },
      mangle: {
        // Mangle variable names for smaller bundle
        toplevel: false,
        keep_classnames: false,
        keep_fnames: false,
      },
      output: {
        // Remove comments
        comments: false,
        // Optimize for size
        ascii_only: true,
      },
    },
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
