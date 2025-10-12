import React from 'react';
import { render } from '@testing-library/react-native';
import PokemonCard from '../PokemonCard';
import Button from '../Button';
import SearchBar from '../SearchBar';
import TypeFilter from '../TypeFilter';
import { Pokemon, Type } from '../../types';

// Mock data
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
    { base_stat: 35, stat: { name: 'hp', url: '' }, effort: 0 },
    { base_stat: 55, stat: { name: 'attack', url: '' }, effort: 0 },
    { base_stat: 40, stat: { name: 'defense', url: '' }, effort: 0 },
    { base_stat: 50, stat: { name: 'special-attack', url: '' }, effort: 0 },
    { base_stat: 50, stat: { name: 'special-defense', url: '' }, effort: 0 },
    { base_stat: 90, stat: { name: 'speed', url: '' }, effort: 0 },
  ],
  abilities: [
    { 
      ability: { name: 'static', url: 'https://pokeapi.co/api/v2/ability/9/' },
      is_hidden: false,
      slot: 1,
    },
  ],
  sprites: {
    front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png',
    other: {
      'official-artwork': {
        front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
      },
    },
  },
  moves: [],
  species: { name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon-species/25/' },
};

const mockTypes: Type[] = [
  { id: 12, name: 'grass', pokemon: [] },
  { id: 10, name: 'fire', pokemon: [] },
  { id: 11, name: 'water', pokemon: [] },
];

