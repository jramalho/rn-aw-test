module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
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
    // Reanimated plugin must be listed last
    'react-native-reanimated/plugin',
  ],
  env: {
    production: {
      plugins: [
        'transform-remove-console',
        // Additional production optimizations
        ['@babel/plugin-transform-react-inline-elements'],
        ['@babel/plugin-transform-react-constant-elements'],
      ],
    },
  },
};
