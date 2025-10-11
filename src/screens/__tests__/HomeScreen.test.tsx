import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import HomeScreen from '../HomeScreen';

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

jest.mock('../../hooks', () => ({
  useCountdown: jest.fn((initialTime) => ({
    time: initialTime,
    isActive: false,
    start: jest.fn(),
    pause: jest.fn(),
    reset: jest.fn(),
  })),
}));

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders correctly with all main sections', () => {
      const { getByText } = render(<HomeScreen />);
      
      expect(getByText('Welcome to RN AW Test!')).toBeTruthy();
      expect(getByText('Showcasing React Native 0.82 New Architecture')).toBeTruthy();
      expect(getByText('Interactive Features')).toBeTruthy();
      expect(getByText('New Architecture Benefits')).toBeTruthy();
    });

    it('displays counter demo section', () => {
      const { getByText } = render(<HomeScreen />);
      
      expect(getByText('Counter Demo')).toBeTruthy();
      expect(getByText('Count: 0')).toBeTruthy();
      expect(getByText('-')).toBeTruthy();
      expect(getByText('Reset')).toBeTruthy();
      expect(getByText('+')).toBeTruthy();
    });

    it('displays countdown timer section', () => {
      const { getByText } = render(<HomeScreen />);
      
      expect(getByText('Countdown Timer')).toBeTruthy();
      expect(getByText('1:00')).toBeTruthy();
      expect(getByText('Start')).toBeTruthy();
    });

    it('displays New Architecture benefits', () => {
      const { getByText } = render(<HomeScreen />);
      
      expect(getByText('⚡')).toBeTruthy();
      expect(getByText('Synchronous Native Calls')).toBeTruthy();
      expect(getByText('🚀')).toBeTruthy();
      expect(getByText('30-50% Faster Startup')).toBeTruthy();
      expect(getByText('📱')).toBeTruthy();
      expect(getByText('15-20% Smaller Bundle')).toBeTruthy();
      expect(getByText('🔄')).toBeTruthy();
      expect(getByText('Concurrent Rendering')).toBeTruthy();
    });
  });

  describe('Counter Functionality', () => {
    it('increments counter when + button is pressed', () => {
      const { getByText } = render(<HomeScreen />);
      
      const plusButton = getByText('+');
      fireEvent.press(plusButton);
      
      expect(getByText('Count: 1')).toBeTruthy();
    });

    it('decrements counter when - button is pressed', () => {
      const { getByText } = render(<HomeScreen />);
      
      // Increment first
      const plusButton = getByText('+');
      fireEvent.press(plusButton);
      fireEvent.press(plusButton);
      
      // Then decrement
      const minusButton = getByText('-');
      fireEvent.press(minusButton);
      
      expect(getByText('Count: 1')).toBeTruthy();
    });

    it('does not go below 0 when decrementing', () => {
      const { getByText } = render(<HomeScreen />);
      
      const minusButton = getByText('-');
      fireEvent.press(minusButton);
      fireEvent.press(minusButton);
      
      expect(getByText('Count: 0')).toBeTruthy();
    });

    it('resets counter to 0 when reset button is pressed', () => {
      const { getByText } = render(<HomeScreen />);
      
      // Increment counter
      const plusButton = getByText('+');
      fireEvent.press(plusButton);
      fireEvent.press(plusButton);
      fireEvent.press(plusButton);
      
      // Reset counter
      const resetButton = getByText('Reset');
      fireEvent.press(resetButton);
      
      expect(getByText('Count: 0')).toBeTruthy();
    });

    it('handles multiple increments correctly', () => {
      const { getByText } = render(<HomeScreen />);
      
      const plusButton = getByText('+');
      
      for (let i = 0; i < 5; i++) {
        fireEvent.press(plusButton);
      }
      
      expect(getByText('Count: 5')).toBeTruthy();
    });
  });

  describe('Countdown Timer Functionality', () => {
    it('displays countdown timer with initial time', () => {
      const { getByText } = render(<HomeScreen />);
      
      expect(getByText('1:00')).toBeTruthy();
    });

    it('calls start when Start button is pressed', () => {
      const mockStart = jest.fn();
      const useCountdown = require('../../hooks').useCountdown;
      useCountdown.mockReturnValue({
        time: 60,
        isActive: false,
        start: mockStart,
        pause: jest.fn(),
        reset: jest.fn(),
      });

      const { getByText } = render(<HomeScreen />);
      
      const startButton = getByText('Start');
      fireEvent.press(startButton);
      
      expect(mockStart).toHaveBeenCalledTimes(1);
    });

    it('changes button to Pause when timer is active', () => {
      const useCountdown = require('../../hooks').useCountdown;
      useCountdown.mockReturnValue({
        time: 55,
        isActive: true,
        start: jest.fn(),
        pause: jest.fn(),
        reset: jest.fn(),
      });

      const { getByText } = render(<HomeScreen />);
      
      expect(getByText('Pause')).toBeTruthy();
    });

    it('calls pause when Pause button is pressed', () => {
      const mockPause = jest.fn();
      const useCountdown = require('../../hooks').useCountdown;
      useCountdown.mockReturnValue({
        time: 55,
        isActive: true,
        start: jest.fn(),
        pause: mockPause,
        reset: jest.fn(),
      });

      const { getByText } = render(<HomeScreen />);
      
      const pauseButton = getByText('Pause');
      fireEvent.press(pauseButton);
      
      expect(mockPause).toHaveBeenCalledTimes(1);
    });

    it('calls reset when Reset button is pressed', () => {
      const mockReset = jest.fn();
      const useCountdown = require('../../hooks').useCountdown;
      useCountdown.mockReturnValue({
        time: 30,
        isActive: false,
        start: jest.fn(),
        pause: jest.fn(),
        reset: mockReset,
      });

      const { getByText } = render(<HomeScreen />);
      
      const resetButtons = getByText('Reset');
      // There are 2 Reset buttons (counter and timer), get the timer one
      fireEvent.press(resetButtons);
      
      expect(mockReset).toHaveBeenCalled();
    });

    it('displays time correctly in mm:ss format', () => {
      const useCountdown = require('../../hooks').useCountdown;
      
      // Test various times
      useCountdown.mockReturnValue({
        time: 125,
        isActive: false,
        start: jest.fn(),
        pause: jest.fn(),
        reset: jest.fn(),
      });

      const { getByText, rerender } = render(<HomeScreen />);
      expect(getByText('2:05')).toBeTruthy();
      
      // Test single digit seconds with padding
      useCountdown.mockReturnValue({
        time: 65,
        isActive: false,
        start: jest.fn(),
        pause: jest.fn(),
        reset: jest.fn(),
      });
      
      rerender(<HomeScreen />);
      expect(getByText('1:05')).toBeTruthy();
    });
  });

  describe('Theme Support', () => {
    it('renders correctly in light mode', () => {
      const useColorScheme = require('react-native').useColorScheme;
      useColorScheme.mockReturnValue('light');
      
      const { getByText } = render(<HomeScreen />);
      
      expect(getByText('Welcome to RN AW Test!')).toBeTruthy();
    });

    it('renders correctly in dark mode', () => {
      const useColorScheme = require('react-native').useColorScheme;
      useColorScheme.mockReturnValue('dark');
      
      const { getByText } = render(<HomeScreen />);
      
      expect(getByText('Welcome to RN AW Test!')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('handles rapid button presses on counter', () => {
      const { getByText } = render(<HomeScreen />);
      
      const plusButton = getByText('+');
      
      // Rapid presses
      for (let i = 0; i < 10; i++) {
        fireEvent.press(plusButton);
      }
      
      expect(getByText('Count: 10')).toBeTruthy();
    });

    it('handles alternating increment and decrement', () => {
      const { getByText } = render(<HomeScreen />);
      
      const plusButton = getByText('+');
      const minusButton = getByText('-');
      
      fireEvent.press(plusButton);
      fireEvent.press(plusButton);
      fireEvent.press(minusButton);
      fireEvent.press(plusButton);
      
      expect(getByText('Count: 2')).toBeTruthy();
    });

    it('renders scrollable content', () => {
      const { UNSAFE_getByType } = render(<HomeScreen />);
      
      const { ScrollView } = require('react-native');
      expect(UNSAFE_getByType(ScrollView)).toBeTruthy();
    });
  });
});
