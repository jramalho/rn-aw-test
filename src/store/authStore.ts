/**
 * Authentication Store
 * Manages authentication state using Zustand with AsyncStorage persistence
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  AuthState,
  User,
  AuthTokens,
  LoginOptions,
  SignUpOptions,
  BiometricAuthOptions,
  AuthError,
} from '../types';
import { authApi } from '../utils/authApi';

interface AuthStore extends AuthState {
  // Actions
  login: (options: LoginOptions) => Promise<void>;
  signUp: (options: SignUpOptions) => Promise<void>;
  logout: () => Promise<void>;
  refreshTokens: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
  clearError: () => void;
  biometricLogin: (options?: BiometricAuthOptions) => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Login action
      login: async (options: LoginOptions) => {
        set({ isLoading: true, error: null });
        try {
          const { credentials } = options;
          if (!credentials) {
            throw new Error('Email and password are required');
          }

          const { user, tokens } = await authApi.login(credentials);

          set({
            user,
            tokens,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const authError: AuthError = {
            code: 'LOGIN_FAILED',
            message: error instanceof Error ? error.message : 'Login failed',
          };
          set({ error: authError.message, isLoading: false });
          throw authError;
        }
      },

      // Sign up action
      signUp: async (options: SignUpOptions) => {
        set({ isLoading: true, error: null });
        try {
          const { user, tokens } = await authApi.signUp(options);

          set({
            user,
            tokens,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const authError: AuthError = {
            code: 'SIGNUP_FAILED',
            message: error instanceof Error ? error.message : 'Sign up failed',
          };
          set({ error: authError.message, isLoading: false });
          throw authError;
        }
      },

      // Logout action
      logout: async () => {
        set({ isLoading: true });
        try {
          await authApi.logout();
          
          // Clear local storage
          await AsyncStorage.multiRemove(['auth-storage']);
          
          set({
            user: null,
            tokens: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Logout failed',
            isLoading: false,
          });
        }
      },

      // Refresh tokens action
      refreshTokens: async () => {
        const { tokens } = get();
        if (!tokens) {
          throw new Error('No tokens to refresh');
        }

        set({ isLoading: true, error: null });
        try {
          const newTokens = await authApi.refreshTokens(tokens.refreshToken);

          set({
            tokens: newTokens,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const authError: AuthError = {
            code: 'TOKEN_REFRESH_FAILED',
            message: error instanceof Error ? error.message : 'Token refresh failed',
          };
          set({ error: authError.message, isLoading: false });
          
          // If refresh fails, logout the user
          await get().logout();
          throw authError;
        }
      },

      // Update user profile
      updateUser: (userData: Partial<User>) => {
        const { user } = get();
        if (!user) {
          return;
        }

        set({
          user: {
            ...user,
            ...userData,
          },
        });
      },

      // Clear error
      clearError: () => {
        set({ error: null });
      },

      // Biometric login
      biometricLogin: async (options?: BiometricAuthOptions) => {
        set({ isLoading: true, error: null });
        try {
          // TODO: Implement biometric authentication
          // This will require react-native-biometrics or similar library
          throw new Error('Biometric login not implemented yet. Library integration pending.');
        } catch (error) {
          const authError: AuthError = {
            code: 'BIOMETRIC_AUTH_FAILED',
            message: error instanceof Error ? error.message : 'Biometric authentication failed',
          };
          set({ error: authError.message, isLoading: false });
          throw authError;
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
