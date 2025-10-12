/**
 * Utility functions for the React Native app
 */

// Import necessary React Native modules
import { Platform, Dimensions } from 'react-native';

// Export error handler
export { globalErrorHandler } from './errorHandler';
export type { ErrorHandler } from './errorHandler';

// Platform utilities
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';

// Screen dimensions
export const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Responsive design helpers
export const scale = (size: number): number => (SCREEN_WIDTH / 375) * size;
export const verticalScale = (size: number): number => (SCREEN_HEIGHT / 667) * size;
export const moderateScale = (size: number, factor = 0.5): number => 
  size + (scale(size) - size) * factor;

// Color utilities
export const hexToRgba = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Pokemon Type Colors
export const getPokemonTypeColor = (type: string): string => {
  const typeColors: Record<string, string> = {
    normal: '#A8A878',
    fire: '#F08030',
    water: '#6890F0',
    electric: '#F8D030',
    grass: '#78C850',
    ice: '#98D8D8',
    fighting: '#C03028',
    poison: '#A040A0',
    ground: '#E0C068',
    flying: '#A890F0',
    psychic: '#F85888',
    bug: '#A8B820',
    rock: '#B8A038',
    ghost: '#705898',
    dragon: '#7038F8',
    dark: '#705848',
    steel: '#B8B8D0',
    fairy: '#EE99AC',
  };
  
  return typeColors[type.toLowerCase()] || '#68A090';
};

// Pokemon Stat Colors
export const getStatColor = (statName: string): string => {
  const statColors: Record<string, string> = {
    hp: '#FF5959',
    attack: '#F5AC78',
    defense: '#FAE078',
    'special-attack': '#9DB7F5',
    'special-defense': '#A7DB8D',
    speed: '#FA92B2',
  };
  
  return statColors[statName.toLowerCase()] || '#A0A0A0';
};

// String utilities
export const capitalize = (str: string): string => 
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

export const capitalizeWords = (str: string): string => 
  str.split(' ').map(word => capitalize(word)).join(' ');

export const formatPokemonName = (name: string): string => {
  return name.split('-').map(word => capitalize(word)).join(' ');
};

export const truncate = (str: string, length: number): string => 
  str.length > length ? `${str.substring(0, length)}...` : str;

// Number utilities
export const formatCurrency = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

export const clamp = (value: number, min: number, max: number): number => 
  Math.min(Math.max(value, min), max);

export const formatHeight = (decimeters: number): string => {
  const meters = decimeters / 10;
  return `${meters.toFixed(1)} m`;
};

export const formatWeight = (hectograms: number): string => {
  const kilograms = hectograms / 10;
  return `${kilograms.toFixed(1)} kg`;
};

export const formatPokemonId = (id: number): string => {
  return `#${id.toString().padStart(3, '0')}`;
};

export const getStatPercentage = (value: number, maxValue = 255): number => {
  return Math.round((value / maxValue) * 100);
};

// Date utilities
export const formatDate = (date: Date | string, format = 'short'): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (format === 'short') {
    return d.toLocaleDateString();
  }
  
  if (format === 'long') {
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
  
  return d.toISOString();
};

export const getTimeAgo = (date: Date | string): string => {
  const now = new Date();
  const past = typeof date === 'string' ? new Date(date) : date;
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

// Validation utilities
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

// Array utilities
export const uniqueBy = <T>(array: T[], key: keyof T): T[] => {
  const seen = new Set();
  return array.filter(item => {
    const value = item[key];
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
};

export const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {
  return array.reduce((groups, item) => {
    const groupKey = String(item[key]);
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {} as Record<string, T[]>);
};

// Pokemon utilities
export const getPokemonImageUrl = (id: number, variant: 'default' | 'shiny' | 'artwork' = 'default'): string => {
  const baseUrl = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';
  
  switch (variant) {
    case 'shiny':
      return `${baseUrl}/shiny/${id}.png`;
    case 'artwork':
      return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
    default:
      return `${baseUrl}/${id}.png`;
  }
};

export const getPokemonIdFromUrl = (url: string): number => {
  const matches = url.match(/\/(\d+)\/$/);
  return matches ? parseInt(matches[1], 10) : 0;
};

export const filterPokemonsByType = <T extends { types: any[] }>(
  pokemons: T[],
  typeFilter: string
): T[] => {
  if (!typeFilter) return pokemons;
  
  return pokemons.filter(pokemon =>
    pokemon.types.some(type => type.type.name.toLowerCase() === typeFilter.toLowerCase())
  );
};

export const sortPokemonsByName = <T extends { name: string }>(pokemons: T[]): T[] => {
  return [...pokemons].sort((a, b) => a.name.localeCompare(b.name));
};

export const sortPokemonsByNumber = <T extends { id: number }>(pokemons: T[]): T[] => {
  return [...pokemons].sort((a, b) => a.id - b.id);
};

// Performance utilities
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void => {
  let isThrottled = false;
  return (...args: Parameters<T>) => {
    if (!isThrottled) {
      func(...args);
      isThrottled = true;
      setTimeout(() => { isThrottled = false; }, delay);
    }
  };
};

// API utilities
export const buildPokemonApiUrl = (endpoint: string, params?: Record<string, string | number>): string => {
  const baseUrl = 'https://pokeapi.co/api/v2';
  let url = `${baseUrl}/${endpoint}`;
  
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, value.toString());
    });
    url += `?${searchParams.toString()}`;
  }
  
  return url;
};

// Cache utilities
export const createCacheKey = (...parts: (string | number)[]): string => {
  return parts.join(':');
};

// Import necessary React Native modules
import { Platform, Dimensions } from 'react-native';
