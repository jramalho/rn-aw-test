import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Pressable,
  Text,
  FlatList,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import { SearchBarProps } from '../types';

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
  const borderColor = isFocused
    ? '#007AFF'
    : isDarkMode
    ? '#555555'
    : '#e1e5e9';

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
      <View
        style={[styles.searchContainer, inputBackgroundColor, { borderColor }]}
      >
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
            <Text style={[styles.clearIcon, { color: placeholderColor }]}>
              ✕
            </Text>
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

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 25,
    borderWidth: 2,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  iconText: {
    fontSize: 18,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 4,
  },
  loadingContainer: {
    marginLeft: 8,
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  clearIcon: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  searchButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 8,
    backgroundColor: '#007AFF',
  },
  searchButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  quickActionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  suggestionsContainer: {
    marginHorizontal: 16,
    marginTop: -8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  suggestionsList: {
    maxHeight: 200,
  },
  suggestionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  suggestionText: {
    fontSize: 16,
    flex: 1,
  },
  suggestionArrow: {
    fontSize: 16,
    color: '#007AFF',
    marginLeft: 8,
  },
});

export default SearchBar;
