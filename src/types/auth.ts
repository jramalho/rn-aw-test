/**
 * Authentication types and interfaces
 * Supports multiple authentication methods: email/password, social login, and biometric
 */

export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  emailVerified: boolean;
  createdAt: string;
  lastLoginAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export enum AuthProvider {
  EMAIL = 'email',
  GOOGLE = 'google',
  APPLE = 'apple',
  BIOMETRIC = 'biometric',
}

export interface LoginOptions {
  provider: AuthProvider;
  credentials?: AuthCredentials;
  rememberMe?: boolean;
}

export interface SignUpOptions {
  email: string;
  password: string;
  displayName?: string;
}

export interface BiometricAuthOptions {
  promptMessage?: string;
  fallbackEnabled?: boolean;
}

export type AuthError = {
  code: string;
  message: string;
  details?: Record<string, unknown>;
};
