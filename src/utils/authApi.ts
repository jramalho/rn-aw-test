/**
 * Authentication API Service
 * Integration with DummyJSON API for demonstration purposes
 * Uses real API endpoints from https://dummyjson.com/docs/auth
 */

import type { User, AuthTokens, AuthCredentials, SignUpOptions } from '../types/auth';

const DUMMYJSON_API_BASE = 'https://dummyjson.com';

// Helper to convert DummyJSON user response to our User type
const convertDummyJsonUser = (dummyUser: any): User => {
  const now = new Date().toISOString();
  return {
    id: String(dummyUser.id),
    email: dummyUser.email,
    displayName: `${dummyUser.firstName} ${dummyUser.lastName}`,
    photoURL: dummyUser.image,
    emailVerified: true,
    createdAt: now,
    lastLoginAt: now,
  };
};

// Helper to convert DummyJSON auth response to our AuthTokens type
const convertDummyJsonTokens = (response: any): AuthTokens => {
  // DummyJSON tokens expire in 60 minutes by default
  const expiresInMs = 60 * 60 * 1000; // 60 minutes
  return {
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
    expiresAt: Date.now() + expiresInMs,
  };
};

export const authApi = {
  /**
   * Login with username and password using DummyJSON API
   * Note: DummyJSON uses username instead of email for authentication
   * Available test users: emilys/emilyspass, michaelw/michaelwpass, etc.
   */
  login: async (credentials: AuthCredentials): Promise<{ user: User; tokens: AuthTokens }> => {
    const { email, password } = credentials;

    try {
      const response = await fetch(`${DUMMYJSON_API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: email, // Using email field as username for compatibility
          password,
          expiresInMins: 60,
        }),
      });

      if (!response.ok) {
        throw new Error('Invalid username or password');
      }

      const data = await response.json();

      // Convert DummyJSON response to our format
      const user = convertDummyJsonUser(data);
      const tokens = convertDummyJsonTokens(data);

      return { user, tokens };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Login failed');
    }
  },

  /**
   * Sign up - Note: DummyJSON doesn't support user registration
   * This is a mock implementation that throws an error with instructions
   */
  signUp: async (options: SignUpOptions): Promise<{ user: User; tokens: AuthTokens }> => {
    throw new Error(
      'Sign up is not available with DummyJSON API. Please use one of the existing test accounts: emilys/emilyspass, michaelw/michaelwpass, sophiab/sophiabpass, etc.',
    );
  },

  /**
   * Refresh authentication tokens using DummyJSON API
   */
  refreshTokens: async (refreshToken: string): Promise<AuthTokens> => {
    try {
      const response = await fetch(`${DUMMYJSON_API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken,
          expiresInMins: 60,
        }),
      });

      if (!response.ok) {
        throw new Error('Invalid refresh token');
      }

      const data = await response.json();
      return convertDummyJsonTokens(data);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Token refresh failed');
    }
  },

  /**
   * Logout - DummyJSON doesn't have a logout endpoint
   * Tokens are stateless JWTs, so logout is handled client-side
   */
  logout: async (): Promise<void> => {
    // No server-side logout needed for DummyJSON
    // Tokens will naturally expire
  },

  /**
   * Get current authenticated user using access token
   */
  getCurrentUser: async (accessToken: string): Promise<User> => {
    try {
      const response = await fetch(`${DUMMYJSON_API_BASE}/auth/me`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const data = await response.json();
      return convertDummyJsonUser(data);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to get user');
    }
  },

  /**
   * Reset password - Not supported by DummyJSON
   */
  resetPassword: async (email: string): Promise<void> => {
    throw new Error('Password reset is not available with DummyJSON API');
  },

  /**
   * Verify email - Not supported by DummyJSON
   */
  verifyEmail: async (token: string): Promise<void> => {
    throw new Error('Email verification is not available with DummyJSON API');
  },
};

/**
 * Helper function to seed demo users for testing
 * DummyJSON provides these test accounts:
 * - emilys / emilyspass
 * - michaelw / michaelwpass
 * - sophiab / sophiabpass
 * - jamesd / jamesdpass
 * - emmaj / emmajpass
 * - oliviaw / oliviawpass
 * - alexanderj / alexanderjpass
 * - avat / avatpass
 * And many more at https://dummyjson.com/users
 */
export const seedDemoUsers = () => {
  console.log('DummyJSON API Integration Active');
  console.log('Test Accounts Available:');
  console.log('  - emilys / emilyspass');
  console.log('  - michaelw / michaelwpass');
  console.log('  - sophiab / sophiabpass');
  console.log('  - jamesd / jamesdpass');
  console.log('See https://dummyjson.com/users for more accounts');
};
