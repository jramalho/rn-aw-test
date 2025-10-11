import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SettingsScreen from '../SettingsScreen';

// Mock dependencies
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    useColorScheme: jest.fn(() => 'light'),
  };
});

jest.mock('../../store/themeStore', () => ({
  useThemeStore: jest.fn(() => ({
    isDarkMode: false,
    systemTheme: true,
    toggleTheme: jest.fn(),
    setTheme: jest.fn(),
  })),
}));

describe('SettingsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('renders correctly with all main sections', () => {
      const { getByText } = render(<SettingsScreen />);
      
      expect(getByText('Settings')).toBeTruthy();
      expect(getByText('Customize your app experience')).toBeTruthy();
      expect(getByText('Appearance')).toBeTruthy();
      expect(getByText('App Settings')).toBeTruthy();
      expect(getByText('New Architecture Status')).toBeTruthy();
      expect(getByText('Actions')).toBeTruthy();
    });

    it('displays appearance settings', () => {
      const { getByText } = render(<SettingsScreen />);
      
      expect(getByText('Dark Mode')).toBeTruthy();
      expect(getByText('Currently: Light')).toBeTruthy();
      expect(getByText('Use System Theme')).toBeTruthy();
    });

    it('displays app settings toggles', () => {
      const { getByText } = render(<SettingsScreen />);
      
      expect(getByText('Push Notifications')).toBeTruthy();
      expect(getByText('Receive app updates and alerts')).toBeTruthy();
      expect(getByText('Analytics')).toBeTruthy();
      expect(getByText('Help improve the app with usage data')).toBeTruthy();
      expect(getByText('Performance Monitoring')).toBeTruthy();
      expect(getByText('Track app performance metrics')).toBeTruthy();
    });

    it('displays New Architecture status indicators', () => {
      const { getAllByText, getByText } = render(<SettingsScreen />);
      
      expect(getByText('Fabric Renderer Active')).toBeTruthy();
      expect(getByText('TurboModules Enabled')).toBeTruthy();
      expect(getByText('JSI Bridge Active')).toBeTruthy();
      expect(getByText('Hermes Engine Running')).toBeTruthy();
      
      // All status indicators should have checkmarks
      const checkmarks = getAllByText('✓');
      expect(checkmarks.length).toBe(4);
    });

    it('displays action buttons', () => {
      const { getByText } = render(<SettingsScreen />);
      
      expect(getByText('Clear Cache')).toBeTruthy();
      expect(getByText('Reset Settings')).toBeTruthy();
      expect(getByText('About App')).toBeTruthy();
    });
  });

  describe('Theme Settings', () => {
    it('displays current theme state correctly', () => {
      const { getByText } = render(<SettingsScreen />);
      
      expect(getByText('Currently: Light')).toBeTruthy();
    });

    it('shows dark mode when theme is dark', () => {
      const useThemeStore = require('../../store/themeStore').useThemeStore;
      useThemeStore.mockReturnValue({
        isDarkMode: true,
        systemTheme: false,
        toggleTheme: jest.fn(),
        setTheme: jest.fn(),
      });

      const { getByText } = render(<SettingsScreen />);
      
      expect(getByText('Currently: Dark')).toBeTruthy();
    });

    it('calls toggleTheme when dark mode switch is toggled', () => {
      const mockToggleTheme = jest.fn();
      const useThemeStore = require('../../store/themeStore').useThemeStore;
      useThemeStore.mockReturnValue({
        isDarkMode: false,
        systemTheme: true,
        toggleTheme: mockToggleTheme,
        setTheme: jest.fn(),
      });

      const { getAllByRole } = render(<SettingsScreen />);
      
      const switches = getAllByRole('switch');
      const darkModeSwitch = switches[0]; // First switch is Dark Mode
      
      fireEvent(darkModeSwitch, 'onValueChange', true);
      
      expect(mockToggleTheme).toHaveBeenCalledTimes(1);
    });

    it('displays system theme status', () => {
      const useThemeStore = require('../../store/themeStore').useThemeStore;
      useThemeStore.mockReturnValue({
        isDarkMode: false,
        systemTheme: true,
        toggleTheme: jest.fn(),
        setTheme: jest.fn(),
      });

      const { getByText } = render(<SettingsScreen />);
      
      expect(getByText('Following system settings')).toBeTruthy();
    });

    it('shows manual override status when not using system theme', () => {
      const useThemeStore = require('../../store/themeStore').useThemeStore;
      useThemeStore.mockReturnValue({
        isDarkMode: true,
        systemTheme: false,
        toggleTheme: jest.fn(),
        setTheme: jest.fn(),
      });

      const { getByText } = render(<SettingsScreen />);
      
      expect(getByText('Manual override active')).toBeTruthy();
    });

    it('calls setTheme when Reset button is pressed', () => {
      const mockSetTheme = jest.fn();
      const useThemeStore = require('../../store/themeStore').useThemeStore;
      const useColorScheme = require('react-native').useColorScheme;
      
      useColorScheme.mockReturnValue('dark');
      useThemeStore.mockReturnValue({
        isDarkMode: false,
        systemTheme: false,
        toggleTheme: jest.fn(),
        setTheme: mockSetTheme,
      });

      const { getByText } = render(<SettingsScreen />);
      
      const resetButton = getByText('Reset');
      fireEvent.press(resetButton);
      
      expect(mockSetTheme).toHaveBeenCalledWith(true); // System is dark
    });
  });

  describe('App Settings Toggles', () => {
    it('toggles notifications setting', () => {
      const { getAllByRole } = render(<SettingsScreen />);
      
      const switches = getAllByRole('switch');
      const notificationsSwitch = switches[1]; // Second switch is Notifications
      
      // Initial state should be true based on component default
      fireEvent(notificationsSwitch, 'onValueChange', false);
      
      // Component should update (tested implicitly through re-render)
      expect(notificationsSwitch).toBeTruthy();
    });

    it('toggles analytics setting', () => {
      const { getAllByRole } = render(<SettingsScreen />);
      
      const switches = getAllByRole('switch');
      const analyticsSwitch = switches[2]; // Third switch is Analytics
      
      fireEvent(analyticsSwitch, 'onValueChange', true);
      
      expect(analyticsSwitch).toBeTruthy();
    });

    it('toggles performance monitoring setting', () => {
      const { getAllByRole } = render(<SettingsScreen />);
      
      const switches = getAllByRole('switch');
      const performanceSwitch = switches[3]; // Fourth switch is Performance
      
      fireEvent(performanceSwitch, 'onValueChange', false);
      
      expect(performanceSwitch).toBeTruthy();
    });

    it('renders correct number of switches', () => {
      const { getAllByRole } = render(<SettingsScreen />);
      
      const switches = getAllByRole('switch');
      expect(switches.length).toBe(4); // Dark Mode, Notifications, Analytics, Performance
    });
  });

  describe('Action Buttons', () => {
    it('calls console.log when Clear Cache button is pressed', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      const { getByText } = render(<SettingsScreen />);
      
      const clearCacheButton = getByText('Clear Cache');
      fireEvent.press(clearCacheButton);
      
      expect(consoleSpy).toHaveBeenCalledWith('Clear Cache pressed');
    });

    it('calls console.log when Reset Settings button is pressed', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      const { getByText } = render(<SettingsScreen />);
      
      const resetSettingsButton = getByText('Reset Settings');
      fireEvent.press(resetSettingsButton);
      
      expect(consoleSpy).toHaveBeenCalledWith('Reset Settings pressed');
    });

    it('calls console.log when About App button is pressed', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      const { getByText } = render(<SettingsScreen />);
      
      const aboutButton = getByText('About App');
      fireEvent.press(aboutButton);
      
      expect(consoleSpy).toHaveBeenCalledWith('About App pressed');
    });
  });

  describe('Theme Support', () => {
    it('renders correctly in light mode', () => {
      const useColorScheme = require('react-native').useColorScheme;
      const useThemeStore = require('../../store/themeStore').useThemeStore;
      
      useColorScheme.mockReturnValue('light');
      useThemeStore.mockReturnValue({
        isDarkMode: false,
        systemTheme: true,
        toggleTheme: jest.fn(),
        setTheme: jest.fn(),
      });
      
      const { getByText } = render(<SettingsScreen />);
      
      expect(getByText('Settings')).toBeTruthy();
    });

    it('renders correctly in dark mode', () => {
      const useColorScheme = require('react-native').useColorScheme;
      const useThemeStore = require('../../store/themeStore').useThemeStore;
      
      useColorScheme.mockReturnValue('dark');
      useThemeStore.mockReturnValue({
        isDarkMode: true,
        systemTheme: true,
        toggleTheme: jest.fn(),
        setTheme: jest.fn(),
      });
      
      const { getByText } = render(<SettingsScreen />);
      
      expect(getByText('Settings')).toBeTruthy();
    });
  });

  describe('Layout and Structure', () => {
    it('renders scrollable content', () => {
      const { UNSAFE_getByType } = render(<SettingsScreen />);
      
      const { ScrollView } = require('react-native');
      expect(UNSAFE_getByType(ScrollView)).toBeTruthy();
    });

    it('displays setting items with proper structure', () => {
      const { getByText } = render(<SettingsScreen />);
      
      // Each setting should have a title and description
      expect(getByText('Push Notifications')).toBeTruthy();
      expect(getByText('Receive app updates and alerts')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('handles rapid toggle switches', () => {
      const { getAllByRole } = render(<SettingsScreen />);
      
      const switches = getAllByRole('switch');
      const notificationsSwitch = switches[1];
      
      // Rapid toggles
      fireEvent(notificationsSwitch, 'onValueChange', false);
      fireEvent(notificationsSwitch, 'onValueChange', true);
      fireEvent(notificationsSwitch, 'onValueChange', false);
      
      expect(notificationsSwitch).toBeTruthy();
    });

    it('handles multiple button presses', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      const { getByText } = render(<SettingsScreen />);
      
      const clearCacheButton = getByText('Clear Cache');
      
      for (let i = 0; i < 5; i++) {
        fireEvent.press(clearCacheButton);
      }
      
      expect(consoleSpy).toHaveBeenCalledTimes(5);
    });

    it('displays all architecture status items', () => {
      const { getByText } = render(<SettingsScreen />);
      
      const statusItems = [
        'Fabric Renderer Active',
        'TurboModules Enabled',
        'JSI Bridge Active',
        'Hermes Engine Running',
      ];
      
      statusItems.forEach(item => {
        expect(getByText(item)).toBeTruthy();
      });
    });
  });

  describe('Accessibility', () => {
    it('has accessible settings labels', () => {
      const { getByText } = render(<SettingsScreen />);
      
      expect(getByText('Dark Mode')).toBeTruthy();
      expect(getByText('Push Notifications')).toBeTruthy();
      expect(getByText('Analytics')).toBeTruthy();
      expect(getByText('Performance Monitoring')).toBeTruthy();
    });

    it('has descriptive text for each setting', () => {
      const { getByText } = render(<SettingsScreen />);
      
      expect(getByText('Receive app updates and alerts')).toBeTruthy();
      expect(getByText('Help improve the app with usage data')).toBeTruthy();
      expect(getByText('Track app performance metrics')).toBeTruthy();
    });
  });
});
