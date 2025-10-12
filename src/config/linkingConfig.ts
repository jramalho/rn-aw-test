/**
 * Deep Linking Configuration
 * Handles URL schemes and universal/app links for iOS and Android
 */

import { LinkingOptions } from '@react-navigation/native';
import type { RootStackParamList } from '../types';

/**
 * URL scheme configuration
 */
const URL_SCHEME = 'rnawtest';
const DOMAIN = 'rnawtest.app';

/**
 * Navigation linking configuration
 * Supports:
 * - Custom URL scheme: rnawtest://
 * - Universal Links (iOS): https://rnawtest.app/
 * - App Links (Android): https://rnawtest.app/
 */
export const linkingConfig: LinkingOptions<RootStackParamList> = {
  prefixes: [
    `${URL_SCHEME}://`,
    `https://${DOMAIN}`,
    `http://${DOMAIN}`,
  ],
  config: {
    screens: {
      // Auth Screens
      Login: 'login',
      SignUp: 'signup',
      
      // Main Tab Navigator
      Main: {
        screens: {
          PokemonList: 'pokemon',
          TeamBuilder: 'team',
          PerformanceDashboard: 'performance',
          Profile: 'profile',
          Settings: 'settings',
        },
      },
      
      // Detail Screens
      PokemonDetail: {
        path: 'pokemon/:id',
        parse: {
          id: (id: string) => id,
        },
      },
      
      // Settings Screens
      NotificationSettings: 'notifications',
    },
  },
};

/**
 * Common deep link URL patterns
 */
export const DeepLinkPatterns = {
  // Pokemon related
  POKEMON_LIST: `${URL_SCHEME}://pokemon`,
  POKEMON_DETAIL: (id: string | number) => `${URL_SCHEME}://pokemon/${id}`,
  
  // Team related
  TEAM_BUILDER: `${URL_SCHEME}://team`,
  
  // User related
  PROFILE: `${URL_SCHEME}://profile`,
  LOGIN: `${URL_SCHEME}://login`,
  SIGNUP: `${URL_SCHEME}://signup`,
  
  // Settings
  SETTINGS: `${URL_SCHEME}://settings`,
  NOTIFICATIONS: `${URL_SCHEME}://notifications`,
  
  // Performance
  PERFORMANCE: `${URL_SCHEME}://performance`,
} as const;

/**
 * Universal/App Link patterns (https)
 */
export const WebLinkPatterns = {
  // Pokemon related
  POKEMON_LIST: `https://${DOMAIN}/pokemon`,
  POKEMON_DETAIL: (id: string | number) => `https://${DOMAIN}/pokemon/${id}`,
  
  // Team related
  TEAM_BUILDER: `https://${DOMAIN}/team`,
  
  // User related
  PROFILE: `https://${DOMAIN}/profile`,
  LOGIN: `https://${DOMAIN}/login`,
  SIGNUP: `https://${DOMAIN}/signup`,
  
  // Settings
  SETTINGS: `https://${DOMAIN}/settings`,
  NOTIFICATIONS: `https://${DOMAIN}/notifications`,
  
  // Performance
  PERFORMANCE: `https://${DOMAIN}/performance`,
} as const;

/**
 * Parse deep link URL and extract route parameters
 */
export function parseDeepLink(url: string): {
  screen: string;
  params?: Record<string, any>;
} | null {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname.replace(/^\//, ''); // Remove leading slash
    const pathSegments = pathname.split('/');
    
    // Handle different URL patterns
    switch (pathSegments[0]) {
      case 'pokemon':
        if (pathSegments[1]) {
          return {
            screen: 'PokemonDetail',
            params: { id: pathSegments[1] },
          };
        }
        return { screen: 'PokemonList' };
        
      case 'team':
        return { screen: 'TeamBuilder' };
        
      case 'profile':
        return { screen: 'Profile' };
        
      case 'settings':
        return { screen: 'Settings' };
        
      case 'notifications':
        return { screen: 'NotificationSettings' };
        
      case 'performance':
        return { screen: 'PerformanceDashboard' };
        
      case 'login':
        return { screen: 'Login' };
        
      case 'signup':
        return { screen: 'SignUp' };
        
      default:
        return null;
    }
  } catch (error) {
    console.error('Error parsing deep link:', error);
    return null;
  }
}

/**
 * Validate if a URL is a valid deep link for this app
 */
export function isValidDeepLink(url: string): boolean {
  if (!url) return false;
  
  try {
    const urlObj = new URL(url);
    
    // Check if URL matches our scheme or domain
    return (
      urlObj.protocol === `${URL_SCHEME}:` ||
      urlObj.hostname === DOMAIN
    );
  } catch {
    return false;
  }
}

/**
 * Get the app's custom URL scheme
 */
export function getUrlScheme(): string {
  return URL_SCHEME;
}

/**
 * Get the app's domain for universal/app links
 */
export function getDomain(): string {
  return DOMAIN;
}
