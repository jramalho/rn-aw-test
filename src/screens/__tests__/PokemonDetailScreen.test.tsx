import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import PokemonDetailScreen from '../PokemonDetailScreen';
import { Pokemon } from '../../types';

// Mock navigation
const mockGoBack = jest.fn();
const mockRoute = {
  params: {
    pokemon: {
      id: 25,
      name: 'pikachu',
      base_experience: 112,
      height: 4,
      weight: 60,
      order: 35,
      is_default: true,
      abilities: [
        {
          is_hidden: false,
          slot: 1,
          ability: { name: 'static', url: '' },
        },
      ],
      forms: [],
      game_indices: [],
      held_items: [],
      location_area_encounters: '',
      moves: [],
      sprites: {
        front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png',
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
      species: { name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon-species/25/' },
      stats: [
        { base_stat: 35, effort: 0, stat: { name: 'hp', url: '' } },
        { base_stat: 55, effort: 0, stat: { name: 'attack', url: '' } },
        { base_stat: 40, effort: 0, stat: { name: 'defense', url: '' } },
        { base_stat: 50, effort: 0, stat: { name: 'special-attack', url: '' } },
        { base_stat: 50, effort: 0, stat: { name: 'special-defense', url: '' } },
        { base_stat: 90, effort: 0, stat: { name: 'speed', url: '' } },
      ],
      types: [
        { slot: 1, type: { name: 'electric', url: '' } },
      ],
    } as Pokemon,
  },
};

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: mockGoBack,
  }),
  useRoute: () => mockRoute,
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
    Dimensions: {
      get: () => ({ width: 375, height: 812 }),
    },
  };
});

// Mock Pokemon API
jest.mock('../../utils/pokemonApi', () => ({
  pokemonApi: {
    getPokemonSpecies: jest.fn(() => Promise.resolve({
      id: 25,
      name: 'pikachu',
      flavor_text_entries: [
        {
          flavor_text: 'When several of these POKéMON gather, their electricity could build and cause lightning storms.',
          language: { name: 'en', url: '' },
          version: { name: 'red', url: '' },
        },
      ],
      genera: [
        {
          genus: 'Mouse Pokémon',
          language: { name: 'en', url: '' },
        },
      ],
      evolution_chain: {
        url: 'https://pokeapi.co/api/v2/evolution-chain/10/',
      },
    })),
    getEvolutionChain: jest.fn(() => Promise.resolve({
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
              },
            ],
          },
        ],
      },
    })),
  },
}));

// Mock Pokemon store
const mockPokemonStore = {
  favorites: [],
  toggleFavorite: jest.fn(),
};

jest.mock('../../store/pokemonStore', () => ({
  usePokemonStore: () => mockPokemonStore,
}));

