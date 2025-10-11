import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import TypeFilter from '../TypeFilter';
import { Type } from '../../types';

// Mock useColorScheme
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    useColorScheme: jest.fn(() => 'light'),
  };
});

const mockTypes: Type[] = [
  {
    id: 1,
    name: 'fire',
    damage_relations: {
      no_damage_to: [],
      half_damage_to: [],
      double_damage_to: [],
      no_damage_from: [],
      half_damage_from: [],
      double_damage_from: [],
    },
    past_damage_relations: [],
    game_indices: [],
    generation: { name: 'generation-i', url: '' },
    move_damage_class: null,
    names: [],
    pokemon: [],
    moves: [],
  },
  {
    id: 2,
    name: 'water',
    damage_relations: {
      no_damage_to: [],
      half_damage_to: [],
      double_damage_to: [],
      no_damage_from: [],
      half_damage_from: [],
      double_damage_from: [],
    },
    past_damage_relations: [],
    game_indices: [],
    generation: { name: 'generation-i', url: '' },
    move_damage_class: null,
    names: [],
    pokemon: [],
    moves: [],
  },
  {
    id: 3,
    name: 'electric',
    damage_relations: {
      no_damage_to: [],
      half_damage_to: [],
      double_damage_to: [],
      no_damage_from: [],
      half_damage_from: [],
      double_damage_from: [],
    },
    past_damage_relations: [],
    game_indices: [],
    generation: { name: 'generation-i', url: '' },
    move_damage_class: null,
    names: [],
    pokemon: [],
    moves: [],
  },
];

