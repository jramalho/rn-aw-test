/**
 * Tests for pokemonApi service
 * Comprehensive test coverage for API caching logic, error handling, and data fetching
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import pokemonApi, { extractIdFromUrl } from '../pokemonApi';
import { Pokemon, PokemonSpecies, EvolutionChain, Type, NamedAPIResourceList } from '../../types';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiRemove: jest.fn(() => Promise.resolve()),
}));

// Mock fetch
global.fetch = jest.fn();

// Test data
const mockPokemon: Pokemon = {
  id: 25,
  name: 'pikachu',
  height: 4,
  weight: 60,
  base_experience: 112,
  types: [
    { slot: 1, type: { name: 'electric', url: 'https://pokeapi.co/api/v2/type/13/' } },
  ],
  stats: [
    { base_stat: 35, effort: 0, stat: { name: 'hp', url: '' } },
    { base_stat: 55, effort: 0, stat: { name: 'attack', url: '' } },
    { base_stat: 40, effort: 0, stat: { name: 'defense', url: '' } },
  ],
  abilities: [
    { ability: { name: 'static', url: '' }, is_hidden: false, slot: 1 },
  ],
  sprites: {
    front_default: 'https://example.com/pikachu.png',
    other: {
      'official-artwork': {
        front_default: 'https://example.com/pikachu-artwork.png',
      },
    },
  },
  moves: [],
  species: { name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon-species/25/' },
};

const mockPokemonList: NamedAPIResourceList = {
  count: 1010,
  next: 'https://pokeapi.co/api/v2/pokemon?offset=20&limit=20',
  previous: null,
  results: [
    { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
    { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon/2/' },
    { name: 'venusaur', url: 'https://pokeapi.co/api/v2/pokemon/3/' },
  ],
};

const mockSpecies: PokemonSpecies = {
  id: 25,
  name: 'pikachu',
  flavor_text_entries: [
    {
      flavor_text: 'When several of these Pokémon gather, their electricity could build and cause lightning storms.',
      language: { name: 'en', url: '' },
      version: { name: 'sword', url: '' },
    },
  ],
  genera: [
    { genus: 'Mouse Pokémon', language: { name: 'en', url: '' } },
  ],
  evolution_chain: {
    url: 'https://pokeapi.co/api/v2/evolution-chain/10/',
  },
  base_happiness: 50,
  capture_rate: 190,
  color: { name: 'yellow', url: '' },
  egg_groups: [],
  evolves_from_species: { name: 'pichu', url: '' },
  gender_rate: 4,
  generation: { name: 'generation-i', url: '' },
  growth_rate: { name: 'medium', url: '' },
  habitat: null,
  has_gender_differences: false,
  hatch_counter: 10,
  is_baby: false,
  is_legendary: false,
  is_mythical: false,
  order: 25,
  pal_park_encounters: [],
  pokedex_numbers: [],
  shape: { name: 'quadruped', url: '' },
  varieties: [],
};

const mockEvolutionChain: EvolutionChain = {
  id: 10,
  chain: {
    species: { name: 'pichu', url: '' },
    evolves_to: [
      {
        species: { name: 'pikachu', url: '' },
        evolves_to: [
          {
            species: { name: 'raichu', url: '' },
            evolves_to: [],
            evolution_details: [],
          },
        ],
        evolution_details: [],
      },
    ],
    evolution_details: [],
  },
  baby_trigger_item: null,
};

const mockType: Type = {
  id: 13,
  name: 'electric',
  damage_relations: {
    double_damage_from: [{ name: 'ground', url: '' }],
    double_damage_to: [{ name: 'water', url: '' }, { name: 'flying', url: '' }],
    half_damage_from: [{ name: 'electric', url: '' }, { name: 'flying', url: '' }, { name: 'steel', url: '' }],
    half_damage_to: [{ name: 'electric', url: '' }, { name: 'grass', url: '' }, { name: 'dragon', url: '' }],
    no_damage_from: [],
    no_damage_to: [{ name: 'ground', url: '' }],
  },
  game_indices: [],
  generation: { name: 'generation-i', url: '' },
  move_damage_class: null,
  moves: [],
  pokemon: [
    { pokemon: { name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon/25/' }, slot: 1 },
    { pokemon: { name: 'raichu', url: 'https://pokeapi.co/api/v2/pokemon/26/' }, slot: 1 },
  ],
};

describe('pokemonApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
    (AsyncStorage.getItem as jest.Mock).mockClear();
    (AsyncStorage.setItem as jest.Mock).mockClear();
    (AsyncStorage.removeItem as jest.Mock).mockClear();
    (AsyncStorage.getAllKeys as jest.Mock).mockClear();
  });

  describe('extractIdFromUrl', () => {
    it('should extract Pokemon ID from PokéAPI URL', () => {
      expect(extractIdFromUrl('https://pokeapi.co/api/v2/pokemon/25/')).toBe(25);
      expect(extractIdFromUrl('https://pokeapi.co/api/v2/pokemon/1/')).toBe(1);
      expect(extractIdFromUrl('https://pokeapi.co/api/v2/pokemon/1010/')).toBe(1010);
    });

    it('should return 0 for invalid URLs', () => {
      expect(extractIdFromUrl('https://example.com/')).toBe(0);
      expect(extractIdFromUrl('invalid-url')).toBe(0);
    });
  });

  describe('getPokemonList', () => {
    it('should fetch Pokemon list successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPokemonList,
      });

      const result = await pokemonApi.getPokemonList(0, 20);

      expect(result).toEqual(mockPokemonList);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://pokeapi.co/api/v2/pokemon?offset=0&limit=20',
        expect.any(Object)
      );
    });

    it('should use cache if available', async () => {
      const cachedData = JSON.stringify({
        data: mockPokemonList,
        timestamp: Date.now(),
        size: 1000,
        accessCount: 1,
        lastAccessed: Date.now(),
      });

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(cachedData);

      const result = await pokemonApi.getPokemonList(0, 20);

      expect(result).toEqual(mockPokemonList);
      expect(global.fetch).not.toHaveBeenCalled();
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('pokemon_api_/pokemon?offset=0&limit=20');
    });

    it('should handle fetch errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await expect(pokemonApi.getPokemonList(0, 20)).rejects.toThrow();
    });

    it('should support pagination', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPokemonList,
      });

      await pokemonApi.getPokemonList(20, 20);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://pokeapi.co/api/v2/pokemon?offset=20&limit=20',
        expect.any(Object)
      );
    });
  });

  describe('getPokemon', () => {
    it('should fetch Pokemon by ID', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPokemon,
      });

      const result = await pokemonApi.getPokemon(25);

      expect(result).toEqual(mockPokemon);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://pokeapi.co/api/v2/pokemon/25',
        expect.any(Object)
      );
    });

    it('should fetch Pokemon by name', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPokemon,
      });

      const result = await pokemonApi.getPokemon('pikachu');

      expect(result).toEqual(mockPokemon);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://pokeapi.co/api/v2/pokemon/pikachu',
        expect.any(Object)
      );
    });

    it('should use cached Pokemon data', async () => {
      const cachedOptimizedPokemon = {
        id: 25,
        name: 'pikachu',
        sprites: mockPokemon.sprites,
        types: mockPokemon.types,
        stats: mockPokemon.stats,
        height: 4,
        weight: 60,
        base_experience: 112,
      };

      const cachedData = JSON.stringify({
        data: cachedOptimizedPokemon,
        timestamp: Date.now(),
        size: 1000,
        accessCount: 1,
        lastAccessed: Date.now(),
      });

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(cachedData);

      const result = await pokemonApi.getPokemon(25);

      expect(result).toBeDefined();
      expect(result.name).toBe('pikachu');
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should handle fetch errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await expect(pokemonApi.getPokemon('nonexistent')).rejects.toThrow();
    });

    it('should cache fetched Pokemon data', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPokemon,
      });

      await pokemonApi.getPokemon(25);

      expect(AsyncStorage.setItem).toHaveBeenCalled();
      const cacheKey = (AsyncStorage.setItem as jest.Mock).mock.calls[0][0];
      expect(cacheKey).toContain('pokemon_api_/pokemon/25');
    });
  });

  describe('Cache expiration', () => {
    it('should not use expired cache', async () => {
      const expiredTimestamp = Date.now() - (1000 * 60 * 31); // 31 minutes ago
      const cachedData = JSON.stringify({
        data: mockPokemonList,
        timestamp: expiredTimestamp,
        size: 1000,
        accessCount: 1,
        lastAccessed: expiredTimestamp,
      });

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(cachedData);
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPokemonList,
      });

      const result = await pokemonApi.getPokemonList(0, 20);

      expect(result).toEqual(mockPokemonList);
      expect(global.fetch).toHaveBeenCalled();
      expect(AsyncStorage.removeItem).toHaveBeenCalled();
    });

    it('should use valid cache within 30 minutes', async () => {
      const recentTimestamp = Date.now() - (1000 * 60 * 10); // 10 minutes ago
      const cachedData = JSON.stringify({
        data: mockPokemonList,
        timestamp: recentTimestamp,
        size: 1000,
        accessCount: 1,
        lastAccessed: recentTimestamp,
      });

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(cachedData);

      const result = await pokemonApi.getPokemonList(0, 20);

      expect(result).toEqual(mockPokemonList);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should update access count when using cache', async () => {
      const cachedData = JSON.stringify({
        data: mockPokemonList,
        timestamp: Date.now(),
        size: 1000,
        accessCount: 5,
        lastAccessed: Date.now() - 60000,
      });

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(cachedData);

      await pokemonApi.getPokemonList(0, 20);

      expect(AsyncStorage.setItem).toHaveBeenCalled();
      const updatedCache = JSON.parse((AsyncStorage.setItem as jest.Mock).mock.calls[0][1]);
      expect(updatedCache.accessCount).toBe(6);
    });
  });

  describe('getPokemonBatch', () => {
    it('should fetch multiple Pokemon', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ ...mockPokemon, id: 1, name: 'bulbasaur' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ ...mockPokemon, id: 2, name: 'ivysaur' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPokemon,
        });

      const result = await pokemonApi.getPokemonBatch([1, 2, 25]);

      expect(result).toHaveLength(3);
      expect(result[0].name).toBe('bulbasaur');
      expect(result[1].name).toBe('ivysaur');
      expect(result[2].name).toBe('pikachu');
    });

    it('should handle empty array', async () => {
      const result = await pokemonApi.getPokemonBatch([]);
      expect(result).toEqual([]);
    });
  });

  describe('searchPokemon', () => {
    it('should find Pokemon by name', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPokemon,
      });

      const result = await pokemonApi.searchPokemon('Pikachu');

      expect(result).toEqual(mockPokemon);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://pokeapi.co/api/v2/pokemon/pikachu',
        expect.any(Object)
      );
    });

    it('should return null for non-existent Pokemon', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const result = await pokemonApi.searchPokemon('nonexistent');

      expect(result).toBeNull();
    });

    it('should normalize Pokemon names to lowercase', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPokemon,
      });

      await pokemonApi.searchPokemon('PIKACHU');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://pokeapi.co/api/v2/pokemon/pikachu',
        expect.any(Object)
      );
    });
  });

  describe('getPokemonSpecies', () => {
    it('should fetch species data', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSpecies,
      });

      const result = await pokemonApi.getPokemonSpecies(25);

      expect(result).toEqual(mockSpecies);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://pokeapi.co/api/v2/pokemon-species/25',
        expect.any(Object)
      );
    });
  });

  describe('getEvolutionChain', () => {
    it('should fetch evolution chain', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockEvolutionChain,
      });

      const result = await pokemonApi.getEvolutionChain(10);

      expect(result).toEqual(mockEvolutionChain);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://pokeapi.co/api/v2/evolution-chain/10',
        expect.any(Object)
      );
    });
  });

  describe('getType', () => {
    it('should fetch type data', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockType,
      });

      const result = await pokemonApi.getType('electric');

      expect(result).toEqual(mockType);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://pokeapi.co/api/v2/type/electric',
        expect.any(Object)
      );
    });
  });

  describe('searchPokemonAdvanced', () => {
    it('should search by name', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPokemon,
      });

      const result = await pokemonApi.searchPokemonAdvanced({ name: 'pikachu' });

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockPokemon);
    });

    it('should filter by type', async () => {
      const grassPokemon = { ...mockPokemon, id: 1, types: [{ slot: 1, type: { name: 'grass', url: '' } }] };
      const electricPokemon = mockPokemon;

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPokemonList,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => grassPokemon,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => electricPokemon,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => grassPokemon,
        });

      const result = await pokemonApi.searchPokemonAdvanced({ type: 'grass' });

      expect(result.length).toBeGreaterThan(0);
      expect(result.every(p => p.types.some(t => t.type.name === 'grass'))).toBe(true);
    });

    it('should handle search errors gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await pokemonApi.searchPokemonAdvanced({ name: 'pikachu' });

      expect(result).toEqual([]);
    });
  });

  describe('getRandomPokemon', () => {
    it('should fetch random Pokemon', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockPokemon,
      });

      const result = await pokemonApi.getRandomPokemon(3);

      expect(result).toHaveLength(3);
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('should default to 1 Pokemon', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPokemon,
      });

      const result = await pokemonApi.getRandomPokemon();

      expect(result).toHaveLength(1);
    });
  });

  describe('getPokemonSuggestions', () => {
    it('should return filtered suggestions', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ...mockPokemonList,
          results: [
            { name: 'pikachu', url: '' },
            { name: 'pichu', url: '' },
            { name: 'raichu', url: '' },
            { name: 'bulbasaur', url: '' },
          ],
        }),
      });

      const result = await pokemonApi.getPokemonSuggestions('pik', 10);

      expect(result).toContain('pikachu');
      expect(result).not.toContain('bulbasaur');
    });

    it('should limit results', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ...mockPokemonList,
          results: Array.from({ length: 20 }, (_, i) => ({ name: `pokemon${i}`, url: '' })),
        }),
      });

      const result = await pokemonApi.getPokemonSuggestions('pokemon', 5);

      expect(result.length).toBeLessThanOrEqual(5);
    });

    it('should handle errors gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await pokemonApi.getPokemonSuggestions('pik', 10);

      expect(result).toEqual([]);
    });
  });

  describe('Cache management', () => {
    it('should clear cache', async () => {
      const cacheKeys = [
        'pokemon_api_/pokemon/1',
        'pokemon_api_/pokemon/2',
        'pokemon_api_/pokemon-species/1',
        'other_key',
      ];

      (AsyncStorage.getAllKeys as jest.Mock).mockResolvedValueOnce(cacheKeys);

      await pokemonApi.clearCache();

      expect(AsyncStorage.multiRemove).toHaveBeenCalledWith([
        'pokemon_api_/pokemon/1',
        'pokemon_api_/pokemon/2',
        'pokemon_api_/pokemon-species/1',
      ]);
    });

    it('should get cache info', async () => {
      const cacheKeys = [
        'pokemon_api_/pokemon/1',
        'pokemon_api_/pokemon/25',
        'other_key',
      ];

      (AsyncStorage.getAllKeys as jest.Mock).mockResolvedValueOnce(cacheKeys);

      const result = await pokemonApi.getCacheInfo();

      expect(result.count).toBe(2);
      expect(result.keys).toEqual([
        'pokemon_api_/pokemon/1',
        'pokemon_api_/pokemon/25',
      ]);
    });

    it('should handle cache info errors', async () => {
      (AsyncStorage.getAllKeys as jest.Mock).mockRejectedValueOnce(new Error('Storage error'));

      const result = await pokemonApi.getCacheInfo();

      expect(result).toEqual({ count: 0, keys: [] });
    });
  });

  describe('Error recovery', () => {
    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(pokemonApi.getPokemon(25)).rejects.toThrow();
    });

    it('should handle JSON parse errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      await expect(pokemonApi.getPokemonList(0, 20)).rejects.toThrow();
    });

    it('should handle cache read errors gracefully', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(new Error('Storage error'));
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPokemon,
      });

      const result = await pokemonApi.getPokemon(25);

      expect(result).toEqual(mockPokemon);
      expect(global.fetch).toHaveBeenCalled();
    });

    it('should handle cache write errors gracefully', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation();
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPokemonList,
      });
      (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(new Error('Storage full'));

      const result = await pokemonApi.getPokemonList(0, 20);

      expect(result).toEqual(mockPokemonList);
      expect(consoleError).toHaveBeenCalled();
      
      consoleError.mockRestore();
    });
  });

  describe('Cache metadata tracking', () => {
    it('should track cache metadata', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPokemonList,
      });

      await pokemonApi.getPokemonList(0, 20);

      // Verify metadata was stored
      const setItemCalls = (AsyncStorage.setItem as jest.Mock).mock.calls;
      const metadataCall = setItemCalls.find(call => 
        call[0] === 'pokemon_cache_metadata'
      );

      expect(metadataCall).toBeDefined();
      if (metadataCall) {
        const metadata = JSON.parse(metadataCall[1]);
        expect(metadata).toHaveProperty('totalSize');
        expect(metadata).toHaveProperty('itemCount');
        expect(metadata).toHaveProperty('lastCleanup');
      }
    });
  });
});
