module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // Reanimated plugin must be last
    'react-native-reanimated/plugin',
    [
      'module-resolver',
      {
        root: ['./src'],
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
    ],
  ],
  env: {
    production: {
      plugins: [
        'react-native-paper/babel',
        'transform-remove-console',
      ],
    },
  },
};