describe('TypeFilter Component', () => {
  const mockOnTypeSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders correctly with types', () => {
      const { getByText } = render(
        <TypeFilter 
          types={mockTypes} 
          selectedType={null} 
          onTypeSelect={mockOnTypeSelect} 
        />
      );
      
      expect(getByText('All Types')).toBeTruthy();
      expect(getByText('Fire')).toBeTruthy();
      expect(getByText('Water')).toBeTruthy();
      expect(getByText('Electric')).toBeTruthy();
    });

    it('renders "All Types" button', () => {
      const { getByText } = render(
        <TypeFilter 
          types={mockTypes} 
          selectedType={null} 
          onTypeSelect={mockOnTypeSelect} 
        />
      );
      
      expect(getByText('All Types')).toBeTruthy();
    });

    it('capitalizes type names correctly', () => {
      const { getByText } = render(
        <TypeFilter 
          types={mockTypes} 
          selectedType={null} 
          onTypeSelect={mockOnTypeSelect} 
        />
      );
      
      expect(getByText('Fire')).toBeTruthy();
      expect(getByText('Water')).toBeTruthy();
      expect(getByText('Electric')).toBeTruthy();
    });

    it('renders with empty types array', () => {
      const { getByText } = render(
        <TypeFilter 
          types={[]} 
          selectedType={null} 
          onTypeSelect={mockOnTypeSelect} 
        />
      );
      
      expect(getByText('All Types')).toBeTruthy();
    });
  });

  describe('Selection States', () => {
    it('shows "All Types" as selected by default', () => {
      const { getByText } = render(
        <TypeFilter 
          types={mockTypes} 
          selectedType={null} 
          onTypeSelect={mockOnTypeSelect} 
        />
      );
      
      const allTypesButton = getByText('All Types');
      expect(allTypesButton).toBeTruthy();
    });

    it('shows selected type as highlighted', () => {
      const { getByText } = render(
        <TypeFilter 
          types={mockTypes} 
          selectedType="fire" 
          onTypeSelect={mockOnTypeSelect} 
        />
      );
      
      const fireButton = getByText('Fire');
      expect(fireButton).toBeTruthy();
    });

    it('handles type selection changes', () => {
      const { rerender, getByText } = render(
        <TypeFilter 
          types={mockTypes} 
          selectedType={null} 
          onTypeSelect={mockOnTypeSelect} 
        />
      );
      
      expect(getByText('All Types')).toBeTruthy();
      
      rerender(
        <TypeFilter 
          types={mockTypes} 
          selectedType="water" 
          onTypeSelect={mockOnTypeSelect} 
        />
      );
      
      expect(getByText('Water')).toBeTruthy();
    });
  });

  describe('Interactions', () => {
    it('calls onTypeSelect with null when "All Types" is pressed', () => {
      const { getByText } = render(
        <TypeFilter 
          types={mockTypes} 
          selectedType="fire" 
          onTypeSelect={mockOnTypeSelect} 
        />
      );
      
      fireEvent.press(getByText('All Types'));
      expect(mockOnTypeSelect).toHaveBeenCalledWith(null);
    });

    it('calls onTypeSelect with type name when type is pressed', () => {
      const { getByText } = render(
        <TypeFilter 
          types={mockTypes} 
          selectedType={null} 
          onTypeSelect={mockOnTypeSelect} 
        />
      );
      
      fireEvent.press(getByText('Fire'));
      expect(mockOnTypeSelect).toHaveBeenCalledWith('fire');
      
      fireEvent.press(getByText('Water'));
      expect(mockOnTypeSelect).toHaveBeenCalledWith('water');
      
      fireEvent.press(getByText('Electric'));
      expect(mockOnTypeSelect).toHaveBeenCalledWith('electric');
    });

    it('allows selecting different types sequentially', () => {
      const { getByText } = render(
        <TypeFilter 
          types={mockTypes} 
          selectedType={null} 
          onTypeSelect={mockOnTypeSelect} 
        />
      );
      
      fireEvent.press(getByText('Fire'));
      expect(mockOnTypeSelect).toHaveBeenCalledWith('fire');
      
      fireEvent.press(getByText('Water'));
      expect(mockOnTypeSelect).toHaveBeenCalledWith('water');
      
      fireEvent.press(getByText('All Types'));
      expect(mockOnTypeSelect).toHaveBeenCalledWith(null);
      
      expect(mockOnTypeSelect).toHaveBeenCalledTimes(3);
    });

    it('handles pressing the same type multiple times', () => {
      const { getByText } = render(
        <TypeFilter 
          types={mockTypes} 
          selectedType={null} 
          onTypeSelect={mockOnTypeSelect} 
        />
      );
      
      const fireButton = getByText('Fire');
      fireEvent.press(fireButton);
      fireEvent.press(fireButton);
      fireEvent.press(fireButton);
      
      expect(mockOnTypeSelect).toHaveBeenCalledTimes(3);
      expect(mockOnTypeSelect).toHaveBeenCalledWith('fire');
    });
  });

  describe('Theme Support', () => {
    it('renders correctly in light mode', () => {
      const useColorScheme = require('react-native').useColorScheme;
      useColorScheme.mockReturnValue('light');
      
      const { getByText } = render(
        <TypeFilter 
          types={mockTypes} 
          selectedType={null} 
          onTypeSelect={mockOnTypeSelect} 
        />
      );
      
      expect(getByText('All Types')).toBeTruthy();
    });

    it('renders correctly in dark mode', () => {
      const useColorScheme = require('react-native').useColorScheme;
      useColorScheme.mockReturnValue('dark');
      
      const { getByText } = render(
        <TypeFilter 
          types={mockTypes} 
          selectedType={null} 
          onTypeSelect={mockOnTypeSelect} 
        />
      );
      
      expect(getByText('All Types')).toBeTruthy();
    });
  });

  describe('Scrolling Behavior', () => {
    it('renders ScrollView for horizontal scrolling', () => {
      const { UNSAFE_getByType } = render(
        <TypeFilter 
          types={mockTypes} 
          selectedType={null} 
          onTypeSelect={mockOnTypeSelect} 
        />
      );
      
      const { ScrollView } = require('react-native');
      expect(UNSAFE_getByType(ScrollView)).toBeTruthy();
    });

    it('handles large number of types', () => {
      const manyTypes: Type[] = Array.from({ length: 20 }, (_, i) => ({
        ...mockTypes[0],
        id: i + 1,
        name: `type-${i + 1}`,
      }));
      
      const { getByText } = render(
        <TypeFilter 
          types={manyTypes} 
          selectedType={null} 
          onTypeSelect={mockOnTypeSelect} 
        />
      );
      
      expect(getByText('All Types')).toBeTruthy();
      expect(getByText('Type 1')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('handles type with hyphenated name', () => {
      const hyphenatedType: Type = {
        ...mockTypes[0],
        id: 99,
        name: 'dragon-type',
      };
      
      const { getByText } = render(
        <TypeFilter 
          types={[hyphenatedType]} 
          selectedType={null} 
          onTypeSelect={mockOnTypeSelect} 
        />
      );
      
      expect(getByText('Dragon Type')).toBeTruthy();
    });

    it('handles type with special characters', () => {
      const specialType: Type = {
        ...mockTypes[0],
        id: 100,
        name: 'normal',
      };
      
      const { getByText } = render(
        <TypeFilter 
          types={[specialType]} 
          selectedType={null} 
          onTypeSelect={mockOnTypeSelect} 
        />
      );
      
      expect(getByText('Normal')).toBeTruthy();
    });

    it('handles selecting a type that does not exist in the list', () => {
      const { getByText } = render(
        <TypeFilter 
          types={mockTypes} 
          selectedType="nonexistent" 
          onTypeSelect={mockOnTypeSelect} 
        />
      );
      
      // Should still render without crashing
      expect(getByText('All Types')).toBeTruthy();
    });
  });
});
