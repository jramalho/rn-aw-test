/**
 * Deep Linking Configuration Tests
 */

import {
  parseDeepLink,
  isValidDeepLink,
  getUrlScheme,
  getDomain,
  DeepLinkPatterns,
  WebLinkPatterns,
} from '../linkingConfig';

describe('Deep Linking Configuration', () => {
  describe('parseDeepLink', () => {
    it('should parse Pokemon list deep link', () => {
      const result = parseDeepLink('rnawtest://pokemon');
      expect(result).toEqual({ screen: 'PokemonList' });
    });

    it('should parse Pokemon detail deep link with ID', () => {
      const result = parseDeepLink('rnawtest://pokemon/25');
      expect(result).toEqual({
        screen: 'PokemonDetail',
        params: { id: '25' },
      });
    });

    it('should parse team builder deep link', () => {
      const result = parseDeepLink('rnawtest://team');
      expect(result).toEqual({ screen: 'TeamBuilder' });
    });

    it('should parse profile deep link', () => {
      const result = parseDeepLink('rnawtest://profile');
      expect(result).toEqual({ screen: 'Profile' });
    });

    it('should parse settings deep link', () => {
      const result = parseDeepLink('rnawtest://settings');
      expect(result).toEqual({ screen: 'Settings' });
    });

    it('should parse notifications deep link', () => {
      const result = parseDeepLink('rnawtest://notifications');
      expect(result).toEqual({ screen: 'NotificationSettings' });
    });

    it('should parse performance deep link', () => {
      const result = parseDeepLink('rnawtest://performance');
      expect(result).toEqual({ screen: 'PerformanceDashboard' });
    });

    it('should parse login deep link', () => {
      const result = parseDeepLink('rnawtest://login');
      expect(result).toEqual({ screen: 'Login' });
    });

    it('should parse signup deep link', () => {
      const result = parseDeepLink('rnawtest://signup');
      expect(result).toEqual({ screen: 'SignUp' });
    });

    it('should parse web link (https)', () => {
      const result = parseDeepLink('https://rnawtest.app/pokemon/25');
      expect(result).toEqual({
        screen: 'PokemonDetail',
        params: { id: '25' },
      });
    });

    it('should return null for invalid path', () => {
      const result = parseDeepLink('rnawtest://invalid');
      expect(result).toBeNull();
    });

    it('should return null for invalid URL', () => {
      const result = parseDeepLink('not-a-url');
      expect(result).toBeNull();
    });
  });

  describe('isValidDeepLink', () => {
    it('should validate custom URL scheme', () => {
      expect(isValidDeepLink('rnawtest://pokemon')).toBe(true);
      expect(isValidDeepLink('rnawtest://team')).toBe(true);
    });

    it('should validate web links', () => {
      expect(isValidDeepLink('https://rnawtest.app/pokemon')).toBe(true);
      expect(isValidDeepLink('http://rnawtest.app/team')).toBe(true);
    });

    it('should reject invalid schemes', () => {
      expect(isValidDeepLink('wrongscheme://pokemon')).toBe(false);
      expect(isValidDeepLink('https://wrongdomain.com/pokemon')).toBe(false);
    });

    it('should reject empty or invalid URLs', () => {
      expect(isValidDeepLink('')).toBe(false);
      expect(isValidDeepLink('not-a-url')).toBe(false);
    });
  });

  describe('getUrlScheme', () => {
    it('should return the correct URL scheme', () => {
      expect(getUrlScheme()).toBe('rnawtest');
    });
  });

  describe('getDomain', () => {
    it('should return the correct domain', () => {
      expect(getDomain()).toBe('rnawtest.app');
    });
  });

  describe('DeepLinkPatterns', () => {
    it('should have correct Pokemon patterns', () => {
      expect(DeepLinkPatterns.POKEMON_LIST).toBe('rnawtest://pokemon');
      expect(DeepLinkPatterns.POKEMON_DETAIL(25)).toBe('rnawtest://pokemon/25');
      expect(DeepLinkPatterns.POKEMON_DETAIL('pikachu')).toBe(
        'rnawtest://pokemon/pikachu'
      );
    });

    it('should have correct navigation patterns', () => {
      expect(DeepLinkPatterns.TEAM_BUILDER).toBe('rnawtest://team');
      expect(DeepLinkPatterns.PROFILE).toBe('rnawtest://profile');
      expect(DeepLinkPatterns.SETTINGS).toBe('rnawtest://settings');
      expect(DeepLinkPatterns.NOTIFICATIONS).toBe('rnawtest://notifications');
      expect(DeepLinkPatterns.PERFORMANCE).toBe('rnawtest://performance');
    });

    it('should have correct auth patterns', () => {
      expect(DeepLinkPatterns.LOGIN).toBe('rnawtest://login');
      expect(DeepLinkPatterns.SIGNUP).toBe('rnawtest://signup');
    });
  });

  describe('WebLinkPatterns', () => {
    it('should have correct Pokemon patterns', () => {
      expect(WebLinkPatterns.POKEMON_LIST).toBe('https://rnawtest.app/pokemon');
      expect(WebLinkPatterns.POKEMON_DETAIL(25)).toBe(
        'https://rnawtest.app/pokemon/25'
      );
      expect(WebLinkPatterns.POKEMON_DETAIL('pikachu')).toBe(
        'https://rnawtest.app/pokemon/pikachu'
      );
    });

    it('should have correct navigation patterns', () => {
      expect(WebLinkPatterns.TEAM_BUILDER).toBe('https://rnawtest.app/team');
      expect(WebLinkPatterns.PROFILE).toBe('https://rnawtest.app/profile');
      expect(WebLinkPatterns.SETTINGS).toBe('https://rnawtest.app/settings');
      expect(WebLinkPatterns.NOTIFICATIONS).toBe(
        'https://rnawtest.app/notifications'
      );
      expect(WebLinkPatterns.PERFORMANCE).toBe(
        'https://rnawtest.app/performance'
      );
    });

    it('should have correct auth patterns', () => {
      expect(WebLinkPatterns.LOGIN).toBe('https://rnawtest.app/login');
      expect(WebLinkPatterns.SIGNUP).toBe('https://rnawtest.app/signup');
    });
  });
});
