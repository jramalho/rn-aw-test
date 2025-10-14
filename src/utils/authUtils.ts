/**
 * Authentication utility functions
 * Includes token validation, secure storage, and auth helpers
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthTokens, User, AuthError } from '../types';

// Storage keys
const STORAGE_KEYS = {
  AUTH_TOKENS: 'auth-tokens',
  USER_DATA: 'user-data',
  BIOMETRIC_ENABLED: 'biometric-enabled',
} as const;

/**
 * Check if access token is expired
 */
export const isTokenExpired = (expiresAt: number): boolean => {
  const now = Date.now();
  // Add 5-minute buffer to refresh before actual expiration
  const bufferMs = 5 * 60 * 1000;
  return now >= expiresAt - bufferMs;
};

/**
 * Validate token format
 */
export const isValidToken = (token: string): boolean => {
  if (!token || typeof token !== 'string') {
    return false;
  }
  // Basic JWT format validation (header.payload.signature)
  const parts = token.split('.');
  return parts.length === 3;
};

/**
 * Validate auth tokens
 */
export const validateTokens = (tokens: AuthTokens | null): boolean => {
  if (!tokens) {
    return false;
  }

  const { accessToken, refreshToken, expiresAt } = tokens;

  return (
    isValidToken(accessToken) &&
    isValidToken(refreshToken) &&
    !isTokenExpired(expiresAt)
  );
};

/**
 * Securely store auth tokens
 */
export const storeTokens = async (tokens: AuthTokens): Promise<void> => {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.AUTH_TOKENS,
      JSON.stringify(tokens),
    );
  } catch (error) {
    throw new Error(
      `Failed to store tokens: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
    );
  }
};

/**
 * Retrieve auth tokens from storage
 */
export const getStoredTokens = async (): Promise<AuthTokens | null> => {
  try {
    const tokensJson = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKENS);
    if (!tokensJson) {
      return null;
    }

    const tokens = JSON.parse(tokensJson) as AuthTokens;
    return validateTokens(tokens) ? tokens : null;
  } catch (error) {
    console.error('Failed to retrieve tokens:', error);
    return null;
  }
};

/**
 * Securely store user data
 */
export const storeUser = async (user: User): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
  } catch (error) {
    throw new Error(
      `Failed to store user data: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
    );
  }
};

/**
 * Retrieve user data from storage
 */
export const getStoredUser = async (): Promise<User | null> => {
  try {
    const userJson = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
    return userJson ? (JSON.parse(userJson) as User) : null;
  } catch (error) {
    console.error('Failed to retrieve user data:', error);
    return null;
  }
};

/**
 * Clear all auth data from storage
 */
export const clearAuthStorage = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.AUTH_TOKENS,
      STORAGE_KEYS.USER_DATA,
    ]);
  } catch (error) {
    throw new Error(
      `Failed to clear auth storage: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
    );
  }
};

/**
 * Check if biometric authentication is enabled
 */
export const isBiometricEnabled = async (): Promise<boolean> => {
  try {
    const enabled = await AsyncStorage.getItem(STORAGE_KEYS.BIOMETRIC_ENABLED);
    return enabled === 'true';
  } catch (error) {
    console.error('Failed to check biometric status:', error);
    return false;
  }
};

/**
 * Enable or disable biometric authentication
 */
export const setBiometricEnabled = async (enabled: boolean): Promise<void> => {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.BIOMETRIC_ENABLED,
      enabled ? 'true' : 'false',
    );
  } catch (error) {
    throw new Error(
      `Failed to set biometric status: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
    );
  }
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * Requirements: at least 8 characters, 1 uppercase, 1 lowercase, 1 number
 */
export const isValidPassword = (
  password: string,
): {
  valid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Create a standardized auth error
 */
export const createAuthError = (
  code: string,
  message: string,
  details?: Record<string, unknown>,
): AuthError => ({
  code,
  message,
  details,
});

/**
 * Format authentication error for display
 */
export const formatAuthError = (error: AuthError | Error | unknown): string => {
  if (!error) {
    return 'An unknown error occurred';
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'object' && 'message' in error) {
    return (error as AuthError).message;
  }

  return 'An unknown error occurred';
};
