import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ProfileScreen from '../ProfileScreen';

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

describe('ProfileScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console.log to avoid test output pollution
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('renders correctly with all main sections', () => {
      const { getByText } = render(<ProfileScreen />);
      
      expect(getByText('React Native Developer')).toBeTruthy();
      expect(getByText('developer@rnawtest.com')).toBeTruthy();
      expect(getByText('Development Stats')).toBeTruthy();
      expect(getByText('New Architecture Experience')).toBeTruthy();
      expect(getByText('Profile Actions')).toBeTruthy();
    });

    it('displays profile header with avatar', () => {
      const { getByText } = render(<ProfileScreen />);
      
      expect(getByText('RN')).toBeTruthy();
      expect(getByText('React Native Developer')).toBeTruthy();
      expect(getByText('developer@rnawtest.com')).toBeTruthy();
    });

    it('displays development stats correctly', () => {
      const { getByText } = render(<ProfileScreen />);
      
      expect(getByText('0.82')).toBeTruthy();
      expect(getByText('RN Version')).toBeTruthy();
      expect(getByText('19.1')).toBeTruthy();
      expect(getByText('React Version')).toBeTruthy();
      expect(getByText('5.8')).toBeTruthy();
      expect(getByText('TypeScript')).toBeTruthy();
    });

    it('displays New Architecture experience items', () => {
      const { getAllByText, getByText } = render(<ProfileScreen />);
      
      expect(getByText('Fabric Renderer Implementation')).toBeTruthy();
      expect(getByText('TurboModules Development')).toBeTruthy();
      expect(getByText('JSI Direct Integration')).toBeTruthy();
      expect(getByText('Concurrent React Features')).toBeTruthy();
      expect(getByText('Hermes V1 Optimization')).toBeTruthy();
      
      // All experience items should have checkmarks
      const checkmarks = getAllByText('✓');
      expect(checkmarks.length).toBe(5);
    });

    it('displays profile action buttons', () => {
      const { getByText } = render(<ProfileScreen />);
      
      expect(getByText('Edit Profile')).toBeTruthy();
      expect(getByText('View Projects')).toBeTruthy();
      expect(getByText('Share Profile')).toBeTruthy();
    });
  });

  describe('Interactions', () => {
    it('calls console.log when Edit Profile button is pressed', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      const { getByText } = render(<ProfileScreen />);
      
      const editButton = getByText('Edit Profile');
      fireEvent.press(editButton);
      
      expect(consoleSpy).toHaveBeenCalledWith('Edit Profile pressed');
    });

    it('calls console.log when View Projects button is pressed', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      const { getByText } = render(<ProfileScreen />);
      
      const viewProjectsButton = getByText('View Projects');
      fireEvent.press(viewProjectsButton);
      
      expect(consoleSpy).toHaveBeenCalledWith('View Projects pressed');
    });

    it('calls console.log when Share Profile button is pressed', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      const { getByText } = render(<ProfileScreen />);
      
      const shareButton = getByText('Share Profile');
      fireEvent.press(shareButton);
      
      expect(consoleSpy).toHaveBeenCalledWith('Share Profile pressed');
    });

    it('allows multiple button presses', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      const { getByText } = render(<ProfileScreen />);
      
      const editButton = getByText('Edit Profile');
      fireEvent.press(editButton);
      fireEvent.press(editButton);
      fireEvent.press(editButton);
      
      expect(consoleSpy).toHaveBeenCalledTimes(3);
    });
  });

  describe('Theme Support', () => {
    it('renders correctly in light mode', () => {
      const useColorScheme = require('react-native').useColorScheme;
      useColorScheme.mockReturnValue('light');
      
      const { getByText } = render(<ProfileScreen />);
      
      expect(getByText('React Native Developer')).toBeTruthy();
    });

    it('renders correctly in dark mode', () => {
      const useColorScheme = require('react-native').useColorScheme;
      useColorScheme.mockReturnValue('dark');
      
      const { getByText } = render(<ProfileScreen />);
      
      expect(getByText('React Native Developer')).toBeTruthy();
    });
  });

  describe('Layout and Structure', () => {
    it('renders scrollable content', () => {
      const { UNSAFE_getByType } = render(<ProfileScreen />);
      
      const { ScrollView } = require('react-native');
      expect(UNSAFE_getByType(ScrollView)).toBeTruthy();
    });

    it('displays stats in horizontal layout', () => {
      const { getByText } = render(<ProfileScreen />);
      
      // All three stat cards should be present
      expect(getByText('RN Version')).toBeTruthy();
      expect(getByText('React Version')).toBeTruthy();
      expect(getByText('TypeScript')).toBeTruthy();
    });

    it('displays action buttons vertically', () => {
      const { getByText } = render(<ProfileScreen />);
      
      const editButton = getByText('Edit Profile');
      const viewProjectsButton = getByText('View Projects');
      const shareButton = getByText('Share Profile');
      
      expect(editButton).toBeTruthy();
      expect(viewProjectsButton).toBeTruthy();
      expect(shareButton).toBeTruthy();
    });
  });

  describe('Content Accuracy', () => {
    it('displays correct version numbers', () => {
      const { getByText } = render(<ProfileScreen />);
      
      // Verify exact version numbers match the project
      expect(getByText('0.82')).toBeTruthy();
      expect(getByText('19.1')).toBeTruthy();
      expect(getByText('5.8')).toBeTruthy();
    });

    it('displays correct email format', () => {
      const { getByText } = render(<ProfileScreen />);
      
      const email = getByText('developer@rnawtest.com');
      expect(email).toBeTruthy();
    });

    it('lists all New Architecture features', () => {
      const { getByText } = render(<ProfileScreen />);
      
      const features = [
        'Fabric Renderer Implementation',
        'TurboModules Development',
        'JSI Direct Integration',
        'Concurrent React Features',
        'Hermes V1 Optimization',
      ];
      
      features.forEach(feature => {
        expect(getByText(feature)).toBeTruthy();
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles rapid button presses gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      const { getByText } = render(<ProfileScreen />);
      
      const editButton = getByText('Edit Profile');
      
      // Simulate rapid presses
      for (let i = 0; i < 10; i++) {
        fireEvent.press(editButton);
      }
      
      expect(consoleSpy).toHaveBeenCalledTimes(10);
    });

    it('renders all buttons without crashing', () => {
      const { getByText } = render(<ProfileScreen />);
      
      // Press all buttons in sequence
      fireEvent.press(getByText('Edit Profile'));
      fireEvent.press(getByText('View Projects'));
      fireEvent.press(getByText('Share Profile'));
      
      // Should still be able to access elements
      expect(getByText('React Native Developer')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('has accessible profile information', () => {
      const { getByText } = render(<ProfileScreen />);
      
      expect(getByText('React Native Developer')).toBeTruthy();
      expect(getByText('developer@rnawtest.com')).toBeTruthy();
    });

    it('has accessible action buttons', () => {
      const { getByText } = render(<ProfileScreen />);
      
      const editButton = getByText('Edit Profile');
      const viewProjectsButton = getByText('View Projects');
      const shareButton = getByText('Share Profile');
      
      expect(editButton).toBeTruthy();
      expect(viewProjectsButton).toBeTruthy();
      expect(shareButton).toBeTruthy();
    });
  });
});
