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
const MAX_CACHE_SIZE = 50; // Maximum number of cached items
const MAX_CACHE_SIZE_BYTES = 1024 * 1024 * 2; // 2MB max cache size

// Cache interface
interface CacheItem<T> {
  data: T;
  timestamp: number;
  size: number;
  accessCount: number;
  lastAccessed: number;
}

// Cache metadata interface
interface CacheMetadata {
  totalSize: number;
  itemCount: number;
  lastCleanup: number;
}

// Simplified Pokemon data for caching (reduce size)
interface CachedPokemon {
  id: number;
  name: string;
  sprites: {
    front_default: string | null;
    other?: {
      'official-artwork'?: {
        front_default?: string;
      };
    };
  };
  types: { slot: number; type: { name: string; url: string } }[];
  stats: { base_stat: number; stat: { name: string } }[];
  height: number;
  weight: number;
  base_experience: number;
}

// Cache utilities
const getCacheKey = (endpoint: string): string => `pokemon_api_${endpoint}`;
const getCacheMetadataKey = (): string => 'pokemon_cache_metadata';

const isCacheValid = (timestamp: number): boolean => {
  return Date.now() - timestamp < CACHE_DURATION;
};

const calculateDataSize = (data: any): number => {
  return new Blob([JSON.stringify(data)]).size;
};

const getCacheMetadata = async (): Promise<CacheMetadata> => {
  try {
    const metadata = await AsyncStorage.getItem(getCacheMetadataKey());
    if (metadata) {
      return JSON.parse(metadata);
    }
  } catch {
    console.error('Error getting cache metadata:', error);
  }

  return {
    totalSize: 0,
    itemCount: 0,
    lastCleanup: Date.now(),
  };
};

const updateCacheMetadata = async (metadata: CacheMetadata): Promise<void> => {
  try {
    await AsyncStorage.setItem(getCacheMetadataKey(), JSON.stringify(metadata));
  } catch {
    console.error('Error updating cache metadata:', error);
  }
};

const optimizePokemonData = (pokemon: Pokemon): CachedPokemon => {
  return {
    id: pokemon.id,
    name: pokemon.name,
    sprites: {
      front_default: pokemon.sprites.front_default,
      other: pokemon.sprites.other
        ? {
            'official-artwork': pokemon.sprites.other['official-artwork'],
          }
        : undefined,
    },
    types: pokemon.types.map(t => ({
      slot: t.slot,
      type: { name: t.type.name, url: t.type.url },
    })),
    stats: pokemon.stats.map(s => ({
      base_stat: s.base_stat,
      stat: { name: s.stat.name },
    })),
    height: pokemon.height,
    weight: pokemon.weight,
    base_experience: pokemon.base_experience,
  };
};

const cleanupOldCache = async (): Promise<void> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter((key: string) =>
      key.startsWith('pokemon_api_'),
    );

    if (cacheKeys.length === 0) return;

    const cacheItems: Array<{ key: string; item: CacheItem<any> }> = [];

    // Get all cache items with their metadata
    for (const key of cacheKeys) {
      try {
        const cached = await AsyncStorage.getItem(key);
        if (cached) {
          const cacheItem = JSON.parse(cached) as CacheItem<any>;
          cacheItems.push({ key, item: cacheItem });
        }
      } catch {
        // Remove corrupted cache items
        await AsyncStorage.removeItem(key);
      }
    }

    // Sort by last accessed time (oldest first) and access count (least used first)
    cacheItems.sort((a, b) => {
      const accessDiff = a.item.accessCount - b.item.accessCount;
      if (accessDiff !== 0) return accessDiff;
      return a.item.lastAccessed - b.item.lastAccessed;
    });

    // Remove expired items first
    const now = Date.now();
    const expiredItems = cacheItems.filter(
      ({ item }) => !isCacheValid(item.timestamp),
    );

    for (const { key } of expiredItems) {
      await AsyncStorage.removeItem(key);
    }

    const remainingItems = cacheItems.filter(({ item }) =>
      isCacheValid(item.timestamp),
    );

    // If still too many items, remove least used ones
    if (remainingItems.length > MAX_CACHE_SIZE) {
      const itemsToRemove = remainingItems.slice(
        0,
        remainingItems.length - MAX_CACHE_SIZE,
      );
      for (const { key } of itemsToRemove) {
        await AsyncStorage.removeItem(key);
      }
    }

    // Update metadata
    const finalItems = remainingItems.slice(-MAX_CACHE_SIZE);
    const totalSize = finalItems.reduce((sum, { item }) => sum + item.size, 0);

    await updateCacheMetadata({
      totalSize,
      itemCount: finalItems.length,
      lastCleanup: now,
    });
  } catch {
    console.error('Error during cache cleanup:', error);
  }
};

const getFromCache = async <T>(endpoint: string): Promise<T | null> => {
  try {
    const cacheKey = getCacheKey(endpoint);
    const cached = await AsyncStorage.getItem(cacheKey);

    if (cached) {
      const cacheItem: CacheItem<T> = JSON.parse(cached);
      if (isCacheValid(cacheItem.timestamp)) {
        // Update access metadata
        cacheItem.accessCount += 1;
        cacheItem.lastAccessed = Date.now();
        await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheItem));

        return cacheItem.data;
      } else {
        // Remove expired item
        await AsyncStorage.removeItem(cacheKey);
      }
    }

    return null;
  } catch {
    console.error('Cache get error:', error);
    return null;
  }
};

