/**
 * useAuth Hook
 * Provides easy access to authentication state and actions
 */

import { useEffect, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import {
  getStoredTokens,
  getStoredUser,
  validateTokens,
} from '../utils/authUtils';
import type {
  LoginOptions,
  SignUpOptions,
  BiometricAuthOptions,
} from '../types';

export const useAuth = () => {
  // Use optimized selectors to prevent unnecessary re-renders
  const user = useAuthStore(state => state.user);
  const tokens = useAuthStore(state => state.tokens);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const isLoading = useAuthStore(state => state.isLoading);
  const error = useAuthStore(state => state.error);
  const login = useAuthStore(state => state.login);
  const signUp = useAuthStore(state => state.signUp);
  const logout = useAuthStore(state => state.logout);
  const refreshTokens = useAuthStore(state => state.refreshTokens);
  const updateUser = useAuthStore(state => state.updateUser);
  const clearError = useAuthStore(state => state.clearError);
  const biometricLogin = useAuthStore(state => state.biometricLogin);

  /**
   * Initialize auth state from storage on mount
   */
  useEffect(() => {
    const initializeAuth = async () => {
      // Set loading to true during initialization
      useAuthStore.setState({ isLoading: true });

      try {
        const [storedTokens, storedUser] = await Promise.all([
          getStoredTokens(),
          getStoredUser(),
        ]);

        if (storedTokens && storedUser && validateTokens(storedTokens)) {
          // Restore auth state if tokens are valid
          useAuthStore.setState({
            user: storedUser,
            tokens: storedTokens,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } else {
          // Clear invalid auth state without calling logout (to avoid recursive calls)
          useAuthStore.setState({
            user: null,
            tokens: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      } catch {
        console.error('Failed to initialize auth:', initError);
        useAuthStore.setState({
          user: null,
          tokens: null,
          isAuthenticated: false,
          isLoading: false,
          error:
            initError instanceof Error
              ? initError.message
              : 'Failed to initialize auth',
        });
      }
    };

    initializeAuth();
  }, []);

  /**
   * Handle login with error handling
   */
  const handleLogin = useCallback(
    async (options: LoginOptions) => {
      try {
        await login(options);
      } catch (loginError) {
        // Error is already set in store
        console.error('Login failed:', loginError);
        throw loginError;
      }
    },
    [login],
  );

  /**
   * Handle sign up with error handling
   */
  const handleSignUp = useCallback(
    async (options: SignUpOptions) => {
      try {
        await signUp(options);
      } catch (signUpError) {
        // Error is already set in store
        console.error('Sign up failed:', signUpError);
        throw signUpError;
      }
    },
    [signUp],
  );

  /**
   * Handle logout with error handling
   */
  const handleLogout = useCallback(async () => {
    try {
      await logout();
    } catch (logoutError) {
      console.error('Logout failed:', logoutError);
      throw logoutError;
    }
  }, [logout]);

  /**
   * Handle token refresh with error handling
   */
  const handleRefreshTokens = useCallback(async () => {
    try {
      await refreshTokens();
    } catch (refreshError) {
      console.error('Token refresh failed:', refreshError);
      throw refreshError;
    }
  }, [refreshTokens]);

  /**
   * Handle biometric login with error handling
   */
  const handleBiometricLogin = useCallback(
    async (options?: BiometricAuthOptions) => {
      try {
        await biometricLogin(options);
      } catch (biometricError) {
        console.error('Biometric login failed:', biometricError);
        throw biometricError;
      }
    },
    [biometricLogin],
  );

  /**
   * Check if current session is valid
   */
  const isSessionValid = useCallback(() => {
    return isAuthenticated && validateTokens(tokens);
  }, [isAuthenticated, tokens]);

  return {
    // State
    user,
    tokens,
    isAuthenticated,
    isLoading,
    error,

    // Actions
    login: handleLogin,
    signUp: handleSignUp,
    logout: handleLogout,
    refreshTokens: handleRefreshTokens,
    updateUser,
    clearError,
    biometricLogin: handleBiometricLogin,

    // Helpers
    isSessionValid,
  };
};
