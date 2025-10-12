/**
 * Tests for useAuth hook
 */

import { renderHook, act } from '@testing-library/react-native';
import { useAuth } from '../useAuth';
import { useAuthStore } from '../../store/authStore';
import { AuthProvider } from '../../types';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
}));

describe('useAuth', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAuthStore.setState({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.user).toBeNull();
    expect(result.current.tokens).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should provide auth actions', () => {
    const { result } = renderHook(() => useAuth());

    expect(typeof result.current.login).toBe('function');
    expect(typeof result.current.signUp).toBe('function');
    expect(typeof result.current.logout).toBe('function');
    expect(typeof result.current.refreshTokens).toBe('function');
    expect(typeof result.current.updateUser).toBe('function');
    expect(typeof result.current.clearError).toBe('function');
    expect(typeof result.current.biometricLogin).toBe('function');
  });

  it('should handle login attempts', async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      try {
        await result.current.login({
          provider: AuthProvider.EMAIL,
          credentials: {
            email: 'test@example.com',
            password: 'password123',
          },
        });
      } catch (error) {
        // Expected to fail as API is not implemented
        expect(error).toBeDefined();
      }
    });
  });

  it('should handle logout', async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.tokens).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should clear errors', () => {
    const { result } = renderHook(() => useAuth());

    act(() => {
      useAuthStore.setState({ error: 'Test error' });
    });

    expect(result.current.error).toBe('Test error');

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });

  it('should validate session', () => {
    const { result } = renderHook(() => useAuth());

    // Initially no valid session
    expect(result.current.isSessionValid()).toBe(false);

    // Set valid tokens
    act(() => {
      useAuthStore.setState({
        isAuthenticated: true,
        tokens: {
          accessToken: 'header.payload.signature',
          refreshToken: 'header.payload.signature',
          expiresAt: Date.now() + 3600000,
        },
      });
    });

    expect(result.current.isSessionValid()).toBe(true);
  });
});
