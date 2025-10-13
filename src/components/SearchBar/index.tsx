import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  Pressable,
  Text,
  FlatList,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import { SearchBarProps } from '../../types';
import { styles } from './styles';

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  onSearch,
  onClear,
  placeholder = 'Search Pokémon...',
  loading = false,
}) => {
  const isDarkMode = useColorScheme() === 'dark';
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const backgroundColor = {
    backgroundColor: isDarkMode ? '#2a2a2a' : '#f8f9fa',
  };

  const inputBackgroundColor = {
    backgroundColor: isDarkMode ? '#404040' : '#ffffff',
  };

  const textColor = {
    color: isDarkMode ? '#ffffff' : '#000000',
  };

  const placeholderColor = isDarkMode ? '#888888' : '#666666';
  const borderColor = isFocused ? '#007AFF' : (isDarkMode ? '#555555' : '#e1e5e9');

  const handleClear = () => {
    onClear();
    inputRef.current?.blur();
  };

  const handleSearch = () => {
    onSearch();
    inputRef.current?.blur();
  };

  return (
    <View style={[styles.container, backgroundColor]}>
      <View style={[styles.searchContainer, inputBackgroundColor, { borderColor }]}>
        {/* Search Icon */}
        <View style={styles.searchIcon}>
          <Text style={[styles.iconText, { color: placeholderColor }]}>🔍</Text>
        </View>

        {/* Text Input */}
        <TextInput
          ref={inputRef}
          style={[styles.input, textColor]}
          placeholder={placeholder}
          placeholderTextColor={placeholderColor}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="never"
          accessible={true}
          accessibilityLabel="Search for Pokémon by name"
          accessibilityHint="Enter a Pokémon name and press search"
          accessibilityValue={{ text: value }}
        />

        {/* Loading Indicator */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#007AFF" />
          </View>
        )}

        {/* Clear Button */}
        {value.length > 0 && !loading && (
          <Pressable
            style={styles.clearButton}
            onPress={handleClear}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            accessibilityHint="Double tap to clear the search field"
          >
            <Text style={[styles.clearIcon, { color: placeholderColor }]}>✕</Text>
          </Pressable>
        )}

        {/* Search Button */}
        {value.length > 0 && (
          <Pressable
            style={styles.searchButton}
            onPress={handleSearch}
            disabled={loading}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Search"
            accessibilityHint="Double tap to search for Pokémon"
            accessibilityState={{ disabled: loading }}
          >
            <Text style={styles.searchButtonText}>Search</Text>
          </Pressable>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Pressable
          style={[styles.quickActionButton, inputBackgroundColor]}
          onPress={() => onChangeText('pikachu')}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Quick search for Pikachu"
          accessibilityHint="Double tap to search for Pikachu"
        >
          <Text style={[styles.quickActionText, textColor]}>⚡ Pikachu</Text>
        </Pressable>
        
        <Pressable
          style={[styles.quickActionButton, inputBackgroundColor]}
          onPress={() => onChangeText('charizard')}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Quick search for Charizard"
          accessibilityHint="Double tap to search for Charizard"
        >
          <Text style={[styles.quickActionText, textColor]}>🔥 Charizard</Text>
        </Pressable>
        
        <Pressable
          style={[styles.quickActionButton, inputBackgroundColor]}
          onPress={() => onChangeText('blastoise')}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Quick search for Blastoise"
          accessibilityHint="Double tap to search for Blastoise"
        >
          <Text style={[styles.quickActionText, textColor]}>💧 Blastoise</Text>
        </Pressable>
      </View>
    </View>
  );
};

interface SearchSuggestionsProps {
  suggestions: string[];
  onSelectSuggestion: (suggestion: string) => void;
  isDarkMode: boolean;
}

export const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
  suggestions,
  onSelectSuggestion,
  isDarkMode,
}) => {
  if (suggestions.length === 0) return null;

  const backgroundColor = {
    backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff',
  };

  const textColor = {
    color: isDarkMode ? '#ffffff' : '#000000',
  };

  return (
    <View style={[styles.suggestionsContainer, backgroundColor]}>
      <FlatList
        data={suggestions}
        keyExtractor={(item, index) => `${item}-${index}`}
        renderItem={({ item }) => {
          const borderBottomColor = isDarkMode ? '#404040' : '#f0f0f0';
          return (
            <Pressable
              style={[styles.suggestionItem, { borderBottomColor }]}
              onPress={() => onSelectSuggestion(item)}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`Suggestion: ${item}`}
              accessibilityHint="Double tap to search for this Pokémon"
            >
              <Text style={[styles.suggestionText, textColor]}>{item}</Text>
              <Text style={styles.suggestionArrow}>→</Text>
            </Pressable>
          );
        }}
        style={styles.suggestionsList}
        scrollEnabled={false}
        accessible={true}
        accessibilityLabel="Search suggestions"
      />
    </View>
  );
};

export default SearchBar;