const setCache = async <T>(endpoint: string, data: T): Promise<void> => {
  try {
    const cacheKey = getCacheKey(endpoint);
    const dataSize = calculateDataSize(data);

    // Skip caching if data is too large
    if (dataSize > MAX_CACHE_SIZE_BYTES / 10) {
      console.warn('Data too large to cache:', endpoint, dataSize);
      return;
    }

    const metadata = await getCacheMetadata();

    // Cleanup if cache is getting too large
    if (
      metadata.itemCount >= MAX_CACHE_SIZE ||
      metadata.totalSize + dataSize > MAX_CACHE_SIZE_BYTES ||
      Date.now() - metadata.lastCleanup > CACHE_DURATION
    ) {
      await cleanupOldCache();
    }

    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      size: dataSize,
      accessCount: 1,
      lastAccessed: Date.now(),
    };

    await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheItem));

    // Update metadata
    const newMetadata = await getCacheMetadata();
    newMetadata.totalSize += dataSize;
    newMetadata.itemCount += 1;
    await updateCacheMetadata(newMetadata);
  } catch {
    console.error('Cache set error:', error);
    // If storage is full, try to clear some cache and retry
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (
      errorMessage.includes('SQLITE_FULL') ||
      errorMessage.includes('disk is full')
    ) {
      console.log('Storage full, attempting cache cleanup...');
      await cleanupOldCache();

      // Try once more with a smaller dataset
      try {
        const retryDataSize = calculateDataSize(data);
        const retryCacheKey = getCacheKey(endpoint);
        const cacheItem: CacheItem<T> = {
          data,
          timestamp: Date.now(),
          size: retryDataSize,
          accessCount: 1,
          lastAccessed: Date.now(),
        };
        await AsyncStorage.setItem(retryCacheKey, JSON.stringify(cacheItem));
      } catch {
        console.error('Cache set retry failed:', retryError);
      }
    }
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
        Accept: 'application/json',
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
  } catch {
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
  getPokemonList: async (
    offset = 0,
    limit = 20,
  ): Promise<NamedAPIResourceList> => {
    const endpoint = `/pokemon?offset=${offset}&limit=${limit}`;
    return apiRequest<NamedAPIResourceList>(endpoint);
  },

  // Get detailed Pokemon data
  getPokemon: async (identifier: string | number): Promise<Pokemon> => {
    const endpoint = `/pokemon/${identifier}`;

    // Check cache first for optimized data
    const cached = await getFromCache<CachedPokemon>(endpoint);
    if (cached) {
      // Return the cached optimized data as full Pokemon object
      return cached as unknown as Pokemon;
    }

    // Fetch from API
    const url = `${BASE_URL}${endpoint}`;
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const fullPokemon = await response.json();

      // Cache optimized version to save space
      const optimizedPokemon = optimizePokemonData(fullPokemon);
      await setCache(endpoint, optimizedPokemon);

      return fullPokemon;
    } catch {
      console.error('API request error:', error);
      throw new Error(`Failed to fetch Pokemon ${identifier}: ${error}`);
    }
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
  getPokemonSpecies: async (
    identifier: string | number,
  ): Promise<PokemonSpecies> => {
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
          pokemonApi.getPokemon(extractIdFromUrl(p.url)),
        );

        results = await Promise.all(pokemonPromises);
      }

      // Apply type filter if specified
      if (filters.type && results.length > 0) {
        results = results.filter(pokemon =>
          pokemon.types.some(
            typeSlot =>
              typeSlot.type.name.toLowerCase() === filters.type!.toLowerCase(),
          ),
        );
      }

      return results;
    } catch {
      console.error('Advanced search error:', error);
      return [];
    }
  },

  // Get random Pokemon
  getRandomPokemon: async (count = 1): Promise<Pokemon[]> => {
    const maxPokemonId = 1010; // Current max Pokemon ID
    const randomIds = Array.from(
      { length: count },
      () => Math.floor(Math.random() * maxPokemonId) + 1,
    );

    return pokemonApi.getPokemonBatch(randomIds);
  },

  // Get Pokemon suggestions (for autocomplete)
  getPokemonSuggestions: async (
    query: string,
    limit = 10,
  ): Promise<string[]> => {
    try {
      // Get a larger list to filter from
      const pokemonList = await pokemonApi.getPokemonList(0, 1000);

      const suggestions = pokemonList.results
        .filter(pokemon =>
          pokemon.name.toLowerCase().includes(query.toLowerCase()),
        )
        .slice(0, limit)
        .map(pokemon => pokemon.name);

      return suggestions;
    } catch {
      console.error('Error getting suggestions:', error);
      return [];
    }
  },

  // Clear cache
  clearCache: async (): Promise<void> => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const pokemonCacheKeys = keys.filter((key: string) =>
        key.startsWith('pokemon_api_'),
      );
      await AsyncStorage.multiRemove(pokemonCacheKeys);
    } catch {
      console.error('Error clearing cache:', error);
    }
  },

  // Get cache size
  getCacheInfo: async (): Promise<{ count: number; keys: string[] }> => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const pokemonCacheKeys = keys.filter((key: string) =>
        key.startsWith('pokemon_api_'),
      );
      return {
        count: pokemonCacheKeys.length,
        keys: pokemonCacheKeys,
      };
    } catch {
      console.error('Error getting cache info:', error);
      return { count: 0, keys: [] };
    }
  },
};

// Export utility functions
export { extractIdFromUrl };

// Export the main API object
export default pokemonApi;
