import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  useColorScheme,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  PokemonCard,
  SearchBar,
  TypeFilter,
  SearchSuggestions,
} from '../components';
import { usePokemonStore } from '../store/pokemonStore';
import { Pokemon } from '../types';
import { useNavigation } from '@react-navigation/native';
import { useDebounce } from '../hooks';

const PokemonListScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const isDarkMode = useColorScheme() === 'dark';
  const navigation = useNavigation();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const {
    pokemonList,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    searchResults,
    isSearching,
    searchError,
    searchSuggestions,
    selectedType,
    availableTypes,
    loadPokemonList,
    loadMore,
    searchPokemon,
    setSelectedType,
    loadTypes,
    getSuggestions,
    clearSearch,
    clearError,
  } = usePokemonStore();

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
  };

  const textStyle = {
    color: isDarkMode ? '#ffffff' : '#000000',
  };

  // Load initial data
  useEffect(() => {
    if (pokemonList.length === 0) {
      loadPokemonList(true);
    }
    if (availableTypes.length === 0) {
      loadTypes();
    }
  }, [pokemonList.length, availableTypes.length, loadPokemonList, loadTypes]);

  // Handle search
  useEffect(() => {
    if (debouncedSearchQuery.trim()) {
      searchPokemon(debouncedSearchQuery);
      setShowSuggestions(false);
    } else {
      clearSearch();
    }
  }, [debouncedSearchQuery, searchPokemon, clearSearch]);

  // Handle suggestions
  useEffect(() => {
    if (searchQuery.trim() && searchQuery !== debouncedSearchQuery) {
      getSuggestions(searchQuery);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [searchQuery, debouncedSearchQuery, getSuggestions]);

  const handlePokemonPress = (pokemon: Pokemon) => {
    // TypeScript casting needed for navigation - this is safe with proper route types
    (navigation as any).navigate('PokemonDetail', { pokemon });
  };

  const handleRefresh = () => {
    clearError();
    if (searchQuery.trim()) {
      searchPokemon(searchQuery);
    } else {
      loadPokemonList(true);
    }
  };

  const handleLoadMore = () => {
    if (hasMore && !isLoadingMore && !searchQuery.trim()) {
      loadMore();
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      searchPokemon(searchQuery);
      setShowSuggestions(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    clearSearch();
    setShowSuggestions(false);
  };

  const handleSuggestionSelect = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
  };

  const displayData = searchQuery.trim() ? searchResults : pokemonList;
  const currentError = searchQuery.trim() ? searchError : error;
  const currentLoading = searchQuery.trim() ? isSearching : isLoading;

  const renderPokemonCard = ({ item }: { item: Pokemon }) => (
    <PokemonCard pokemon={item} onPress={handlePokemonPress} />
  );

  const renderEmpty = () => {
    if (currentLoading) return null;

    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, textStyle]}>
          {searchQuery.trim()
            ? `No Pokémon found for "${searchQuery}"`
            : 'No Pokémon available'}
        </Text>
        <Text style={[styles.emptySubtext, textStyle]}>
          {searchQuery.trim()
            ? 'Try a different search term'
            : 'Pull to refresh'}
        </Text>
      </View>
    );
  };

  const renderFooter = () => {
    if (!isLoadingMore || searchQuery.trim()) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#007AFF" />
        <Text style={[styles.footerText, textStyle]}>
          Loading more Pokémon...
        </Text>
      </View>
    );
  };

  const renderError = () => {
    if (!currentError) return null;

    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>⚠️ {currentError}</Text>
        <Text
          style={styles.retryText}
          onPress={() => {
            clearError();
            handleRefresh();
          }}
        >
          Tap to retry
        </Text>
      </View>
    );
  };

  return (
    <View
      style={[styles.container, backgroundStyle, { paddingTop: insets.top }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, textStyle]}>PokéDex</Text>
        <Text style={[styles.subtitle, textStyle]}>
          Discover amazing Pokémon
        </Text>
      </View>

      {/* Search Bar */}
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSearch={handleSearch}
        onClear={handleClearSearch}
        loading={currentLoading}
        placeholder="Search for Pokémon..."
      />

      {/* Search Suggestions */}
      {showSuggestions && (
        <SearchSuggestions
          suggestions={searchSuggestions}
          onSelectSuggestion={handleSuggestionSelect}
          isDarkMode={isDarkMode}
        />
      )}

      {/* Type Filter - Only show when not searching */}
      {!searchQuery.trim() && availableTypes.length > 0 && (
        <TypeFilter
          types={availableTypes}
          selectedType={selectedType}
          onTypeSelect={setSelectedType}
        />
      )}

      {/* Error Display */}
      {renderError()}

      {/* Pokemon List */}
      <FlatList
        data={displayData}
        renderItem={renderPokemonCard}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={handleRefresh}
            tintColor={isDarkMode ? '#ffffff' : '#000000'}
            colors={['#007AFF']}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
      />

      {/* Initial Loading */}
      {currentLoading && displayData.length === 0 && (
        <View style={styles.initialLoader}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={[styles.loadingText, textStyle]}>
            Loading Pokémon...
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    marginTop: 4,
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
  },
  errorContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: '#ffebee',
    borderRadius: 12,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#c62828',
    textAlign: 'center',
    marginBottom: 8,
  },
  retryText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  footerLoader: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    marginTop: 8,
    fontSize: 14,
    opacity: 0.7,
  },
  initialLoader: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    alignItems: 'center',
    transform: [{ translateY: -50 }],
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    opacity: 0.7,
  },
});

export default PokemonListScreen;
