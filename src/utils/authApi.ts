/**
 * Authentication API Service
 * Mock implementation for demonstration purposes
 * In production, this would connect to a real backend API
 */

import type { User, AuthTokens, AuthCredentials, SignUpOptions } from '../types/auth';

// Simulate network delay
const NETWORK_DELAY = 1000;

// Mock user database (in production, this would be on the backend)
const mockUsers = new Map<string, { password: string; user: User }>();

// Helper to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to generate mock tokens
const generateTokens = (): AuthTokens => {
  const now = Date.now();
  return {
    accessToken: `mock_access_token_${Math.random().toString(36).substring(7)}`,
    refreshToken: `mock_refresh_token_${Math.random().toString(36).substring(7)}`,
    expiresAt: now + 3600000, // 1 hour from now
  };
};

// Helper to generate mock user
const generateUser = (email: string, displayName?: string): User => {
  const now = new Date().toISOString();
  return {
    id: `user_${Math.random().toString(36).substring(7)}`,
    email,
    displayName: displayName || email.split('@')[0],
    emailVerified: false, // Would be verified via email in production
    createdAt: now,
    lastLoginAt: now,
  };
};

export const authApi = {
  /**
   * Login with email and password
   */
  login: async (credentials: AuthCredentials): Promise<{ user: User; tokens: AuthTokens }> => {
    await delay(NETWORK_DELAY);

    const { email, password } = credentials;

    // Check if user exists
    const userData = mockUsers.get(email.toLowerCase());
    if (!userData) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    if (userData.password !== password) {
      throw new Error('Invalid email or password');
    }

    // Update last login
    const user = {
      ...userData.user,
      lastLoginAt: new Date().toISOString(),
    };

    // Generate tokens
    const tokens = generateTokens();

    // Update stored user
    mockUsers.set(email.toLowerCase(), { ...userData, user });

    return { user, tokens };
  },

  /**
   * Sign up with email and password
   */
  signUp: async (options: SignUpOptions): Promise<{ user: User; tokens: AuthTokens }> => {
    await delay(NETWORK_DELAY);

    const { email, password, displayName } = options;

    // Check if user already exists
    if (mockUsers.has(email.toLowerCase())) {
      throw new Error('An account with this email already exists');
    }

    // Validate password strength (basic validation)
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    // Create new user
    const user = generateUser(email, displayName);

    // Generate tokens
    const tokens = generateTokens();

    // Store user
    mockUsers.set(email.toLowerCase(), { password, user });

    return { user, tokens };
  },

  /**
   * Refresh authentication tokens
   */
  refreshTokens: async (refreshToken: string): Promise<AuthTokens> => {
    await delay(NETWORK_DELAY);

    // In production, validate the refresh token on the backend
    if (!refreshToken || !refreshToken.startsWith('mock_refresh_token_')) {
      throw new Error('Invalid refresh token');
    }

    // Generate new tokens
    return generateTokens();
  },

  /**
   * Logout (invalidate tokens on backend)
   */
  logout: async (): Promise<void> => {
    await delay(500);
    // In production, this would invalidate tokens on the backend
  },

  /**
   * Reset password
   */
  resetPassword: async (email: string): Promise<void> => {
    await delay(NETWORK_DELAY);

    // Check if user exists
    if (!mockUsers.has(email.toLowerCase())) {
      // In production, don't reveal if email exists for security
      // But for demo purposes, we'll throw an error
      throw new Error('No account found with this email');
    }

    // In production, this would send a password reset email
    console.log(`Password reset email sent to: ${email}`);
  },

  /**
   * Verify email
   */
  verifyEmail: async (token: string): Promise<void> => {
    await delay(NETWORK_DELAY);

    // In production, validate the verification token
    if (!token) {
      throw new Error('Invalid verification token');
    }

    // Update user's email verification status
    console.log('Email verified successfully');
  },
};

/**
 * Helper function to seed demo users for testing
 */
export const seedDemoUsers = () => {
  const demoUser = {
    email: 'demo@example.com',
    password: 'demo12345',
    displayName: 'Demo User',
  };

  const user = generateUser(demoUser.email, demoUser.displayName);
  mockUsers.set(demoUser.email.toLowerCase(), {
    password: demoUser.password,
    user,
  });

  console.log('Demo user seeded:', demoUser.email, '/', demoUser.password);
};
