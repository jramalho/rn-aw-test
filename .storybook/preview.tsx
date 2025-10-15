import type { Preview } from '@storybook/react-native';
import React from 'react';
import { View, StyleSheet } from 'react-native';

// Decorator to add padding around stories
const withPadding = (Story: any) => (
  <View style={styles.container}>
    <Story />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
});

const preview: Preview = {
  decorators: [withPadding],
  parameters: {
    backgrounds: {
      default: 'plain',
      values: [
        { name: 'plain', value: '#f5f5f5' },
        { name: 'warm', value: '#fff5eb' },
        { name: 'cool', value: '#e6f7ff' },
        { name: 'dark', value: '#1a1a1a' },
      ],
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
};

export const decorators = preview.decorators;

export default preview;
