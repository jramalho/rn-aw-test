/**
 * ErrorScreen Component Tests
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ErrorScreen } from '../ErrorScreen';

// Mock navigation
const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({
      goBack: mockGoBack,
      canGoBack: jest.fn(() => true),
    }),
  };
});

describe('ErrorScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with default props', () => {
    const { getByText } = render(<ErrorScreen />);

    expect(getByText('Something went wrong')).toBeTruthy();
    expect(
      getByText('An unexpected error occurred. Please try again.'),
    ).toBeTruthy();
  });

  it('renders with custom title and message', () => {
    const { getByText } = render(
      <ErrorScreen title="Custom Error Title" message="Custom error message" />,
    );

    expect(getByText('Custom Error Title')).toBeTruthy();
    expect(getByText('Custom error message')).toBeTruthy();
  });

  it('calls onRetry when Try Again button is pressed', () => {
    const onRetry = jest.fn();
    const { getByText } = render(<ErrorScreen onRetry={onRetry} />);

    const retryButton = getByText('Try Again');
    fireEvent.press(retryButton);

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('calls onGoHome when Go Home button is pressed', () => {
    const onGoHome = jest.fn();
    const { getByText } = render(<ErrorScreen onGoHome={onGoHome} />);

    const homeButton = getByText('Go Home');
    fireEvent.press(homeButton);

    expect(onGoHome).toHaveBeenCalledTimes(1);
  });

  it('navigates back when Go Home is pressed without onGoHome prop', () => {
    const { getByText } = render(<ErrorScreen />);

    const homeButton = getByText('Go Home');
    fireEvent.press(homeButton);

    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });

  it('displays debug information in development mode', () => {
    const testError = new Error('Test error message');
    testError.stack = 'Test stack trace';

    const { getByText } = render(
      <ErrorScreen error={testError} showDebugInfo={true} />,
    );

    expect(getByText('Debug Information')).toBeTruthy();
    expect(getByText('Test error message')).toBeTruthy();
    expect(getByText('Test stack trace')).toBeTruthy();
  });

  it('hides debug information when showDebugInfo is false', () => {
    const testError = new Error('Test error message');
    const { queryByText } = render(
      <ErrorScreen error={testError} showDebugInfo={false} />,
    );

    expect(queryByText('Debug Information')).toBeNull();
  });

  it('shows Try Again button only when onRetry is provided', () => {
    const { queryByText } = render(<ErrorScreen />);
    expect(queryByText('Try Again')).toBeNull();

    const { getByText } = render(<ErrorScreen onRetry={() => {}} />);
    expect(getByText('Try Again')).toBeTruthy();
  });

  it('has accessible buttons', () => {
    const { getByLabelText } = render(<ErrorScreen onRetry={() => {}} />);

    const retryButton = getByLabelText('Retry');
    expect(retryButton).toBeTruthy();
    expect(retryButton.props.accessibilityRole).toBe('button');

    const homeButton = getByLabelText('Go to home screen');
    expect(homeButton).toBeTruthy();
    expect(homeButton.props.accessibilityRole).toBe('button');
  });

  it('renders error icon', () => {
    const { getByText } = render(<ErrorScreen />);
    expect(getByText('⚠️')).toBeTruthy();
  });
});