describe('PokemonDetailScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPokemonStore.favorites = [];
  });

  describe('Rendering', () => {
    it('renders Pokemon basic information correctly', () => {
      const { getByText } = render(<PokemonDetailScreen />);
      
      expect(getByText('Pikachu')).toBeTruthy();
      expect(getByText('#025')).toBeTruthy();
    });

    it('displays Pokemon image', () => {
      const { UNSAFE_getByType } = render(<PokemonDetailScreen />);
      
      const { Image } = require('react-native');
      const image = UNSAFE_getByType(Image);
      expect(image.props.source.uri).toContain('25.png');
    });

    it('displays Pokemon types', () => {
      const { getByText } = render(<PokemonDetailScreen />);
      
      expect(getByText('ELECTRIC')).toBeTruthy();
    });

    it('displays Pokemon stats', () => {
      const { getByText } = render(<PokemonDetailScreen />);
      
      expect(getByText('HP')).toBeTruthy();
      expect(getByText('35')).toBeTruthy();
      expect(getByText('Attack')).toBeTruthy();
      expect(getByText('55')).toBeTruthy();
      expect(getByText('Defense')).toBeTruthy();
      expect(getByText('40')).toBeTruthy();
      expect(getByText('Sp. Atk')).toBeTruthy();
      expect(getByText('50')).toBeTruthy();
      expect(getByText('Sp. Def')).toBeTruthy();
      expect(getByText('Speed')).toBeTruthy();
      expect(getByText('90')).toBeTruthy();
    });

    it('displays Pokemon physical characteristics', () => {
      const { getByText } = render(<PokemonDetailScreen />);
      
      expect(getByText('Height')).toBeTruthy();
      expect(getByText('0.4 m')).toBeTruthy();
      expect(getByText('Weight')).toBeTruthy();
      expect(getByText('6.0 kg')).toBeTruthy();
      expect(getByText('Base Experience')).toBeTruthy();
      expect(getByText('112')).toBeTruthy();
    });

    it('displays Pokemon abilities', () => {
      const { getByText } = render(<PokemonDetailScreen />);
      
      expect(getByText('Abilities')).toBeTruthy();
      expect(getByText('Static')).toBeTruthy();
    });
  });

  describe('Favorite Functionality', () => {
    it('shows unfavorited state initially', () => {
      mockPokemonStore.favorites = [];
      const { getByText } = render(<PokemonDetailScreen />);
      
      expect(getByText('Add to Favorites')).toBeTruthy();
    });

    it('shows favorited state when Pokemon is in favorites', () => {
      mockPokemonStore.favorites = [25];
      const { getByText } = render(<PokemonDetailScreen />);
      
      expect(getByText('Remove from Favorites')).toBeTruthy();
    });

    it('toggles favorite when button is pressed', () => {
      const { getByText } = render(<PokemonDetailScreen />);
      
      const favoriteButton = getByText('Add to Favorites');
      fireEvent.press(favoriteButton);
      
      expect(mockPokemonStore.toggleFavorite).toHaveBeenCalledWith(25);
    });

    it('can toggle favorite multiple times', () => {
      const { getByText } = render(<PokemonDetailScreen />);
      
      const favoriteButton = getByText('Add to Favorites');
      fireEvent.press(favoriteButton);
      fireEvent.press(favoriteButton);
      fireEvent.press(favoriteButton);
      
      expect(mockPokemonStore.toggleFavorite).toHaveBeenCalledTimes(3);
    });
  });

  describe('Additional Data Loading', () => {
    it('loads Pokemon species data on mount', async () => {
      const { pokemonApi } = require('../../utils/pokemonApi');
      
      render(<PokemonDetailScreen />);
      
      await waitFor(() => {
        expect(pokemonApi.getPokemonSpecies).toHaveBeenCalledWith(25);
      });
    });

    it('loads evolution chain data', async () => {
      const { pokemonApi } = require('../../utils/pokemonApi');
      
      render(<PokemonDetailScreen />);
      
      await waitFor(() => {
        expect(pokemonApi.getEvolutionChain).toHaveBeenCalledWith(10);
      });
    });

    it('displays loaded species description', async () => {
      const { findByText } = render(<PokemonDetailScreen />);
      
      const description = await findByText(/When several of these POKéMON gather/);
      expect(description).toBeTruthy();
    });

    it('displays Pokemon genus', async () => {
      const { findByText } = render(<PokemonDetailScreen />);
      
      const genus = await findByText('Mouse Pokémon');
      expect(genus).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('displays error message when species loading fails', async () => {
      const { pokemonApi } = require('../../utils/pokemonApi');
      pokemonApi.getPokemonSpecies.mockRejectedValueOnce(new Error('Network error'));
      
      const { findByText } = render(<PokemonDetailScreen />);
      
      const errorMessage = await findByText(/Failed to load Pokemon details/);
      expect(errorMessage).toBeTruthy();
    });

    it('displays loading indicator while fetching data', () => {
      const { UNSAFE_getByType } = render(<PokemonDetailScreen />);
      
      const { ActivityIndicator } = require('react-native');
      // Loading indicator should be present initially
      const indicator = UNSAFE_getByType(ActivityIndicator);
      expect(indicator).toBeTruthy();
    });

    it('continues to display basic info even if additional data fails', async () => {
      const { pokemonApi } = require('../../utils/pokemonApi');
      pokemonApi.getPokemonSpecies.mockRejectedValueOnce(new Error('Failed'));
      
      const { getByText } = render(<PokemonDetailScreen />);
      
      // Basic info should still be visible
      expect(getByText('Pikachu')).toBeTruthy();
      expect(getByText('#025')).toBeTruthy();
    });
  });

  describe('Navigation', () => {
    it('has back button functionality', () => {
      const { getByText } = render(<PokemonDetailScreen />);
      
      const backButton = getByText('← Back');
      fireEvent.press(backButton);
      
      expect(mockGoBack).toHaveBeenCalled();
    });
  });

  describe('Stats Display', () => {
    it('displays all six Pokemon stats', () => {
      const { getByText } = render(<PokemonDetailScreen />);
      
      const statNames = ['HP', 'Attack', 'Defense', 'Sp. Atk', 'Sp. Def', 'Speed'];
      
      statNames.forEach(stat => {
        expect(getByText(stat)).toBeTruthy();
      });
    });

    it('displays correct stat values', () => {
      const { getByText } = render(<PokemonDetailScreen />);
      
      const statValues = ['35', '55', '40', '50', '90'];
      
      statValues.forEach(value => {
        expect(getByText(value)).toBeTruthy();
      });
    });

    it('calculates total stats correctly', () => {
      const { getByText } = render(<PokemonDetailScreen />);
      
      // Total: 35 + 55 + 40 + 50 + 50 + 90 = 320
      expect(getByText('Total')).toBeTruthy();
      expect(getByText('320')).toBeTruthy();
    });
  });

  describe('Type Display', () => {
    it('displays Pokemon type with correct styling', () => {
      const { getByText } = render(<PokemonDetailScreen />);
      
      const typeElement = getByText('ELECTRIC');
      expect(typeElement).toBeTruthy();
    });

    it('handles multiple types correctly', () => {
      // Update mock route to have dual-type Pokemon
      const originalParams = mockRoute.params;
      mockRoute.params = {
        pokemon: {
          ...originalParams.pokemon,
          types: [
            { slot: 1, type: { name: 'fire', url: '' } },
            { slot: 2, type: { name: 'flying', url: '' } },
          ],
        },
      };
      
      const { getByText } = render(<PokemonDetailScreen />);
      
      expect(getByText('FIRE')).toBeTruthy();
      expect(getByText('FLYING')).toBeTruthy();
      
      // Restore original params
      mockRoute.params = originalParams;
    });
  });

  describe('Theme Support', () => {
    it('renders correctly in light mode', () => {
      const useColorScheme = require('react-native').useColorScheme;
      useColorScheme.mockReturnValue('light');
      
      const { getByText } = render(<PokemonDetailScreen />);
      
      expect(getByText('Pikachu')).toBeTruthy();
    });

    it('renders correctly in dark mode', () => {
      const useColorScheme = require('react-native').useColorScheme;
      useColorScheme.mockReturnValue('dark');
      
      const { getByText } = render(<PokemonDetailScreen />);
      
      expect(getByText('Pikachu')).toBeTruthy();
    });
  });

  describe('Layout and Structure', () => {
    it('renders scrollable content', () => {
      const { UNSAFE_getByType } = render(<PokemonDetailScreen />);
      
      const { ScrollView } = require('react-native');
      expect(UNSAFE_getByType(ScrollView)).toBeTruthy();
    });

    it('displays sections in correct order', () => {
      const { getByText } = render(<PokemonDetailScreen />);
      
      // Check that main sections are present
      expect(getByText('Pikachu')).toBeTruthy();
      expect(getByText('Stats')).toBeTruthy();
      expect(getByText('Physical Characteristics')).toBeTruthy();
      expect(getByText('Abilities')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('handles Pokemon with no abilities', () => {
      const originalParams = mockRoute.params;
      mockRoute.params = {
        pokemon: {
          ...originalParams.pokemon,
          abilities: [],
        },
      };
      
      const { getByText, queryByText } = render(<PokemonDetailScreen />);
      
      expect(getByText('Abilities')).toBeTruthy();
      // Should still render the section without crashing
      
      // Restore original params
      mockRoute.params = originalParams;
    });

    it('handles Pokemon with missing sprites', () => {
      const originalParams = mockRoute.params;
      mockRoute.params = {
        pokemon: {
          ...originalParams.pokemon,
          sprites: {
            ...originalParams.pokemon.sprites,
            front_default: null,
          },
        },
      };
      
      const { getByText } = render(<PokemonDetailScreen />);
      
      // Should still render without crashing
      expect(getByText('Pikachu')).toBeTruthy();
      
      // Restore original params
      mockRoute.params = originalParams;
    });

    it('handles very large stat values', () => {
      const originalParams = mockRoute.params;
      mockRoute.params = {
        pokemon: {
          ...originalParams.pokemon,
          stats: [
            { base_stat: 999, effort: 0, stat: { name: 'hp', url: '' } },
            { base_stat: 999, effort: 0, stat: { name: 'attack', url: '' } },
            { base_stat: 999, effort: 0, stat: { name: 'defense', url: '' } },
            { base_stat: 999, effort: 0, stat: { name: 'special-attack', url: '' } },
            { base_stat: 999, effort: 0, stat: { name: 'special-defense', url: '' } },
            { base_stat: 999, effort: 0, stat: { name: 'speed', url: '' } },
          ],
        },
      };
      
      const { getByText } = render(<PokemonDetailScreen />);
      
      expect(getByText('999')).toBeTruthy();
      
      // Restore original params
      mockRoute.params = originalParams;
    });

    it('formats Pokemon name with hyphens correctly', () => {
      const originalParams = mockRoute.params;
      mockRoute.params = {
        pokemon: {
          ...originalParams.pokemon,
          name: 'mr-mime',
        },
      };
      
      const { getByText } = render(<PokemonDetailScreen />);
      
      expect(getByText('Mr Mime')).toBeTruthy();
      
      // Restore original params
      mockRoute.params = originalParams;
    });
  });

  describe('Accessibility', () => {
    it('has accessible Pokemon name', () => {
      const { getByText } = render(<PokemonDetailScreen />);
      
      expect(getByText('Pikachu')).toBeTruthy();
    });

    it('has accessible favorite button', () => {
      const { getByText } = render(<PokemonDetailScreen />);
      
      const favoriteButton = getByText('Add to Favorites');
      expect(favoriteButton).toBeTruthy();
    });

    it('has accessible back button', () => {
      const { getByText } = render(<PokemonDetailScreen />);
      
      const backButton = getByText('← Back');
      expect(backButton).toBeTruthy();
    });
  });
});
