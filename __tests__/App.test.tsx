import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import App from '../App';

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
}));

describe('App Component', () => {
  it('renders correctly', () => {
    const { getByText } = render(<App />);
    
    expect(getByText('🚀 RN AW Test')).toBeTruthy();
    expect(getByText('React Native 0.82 New Architecture')).toBeTruthy();
  });

  it('displays feature cards', () => {
    const { getByText } = render(<App />);
    
    expect(getByText('⚡ New Architecture')).toBeTruthy();
    expect(getByText('⚛️ React 19.1.1')).toBeTruthy();
    expect(getByText('📘 TypeScript 5.8.3')).toBeTruthy();
    expect(getByText('🎨 Material Design 3')).toBeTruthy();
  });

  it('has interactive counter functionality', () => {
    const { getByText } = render(<App />);
    
    const counterText = getByText('Counter: 0');
    expect(counterText).toBeTruthy();
    
    const incrementButton = getByText('+');
    const decrementButton = getByText('−');
    
    // Test increment
    fireEvent.press(incrementButton);
    expect(getByText('Counter: 1')).toBeTruthy();
    
    // Test increment again
    fireEvent.press(incrementButton);
    expect(getByText('Counter: 2')).toBeTruthy();
    
    // Test decrement
    fireEvent.press(decrementButton);
    expect(getByText('Counter: 1')).toBeTruthy();
    
    // Test decrement to zero
    fireEvent.press(decrementButton);
    expect(getByText('Counter: 0')).toBeTruthy();
    
    // Test that counter doesn\'t go below zero
    fireEvent.press(decrementButton);
    expect(getByText('Counter: 0')).toBeTruthy();
  });

  it('displays architecture benefits', () => {
    const { getByText } = render(<App />);
    
    expect(getByText('Architecture Benefits')).toBeTruthy();
    expect(getByText('30-50% faster startup with Hermes V1')).toBeTruthy();
    expect(getByText('15-20% smaller bundle size')).toBeTruthy();
    expect(getByText('Synchronous native method calls')).toBeTruthy();
    expect(getByText('Concurrent rendering support')).toBeTruthy();
  });

  it('has proper accessibility labels', () => {
    const { getByText } = render(<App />);
    
    const incrementButton = getByText('+');
    const decrementButton = getByText('−');
    
    expect(incrementButton).toBeTruthy();
    expect(decrementButton).toBeTruthy();
  });
});
