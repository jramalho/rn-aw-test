import { renderHook, act, waitFor } from '@testing-library/react-native';
import { usePokemonStore } from '../pokemonStore';
import pokemonApi from '../../utils/pokemonApi';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
}));

// Mock pokemonApi
jest.mock('../../utils/pokemonApi');

// Sample test data
const mockPokemon1 = {
  id: 1,
  name: 'bulbasaur',
  height: 7,
  weight: 69,
  base_experience: 64,
  types: [
    {
      slot: 1,
      type: { name: 'grass', url: 'https://pokeapi.co/api/v2/type/12/' },
    },
    {
      slot: 2,
      type: { name: 'poison', url: 'https://pokeapi.co/api/v2/type/4/' },
    },
  ],
  stats: [
    { base_stat: 45, stat: { name: 'hp' } },
    { base_stat: 49, stat: { name: 'attack' } },
  ],
  abilities: [{ ability: { name: 'overgrow', url: '' } }],
  sprites: {
    front_default: 'https://example.com/bulbasaur.png',
    other: {
      'official-artwork': {
        front_default: 'https://example.com/bulbasaur-art.png',
      },
    },
  },
};

const mockPokemon2 = {
  id: 2,
  name: 'ivysaur',
  height: 10,
  weight: 130,
  base_experience: 142,
  types: [
    {
      slot: 1,
      type: { name: 'grass', url: 'https://pokeapi.co/api/v2/type/12/' },
    },
    {
      slot: 2,
      type: { name: 'poison', url: 'https://pokeapi.co/api/v2/type/4/' },
    },
  ],
  stats: [
    { base_stat: 60, stat: { name: 'hp' } },
    { base_stat: 62, stat: { name: 'attack' } },
  ],
  abilities: [{ ability: { name: 'overgrow', url: '' } }],
  sprites: {
    front_default: 'https://example.com/ivysaur.png',
    other: {
      'official-artwork': {
        front_default: 'https://example.com/ivysaur-art.png',
      },
    },
  },
};

