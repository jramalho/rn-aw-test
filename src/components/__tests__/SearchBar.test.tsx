import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SearchBar from '../SearchBar';

// Mock useColorScheme
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    useColorScheme: jest.fn(() => 'light'),
  };
});

describe('SearchBar Component', () => {
  const mockProps = {
    value: '',
    onChangeText: jest.fn(),
    onSearch: jest.fn(),
    onClear: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders correctly with default props', () => {
      const { getByPlaceholderText } = render(<SearchBar {...mockProps} />);
      
      expect(getByPlaceholderText('Search Pokémon...')).toBeTruthy();
    });

    it('renders with custom placeholder', () => {
      const { getByPlaceholderText } = render(
        <SearchBar {...mockProps} placeholder="Find Pokemon" />
      );
      
      expect(getByPlaceholderText('Find Pokemon')).toBeTruthy();
    });

    it('displays search icon', () => {
      const { getByText } = render(<SearchBar {...mockProps} />);
      
      expect(getByText('🔍')).toBeTruthy();
    });

    it('displays quick action buttons', () => {
      const { getByText } = render(<SearchBar {...mockProps} />);
      
      expect(getByText('⚡ Pikachu')).toBeTruthy();
      expect(getByText('🔥 Charizard')).toBeTruthy();
      expect(getByText('💧 Blastoise')).toBeTruthy();
    });

    it('shows loading indicator when loading is true', () => {
      const { UNSAFE_getByType } = render(
        <SearchBar {...mockProps} loading={true} />
      );
      
      const { ActivityIndicator } = require('react-native');
      expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
    });

    it('shows clear button when value is not empty', () => {
      const { getByText } = render(
        <SearchBar {...mockProps} value="pikachu" />
      );
      
      expect(getByText('✕')).toBeTruthy();
    });

    it('shows search button when value is not empty', () => {
      const { getByText } = render(
        <SearchBar {...mockProps} value="pikachu" />
      );
      
      expect(getByText('Search')).toBeTruthy();
    });

    it('does not show clear button when value is empty', () => {
      const { queryByText } = render(<SearchBar {...mockProps} value="" />);
      
      expect(queryByText('✕')).toBeNull();
    });
  });

  describe('Interactions', () => {
    it('calls onChangeText when text is entered', () => {
      const onChangeTextMock = jest.fn();
      const { getByPlaceholderText } = render(
        <SearchBar {...mockProps} onChangeText={onChangeTextMock} />
      );
      
      const input = getByPlaceholderText('Search Pokémon...');
      fireEvent.changeText(input, 'pikachu');
      
      expect(onChangeTextMock).toHaveBeenCalledWith('pikachu');
    });

    it('calls onSearch when search button is pressed', () => {
      const onSearchMock = jest.fn();
      const { getByText } = render(
        <SearchBar {...mockProps} value="pikachu" onSearch={onSearchMock} />
      );
      
      fireEvent.press(getByText('Search'));
      expect(onSearchMock).toHaveBeenCalledTimes(1);
    });

    it('calls onSearch when return key is pressed', () => {
      const onSearchMock = jest.fn();
      const { getByPlaceholderText } = render(
        <SearchBar {...mockProps} onSearch={onSearchMock} />
      );
      
      const input = getByPlaceholderText('Search Pokémon...');
      fireEvent(input, 'submitEditing');
      
      expect(onSearchMock).toHaveBeenCalledTimes(1);
    });

    it('calls onClear when clear button is pressed', () => {
      const onClearMock = jest.fn();
      const { getByText } = render(
        <SearchBar {...mockProps} value="pikachu" onClear={onClearMock} />
      );
      
      fireEvent.press(getByText('✕'));
      expect(onClearMock).toHaveBeenCalledTimes(1);
    });

    it('calls onChangeText when quick action button is pressed', () => {
      const onChangeTextMock = jest.fn();
      const { getByText } = render(
        <SearchBar {...mockProps} onChangeText={onChangeTextMock} />
      );
      
      fireEvent.press(getByText('⚡ Pikachu'));
      expect(onChangeTextMock).toHaveBeenCalledWith('pikachu');
      
      fireEvent.press(getByText('🔥 Charizard'));
      expect(onChangeTextMock).toHaveBeenCalledWith('charizard');
      
      fireEvent.press(getByText('💧 Blastoise'));
      expect(onChangeTextMock).toHaveBeenCalledWith('blastoise');
    });

    it('does not call onSearch when loading', () => {
      const onSearchMock = jest.fn();
      const { getByText } = render(
        <SearchBar {...mockProps} value="pikachu" loading={true} onSearch={onSearchMock} />
      );
      
      fireEvent.press(getByText('Search'));
      expect(onSearchMock).not.toHaveBeenCalled();
    });
  });

  describe('Theme Support', () => {
    it('renders correctly in light mode', () => {
      const useColorScheme = require('react-native').useColorScheme;
      useColorScheme.mockReturnValue('light');
      
      const { getByPlaceholderText } = render(<SearchBar {...mockProps} />);
      
      expect(getByPlaceholderText('Search Pokémon...')).toBeTruthy();
    });

    it('renders correctly in dark mode', () => {
      const useColorScheme = require('react-native').useColorScheme;
      useColorScheme.mockReturnValue('dark');
      
      const { getByPlaceholderText } = render(<SearchBar {...mockProps} />);
      
      expect(getByPlaceholderText('Search Pokémon...')).toBeTruthy();
    });
  });

  describe('Focus States', () => {
    it('updates focus state when input is focused', () => {
      const { getByPlaceholderText } = render(<SearchBar {...mockProps} />);
      
      const input = getByPlaceholderText('Search Pokémon...');
      fireEvent(input, 'focus');
      
      // Component should handle focus without errors
      expect(input).toBeTruthy();
    });

    it('updates focus state when input is blurred', () => {
      const { getByPlaceholderText } = render(<SearchBar {...mockProps} />);
      
      const input = getByPlaceholderText('Search Pokémon...');
      fireEvent(input, 'blur');
      
      // Component should handle blur without errors
      expect(input).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty search value', () => {
      const { getByPlaceholderText } = render(<SearchBar {...mockProps} value="" />);
      
      expect(getByPlaceholderText('Search Pokémon...')).toBeTruthy();
    });

    it('handles long search values', () => {
      const longValue = 'a'.repeat(100);
      const { getByDisplayValue } = render(
        <SearchBar {...mockProps} value={longValue} />
      );
      
      expect(getByDisplayValue(longValue)).toBeTruthy();
    });

    it('handles special characters in search', () => {
      const specialValue = '!@#$%^&*()';
      const { getByDisplayValue } = render(
        <SearchBar {...mockProps} value={specialValue} />
      );
      
      expect(getByDisplayValue(specialValue)).toBeTruthy();
    });
  });

  describe('Input Configuration', () => {
    it('has correct input configuration', () => {
      const { getByPlaceholderText } = render(<SearchBar {...mockProps} />);
      
      const input = getByPlaceholderText('Search Pokémon...');
      expect(input.props.autoCapitalize).toBe('none');
      expect(input.props.autoCorrect).toBe(false);
      expect(input.props.returnKeyType).toBe('search');
    });
  });
});
