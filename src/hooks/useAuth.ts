/**
 * useAuth Hook
 * Provides easy access to authentication state and actions
 */

import { useEffect, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { getStoredTokens, getStoredUser, validateTokens } from '../utils/authUtils';
import type { LoginOptions, SignUpOptions, BiometricAuthOptions } from '../types';

export const useAuth = () => {
  const {
    user,
    tokens,
    isAuthenticated,
    isLoading,
    error,
    login,
    signUp,
    logout,
    refreshTokens,
    updateUser,
    clearError,
    biometricLogin,
  } = useAuthStore();

  /**
   * Initialize auth state from storage on mount
   */
  useEffect(() => {
    const initializeAuth = async () => {
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
          });
        } else {
          // Clear invalid auth state
          await logout();
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        await logout();
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
      } catch (error) {
        // Error is already set in store
        console.error('Login failed:', error);
        throw error;
      }
    },
    [login]
  );

  /**
   * Handle sign up with error handling
   */
  const handleSignUp = useCallback(
    async (options: SignUpOptions) => {
      try {
        await signUp(options);
      } catch (error) {
        // Error is already set in store
        console.error('Sign up failed:', error);
        throw error;
      }
    },
    [signUp]
  );

  /**
   * Handle logout with error handling
   */
  const handleLogout = useCallback(async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  }, [logout]);

  /**
   * Handle token refresh with error handling
   */
  const handleRefreshTokens = useCallback(async () => {
    try {
      await refreshTokens();
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw error;
    }
  }, [refreshTokens]);

  /**
   * Handle biometric login with error handling
   */
  const handleBiometricLogin = useCallback(
    async (options?: BiometricAuthOptions) => {
      try {
        await biometricLogin(options);
      } catch (error) {
        console.error('Biometric login failed:', error);
        throw error;
      }
    },
    [biometricLogin]
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