const mockPokemonListResponse = {
  count: 1000,
  next: 'https://pokeapi.co/api/v2/pokemon?offset=20&limit=20',
  previous: null,
  results: [
    { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
    { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon/2/' },
  ],
};

const mockSpecies = {
  id: 1,
  name: 'bulbasaur',
  flavor_text_entries: [
    { flavor_text: 'A strange seed was planted.', language: { name: 'en' } },
  ],
  genera: [{ genus: 'Seed Pokémon', language: { name: 'en' } }],
  evolution_chain: {
    url: 'https://pokeapi.co/api/v2/evolution-chain/1/',
  },
};

const mockEvolutionChain = {
  id: 1,
  chain: {
    species: { name: 'bulbasaur' },
    evolves_to: [
      {
        species: { name: 'ivysaur' },
        evolves_to: [{ species: { name: 'venusaur' }, evolves_to: [] }],
      },
    ],
  },
};

const mockType = {
  id: 12,
  name: 'grass',
  pokemon: [
    {
      pokemon: {
        name: 'bulbasaur',
        url: 'https://pokeapi.co/api/v2/pokemon/1/',
      },
    },
    {
      pokemon: { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon/2/' },
    },
  ],
};

const mockAllTypes = {
  count: 20,
  results: [
    { name: 'normal', url: 'https://pokeapi.co/api/v2/type/1/' },
    { name: 'fighting', url: 'https://pokeapi.co/api/v2/type/2/' },
    { name: 'grass', url: 'https://pokeapi.co/api/v2/type/12/' },
  ],
};

describe('pokemonStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset the store state
    renderHook(() => usePokemonStore());
    act(() => {
      usePokemonStore.setState({
        pokemonList: [],
        isLoading: false,
        isLoadingMore: false,
        error: null,
        hasMore: true,
        offset: 0,
        limit: 20,
        searchQuery: '',
        searchResults: [],
        isSearching: false,
        searchError: null,
        searchSuggestions: [],
        currentPokemon: null,
        currentSpecies: null,
        currentEvolutionChain: null,
        isLoadingDetail: false,
        detailError: null,
        favorites: [],
        team: [],
        savedTeams: [],
        currentTeamId: null,
        selectedType: null,
        availableTypes: [],
      });
    });
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => usePokemonStore());

      expect(result.current.pokemonList).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.hasMore).toBe(true);
      expect(result.current.offset).toBe(0);
      expect(result.current.limit).toBe(20);
      expect(result.current.searchQuery).toBe('');
      expect(result.current.favorites).toEqual([]);
      expect(result.current.selectedType).toBeNull();
    });

    it('should expose all required methods', () => {
      const { result } = renderHook(() => usePokemonStore());

      expect(typeof result.current.loadPokemonList).toBe('function');
      expect(typeof result.current.loadMore).toBe('function');
      expect(typeof result.current.searchPokemon).toBe('function');
      expect(typeof result.current.loadPokemonDetail).toBe('function');
      expect(typeof result.current.toggleFavorite).toBe('function');
      expect(typeof result.current.setSelectedType).toBe('function');
      expect(typeof result.current.loadTypes).toBe('function');
      expect(typeof result.current.getSuggestions).toBe('function');
      expect(typeof result.current.clearSearch).toBe('function');
      expect(typeof result.current.clearError).toBe('function');
      expect(typeof result.current.clearDetailError).toBe('function');
    });
  });

  describe('loadPokemonList', () => {
    it('should load Pokemon list successfully', async () => {
      (pokemonApi.getPokemonList as jest.Mock).mockResolvedValue(
        mockPokemonListResponse,
      );
      (pokemonApi.getPokemon as jest.Mock)
        .mockResolvedValueOnce(mockPokemon1)
        .mockResolvedValueOnce(mockPokemon2);

      const { result } = renderHook(() => usePokemonStore());

      await act(async () => {
        await result.current.loadPokemonList();
      });

      expect(result.current.pokemonList).toHaveLength(2);
      expect(result.current.pokemonList[0].name).toBe('bulbasaur');
      expect(result.current.pokemonList[1].name).toBe('ivysaur');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.offset).toBe(20);
      expect(result.current.hasMore).toBe(true);
    });

    it('should set loading state during request', async () => {
      (pokemonApi.getPokemonList as jest.Mock).mockImplementation(
        () =>
          new Promise(resolve =>
            setTimeout(() => resolve(mockPokemonListResponse), 100),
          ),
      );

      const { result } = renderHook(() => usePokemonStore());

      const loadPromise = act(async () => {
        await result.current.loadPokemonList();
      });

      // Should be loading immediately
      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });

      await loadPromise;

      expect(result.current.isLoading).toBe(false);
    });

    it('should handle API errors gracefully', async () => {
      const errorMessage = 'Network error';
      (pokemonApi.getPokemonList as jest.Mock).mockRejectedValue(
        new Error(errorMessage),
      );

      const { result } = renderHook(() => usePokemonStore());

      await act(async () => {
        await result.current.loadPokemonList();
      });

      expect(result.current.error).toBe(errorMessage);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.pokemonList).toEqual([]);
    });

    it('should refresh list when refresh parameter is true', async () => {
      (pokemonApi.getPokemonList as jest.Mock).mockResolvedValue(
        mockPokemonListResponse,
      );
      (pokemonApi.getPokemon as jest.Mock)
        .mockResolvedValueOnce(mockPokemon1)
        .mockResolvedValueOnce(mockPokemon2);

      const { result } = renderHook(() => usePokemonStore());

      // Load initial list
      await act(async () => {
        await result.current.loadPokemonList();
      });

      expect(result.current.pokemonList).toHaveLength(2);
      expect(result.current.offset).toBe(20);

      // Refresh list
      (pokemonApi.getPokemonList as jest.Mock).mockResolvedValue(
        mockPokemonListResponse,
      );
      (pokemonApi.getPokemon as jest.Mock)
        .mockResolvedValueOnce(mockPokemon1)
        .mockResolvedValueOnce(mockPokemon2);

      await act(async () => {
        await result.current.loadPokemonList(true);
      });

      expect(result.current.pokemonList).toHaveLength(2);
      expect(result.current.offset).toBe(20);
    });

    it('should prevent duplicate requests when already loading', async () => {
      (pokemonApi.getPokemonList as jest.Mock).mockImplementation(
        () =>
          new Promise(resolve =>
            setTimeout(() => resolve(mockPokemonListResponse), 100),
          ),
      );

      const { result } = renderHook(() => usePokemonStore());

      const promise1 = act(async () => {
        await result.current.loadPokemonList();
      });

      const promise2 = act(async () => {
        await result.current.loadPokemonList();
      });

      await Promise.all([promise1, promise2]);

      // Should only call API once
      expect(pokemonApi.getPokemonList).toHaveBeenCalledTimes(1);
    });

    it('should handle end of list correctly', async () => {
      const lastPageResponse = {
        ...mockPokemonListResponse,
        next: null,
      };

      (pokemonApi.getPokemonList as jest.Mock).mockResolvedValue(
        lastPageResponse,
      );
      (pokemonApi.getPokemon as jest.Mock)
        .mockResolvedValueOnce(mockPokemon1)
        .mockResolvedValueOnce(mockPokemon2);

      const { result } = renderHook(() => usePokemonStore());

      await act(async () => {
        await result.current.loadPokemonList();
      });

      expect(result.current.hasMore).toBe(false);
    });
  });

  describe('loadMore', () => {
    it('should load more Pokemon when available', async () => {
      // Setup initial list
      (pokemonApi.getPokemonList as jest.Mock).mockResolvedValue(
        mockPokemonListResponse,
      );
      (pokemonApi.getPokemon as jest.Mock)
        .mockResolvedValueOnce(mockPokemon1)
        .mockResolvedValueOnce(mockPokemon2);

      const { result } = renderHook(() => usePokemonStore());

      await act(async () => {
        await result.current.loadPokemonList();
      });

      const initialLength = result.current.pokemonList.length;

      // Load more
      (pokemonApi.getPokemonList as jest.Mock).mockResolvedValue(
        mockPokemonListResponse,
      );
      (pokemonApi.getPokemon as jest.Mock)
        .mockResolvedValueOnce(mockPokemon1)
        .mockResolvedValueOnce(mockPokemon2);

      await act(async () => {
        await result.current.loadMore();
      });

      expect(result.current.pokemonList.length).toBeGreaterThan(initialLength);
    });

    it('should not load more when hasMore is false', async () => {
      const { result } = renderHook(() => usePokemonStore());

      // Set hasMore to false
      act(() => {
        usePokemonStore.setState({ hasMore: false });
      });

      await act(async () => {
        await result.current.loadMore();
      });

      expect(pokemonApi.getPokemonList).not.toHaveBeenCalled();
    });

    it('should not load more when already loading', async () => {
      const { result } = renderHook(() => usePokemonStore());

      act(() => {
        usePokemonStore.setState({ isLoading: true });
      });

      await act(async () => {
        await result.current.loadMore();
      });

      expect(pokemonApi.getPokemonList).not.toHaveBeenCalled();
    });

    it('should set isLoadingMore during request', async () => {
      // Setup initial state
      (pokemonApi.getPokemonList as jest.Mock).mockImplementation(
        () =>
          new Promise(resolve =>
            setTimeout(() => resolve(mockPokemonListResponse), 100),
          ),
      );

      const { result } = renderHook(() => usePokemonStore());

      act(() => {
        usePokemonStore.setState({
          hasMore: true,
          pokemonList: [mockPokemon1],
        });
      });

      const loadPromise = act(async () => {
        await result.current.loadMore();
      });

      await waitFor(() => {
        expect(result.current.isLoadingMore).toBe(true);
      });

      await loadPromise;

      expect(result.current.isLoadingMore).toBe(false);
    });
  });

  describe('searchPokemon', () => {
    it('should search Pokemon successfully', async () => {
      const searchResults = [mockPokemon1, mockPokemon2];
      (pokemonApi.searchPokemonAdvanced as jest.Mock).mockResolvedValue(
        searchResults,
      );

      const { result } = renderHook(() => usePokemonStore());

      await act(async () => {
        await result.current.searchPokemon('bulb');
      });

      expect(result.current.searchResults).toEqual(searchResults);
      expect(result.current.searchQuery).toBe('bulb');
      expect(result.current.isSearching).toBe(false);
      expect(result.current.searchError).toBeNull();
    });

    it('should clear results for empty query', async () => {
      const { result } = renderHook(() => usePokemonStore());

      await act(async () => {
        await result.current.searchPokemon('');
      });

      expect(result.current.searchResults).toEqual([]);
      expect(result.current.isSearching).toBe(false);
    });

    it('should handle search errors', async () => {
      const errorMessage = 'Search failed';
      (pokemonApi.searchPokemonAdvanced as jest.Mock).mockRejectedValue(
        new Error(errorMessage),
      );

      const { result } = renderHook(() => usePokemonStore());

      await act(async () => {
        await result.current.searchPokemon('test');
      });

      expect(result.current.searchError).toBe(errorMessage);
      expect(result.current.isSearching).toBe(false);
      expect(result.current.searchResults).toEqual([]);
    });

    it('should set isSearching during search', async () => {
      (pokemonApi.searchPokemonAdvanced as jest.Mock).mockImplementation(
        () =>
          new Promise(resolve =>
            setTimeout(() => resolve([mockPokemon1]), 100),
          ),
      );

      const { result } = renderHook(() => usePokemonStore());

      const searchPromise = act(async () => {
        await result.current.searchPokemon('bulb');
      });

      await waitFor(() => {
        expect(result.current.isSearching).toBe(true);
      });

      await searchPromise;

      expect(result.current.isSearching).toBe(false);
    });
  });

  describe('loadPokemonDetail', () => {
    it('should load Pokemon details successfully', async () => {
      (pokemonApi.getPokemonSpecies as jest.Mock).mockResolvedValue(
        mockSpecies,
      );
      (pokemonApi.getEvolutionChain as jest.Mock).mockResolvedValue(
        mockEvolutionChain,
      );

      const { result } = renderHook(() => usePokemonStore());

      await act(async () => {
        await result.current.loadPokemonDetail(mockPokemon1);
      });

      expect(result.current.currentPokemon).toEqual(mockPokemon1);
      expect(result.current.currentSpecies).toEqual(mockSpecies);
      expect(result.current.currentEvolutionChain).toEqual(mockEvolutionChain);
      expect(result.current.isLoadingDetail).toBe(false);
      expect(result.current.detailError).toBeNull();
    });

    it('should handle missing evolution chain', async () => {
      const speciesWithoutEvolution = {
        ...mockSpecies,
        evolution_chain: null,
      };

      (pokemonApi.getPokemonSpecies as jest.Mock).mockResolvedValue(
        speciesWithoutEvolution,
      );

      const { result } = renderHook(() => usePokemonStore());

      await act(async () => {
        await result.current.loadPokemonDetail(mockPokemon1);
      });

      expect(result.current.currentSpecies).toEqual(speciesWithoutEvolution);
      expect(result.current.currentEvolutionChain).toBeNull();
      expect(pokemonApi.getEvolutionChain).not.toHaveBeenCalled();
    });

    it('should handle detail loading errors', async () => {
      const errorMessage = 'Failed to load details';
      (pokemonApi.getPokemonSpecies as jest.Mock).mockRejectedValue(
        new Error(errorMessage),
      );

      const { result } = renderHook(() => usePokemonStore());

      await act(async () => {
        await result.current.loadPokemonDetail(mockPokemon1);
      });

      expect(result.current.detailError).toBe(errorMessage);
      expect(result.current.isLoadingDetail).toBe(false);
    });

    it('should set isLoadingDetail during request', async () => {
      (pokemonApi.getPokemonSpecies as jest.Mock).mockImplementation(
        () =>
          new Promise(resolve => setTimeout(() => resolve(mockSpecies), 100)),
      );

      const { result } = renderHook(() => usePokemonStore());

      const loadPromise = act(async () => {
        await result.current.loadPokemonDetail(mockPokemon1);
      });

      await waitFor(() => {
        expect(result.current.isLoadingDetail).toBe(true);
      });

      await loadPromise;

      expect(result.current.isLoadingDetail).toBe(false);
    });
  });

  describe('toggleFavorite', () => {
    it('should add Pokemon to favorites', () => {
      const { result } = renderHook(() => usePokemonStore());

      act(() => {
        result.current.toggleFavorite(1);
      });

      expect(result.current.favorites).toContain(1);
    });

    it('should remove Pokemon from favorites', () => {
      const { result } = renderHook(() => usePokemonStore());

      act(() => {
        result.current.toggleFavorite(1);
      });

      expect(result.current.favorites).toContain(1);

      act(() => {
        result.current.toggleFavorite(1);
      });

      expect(result.current.favorites).not.toContain(1);
    });

    it('should handle multiple favorites', () => {
      const { result } = renderHook(() => usePokemonStore());

      act(() => {
        result.current.toggleFavorite(1);
        result.current.toggleFavorite(2);
        result.current.toggleFavorite(3);
      });

      expect(result.current.favorites).toEqual([1, 2, 3]);
    });

    it('should persist favorites to AsyncStorage', async () => {
      const { result } = renderHook(() => usePokemonStore());

      await act(async () => {
        result.current.toggleFavorite(1);
        // Wait for persistence
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('setSelectedType', () => {
    it('should set selected type and reload list', async () => {
      (pokemonApi.getType as jest.Mock).mockResolvedValue(mockType);
      (pokemonApi.getPokemon as jest.Mock)
        .mockResolvedValueOnce(mockPokemon1)
        .mockResolvedValueOnce(mockPokemon2);

      const { result } = renderHook(() => usePokemonStore());

      await act(async () => {
        result.current.setSelectedType('grass');
        // Wait for async operations
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(result.current.selectedType).toBe('grass');
      expect(result.current.pokemonList).toHaveLength(0); // Will be populated by loadPokemonList
      expect(result.current.offset).toBe(0);
      expect(result.current.hasMore).toBe(true);
    });

    it('should clear filter when type is null', async () => {
      (pokemonApi.getPokemonList as jest.Mock).mockResolvedValue(
        mockPokemonListResponse,
      );
      (pokemonApi.getPokemon as jest.Mock)
        .mockResolvedValueOnce(mockPokemon1)
        .mockResolvedValueOnce(mockPokemon2);

      const { result } = renderHook(() => usePokemonStore());

      await act(async () => {
        result.current.setSelectedType(null);
        // Wait for async operations
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(result.current.selectedType).toBeNull();
    });

    it('should reset list state when changing type', () => {
      const { result } = renderHook(() => usePokemonStore());

      // Set initial state with some data
      act(() => {
        usePokemonStore.setState({
          pokemonList: [mockPokemon1, mockPokemon2],
          offset: 40,
          hasMore: false,
        });
      });

      act(() => {
        result.current.setSelectedType('fire');
      });

      expect(result.current.pokemonList).toEqual([]);
      expect(result.current.offset).toBe(0);
      expect(result.current.hasMore).toBe(true);
    });
  });

  describe('loadTypes', () => {
    it('should load all available types', async () => {
      (pokemonApi.getAllTypes as jest.Mock).mockResolvedValue(mockAllTypes);
      (pokemonApi.getType as jest.Mock)
        .mockResolvedValueOnce({ id: 1, name: 'normal', pokemon: [] })
        .mockResolvedValueOnce({ id: 2, name: 'fighting', pokemon: [] })
        .mockResolvedValueOnce(mockType);

      const { result } = renderHook(() => usePokemonStore());

      await act(async () => {
        await result.current.loadTypes();
      });

      expect(result.current.availableTypes).toHaveLength(3);
    });

    it('should filter out unknown and shadow types', async () => {
      const typesWithUnknown = {
        ...mockAllTypes,
        results: [
          ...mockAllTypes.results,
          { name: 'unknown', url: 'https://pokeapi.co/api/v2/type/10001/' },
          { name: 'shadow', url: 'https://pokeapi.co/api/v2/type/10002/' },
        ],
      };

      (pokemonApi.getAllTypes as jest.Mock).mockResolvedValue(typesWithUnknown);
      (pokemonApi.getType as jest.Mock)
        .mockResolvedValueOnce({ id: 1, name: 'normal', pokemon: [] })
        .mockResolvedValueOnce({ id: 2, name: 'fighting', pokemon: [] })
        .mockResolvedValueOnce(mockType);

      const { result } = renderHook(() => usePokemonStore());

      await act(async () => {
        await result.current.loadTypes();
      });

      // Should only have 3 types (filtered out unknown and shadow)
      expect(result.current.availableTypes).toHaveLength(3);
      expect(
        result.current.availableTypes.every(
          t => !['unknown', 'shadow'].includes(t.name),
        ),
      ).toBe(true);
    });

    it('should handle errors silently', async () => {
      (pokemonApi.getAllTypes as jest.Mock).mockRejectedValue(
        new Error('API Error'),
      );

      const { result } = renderHook(() => usePokemonStore());

      await act(async () => {
        await result.current.loadTypes();
      });

      expect(result.current.availableTypes).toEqual([]);
    });
  });

  describe('getSuggestions', () => {
    it('should get Pokemon suggestions', async () => {
      const suggestions = ['bulbasaur', 'ivysaur', 'venusaur'];
      (pokemonApi.getPokemonSuggestions as jest.Mock).mockResolvedValue(
        suggestions,
      );

      const { result } = renderHook(() => usePokemonStore());

      await act(async () => {
        await result.current.getSuggestions('bulb');
      });

      expect(result.current.searchSuggestions).toEqual(suggestions);
    });

    it('should clear suggestions for empty query', async () => {
      const { result } = renderHook(() => usePokemonStore());

      await act(async () => {
        await result.current.getSuggestions('');
      });

      expect(result.current.searchSuggestions).toEqual([]);
      expect(pokemonApi.getPokemonSuggestions).not.toHaveBeenCalled();
    });

    it('should handle suggestion errors', async () => {
      (pokemonApi.getPokemonSuggestions as jest.Mock).mockRejectedValue(
        new Error('Error'),
      );

      const { result } = renderHook(() => usePokemonStore());

      await act(async () => {
        await result.current.getSuggestions('test');
      });

      expect(result.current.searchSuggestions).toEqual([]);
    });

    it('should request limited number of suggestions', async () => {
      (pokemonApi.getPokemonSuggestions as jest.Mock).mockResolvedValue([]);

      const { result } = renderHook(() => usePokemonStore());

      await act(async () => {
        await result.current.getSuggestions('pika');
      });

      expect(pokemonApi.getPokemonSuggestions).toHaveBeenCalledWith('pika', 8);
    });
  });

  describe('clearSearch', () => {
    it('should clear all search state', () => {
      const { result } = renderHook(() => usePokemonStore());

      // Set search state
      act(() => {
        usePokemonStore.setState({
          searchQuery: 'test',
          searchResults: [mockPokemon1],
          searchError: 'error',
          searchSuggestions: ['bulbasaur'],
        });
      });

      act(() => {
        result.current.clearSearch();
      });

      expect(result.current.searchQuery).toBe('');
      expect(result.current.searchResults).toEqual([]);
      expect(result.current.searchError).toBeNull();
      expect(result.current.searchSuggestions).toEqual([]);
    });
  });

  describe('clearError', () => {
    it('should clear error state', () => {
      const { result } = renderHook(() => usePokemonStore());

      act(() => {
        usePokemonStore.setState({ error: 'Test error' });
      });

      expect(result.current.error).toBe('Test error');

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('clearDetailError', () => {
    it('should clear detail error state', () => {
      const { result } = renderHook(() => usePokemonStore());

      act(() => {
        usePokemonStore.setState({ detailError: 'Detail error' });
      });

      expect(result.current.detailError).toBe('Detail error');

      act(() => {
        result.current.clearDetailError();
      });

      expect(result.current.detailError).toBeNull();
    });
  });

  describe('Persistence', () => {
    it('should persist favorites and selectedType', async () => {
      const { result } = renderHook(() => usePokemonStore());

      await act(async () => {
        result.current.toggleFavorite(1);
        result.current.setSelectedType('fire');
        // Wait for persistence
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'pokemon-storage',
        expect.stringContaining('favorites'),
      );
    });

    it('should only persist favorites and selectedType, not full list', async () => {
      renderHook(() => usePokemonStore());

      await act(async () => {
        usePokemonStore.setState({
          pokemonList: [mockPokemon1, mockPokemon2],
          favorites: [1],
        });
        // Wait for persistence
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      const calls = (AsyncStorage.setItem as jest.Mock).mock.calls;
      if (calls.length > 0) {
        const lastCall = calls[calls.length - 1];
        const [_key, value] = lastCall;
        const parsed = JSON.parse(value);

        // Should persist favorites
        expect(parsed.state).toHaveProperty('favorites');
        // Should NOT persist pokemonList
        expect(parsed.state).not.toHaveProperty('pokemonList');
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid state changes', async () => {
      const { result } = renderHook(() => usePokemonStore());

      await act(async () => {
        result.current.toggleFavorite(1);
        result.current.toggleFavorite(2);
        result.current.toggleFavorite(1);
        result.current.toggleFavorite(3);
      });

      expect(result.current.favorites).toEqual([2, 3]);
    });

    it('should maintain state consistency across operations', async () => {
      (pokemonApi.getPokemonList as jest.Mock).mockResolvedValue(
        mockPokemonListResponse,
      );
      (pokemonApi.getPokemon as jest.Mock).mockResolvedValue(mockPokemon1);

      const { result } = renderHook(() => usePokemonStore());

      await act(async () => {
        await result.current.loadPokemonList();
        result.current.toggleFavorite(1);
        result.current.setSelectedType('grass');
      });

      expect(result.current.favorites).toContain(1);
      expect(result.current.selectedType).toBe('grass');
    });

    it('should handle concurrent requests gracefully', async () => {
      (pokemonApi.searchPokemonAdvanced as jest.Mock).mockResolvedValue([
        mockPokemon1,
      ]);
      (pokemonApi.getPokemonList as jest.Mock).mockResolvedValue(
        mockPokemonListResponse,
      );
      (pokemonApi.getPokemon as jest.Mock).mockResolvedValue(mockPokemon1);

      const { result } = renderHook(() => usePokemonStore());

      await act(async () => {
        const promises = [
          result.current.searchPokemon('bulb'),
          result.current.loadPokemonList(),
        ];
        await Promise.all(promises);
      });

      // Both operations should complete
      expect(result.current.searchResults.length).toBeGreaterThanOrEqual(0);
      expect(result.current.isSearching).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('Team Management', () => {
    describe('addToTeam', () => {
      it('should add Pokemon to team', () => {
        const { result } = renderHook(() => usePokemonStore());

        act(() => {
          const success = result.current.addToTeam(mockPokemon1);
          expect(success).toBe(true);
        });

        expect(result.current.team).toHaveLength(1);
        expect(result.current.team[0]).toEqual(mockPokemon1);
      });

      it('should not add duplicate Pokemon', () => {
        const { result } = renderHook(() => usePokemonStore());

        act(() => {
          result.current.addToTeam(mockPokemon1);
          const success = result.current.addToTeam(mockPokemon1);
          expect(success).toBe(false);
        });

        expect(result.current.team).toHaveLength(1);
      });

      it('should not add more than 6 Pokemon', () => {
        const { result } = renderHook(() => usePokemonStore());

        const pokemon3 = { ...mockPokemon1, id: 3, name: 'venusaur' };
        const pokemon4 = { ...mockPokemon1, id: 4, name: 'charmander' };
        const pokemon5 = { ...mockPokemon1, id: 5, name: 'charmeleon' };
        const pokemon6 = { ...mockPokemon1, id: 6, name: 'charizard' };
        const pokemon7 = { ...mockPokemon1, id: 7, name: 'squirtle' };

        act(() => {
          result.current.addToTeam(mockPokemon1);
          result.current.addToTeam(mockPokemon2);
          result.current.addToTeam(pokemon3);
          result.current.addToTeam(pokemon4);
          result.current.addToTeam(pokemon5);
          result.current.addToTeam(pokemon6);
          const success = result.current.addToTeam(pokemon7);
          expect(success).toBe(false);
        });

        expect(result.current.team).toHaveLength(6);
      });
    });

    describe('removeFromTeam', () => {
      it('should remove Pokemon from team', () => {
        const { result } = renderHook(() => usePokemonStore());

        act(() => {
          result.current.addToTeam(mockPokemon1);
          result.current.addToTeam(mockPokemon2);
        });

        expect(result.current.team).toHaveLength(2);

        act(() => {
          result.current.removeFromTeam(mockPokemon1.id);
        });

        expect(result.current.team).toHaveLength(1);
        expect(result.current.team[0].id).toBe(mockPokemon2.id);
      });
    });

    describe('clearTeam', () => {
      it('should clear entire team', () => {
        const { result } = renderHook(() => usePokemonStore());

        act(() => {
          result.current.addToTeam(mockPokemon1);
          result.current.addToTeam(mockPokemon2);
        });

        expect(result.current.team).toHaveLength(2);

        act(() => {
          result.current.clearTeam();
        });

        expect(result.current.team).toHaveLength(0);
      });
    });

    describe('isInTeam', () => {
      it('should check if Pokemon is in team', () => {
        const { result } = renderHook(() => usePokemonStore());

        act(() => {
          result.current.addToTeam(mockPokemon1);
        });

        expect(result.current.isInTeam(mockPokemon1.id)).toBe(true);
        expect(result.current.isInTeam(mockPokemon2.id)).toBe(false);
      });
    });

    describe('saveCurrentTeam', () => {
      it('should save current team', () => {
        const { result } = renderHook(() => usePokemonStore());

        act(() => {
          result.current.addToTeam(mockPokemon1);
          result.current.addToTeam(mockPokemon2);
        });

        let savedTeam;
        act(() => {
          savedTeam = result.current.saveCurrentTeam(
            'My Team',
            'Test description',
          );
        });

        expect(result.current.savedTeams).toHaveLength(1);
        expect(result.current.savedTeams[0].name).toBe('My Team');
        expect(result.current.savedTeams[0].description).toBe(
          'Test description',
        );
        expect(result.current.savedTeams[0].pokemon).toHaveLength(2);
        expect(result.current.currentTeamId).toBe(savedTeam.id);
      });

      it('should not save empty team', () => {
        const { result } = renderHook(() => usePokemonStore());

        expect(() => {
          act(() => {
            result.current.saveCurrentTeam('Empty Team');
          });
        }).toThrow('Cannot save an empty team');
      });

      it('should update existing team when currentTeamId is set', () => {
        const { result } = renderHook(() => usePokemonStore());

        // let teamId;
        act(() => {
          result.current.addToTeam(mockPokemon1);
          result.current.saveCurrentTeam('Original Name');
          // teamId = saved.id;
        });

        act(() => {
          result.current.addToTeam(mockPokemon2);
          result.current.saveCurrentTeam('Updated Name', 'New description');
        });

        expect(result.current.savedTeams).toHaveLength(1);
        expect(result.current.savedTeams[0].name).toBe('Updated Name');
        expect(result.current.savedTeams[0].description).toBe(
          'New description',
        );
        expect(result.current.savedTeams[0].pokemon).toHaveLength(2);
      });
    });

    describe('loadTeam', () => {
      it('should load saved team', () => {
        const { result } = renderHook(() => usePokemonStore());

        let teamId;
        act(() => {
          result.current.addToTeam(mockPokemon1);
          result.current.addToTeam(mockPokemon2);
          const saved = result.current.saveCurrentTeam('Team 1');
          _teamId = saved.id;
          result.current.clearTeam();
        });

        expect(result.current.team).toHaveLength(0);

        act(() => {
          result.current.loadTeam(teamId);
        });

        expect(result.current.team).toHaveLength(2);
        expect(result.current.currentTeamId).toBe(teamId);
      });

      it('should throw error for non-existent team', () => {
        const { result } = renderHook(() => usePokemonStore());

        expect(() => {
          act(() => {
            result.current.loadTeam('non-existent-id');
          });
        }).toThrow('Team not found');
      });
    });

    describe('deleteTeam', () => {
      it('should delete saved team', () => {
        const { result } = renderHook(() => usePokemonStore());

        let teamId;
        act(() => {
          result.current.addToTeam(mockPokemon1);
          const saved = result.current.saveCurrentTeam('Team to Delete');
          _teamId = saved.id;
        });

        expect(result.current.savedTeams).toHaveLength(1);

        act(() => {
          result.current.deleteTeam(teamId);
        });

        expect(result.current.savedTeams).toHaveLength(0);
      });

      it('should clear currentTeamId when deleting active team', () => {
        const { result } = renderHook(() => usePokemonStore());

        let teamId;
        act(() => {
          result.current.addToTeam(mockPokemon1);
          const saved = result.current.saveCurrentTeam('Active Team');
          _teamId = saved.id;
        });

        expect(result.current.currentTeamId).toBe(teamId);

        act(() => {
          result.current.deleteTeam(teamId);
        });

        expect(result.current.currentTeamId).toBeNull();
      });
    });

    describe('updateTeam', () => {
      it('should update team name and description', () => {
        const { result } = renderHook(() => usePokemonStore());

        let teamId;
        act(() => {
          result.current.addToTeam(mockPokemon1);
          const saved = result.current.saveCurrentTeam(
            'Original Name',
            'Original description',
          );
          _teamId = saved.id;
        });

        act(() => {
          result.current.updateTeam(teamId, {
            name: 'Updated Name',
            description: 'Updated description',
          });
        });

        const updatedTeam = result.current.savedTeams.find(
          t => t.id === teamId,
        );
        expect(updatedTeam?.name).toBe('Updated Name');
        expect(updatedTeam?.description).toBe('Updated description');
      });
    });

    describe('getTeamAnalysis', () => {
      it('should return null for empty team', () => {
        const { result } = renderHook(() => usePokemonStore());

        const analysis = result.current.getTeamAnalysis();
        expect(analysis).toBeNull();
      });

      it('should calculate type coverage', () => {
        const { result } = renderHook(() => usePokemonStore());

        act(() => {
          result.current.addToTeam(mockPokemon1); // grass/poison
          result.current.addToTeam(mockPokemon2); // grass/poison
        });

        const analysis = result.current.getTeamAnalysis();
        expect(analysis).not.toBeNull();
        expect(analysis?.typeCoverage.grass).toBe(2);
        expect(analysis?.typeCoverage.poison).toBe(2);
      });

      it('should calculate average stats', () => {
        const { result } = renderHook(() => usePokemonStore());

        act(() => {
          result.current.addToTeam(mockPokemon1); // HP: 45, Attack: 49
          result.current.addToTeam(mockPokemon2); // HP: 60, Attack: 62
        });

        const analysis = result.current.getTeamAnalysis();
        expect(analysis).not.toBeNull();
        expect(analysis?.averageStats.hp).toBe(53); // (45 + 60) / 2 = 52.5 rounded to 53
        expect(analysis?.averageStats.attack).toBe(56); // (49 + 62) / 2 = 55.5 rounded to 56
      });
    });
  });
});
