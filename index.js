/**
 * @format
 */

import { AppRegistry } from 'react-native';
import { name as appName } from './app.json';

// Toggle between App and Storybook
// Set LOAD_STORYBOOK to true to load Storybook, false to load the main app
const LOAD_STORYBOOK = false;

let AppRoot;

if (LOAD_STORYBOOK) {
  // Load Storybook
  const StorybookUIRoot = require('./.storybook/Storybook').default;
  AppRoot = StorybookUIRoot;
} else {
  // Load main app
  const App = require('./App').default;
  AppRoot = App;
}

AppRegistry.registerComponent(appName, () => AppRoot);
