/**
 * Authentication Screen Tests
 * Tests for login and signup screens
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '../LoginScreen';
import SignUpScreen from '../SignUpScreen';
import { useAuth } from '../../hooks/useAuth';
import { Alert } from 'react-native';

// Mock the useAuth hook
jest.mock('../../hooks/useAuth');
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

// Mock Alert
jest.spyOn(Alert, 'alert');

// Mock navigation
const mockNavigate = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
};

describe('LoginScreen', () => {
  const mockLogin = jest.fn();
  const mockClearError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      login: mockLogin,
      signUp: jest.fn(),
      logout: jest.fn(),
      refreshTokens: jest.fn(),
      updateUser: jest.fn(),
      clearError: mockClearError,
      biometricLogin: jest.fn(),
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      isSessionValid: jest.fn(() => false),
    });
  });

  it('renders correctly', () => {
    const { getByText, getByPlaceholderText } = render(
      <LoginScreen navigation={mockNavigation as any} route={{} as any} />
    );

    expect(getByText('Welcome Back')).toBeTruthy();
    expect(getByText('Sign in to continue to PokéDex')).toBeTruthy();
  });

  it('shows error when submitting empty form', async () => {
    const { getByText } = render(
      <LoginScreen navigation={mockNavigation as any} route={{} as any} />
    );

    const signInButton = getByText('Sign In');
    fireEvent.press(signInButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'Please enter both email and password'
      );
    });
  });

  it('navigates to sign up screen when sign up link is pressed', () => {
    const { getByText } = render(
      <LoginScreen navigation={mockNavigation as any} route={{} as any} />
    );

    const signUpLink = getByText('Sign Up');
    fireEvent.press(signUpLink);

    expect(mockClearError).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('SignUp');
  });
});

describe('SignUpScreen', () => {
  const mockSignUp = jest.fn();
  const mockClearError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      login: jest.fn(),
      signUp: mockSignUp,
      logout: jest.fn(),
      refreshTokens: jest.fn(),
      updateUser: jest.fn(),
      clearError: mockClearError,
      biometricLogin: jest.fn(),
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      isSessionValid: jest.fn(() => false),
    });
  });

  it('renders correctly', () => {
    const { getByText } = render(
      <SignUpScreen navigation={mockNavigation as any} route={{} as any} />
    );

    expect(getByText('Create Account')).toBeTruthy();
    expect(getByText('Join PokéDex community today')).toBeTruthy();
  });

  it('shows error when passwords do not match', async () => {
    const { getByText, getByLabelText } = render(
      <SignUpScreen navigation={mockNavigation as any} route={{} as any} />
    );

    const emailInput = getByLabelText('Email *');
    const passwordInput = getByLabelText('Password *');
    const confirmPasswordInput = getByLabelText('Confirm Password *');
    const signUpButton = getByText('Sign Up');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.changeText(confirmPasswordInput, 'password456');
    fireEvent.press(signUpButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Passwords do not match');
    });
  });

  it('navigates to login screen when sign in link is pressed', () => {
    const { getByText } = render(
      <SignUpScreen navigation={mockNavigation as any} route={{} as any} />
    );

    const signInLink = getByText('Sign In');
    fireEvent.press(signInLink);

    expect(mockClearError).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('Login');
  });
});
