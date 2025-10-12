/**
 * RN AW Test - React Native 0.82 New Architecture Showcase
 *
 * A complete modern React Native app demonstrating:
 * - New Architecture (100% Fabric + TurboModules)
 * - React 19.1.1 with Concurrent Features
 * - TypeScript 5.8.3 with Strict Mode
 * - Modern Navigation & State Management
 * - Material Design 3 Components
 * - Performance Optimizations
 * - Comprehensive Error Handling
 *
 * @format
 */

import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppNavigator } from './src/navigation/AppNavigator';
import { useThemeStore } from './src/store/themeStore';
import { ErrorBoundary } from './src/components/ErrorBoundary';

const App: React.FC = () => {
  const systemColorScheme = useColorScheme();
  const { isDarkMode, setSystemTheme } = useThemeStore();

  React.useEffect(() => {
    setSystemTheme(systemColorScheme === 'dark');
  }, [systemColorScheme, setSystemTheme]);

  // Create custom navigation themes
  const lightTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: '#007AFF',
      background: '#ffffff',
      card: '#f8f9fa',
      text: '#000000',
      border: '#e1e5e9',
    },
  };

  const darkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: '#0A84FF',
      background: '#1a1a1a',
      card: '#2a2a2a',
      text: '#ffffff',
      border: '#3a3a3a',
    },
  };

  const navigationTheme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <NavigationContainer theme={navigationTheme}>
          <StatusBar
            barStyle={isDarkMode ? 'light-content' : 'dark-content'}
            backgroundColor={navigationTheme.colors.card}
          />
          <AppNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
};

export default App;
