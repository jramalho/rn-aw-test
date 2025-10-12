import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { AppNavigator } from '../AppNavigator';
import { usePokemonStore } from '../../store/pokemonStore';
import pokemonApi from '../../utils/pokemonApi';

// Mock dependencies
jest.mock('../../utils/pokemonApi');
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
}));

// Mock data
const mockPokemonList = {
  count: 1000,
  next: 'https://pokeapi.co/api/v2/pokemon?offset=20&limit=20',
  previous: null,
  results: [
    { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
    { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon/2/' },
    { name: 'venusaur', url: 'https://pokeapi.co/api/v2/pokemon/3/' },
  ],
};

const mockPokemon = {
  id: 1,
  name: 'bulbasaur',
  height: 7,
  weight: 69,
  base_experience: 64,
  types: [
    { slot: 1, type: { name: 'grass', url: 'https://pokeapi.co/api/v2/type/12/' } },
    { slot: 2, type: { name: 'poison', url: 'https://pokeapi.co/api/v2/type/4/' } },
  ],
  stats: [
    { base_stat: 45, stat: { name: 'hp', url: '' }, effort: 0 },
    { base_stat: 49, stat: { name: 'attack', url: '' }, effort: 0 },
    { base_stat: 49, stat: { name: 'defense', url: '' }, effort: 0 },
    { base_stat: 65, stat: { name: 'special-attack', url: '' }, effort: 1 },
    { base_stat: 65, stat: { name: 'special-defense', url: '' }, effort: 0 },
    { base_stat: 45, stat: { name: 'speed', url: '' }, effort: 0 },
  ],
  abilities: [
    { 
      ability: { name: 'overgrow', url: 'https://pokeapi.co/api/v2/ability/65/' },
      is_hidden: false,
      slot: 1,
    },
  ],
  sprites: {
    front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png',
    other: {
      'official-artwork': {
        front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png',
      },
    },
  },
  moves: [
    {
      move: { name: 'razor-wind', url: 'https://pokeapi.co/api/v2/move/13/' },
      version_group_details: [],
    },
  ],
  species: { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon-species/1/' },
};

const mockSpecies = {
  id: 1,
  name: 'bulbasaur',
  flavor_text_entries: [
    { 
      flavor_text: 'A strange seed was planted on its back at birth.', 
      language: { name: 'en', url: '' },
      version: { name: 'red', url: '' },
    },
  ],
  genera: [
    { genus: 'Seed Pokémon', language: { name: 'en', url: '' } },
  ],
  evolution_chain: {
    url: 'https://pokeapi.co/api/v2/evolution-chain/1/',
  },
};

const mockEvolutionChain = {
  id: 1,
  chain: {
    species: { name: 'bulbasaur', url: '' },
    evolution_details: [],
    evolves_to: [
      {
        species: { name: 'ivysaur', url: '' },
        evolution_details: [],
        evolves_to: [
          { 
            species: { name: 'venusaur', url: '' }, 
            evolution_details: [],
            evolves_to: [],
          },
        ],
      },
    ],
  },
};

describe('Navigation Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset store before each test
    usePokemonStore.setState({
      pokemonList: [],
      searchResults: [],
      isLoading: false,
      isSearching: false,
      error: null,
      searchError: null,
      currentPage: 0,
      hasMore: true,
      favorites: [],
      selectedType: null,
      selectedPokemon: null,
      detailLoading: false,
      detailError: null,
    });
    
    // Setup default mocks
    (pokemonApi.getPokemonList as jest.Mock).mockResolvedValue(mockPokemonList);
    (pokemonApi.getPokemon as jest.Mock).mockResolvedValue(mockPokemon);
    (pokemonApi.getSpecies as jest.Mock).mockResolvedValue(mockSpecies);
    (pokemonApi.getEvolutionChain as jest.Mock).mockResolvedValue(mockEvolutionChain);
  });

  describe('Tab Navigation Flows', () => {
    it('should render the main tab navigator with all tabs', async () => {
      const { getByText } = render(
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      );

      await waitFor(() => {
        expect(getByText('PokéDex')).toBeTruthy();
        expect(getByText('Profile')).toBeTruthy();
        expect(getByText('Settings')).toBeTruthy();
      });
    });

    it('should navigate between tabs', async () => {
      const { getByText, queryByText } = render(
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      );

      // Start on PokéDex tab
      await waitFor(() => {
        expect(getByText('PokéDex')).toBeTruthy();
      });

      // Navigate to Profile tab
      const profileTab = getByText('Profile');
      fireEvent.press(profileTab);

      await waitFor(() => {
        // Profile screen should be visible
        expect(queryByText('Pokemon Trainer')).toBeTruthy();
      });

      // Navigate to Settings tab
      const settingsTab = getByText('Settings');
      fireEvent.press(settingsTab);

      await waitFor(() => {
        // Settings screen should be visible
        expect(queryByText('App Settings')).toBeTruthy();
      });

      // Navigate back to PokéDex
      const pokedexTab = getByText('PokéDex');
      fireEvent.press(pokedexTab);

      await waitFor(() => {
        // PokéDex screen should be visible again
        expect(queryByText('PokéDex')).toBeTruthy();
      });
    });

    it('should maintain tab state when switching tabs', async () => {
      const { getByText, getByPlaceholderText } = render(
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(getByText('PokéDex')).toBeTruthy();
      });

      // Enter search text
      const searchInput = getByPlaceholderText('Search Pokémon...');
      fireEvent.changeText(searchInput, 'pikachu');

      // Switch to Profile tab
      const profileTab = getByText('Profile');
      fireEvent.press(profileTab);

      await waitFor(() => {
        expect(getByText('Pokemon Trainer')).toBeTruthy();
      });

      // Switch back to PokéDex
      const pokedexTab = getByText('PokéDex');
      fireEvent.press(pokedexTab);

      // Search text should be preserved
      await waitFor(() => {
        const searchInputAfter = getByPlaceholderText('Search Pokémon...');
        expect(searchInputAfter.props.value).toBe('pikachu');
      });
    });
  });

  describe('Pokemon List to Detail Navigation', () => {
    it('should navigate from list to detail screen when pokemon card is pressed', async () => {
      const { findByText } = render(
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      );

      // Wait for pokemon list to load
      await waitFor(() => {
        expect(pokemonApi.getPokemonList).toHaveBeenCalled();
      });

      // Find and press a pokemon card
      const pokemonCard = await findByText('Bulbasaur');
      fireEvent.press(pokemonCard);

      // Should navigate to detail screen
      await waitFor(() => {
        expect(pokemonApi.getPokemon).toHaveBeenCalledWith(1);
        expect(pokemonApi.getSpecies).toHaveBeenCalledWith(1);
      });
    });

    it('should load pokemon details when navigating to detail screen', async () => {
      const { findByText, queryByText } = render(
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      );

      // Wait for list to load
      await waitFor(() => {
        expect(pokemonApi.getPokemonList).toHaveBeenCalled();
      });

      // Press pokemon card
      const pokemonCard = await findByText('Bulbasaur');
      fireEvent.press(pokemonCard);

      // Wait for detail screen to load
      await waitFor(() => {
        expect(queryByText('Seed Pokémon')).toBeTruthy();
        expect(queryByText('grass')).toBeTruthy();
        expect(queryByText('poison')).toBeTruthy();
      });
    });

    it('should navigate back from detail to list screen', async () => {
      const { findByText, queryByText, getByTestId } = render(
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      );

      // Navigate to detail
      await waitFor(() => {
        expect(pokemonApi.getPokemonList).toHaveBeenCalled();
      });

      const pokemonCard = await findByText('Bulbasaur');
      fireEvent.press(pokemonCard);

      await waitFor(() => {
        expect(queryByText('Seed Pokémon')).toBeTruthy();
      });

      // Find and press back button
      const backButton = getByTestId('back-button');
      fireEvent.press(backButton);

      // Should be back on list screen
      await waitFor(() => {
        expect(queryByText('PokéDex')).toBeTruthy();
      });
    });
  });

  describe('Search and Navigation Integration', () => {
    it('should allow searching and then navigating to detail from search results', async () => {
      const searchResults = [mockPokemon];
      (pokemonApi.searchPokemonAdvanced as jest.Mock).mockResolvedValue(searchResults);

      const { getByPlaceholderText, getByText, findByText } = render(
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      );

      // Perform search
      const searchInput = getByPlaceholderText('Search Pokémon...');
      fireEvent.changeText(searchInput, 'bulbasaur');

      // Press search button
      const searchButton = getByText('🔍');
      fireEvent.press(searchButton);

      await waitFor(() => {
        expect(pokemonApi.searchPokemonAdvanced).toHaveBeenCalledWith('bulbasaur');
      });

      // Click on search result
      const resultCard = await findByText('Bulbasaur');
      fireEvent.press(resultCard);

      // Should navigate to detail
      await waitFor(() => {
        expect(pokemonApi.getPokemon).toHaveBeenCalledWith(1);
      });
    });

    it('should preserve search state after navigating back from detail', async () => {
      const searchResults = [mockPokemon];
      (pokemonApi.searchPokemonAdvanced as jest.Mock).mockResolvedValue(searchResults);

      const { getByPlaceholderText, getByText, findByText, getByTestId, queryByText } = render(
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      );

      // Perform search
      const searchInput = getByPlaceholderText('Search Pokémon...');
      fireEvent.changeText(searchInput, 'bulbasaur');

      const searchButton = getByText('🔍');
      fireEvent.press(searchButton);

      await waitFor(() => {
        expect(pokemonApi.searchPokemonAdvanced).toHaveBeenCalled();
      });

      // Navigate to detail
      const resultCard = await findByText('Bulbasaur');
      fireEvent.press(resultCard);

      await waitFor(() => {
        expect(queryByText('Seed Pokémon')).toBeTruthy();
      });

      // Navigate back
      const backButton = getByTestId('back-button');
      fireEvent.press(backButton);

      // Search results should still be visible
      await waitFor(() => {
        expect(queryByText('Bulbasaur')).toBeTruthy();
      });
    });
  });

  describe('Type Filter and Navigation Integration', () => {
    it('should filter by type and navigate to filtered pokemon detail', async () => {
      const grassPokemon = {
        ...mockPokemon,
        types: [{ slot: 1, type: { name: 'grass', url: '' } }],
      };

      (pokemonApi.getPokemon as jest.Mock).mockResolvedValue(grassPokemon);
      (pokemonApi.filterPokemonByType as jest.Mock).mockResolvedValue([grassPokemon]);

      const { findByText } = render(
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(pokemonApi.getPokemonList).toHaveBeenCalled();
      });

      // Select grass type filter
      const grassFilter = await findByText('grass');
      fireEvent.press(grassFilter);

      await waitFor(() => {
        expect(usePokemonStore.getState().selectedType).toBe('grass');
      });

      // Navigate to filtered pokemon
      const pokemonCard = await findByText('Bulbasaur');
      fireEvent.press(pokemonCard);

      // Should load detail
      await waitFor(() => {
        expect(pokemonApi.getPokemon).toHaveBeenCalled();
      });
    });

    it('should maintain filter selection when navigating back from detail', async () => {
      const { findByText, getByTestId } = render(
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      );

      await waitFor(() => {
        expect(pokemonApi.getPokemonList).toHaveBeenCalled();
      });

      // Apply filter
      const grassFilter = await findByText('grass');
      fireEvent.press(grassFilter);

      // Navigate to detail
      const pokemonCard = await findByText('Bulbasaur');
      fireEvent.press(pokemonCard);

      await waitFor(() => {
        expect(pokemonApi.getPokemon).toHaveBeenCalled();
      });

      // Navigate back
      const backButton = getByTestId('back-button');
      fireEvent.press(backButton);

      // Filter should still be active
      await waitFor(() => {
        expect(usePokemonStore.getState().selectedType).toBe('grass');
      });
    });
  });

  describe('Favorites and Navigation Integration', () => {
    it('should toggle favorite from detail screen and reflect in list', async () => {
      const { findByText, getByTestId, queryByText } = render(
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      );

      // Navigate to detail
      await waitFor(() => {
        expect(pokemonApi.getPokemonList).toHaveBeenCalled();
      });

      const pokemonCard = await findByText('Bulbasaur');
      fireEvent.press(pokemonCard);

      await waitFor(() => {
        expect(queryByText('Seed Pokémon')).toBeTruthy();
      });

      // Toggle favorite
      const favoriteButton = getByTestId('favorite-button');
      fireEvent.press(favoriteButton);

      // Navigate back
      const backButton = getByTestId('back-button');
      fireEvent.press(backButton);

      // Check if favorite is reflected in list
      await waitFor(() => {
        expect(usePokemonStore.getState().favorites).toContain(1);
      });
    });

    it('should view favorites from profile and navigate to detail', async () => {
      // Set up favorites
      usePokemonStore.setState({
        favorites: [1],
        pokemonList: [mockPokemon],
      });

      const { getByText, findByText } = render(
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      );

      // Navigate to Profile tab
      const profileTab = getByText('Profile');
      fireEvent.press(profileTab);

      await waitFor(() => {
        expect(getByText('Pokemon Trainer')).toBeTruthy();
      });

      // Find and press favorite pokemon
      const favoritePokemon = await findByText('Bulbasaur');
      fireEvent.press(favoritePokemon);

      // Should navigate to detail
      await waitFor(() => {
        expect(pokemonApi.getPokemon).toHaveBeenCalledWith(1);
      });
    });
  });

  describe('Error Handling in Navigation Flows', () => {
    it('should handle API errors when navigating to detail', async () => {
      (pokemonApi.getPokemon as jest.Mock).mockRejectedValue(new Error('API Error'));

      const { findByText, queryByText } = render(
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      );

      await waitFor(() => {
        expect(pokemonApi.getPokemonList).toHaveBeenCalled();
      });

      const pokemonCard = await findByText('Bulbasaur');
      fireEvent.press(pokemonCard);

      // Should show error message
      await waitFor(() => {
        expect(queryByText('API Error')).toBeTruthy();
      });
    });

    it('should allow retry after error on detail screen', async () => {
      (pokemonApi.getPokemon as jest.Mock)
        .mockRejectedValueOnce(new Error('API Error'))
        .mockResolvedValueOnce(mockPokemon);

      const { getByText, findByText, queryByText } = render(
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      );

      await waitFor(() => {
        expect(pokemonApi.getPokemonList).toHaveBeenCalled();
      });

      const pokemonCard = await findByText('Bulbasaur');
      fireEvent.press(pokemonCard);

      // Wait for error
      await waitFor(() => {
        expect(queryByText('API Error')).toBeTruthy();
      });

      // Press retry button
      const retryButton = getByText('Retry');
      fireEvent.press(retryButton);

      // Should load successfully
      await waitFor(() => {
        expect(pokemonApi.getPokemon).toHaveBeenCalledTimes(2);
        expect(queryByText('Seed Pokémon')).toBeTruthy();
      });
    });
  });

  describe('Deep Linking Scenarios', () => {
    it('should handle direct navigation to detail screen', async () => {
      render(
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      );

      // Simulate direct navigation to detail
      usePokemonStore.getState().loadPokemonDetail(1);

      await waitFor(() => {
        expect(pokemonApi.getPokemon).toHaveBeenCalledWith(1);
        expect(pokemonApi.getSpecies).toHaveBeenCalledWith(1);
      });
    });
  });

  describe('Performance and State Management', () => {
    it('should not reload list when returning from detail', async () => {
      const { findByText, getByTestId } = render(
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      );

      await waitFor(() => {
        expect(pokemonApi.getPokemonList).toHaveBeenCalledTimes(1);
      });

      // Navigate to detail
      const pokemonCard = await findByText('Bulbasaur');
      fireEvent.press(pokemonCard);

      await waitFor(() => {
        expect(pokemonApi.getPokemon).toHaveBeenCalled();
      });

      // Navigate back
      const backButton = getByTestId('back-button');
      fireEvent.press(backButton);

      // Should NOT call getPokemonList again
      await waitFor(() => {
        expect(pokemonApi.getPokemonList).toHaveBeenCalledTimes(1);
      });
    });

    it('should preserve selected pokemon state appropriately', async () => {
      const { getByText, findByText } = render(
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      );

      await waitFor(() => {
        expect(pokemonApi.getPokemonList).toHaveBeenCalled();
      });

      // Navigate to detail
      const pokemonCard = await findByText('Bulbasaur');
      fireEvent.press(pokemonCard);

      await waitFor(() => {
        expect(usePokemonStore.getState().selectedPokemon).toBeTruthy();
      });

      // Navigate to different tab
      const settingsTab = getByText('Settings');
      fireEvent.press(settingsTab);

      // Verify settings screen is visible
      await waitFor(() => {
        expect(getByText('App Settings')).toBeTruthy();
      });
    });
  });
});
