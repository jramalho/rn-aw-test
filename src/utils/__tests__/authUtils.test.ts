/**
 * Tests for authentication utilities
 */

import {
  isTokenExpired,
  isValidToken,
  validateTokens,
  isValidEmail,
  isValidPassword,
  createAuthError,
  formatAuthError,
} from '../authUtils';
import type { AuthTokens } from '../../types';

describe('authUtils', () => {
  describe('isTokenExpired', () => {
    it('should return true for expired tokens', () => {
      const pastTime = Date.now() - 10000; // 10 seconds ago
      expect(isTokenExpired(pastTime)).toBe(true);
    });

    it('should return false for valid tokens', () => {
      const futureTime = Date.now() + 3600000; // 1 hour from now
      expect(isTokenExpired(futureTime)).toBe(false);
    });

    it('should return true for tokens about to expire (within buffer)', () => {
      const soonTime = Date.now() + 60000; // 1 minute from now (within 5 min buffer)
      expect(isTokenExpired(soonTime)).toBe(true);
    });
  });

  describe('isValidToken', () => {
    it('should validate JWT format tokens', () => {
      const validToken = 'header.payload.signature';
      expect(isValidToken(validToken)).toBe(true);
    });

    it('should reject invalid token formats', () => {
      expect(isValidToken('invalid')).toBe(false);
      expect(isValidToken('header.payload')).toBe(false);
      expect(isValidToken('')).toBe(false);
      expect(isValidToken(null as any)).toBe(false);
    });
  });

  describe('validateTokens', () => {
    it('should validate complete token objects', () => {
      const validTokens: AuthTokens = {
        accessToken: 'header.payload.signature',
        refreshToken: 'header.payload.signature',
        expiresAt: Date.now() + 3600000,
      };
      expect(validateTokens(validTokens)).toBe(true);
    });

    it('should reject null tokens', () => {
      expect(validateTokens(null)).toBe(false);
    });

    it('should reject expired tokens', () => {
      const expiredTokens: AuthTokens = {
        accessToken: 'header.payload.signature',
        refreshToken: 'header.payload.signature',
        expiresAt: Date.now() - 1000,
      };
      expect(validateTokens(expiredTokens)).toBe(false);
    });

    it('should reject invalid token formats', () => {
      const invalidTokens: AuthTokens = {
        accessToken: 'invalid',
        refreshToken: 'header.payload.signature',
        expiresAt: Date.now() + 3600000,
      };
      expect(validateTokens(invalidTokens)).toBe(false);
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct email formats', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('user+tag@example.com')).toBe(true);
    });

    it('should reject invalid email formats', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('test @example.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('isValidPassword', () => {
    it('should validate strong passwords', () => {
      const result = isValidPassword('StrongPass123');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject short passwords', () => {
      const result = isValidPassword('Short1');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters long');
    });

    it('should reject passwords without uppercase', () => {
      const result = isValidPassword('weakpass123');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
    });

    it('should reject passwords without lowercase', () => {
      const result = isValidPassword('WEAKPASS123');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one lowercase letter');
    });

    it('should reject passwords without numbers', () => {
      const result = isValidPassword('WeakPassword');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one number');
    });

    it('should return multiple errors for weak passwords', () => {
      const result = isValidPassword('weak');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });

  describe('createAuthError', () => {
    it('should create standardized auth errors', () => {
      const error = createAuthError('TEST_ERROR', 'Test message');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.message).toBe('Test message');
      expect(error.details).toBeUndefined();
    });

    it('should include optional details', () => {
      const details = { field: 'email', reason: 'invalid format' };
      const error = createAuthError('VALIDATION_ERROR', 'Invalid input', details);
      expect(error.details).toEqual(details);
    });
  });

  describe('formatAuthError', () => {
    it('should format Error objects', () => {
      const error = new Error('Test error message');
      expect(formatAuthError(error)).toBe('Test error message');
    });

    it('should format AuthError objects', () => {
      const error = createAuthError('TEST_ERROR', 'Test message');
      expect(formatAuthError(error)).toBe('Test message');
    });

    it('should handle unknown errors', () => {
      expect(formatAuthError(null)).toBe('An unknown error occurred');
      expect(formatAuthError(undefined)).toBe('An unknown error occurred');
      expect(formatAuthError('string error')).toBe('An unknown error occurred');
    });

    it('should handle objects with message property', () => {
      const error = { message: 'Custom message' };
      expect(formatAuthError(error)).toBe('Custom message');
    });
  });
});
