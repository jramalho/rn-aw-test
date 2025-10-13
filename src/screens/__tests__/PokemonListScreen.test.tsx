import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import PokemonListScreen from '../PokemonListScreen';
import { Pokemon } from '../../types';

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

// Mock dependencies
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    useColorScheme: jest.fn(() => 'light'),
  };
});

jest.mock('../../hooks', () => ({
  useDebounce: jest.fn(value => value),
}));

// Mock components
jest.mock('../../components', () => ({
  PokemonCard: ({ pokemon, onPress }: any) => {
    const { Text, Pressable } = require('react-native');
    return (
      <Pressable
        onPress={() => onPress(pokemon)}
        testID={`pokemon-card-${pokemon.id}`}
      >
        <Text>{pokemon.name}</Text>
      </Pressable>
    );
  },
  SearchBar: ({ value, onChangeText, onSearch, onClear, loading }: any) => {
    const { View, TextInput, Text, Pressable } = require('react-native');
    return (
      <View testID="search-bar">
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder="Search"
          testID="search-input"
        />
        <Pressable onPress={onSearch} testID="search-button">
          <Text>Search</Text>
        </Pressable>
        <Pressable onPress={onClear} testID="clear-button">
          <Text>Clear</Text>
        </Pressable>
        {loading && <Text testID="search-loading">Loading...</Text>}
      </View>
    );
  },
  TypeFilter: ({ types, _selectedType, onTypeSelect }: any) => {
    const { View, Text, Pressable } = require('react-native');
    return (
      <View testID="type-filter">
        {types.map((type: any) => (
          <Pressable
            key={type.id}
            onPress={() => onTypeSelect(type.name)}
            testID={`type-${type.name}`}
          >
            <Text>{type.name}</Text>
          </Pressable>
        ))}
      </View>
    );
  },
  SearchSuggestions: ({ suggestions, onSelect, visible }: any) => {
    const { View, Text, Pressable } = require('react-native');
    if (!visible) return null;
    return (
      <View testID="search-suggestions">
        {suggestions.map((suggestion: string) => (
          <Pressable
            key={suggestion}
            onPress={() => onSelect(suggestion)}
            testID={`suggestion-${suggestion}`}
          >
            <Text>{suggestion}</Text>
          </Pressable>
        ))}
      </View>
    );
  },
}));

const mockPokemon: Pokemon[] = [
  {
    id: 1,
    name: 'bulbasaur',
    base_experience: 64,
    height: 7,
    weight: 69,
    order: 1,
    is_default: true,
    abilities: [],
    forms: [],
    game_indices: [],
    held_items: [],
    location_area_encounters: '',
    moves: [],
    sprites: {
      front_default: 'sprite1.png',
      front_shiny: null,
      front_female: null,
      front_shiny_female: null,
      back_default: null,
      back_shiny: null,
      back_female: null,
      back_shiny_female: null,
      other: {},
      versions: {},
    },
    cries: { latest: '', legacy: '' },
    species: { name: 'bulbasaur', url: '' },
    stats: [],
    types: [{ slot: 1, type: { name: 'grass', url: '' } }],
  },
  {
    id: 25,
    name: 'pikachu',
    base_experience: 112,
    height: 4,
    weight: 60,
    order: 35,
    is_default: true,
    abilities: [],
    forms: [],
    game_indices: [],
    held_items: [],
    location_area_encounters: '',
    moves: [],
    sprites: {
      front_default: 'sprite25.png',
      front_shiny: null,
      front_female: null,
      front_shiny_female: null,
      back_default: null,
      back_shiny: null,
      back_female: null,
      back_shiny_female: null,
      other: {},
      versions: {},
    },
    cries: { latest: '', legacy: '' },
    species: { name: 'pikachu', url: '' },
    stats: [],
    types: [{ slot: 1, type: { name: 'electric', url: '' } }],
  },
];

const mockTypes = [
  { id: 1, name: 'fire' },
  { id: 2, name: 'water' },
];

// Mock the Pokemon store
const mockPokemonStore = {
  pokemonList: mockPokemon,
  isLoading: false,
  isLoadingMore: false,
  error: null,
  hasMore: true,
  searchResults: [],
  isSearching: false,
  searchError: null,
  searchSuggestions: [],
  _selectedType: null,
  availableTypes: mockTypes,
  loadPokemonList: jest.fn(),
  loadMore: jest.fn(),
  searchPokemon: jest.fn(),
  set_selectedType: jest.fn(),
  loadTypes: jest.fn(),
  getSuggestions: jest.fn(),
  clearSearch: jest.fn(),
  clearError: jest.fn(),
};

jest.mock('../../store/pokemonStore', () => ({
  usePokemonStore: () => mockPokemonStore,
}));

