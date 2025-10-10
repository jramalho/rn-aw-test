/**
 * Pokémon API service
 * Handles all interactions with the PokéAPI (https://pokeapi.co)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Pokemon,
  PokemonSpecies,
  EvolutionChain,
  Type,
  Ability,
  NamedAPIResourceList,
} from '../types';

const BASE_URL = 'https://pokeapi.co/api/v2';
const CACHE_DURATION = 1000 * 60 * 30; // 30 minutes

// Cache interface
interface CacheItem<T> {
  data: T;
  timestamp: number;
}

// Cache utilities
const getCacheKey = (endpoint: string): string => `pokemon_api_${endpoint}`;

const isCacheValid = (timestamp: number): boolean => {
  return Date.now() - timestamp < CACHE_DURATION;
};

const getFromCache = async <T>(endpoint: string): Promise<T | null> => {
  try {
    const cacheKey = getCacheKey(endpoint);
    const cached = await AsyncStorage.getItem(cacheKey);
    
    if (cached) {
      const cacheItem: CacheItem<T> = JSON.parse(cached);
      if (isCacheValid(cacheItem.timestamp)) {
        return cacheItem.data;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
};

const setCache = async <T>(endpoint: string, data: T): Promise<void> => {
  try {
    const cacheKey = getCacheKey(endpoint);
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
    };
    
    await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheItem));
  } catch (error) {
    console.error('Cache set error:', error);
  }
};

// Generic API request function
const apiRequest = async <T>(endpoint: string, useCache = true): Promise<T> => {
  // Check cache first
  if (useCache) {
    const cached = await getFromCache<T>(endpoint);
    if (cached) {
      return cached;
    }
  }

  const url = `${BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Cache the response
    if (useCache) {
      await setCache(endpoint, data);
    }

    return data;
  } catch (error) {
    console.error('API request error:', error);
    throw new Error(`Failed to fetch data from ${url}: ${error}`);
  }
};

// Utility function to extract ID from URL
const extractIdFromUrl = (url: string): number => {
  const matches = url.match(/\/(\d+)\/$/);
  return matches ? parseInt(matches[1], 10) : 0;
};

// Pokemon API functions
export const pokemonApi = {
  // Get list of Pokemon with pagination
  getPokemonList: async (offset = 0, limit = 20): Promise<NamedAPIResourceList> => {
    const endpoint = `/pokemon?offset=${offset}&limit=${limit}`;
    return apiRequest<NamedAPIResourceList>(endpoint);
  },

  // Get detailed Pokemon data
  getPokemon: async (identifier: string | number): Promise<Pokemon> => {
    const endpoint = `/pokemon/${identifier}`;
    return apiRequest<Pokemon>(endpoint);
  },

  // Get multiple Pokemon by IDs (batch request)
  getPokemonBatch: async (ids: number[]): Promise<Pokemon[]> => {
    const promises = ids.map(id => pokemonApi.getPokemon(id));
    return Promise.all(promises);
  },

  // Search Pokemon by name
  searchPokemon: async (name: string): Promise<Pokemon | null> => {
    try {
      return await pokemonApi.getPokemon(name.toLowerCase());
    } catch {
      console.log(`Pokemon "${name}" not found`);
      return null;
    }
  },

  // Get Pokemon species data
  getPokemonSpecies: async (identifier: string | number): Promise<PokemonSpecies> => {
    const endpoint = `/pokemon-species/${identifier}`;
    return apiRequest<PokemonSpecies>(endpoint);
  },

  // Get evolution chain
  getEvolutionChain: async (id: number): Promise<EvolutionChain> => {
    const endpoint = `/evolution-chain/${id}`;
    return apiRequest<EvolutionChain>(endpoint);
  },

  // Get Pokemon type data
  getType: async (identifier: string | number): Promise<Type> => {
    const endpoint = `/type/${identifier}`;
    return apiRequest<Type>(endpoint);
  },

  // Get Pokemon ability data
  getAbility: async (identifier: string | number): Promise<Ability> => {
    const endpoint = `/ability/${identifier}`;
    return apiRequest<Ability>(endpoint);
  },

  // Get all Pokemon types
  getAllTypes: async (): Promise<NamedAPIResourceList> => {
    const endpoint = '/type';
    return apiRequest<NamedAPIResourceList>(endpoint);
  },

  // Get Pokemon by type
  getPokemonByType: async (typeId: number | string): Promise<Type> => {
    return pokemonApi.getType(typeId);
  },

  // Advanced search with filters
  searchPokemonAdvanced: async (filters: {
    name?: string;
    type?: string;
    minId?: number;
    maxId?: number;
  }): Promise<Pokemon[]> => {
    try {
      let results: Pokemon[] = [];

      if (filters.name) {
        const pokemon = await pokemonApi.searchPokemon(filters.name);
        if (pokemon) {
          results = [pokemon];
        }
      } else {
        // Get a range of Pokemon
        const startId = filters.minId || 1;
        const endId = filters.maxId || 151; // First generation by default
        const limit = Math.min(endId - startId + 1, 50); // Limit to prevent too many requests
        
        const pokemonList = await pokemonApi.getPokemonList(startId - 1, limit);
        const pokemonPromises = pokemonList.results.map(p => 
          pokemonApi.getPokemon(extractIdFromUrl(p.url))
        );
        
        results = await Promise.all(pokemonPromises);
      }

      // Apply type filter if specified
      if (filters.type && results.length > 0) {
        results = results.filter(pokemon =>
          pokemon.types.some(typeSlot => 
            typeSlot.type.name.toLowerCase() === filters.type!.toLowerCase()
          )
        );
      }

      return results;
    } catch (error) {
      console.error('Advanced search error:', error);
      return [];
    }
  },

  // Get random Pokemon
  getRandomPokemon: async (count = 1): Promise<Pokemon[]> => {
    const maxPokemonId = 1010; // Current max Pokemon ID
    const randomIds = Array.from({ length: count }, () => 
      Math.floor(Math.random() * maxPokemonId) + 1
    );
    
    return pokemonApi.getPokemonBatch(randomIds);
  },

  // Get Pokemon suggestions (for autocomplete)
  getPokemonSuggestions: async (query: string, limit = 10): Promise<string[]> => {
    try {
      // Get a larger list to filter from
      const pokemonList = await pokemonApi.getPokemonList(0, 1000);
      
      const suggestions = pokemonList.results
        .filter(pokemon => 
          pokemon.name.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, limit)
        .map(pokemon => pokemon.name);
        
      return suggestions;
    } catch (error) {
      console.error('Error getting suggestions:', error);
      return [];
    }
  },

  // Clear cache
  clearCache: async (): Promise<void> => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const pokemonCacheKeys = keys.filter(key => key.startsWith('pokemon_api_'));
      await AsyncStorage.multiRemove(pokemonCacheKeys);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  },

  // Get cache size
  getCacheInfo: async (): Promise<{ count: number; keys: string[] }> => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const pokemonCacheKeys = keys.filter(key => key.startsWith('pokemon_api_'));
      return {
        count: pokemonCacheKeys.length,
        keys: pokemonCacheKeys,
      };
    } catch (error) {
      console.error('Error getting cache info:', error);
      return { count: 0, keys: [] };
    }
  },
};

// Export utility functions
export { extractIdFromUrl };

// Export the main API object
export default pokemonApi;