describe('Accessibility Tests', () => {
  describe('PokemonCard Accessibility', () => {
    it('should have proper accessibility label with comprehensive information', () => {
      const onPress = jest.fn();
      const { getByRole } = render(
        <PokemonCard pokemon={mockPokemon} onPress={onPress} />
      );

      const card = getByRole('button');
      expect(card).toBeTruthy();
      expect(card.props.accessibilityLabel).toContain('Pikachu');
      expect(card.props.accessibilityLabel).toContain('#025');
      expect(card.props.accessibilityLabel).toContain('electric');
      expect(card.props.accessibilityLabel).toContain('HP 35');
      expect(card.props.accessibilityLabel).toContain('Attack 55');
      expect(card.props.accessibilityLabel).toContain('Defense 40');
    });

    it('should have accessibility hint for interaction', () => {
      const onPress = jest.fn();
      const { getByRole } = render(
        <PokemonCard pokemon={mockPokemon} onPress={onPress} />
      );

      const card = getByRole('button');
      expect(card.props.accessibilityHint).toContain('Double tap');
      expect(card.props.accessibilityHint).toContain('detailed information');
    });

    it('should have accessible image with proper label', () => {
      const onPress = jest.fn();
      const { UNSAFE_getByProps } = render(
        <PokemonCard pokemon={mockPokemon} onPress={onPress} />
      );

      const image = UNSAFE_getByProps({ 
        accessibilityLabel: 'Pikachu sprite image' 
      });
      expect(image).toBeTruthy();
      expect(image.props.accessible).toBe(true);
      expect(image.props.accessibilityIgnoresInvertColors).toBe(true);
    });

    it('should handle multi-type Pokemon in accessibility label', () => {
      const multiTypePokemon: Pokemon = {
        ...mockPokemon,
        types: [
          { slot: 1, type: { name: 'grass', url: '' } },
          { slot: 2, type: { name: 'poison', url: '' } },
        ],
      };

      const onPress = jest.fn();
      const { getByRole } = render(
        <PokemonCard pokemon={multiTypePokemon} onPress={onPress} />
      );

      const card = getByRole('button');
      expect(card.props.accessibilityLabel).toContain('grass and poison');
    });
  });

  describe('Button Accessibility', () => {
    it('should have proper accessibility role and label', () => {
      const onPress = jest.fn();
      const { getByRole } = render(
        <Button title="Test Button" onPress={onPress} />
      );

      const button = getByRole('button');
      expect(button).toBeTruthy();
      expect(button.props.accessibilityLabel).toBe('Test Button');
    });

    it('should indicate disabled state in accessibility', () => {
      const onPress = jest.fn();
      const { getByRole } = render(
        <Button title="Disabled Button" onPress={onPress} disabled={true} />
      );

      const button = getByRole('button');
      expect(button.props.accessibilityState.disabled).toBe(true);
    });

    it('should indicate loading state in accessibility', () => {
      const onPress = jest.fn();
      const { getByRole } = render(
        <Button title="Loading Button" onPress={onPress} loading={true} />
      );

      const button = getByRole('button');
      expect(button.props.accessibilityState.disabled).toBe(true);
    });
  });

  describe('SearchBar Accessibility', () => {
    it('should have accessible search input with proper labels', () => {
      const onChangeText = jest.fn();
      const onSearch = jest.fn();
      const onClear = jest.fn();

      const { getByA11yLabel } = render(
        <SearchBar
          value=""
          onChangeText={onChangeText}
          onSearch={onSearch}
          onClear={onClear}
        />
      );

      const input = getByA11yLabel('Search for Pokémon by name');
      expect(input).toBeTruthy();
      expect(input.props.accessible).toBe(true);
      expect(input.props.accessibilityHint).toContain('Enter a Pokémon name');
    });

    it('should have accessible clear button when text is entered', () => {
      const onChangeText = jest.fn();
      const onSearch = jest.fn();
      const onClear = jest.fn();

      const { getByA11yLabel } = render(
        <SearchBar
          value="pikachu"
          onChangeText={onChangeText}
          onSearch={onSearch}
          onClear={onClear}
        />
      );

      const clearButton = getByA11yLabel('Clear search');
      expect(clearButton).toBeTruthy();
      expect(clearButton.props.accessibilityRole).toBe('button');
      expect(clearButton.props.accessibilityHint).toContain('clear the search field');
    });

    it('should have accessible search button when text is entered', () => {
      const onChangeText = jest.fn();
      const onSearch = jest.fn();
      const onClear = jest.fn();

      const { getByA11yLabel } = render(
        <SearchBar
          value="pikachu"
          onChangeText={onChangeText}
          onSearch={onSearch}
          onClear={onClear}
        />
      );

      const searchButton = getByA11yLabel('Search');
      expect(searchButton).toBeTruthy();
      expect(searchButton.props.accessibilityRole).toBe('button');
      expect(searchButton.props.accessibilityHint).toContain('search for Pokémon');
    });

    it('should have accessible quick action buttons', () => {
      const onChangeText = jest.fn();
      const onSearch = jest.fn();
      const onClear = jest.fn();

      const { getByA11yLabel } = render(
        <SearchBar
          value=""
          onChangeText={onChangeText}
          onSearch={onSearch}
          onClear={onClear}
        />
      );

      const pikachuButton = getByA11yLabel('Quick search for Pikachu');
      const charizardButton = getByA11yLabel('Quick search for Charizard');
      const blastoiseButton = getByA11yLabel('Quick search for Blastoise');

      expect(pikachuButton).toBeTruthy();
      expect(charizardButton).toBeTruthy();
      expect(blastoiseButton).toBeTruthy();

      expect(pikachuButton.props.accessibilityRole).toBe('button');
      expect(charizardButton.props.accessibilityRole).toBe('button');
      expect(blastoiseButton.props.accessibilityRole).toBe('button');
    });

    it('should indicate loading state in accessibility', () => {
      const onChangeText = jest.fn();
      const onSearch = jest.fn();
      const onClear = jest.fn();

      const { getByA11yLabel } = render(
        <SearchBar
          value="test"
          onChangeText={onChangeText}
          onSearch={onSearch}
          onClear={onClear}
          loading={true}
        />
      );

      const searchButton = getByA11yLabel('Search');
      expect(searchButton.props.accessibilityState.disabled).toBe(true);
    });

    it('should have accessibility value for text input', () => {
      const onChangeText = jest.fn();
      const onSearch = jest.fn();
      const onClear = jest.fn();

      const { getByA11yLabel } = render(
        <SearchBar
          value="pikachu"
          onChangeText={onChangeText}
          onSearch={onSearch}
          onClear={onClear}
        />
      );

      const input = getByA11yLabel('Search for Pokémon by name');
      expect(input.props.accessibilityValue).toEqual({ text: 'pikachu' });
    });
  });

  describe('TypeFilter Accessibility', () => {
    it('should have accessible scroll view with proper label', () => {
      const onTypeSelect = jest.fn();
      const { getByA11yLabel } = render(
        <TypeFilter
          types={mockTypes}
          selectedType={null}
          onTypeSelect={onTypeSelect}
        />
      );

      const scrollView = getByA11yLabel('Pokémon type filter');
      expect(scrollView).toBeTruthy();
      expect(scrollView.props.accessible).toBe(true);
      expect(scrollView.props.accessibilityHint).toContain('Scroll horizontally');
    });

    it('should have accessible "All Types" button', () => {
      const onTypeSelect = jest.fn();
      const { getByA11yLabel } = render(
        <TypeFilter
          types={mockTypes}
          selectedType={null}
          onTypeSelect={onTypeSelect}
        />
      );

      const allTypesButton = getByA11yLabel('All Types filter');
      expect(allTypesButton).toBeTruthy();
      expect(allTypesButton.props.accessibilityRole).toBe('button');
      expect(allTypesButton.props.accessibilityHint).toContain('show all Pokémon types');
    });

    it('should indicate selected state for "All Types"', () => {
      const onTypeSelect = jest.fn();
      const { getByA11yLabel } = render(
        <TypeFilter
          types={mockTypes}
          selectedType={null}
          onTypeSelect={onTypeSelect}
        />
      );

      const allTypesButton = getByA11yLabel('All Types filter');
      expect(allTypesButton.props.accessibilityState.selected).toBe(true);
    });

    it('should have accessible type filter buttons', () => {
      const onTypeSelect = jest.fn();
      const { getByA11yLabel } = render(
        <TypeFilter
          types={mockTypes}
          selectedType={null}
          onTypeSelect={onTypeSelect}
        />
      );

      const grassButton = getByA11yLabel('Grass type filter');
      const fireButton = getByA11yLabel('Fire type filter');
      const waterButton = getByA11yLabel('Water type filter');

      expect(grassButton).toBeTruthy();
      expect(fireButton).toBeTruthy();
      expect(waterButton).toBeTruthy();

      expect(grassButton.props.accessibilityRole).toBe('button');
      expect(fireButton.props.accessibilityRole).toBe('button');
      expect(waterButton.props.accessibilityRole).toBe('button');
    });

    it('should indicate selected state for specific type', () => {
      const onTypeSelect = jest.fn();
      const { getByA11yLabel } = render(
        <TypeFilter
          types={mockTypes}
          selectedType="fire"
          onTypeSelect={onTypeSelect}
        />
      );

      const fireButton = getByA11yLabel('Fire type filter');
      const grassButton = getByA11yLabel('Grass type filter');

      expect(fireButton.props.accessibilityState.selected).toBe(true);
      expect(grassButton.props.accessibilityState.selected).toBe(false);
    });

    it('should have descriptive accessibility hints for type filters', () => {
      const onTypeSelect = jest.fn();
      const { getByA11yLabel } = render(
        <TypeFilter
          types={mockTypes}
          selectedType={null}
          onTypeSelect={onTypeSelect}
        />
      );

      const grassButton = getByA11yLabel('Grass type filter');
      expect(grassButton.props.accessibilityHint).toContain('show only grass type Pokémon');
    });
  });

  describe('Cross-Component Accessibility', () => {
    it('should maintain accessibility tree structure', () => {
      const onPress = jest.fn();
      const { UNSAFE_root } = render(
        <PokemonCard pokemon={mockPokemon} onPress={onPress} />
      );

      expect(UNSAFE_root).toBeTruthy();
    });

    it('should have unique accessibility labels within a list', () => {
      const mockPokemon2: Pokemon = {
        ...mockPokemon,
        id: 6,
        name: 'charizard',
      };

      const onPress = jest.fn();
      const { getAllByRole } = render(
        <>
          <PokemonCard pokemon={mockPokemon} onPress={onPress} />
          <PokemonCard pokemon={mockPokemon2} onPress={onPress} />
        </>
      );

      const cards = getAllByRole('button');
      expect(cards).toHaveLength(2);
      expect(cards[0].props.accessibilityLabel).not.toBe(cards[1].props.accessibilityLabel);
      expect(cards[0].props.accessibilityLabel).toContain('Pikachu');
      expect(cards[1].props.accessibilityLabel).toContain('Charizard');
    });
  });

  describe('Accessibility Best Practices', () => {
    it('should use semantic roles for all interactive elements', () => {
      const onPress = jest.fn();
      const onChangeText = jest.fn();
      const onSearch = jest.fn();
      const onClear = jest.fn();
      const onTypeSelect = jest.fn();

      const { getAllByRole } = render(
        <>
          <Button title="Test" onPress={onPress} />
          <PokemonCard pokemon={mockPokemon} onPress={onPress} />
          <SearchBar
            value="test"
            onChangeText={onChangeText}
            onSearch={onSearch}
            onClear={onClear}
          />
          <TypeFilter
            types={mockTypes}
            selectedType={null}
            onTypeSelect={onTypeSelect}
          />
        </>
      );

      const buttons = getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should provide hints for complex interactions', () => {
      const onPress = jest.fn();
      const { getByRole } = render(
        <PokemonCard pokemon={mockPokemon} onPress={onPress} />
      );

      const card = getByRole('button');
      expect(card.props.accessibilityHint).toBeTruthy();
      expect(card.props.accessibilityHint.length).toBeGreaterThan(0);
    });

    it('should have proper touch target sizes (implicit through hitSlop)', () => {
      const onChangeText = jest.fn();
      const onSearch = jest.fn();
      const onClear = jest.fn();

      const { getByA11yLabel } = render(
        <SearchBar
          value="test"
          onChangeText={onChangeText}
          onSearch={onSearch}
          onClear={onClear}
        />
      );

      const clearButton = getByA11yLabel('Clear search');
      expect(clearButton.props.hitSlop).toBeTruthy();
      expect(clearButton.props.hitSlop.top).toBe(10);
    });
  });
});