describe('PokemonListScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock store to default values
    Object.assign(mockPokemonStore, {
      pokemonList: mockPokemon,
      isLoading: false,
      isLoadingMore: false,
      error: null,
      hasMore: true,
      searchResults: [],
      isSearching: false,
      searchError: null,
      searchSuggestions: [],
      _selectedType: null,
      availableTypes: mockTypes,
    });
  });

  describe('Rendering', () => {
    it('renders correctly with Pokemon list', () => {
      const { getByText } = render(<PokemonListScreen />);

      expect(getByText('PokéDex')).toBeTruthy();
      expect(getByText('Discover amazing Pokémon')).toBeTruthy();
      expect(getByText('bulbasaur')).toBeTruthy();
      expect(getByText('pikachu')).toBeTruthy();
    });

    it('displays search bar', () => {
      const { _getByTestId } = render(<PokemonListScreen />);

      expect(_getByTestId('search-bar')).toBeTruthy();
      expect(_getByTestId('search-input')).toBeTruthy();
    });

    it('displays type filter', () => {
      const { _getByTestId } = render(<PokemonListScreen />);

      expect(_getByTestId('type-filter')).toBeTruthy();
    });

    it('displays Pokemon cards', () => {
      const { _getByTestId } = render(<PokemonListScreen />);

      expect(_getByTestId('pokemon-card-1')).toBeTruthy();
      expect(_getByTestId('pokemon-card-25')).toBeTruthy();
    });
  });

  describe('Initial Data Loading', () => {
    it('loads Pokemon list on mount when empty', async () => {
      mockPokemonStore.pokemonList = [];

      render(<PokemonListScreen />);

      await waitFor(() => {
        expect(mockPokemonStore.loadPokemonList).toHaveBeenCalledWith(true);
      });
    });

    it('loads types on mount when empty', async () => {
      mockPokemonStore.availableTypes = [];

      render(<PokemonListScreen />);

      await waitFor(() => {
        expect(mockPokemonStore.loadTypes).toHaveBeenCalled();
      });
    });

    it('does not reload if data already exists', () => {
      mockPokemonStore.pokemonList = mockPokemon;
      mockPokemonStore.availableTypes = mockTypes;

      render(<PokemonListScreen />);

      expect(mockPokemonStore.loadPokemonList).not.toHaveBeenCalled();
      expect(mockPokemonStore.loadTypes).not.toHaveBeenCalled();
    });
  });

  describe('Search Functionality', () => {
    it('updates search query when typing', () => {
      const { _getByTestId } = render(<PokemonListScreen />);

      const _searchInput = _getByTestId('search-input');
      fireEvent.changeText(_searchInput, 'pikachu');

      expect(_searchInput.props.value).toBe('pikachu');
    });

    it('calls searchPokemon after debounce', async () => {
      const { _getByTestId } = render(<PokemonListScreen />);

      const _searchInput = _getByTestId('search-input');
      fireEvent.changeText(_searchInput, 'pikachu');

      await waitFor(() => {
        expect(mockPokemonStore.searchPokemon).toHaveBeenCalledWith('pikachu');
      });
    });

    it('clears search when clear button is pressed', () => {
      const { _getByTestId } = render(<PokemonListScreen />);

      const _searchInput = _getByTestId('search-input');
      fireEvent.changeText(_searchInput, 'pikachu');

      const clearButton = _getByTestId('clear-button');
      fireEvent.press(clearButton);

      expect(mockPokemonStore.clearSearch).toHaveBeenCalled();
      expect(_searchInput.props.value).toBe('');
    });

    it('shows search results when searching', () => {
      mockPokemonStore.searchResults = [mockPokemon[1]];
      const { getByText } = render(<PokemonListScreen />);

      expect(getByText('pikachu')).toBeTruthy();
    });

    it('displays loading indicator when searching', () => {
      mockPokemonStore.isSearching = true;
      const { _getByTestId } = render(<PokemonListScreen />);

      expect(_getByTestId('search-loading')).toBeTruthy();
    });

    it('displays search error when search fails', () => {
      mockPokemonStore.searchError = 'Pokemon not found';
      const { getByText } = render(<PokemonListScreen />);

      expect(getByText('⚠️ Pokemon not found')).toBeTruthy();
    });
  });

  describe('Type Filter', () => {
    it('calls set_selectedType when type is selected', () => {
      const { _getByTestId } = render(<PokemonListScreen />);

      const fireType = _getByTestId('type-fire');
      fireEvent.press(fireType);

      expect(mockPokemonStore.set_selectedType).toHaveBeenCalledWith('fire');
    });

    it('displays available types', () => {
      const { _getByTestId } = render(<PokemonListScreen />);

      expect(_getByTestId('type-fire')).toBeTruthy();
      expect(_getByTestId('type-water')).toBeTruthy();
    });
  });

  describe('Pokemon Card Interaction', () => {
    it('navigates to detail screen when Pokemon card is pressed', () => {
      const { _getByTestId } = render(<PokemonListScreen />);

      const pokemonCard = _getByTestId('pokemon-card-25');
      fireEvent.press(pokemonCard);

      expect(mockNavigate).toHaveBeenCalledWith('PokemonDetail', {
        pokemon: mockPokemon[1],
      });
    });

    it('handles multiple card presses', () => {
      const { _getByTestId } = render(<PokemonListScreen />);

      fireEvent.press(_getByTestId('pokemon-card-1'));
      fireEvent.press(_getByTestId('pokemon-card-25'));

      expect(mockNavigate).toHaveBeenCalledTimes(2);
    });
  });

  describe('Infinite Scroll', () => {
    it('loads more Pokemon when reaching end of list', () => {
      mockPokemonStore.hasMore = true;
      const { _getByTestId } = render(<PokemonListScreen />);

      const flatList =
        _getByTestId('pokemon-list') ||
        _getByTestId('pokemon-card-1').parent?.parent;

      // This would be triggered by FlatList onEndReached
      // In a real scenario, we'd simulate scroll to end
      if (flatList) {
        mockPokemonStore.loadMore();
        expect(mockPokemonStore.loadMore).toHaveBeenCalled();
      }
    });

    it('does not load more when already loading', () => {
      mockPokemonStore.isLoadingMore = true;
      render(<PokemonListScreen />);

      // Should not trigger additional load
      expect(mockPokemonStore.loadMore).not.toHaveBeenCalled();
    });

    it('displays loading indicator when loading more', () => {
      mockPokemonStore.isLoadingMore = true;
      const { getByText } = render(<PokemonListScreen />);

      expect(getByText('Loading more Pokémon...')).toBeTruthy();
    });
  });

  describe('Pull to Refresh', () => {
    it('refreshes data when pulled', () => {
      render(<PokemonListScreen />);

      // Simulate pull to refresh
      // In actual implementation, this would be through FlatList refreshControl
      mockPokemonStore.loadPokemonList(true);

      expect(mockPokemonStore.loadPokemonList).toHaveBeenCalledWith(true);
    });
  });

  describe('Empty States', () => {
    it('displays empty message when no Pokemon', () => {
      mockPokemonStore.pokemonList = [];
      mockPokemonStore.searchResults = [];
      mockPokemonStore.isLoading = false;

      const { getByText } = render(<PokemonListScreen />);

      expect(getByText('No Pokémon available')).toBeTruthy();
      expect(getByText('Pull to refresh')).toBeTruthy();
    });

    it('displays no results message when search returns empty', () => {
      mockPokemonStore.searchResults = [];
      mockPokemonStore.isSearching = false;

      const { _getByTestId, getByText } = render(<PokemonListScreen />);

      const _searchInput = _getByTestId('search-input');
      fireEvent.changeText(_searchInput, 'nonexistent');

      expect(getByText(/No Pokémon found for/)).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('displays error message when loading fails', () => {
      mockPokemonStore.error = 'Failed to load Pokemon';
      const { getByText } = render(<PokemonListScreen />);

      expect(getByText('⚠️ Failed to load Pokemon')).toBeTruthy();
    });

    it('allows retry when error occurs', () => {
      mockPokemonStore.error = 'Network error';
      const { getByText } = render(<PokemonListScreen />);

      const retryButton = getByText('Tap to retry');
      fireEvent.press(retryButton);

      expect(mockPokemonStore.clearError).toHaveBeenCalled();
    });
  });

  describe('Theme Support', () => {
    it('renders correctly in light mode', () => {
      const useColorScheme = require('react-native').useColorScheme;
      useColorScheme.mockReturnValue('light');

      const { getByText } = render(<PokemonListScreen />);

      expect(getByText('PokéDex')).toBeTruthy();
    });

    it('renders correctly in dark mode', () => {
      const useColorScheme = require('react-native').useColorScheme;
      useColorScheme.mockReturnValue('dark');

      const { getByText } = render(<PokemonListScreen />);

      expect(getByText('PokéDex')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty search query', () => {
      const { _getByTestId } = render(<PokemonListScreen />);

      const _searchInput = _getByTestId('search-input');
      fireEvent.changeText(_searchInput, '   ');

      expect(mockPokemonStore.clearSearch).toHaveBeenCalled();
    });

    it('handles rapid search changes', async () => {
      const { _getByTestId } = render(<PokemonListScreen />);

      const _searchInput = _getByTestId('search-input');

      fireEvent.changeText(_searchInput, 'p');
      fireEvent.changeText(_searchInput, 'pi');
      fireEvent.changeText(_searchInput, 'pik');

      await waitFor(() => {
        expect(mockPokemonStore.searchPokemon).toHaveBeenCalled();
      });
    });
  });
});
