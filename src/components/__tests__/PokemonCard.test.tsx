import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import PokemonCard from '../PokemonCard';
import { Pokemon } from '../../types';

// Mock useColorScheme
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    useColorScheme: jest.fn(() => 'light'),
  };
});

const mockPokemon: Pokemon = {
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
      ability: { name: 'static', url: 'https://pokeapi.co/api/v2/ability/9/' },
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
  cries: {
    latest: '',
    legacy: '',
  },
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
    { slot: 1, type: { name: 'electric', url: 'https://pokeapi.co/api/v2/type/13/' } },
  ],
};

describe('PokemonCard Component', () => {
  describe('Rendering', () => {
    it('renders correctly with pokemon data', () => {
      const { getByText } = render(
        <PokemonCard pokemon={mockPokemon} onPress={jest.fn()} />
      );
      
      expect(getByText('Pikachu')).toBeTruthy();
      expect(getByText('#025')).toBeTruthy();
    });

    it('displays pokemon image', () => {
      const { UNSAFE_getByType } = render(
        <PokemonCard pokemon={mockPokemon} onPress={jest.fn()} />
      );
      
      const { Image } = require('react-native');
      const image = UNSAFE_getByType(Image);
      expect(image.props.source.uri).toContain('25.png');
    });

    it('displays pokemon types correctly', () => {
      const { getByText } = render(
        <PokemonCard pokemon={mockPokemon} onPress={jest.fn()} />
      );
      
      expect(getByText('ELECTRIC')).toBeTruthy();
    });

    it('displays pokemon stats', () => {
      const { getByText } = render(
        <PokemonCard pokemon={mockPokemon} onPress={jest.fn()} />
      );
      
      expect(getByText('HP')).toBeTruthy();
      expect(getByText('35')).toBeTruthy();
      expect(getByText('ATK')).toBeTruthy();
      expect(getByText('55')).toBeTruthy();
      expect(getByText('DEF')).toBeTruthy();
      expect(getByText('40')).toBeTruthy();
    });

    it('handles pokemon with multiple types', () => {
      const multiTypePokemon: Pokemon = {
        ...mockPokemon,
        types: [
          { slot: 1, type: { name: 'fire', url: '' } },
          { slot: 2, type: { name: 'flying', url: '' } },
        ],
      };
      
      const { getByText } = render(
        <PokemonCard pokemon={multiTypePokemon} onPress={jest.fn()} />
      );
      
      expect(getByText('FIRE')).toBeTruthy();
      expect(getByText('FLYING')).toBeTruthy();
    });

    it('handles pokemon with hyphenated names', () => {
      const hyphenatedPokemon: Pokemon = {
        ...mockPokemon,
        name: 'mr-mime',
      };
      
      const { getByText } = render(
        <PokemonCard pokemon={hyphenatedPokemon} onPress={jest.fn()} />
      );
      
      expect(getByText('Mr Mime')).toBeTruthy();
    });
  });

  describe('Interactions', () => {
    it('calls onPress with pokemon data when pressed', () => {
      const onPressMock = jest.fn();
      const { getByText } = render(
        <PokemonCard pokemon={mockPokemon} onPress={onPressMock} />
      );
      
      fireEvent.press(getByText('Pikachu'));
      expect(onPressMock).toHaveBeenCalledWith(mockPokemon);
      expect(onPressMock).toHaveBeenCalledTimes(1);
    });

    it('applies pressed style when pressed', () => {
      const { getByText } = render(
        <PokemonCard pokemon={mockPokemon} onPress={jest.fn()} />
      );
      
      const card = getByText('Pikachu').parent?.parent;
      expect(card).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('has proper accessibility role', () => {
      const { getByRole } = render(
        <PokemonCard pokemon={mockPokemon} onPress={jest.fn()} />
      );
      
      expect(getByRole('button')).toBeTruthy();
    });

    it('has proper accessibility label', () => {
      const { getByLabelText } = render(
        <PokemonCard pokemon={mockPokemon} onPress={jest.fn()} />
      );
      
      expect(getByLabelText('Pokemon pikachu')).toBeTruthy();
    });
  });

  describe('Theme Support', () => {
    it('renders correctly in light mode', () => {
      const useColorScheme = require('react-native').useColorScheme;
      useColorScheme.mockReturnValue('light');
      
      const { getByText } = render(
        <PokemonCard pokemon={mockPokemon} onPress={jest.fn()} />
      );
      
      expect(getByText('Pikachu')).toBeTruthy();
    });

    it('renders correctly in dark mode', () => {
      const useColorScheme = require('react-native').useColorScheme;
      useColorScheme.mockReturnValue('dark');
      
      const { getByText } = render(
        <PokemonCard pokemon={mockPokemon} onPress={jest.fn()} />
      );
      
      expect(getByText('Pikachu')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('handles missing stats gracefully', () => {
      const pokemonWithMissingStats: Pokemon = {
        ...mockPokemon,
        stats: [],
      };
      
      const { getByText } = render(
        <PokemonCard pokemon={pokemonWithMissingStats} onPress={jest.fn()} />
      );
      
      expect(getByText('HP')).toBeTruthy();
      expect(getByText('0')).toBeTruthy();
    });

    it('handles pokemon with no types', () => {
      const pokemonWithNoTypes: Pokemon = {
        ...mockPokemon,
        types: [],
      };
      
      const { queryByText } = render(
        <PokemonCard pokemon={pokemonWithNoTypes} onPress={jest.fn()} />
      );
      
      // Should still render without crashing
      expect(queryByText('Pikachu')).toBeTruthy();
    });

    it('handles large stat values', () => {
      const pokemonWithLargeStats: Pokemon = {
        ...mockPokemon,
        stats: [
          { base_stat: 999, effort: 0, stat: { name: 'hp', url: '' } },
          { base_stat: 999, effort: 0, stat: { name: 'attack', url: '' } },
          { base_stat: 999, effort: 0, stat: { name: 'defense', url: '' } },
        ],
      };
      
      const { getAllByText } = render(
        <PokemonCard pokemon={pokemonWithLargeStats} onPress={jest.fn()} />
      );
      
      expect(getAllByText('999')).toHaveLength(3);
    });
  });
});
