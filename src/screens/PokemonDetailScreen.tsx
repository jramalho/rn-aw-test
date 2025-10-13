import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  useColorScheme,
  Pressable,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { usePokemonStore } from '../store/pokemonStore';
import { Button } from '../components';
import { RootStackParamList, Pokemon } from '../types';
import { pokemonApi } from '../utils/pokemonApi';

type PokemonDetailRouteProp = RouteProp<RootStackParamList, 'PokemonDetail'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const PokemonDetailScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const isDarkMode = useColorScheme() === 'dark';
  const navigation = useNavigation();
  const route = useRoute<PokemonDetailRouteProp>();
  const { pokemon } = route.params;

  const {
    favorites,
    toggleFavorite,
    loadPokemonDetail,
    currentSpecies,
    isLoadingDetail,
    detailError,
    clearDetailError,
  } = usePokemonStore();

  const [fullPokemon, setFullPokemon] = useState<Pokemon | null>(null);
  const [loadingFullData, setLoadingFullData] = useState(false);

  // Use full Pokemon data if available, otherwise use the passed pokemon
  const displayPokemon = fullPokemon || pokemon;
  const isFavorite = favorites.includes(pokemon.id);

  // Use store data for species and loading states
  const species = currentSpecies;
  const loading = isLoadingDetail || loadingFullData;
  const error = detailError;

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
  };

  const textStyle = {
    color: isDarkMode ? '#ffffff' : '#000000',
  };

  const loadFullPokemonData = useCallback(async () => {
    // Check if we need to load full Pokemon data (abilities, moves, etc.)
    const needsFullData =
      !pokemon.abilities ||
      !pokemon.moves ||
      !pokemon.stats ||
      !Array.isArray(pokemon.abilities) ||
      !Array.isArray(pokemon.moves) ||
      !Array.isArray(pokemon.stats);

    if (needsFullData) {
      setLoadingFullData(true);
      try {
        const fullData = await pokemonApi.getPokemon(pokemon.id);
        setFullPokemon(fullData);
      } catch {
        console.error('Failed to load full Pokemon data:', err);
      } finally {
        setLoadingFullData(false);
      }
    }

    // Load species and evolution data through the store
    await loadPokemonDetail(pokemon);
  }, [pokemon, loadPokemonDetail]);

  // Load additional Pokemon data
  useEffect(() => {
    loadFullPokemonData();
  }, [loadFullPokemonData]);

  const getTypeColor = (type: string): string => {
    const typeColors: { [key: string]: string } = {
      normal: '#A8A878',
      fire: '#F08030',
      water: '#6890F0',
      electric: '#F8D030',
      grass: '#78C850',
      ice: '#98D8D8',
      fighting: '#C03028',
      poison: '#A040A0',
      ground: '#E0C068',
      flying: '#A890F0',
      psychic: '#F85888',
      bug: '#A8B820',
      rock: '#B8A038',
      ghost: '#705898',
      dragon: '#7038F8',
      dark: '#705848',
      steel: '#B8B8D0',
      fairy: '#EE99AC',
    };
    return typeColors[type.toLowerCase()] || '#68A090';
  };

  const formatHeight = (height: number) => {
    const meters = height / 10;
    return `${meters.toFixed(1)}m`;
  };

  const formatWeight = (weight: number) => {
    const kg = weight / 10;
    return `${kg.toFixed(1)}kg`;
  };

  const renderStats = () => {
    // Check if stats exist and is an array
    if (
      !displayPokemon.stats ||
      !Array.isArray(displayPokemon.stats) ||
      displayPokemon.stats.length === 0
    ) {
      return (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, textStyle]}>Base Stats</Text>
          <Text style={[styles.noDataText, textStyle]}>Loading stats...</Text>
        </View>
      );
    }

    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, textStyle]}>Base Stats</Text>
        {displayPokemon.stats.map((stat, index) => {
          const statPercentage = Math.min(stat.base_stat / 2, 100);
          const statColor =
            stat.base_stat > 100
              ? '#4CAF50'
              : stat.base_stat > 70
              ? '#FF9800'
              : '#F44336';

          return (
            <View key={index} style={styles.statRow}>
              <Text style={[styles.statName, textStyle]}>
                {stat.stat.name.replace('-', ' ').toUpperCase()}
              </Text>
              <Text style={[styles.statValue, textStyle]}>
                {stat.base_stat}
              </Text>
              <View style={styles.statBar}>
                <View
                  style={[
                    styles.statFill,
                    {
                      width: `${statPercentage}%`,
                      backgroundColor: statColor,
                    },
                  ]}
                />
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const renderAbilities = () => {
    const abilityChipColor = isDarkMode ? '#333333' : '#f0f0f0';

    // Check if abilities exist and is an array
    if (
      !displayPokemon.abilities ||
      !Array.isArray(displayPokemon.abilities) ||
      displayPokemon.abilities.length === 0
    ) {
      return (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, textStyle]}>Abilities</Text>
          <View style={styles.abilitiesContainer}>
            <Text style={[styles.noDataText, textStyle]}>
              Loading abilities...
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, textStyle]}>Abilities</Text>
        <View style={styles.abilitiesContainer}>
          {displayPokemon.abilities.map((ability, index) => (
            <View
              key={index}
              style={[
                styles.abilityChip,
                { backgroundColor: abilityChipColor },
              ]}
            >
              <Text style={[styles.abilityText, textStyle]}>
                {ability.ability.name.replace('-', ' ')}
              </Text>
              {ability.is_hidden && (
                <Text style={styles.hiddenBadge}>Hidden</Text>
              )}
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderMoves = () => {
    // Check if moves exist and is an array
    if (
      !displayPokemon.moves ||
      !Array.isArray(displayPokemon.moves) ||
      displayPokemon.moves.length === 0
    ) {
      return (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, textStyle]}>Moves</Text>
          <Text style={[styles.noDataText, textStyle]}>Loading moves...</Text>
        </View>
      );
    }

    const firstMoves = displayPokemon.moves.slice(0, 8);
    const moveChipColor = isDarkMode ? '#2a2a2a' : '#f8f9fa';
    const moreMovesChipColor = isDarkMode ? '#333333' : '#e0e0e0';

    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, textStyle]}>
          Moves ({displayPokemon.moves.length} total)
        </Text>
        <View style={styles.movesGrid}>
          {firstMoves.map((move, index) => (
            <View
              key={index}
              style={[styles.moveChip, { backgroundColor: moveChipColor }]}
            >
              <Text style={[styles.moveText, textStyle]}>
                {move.move.name.replace('-', ' ')}
              </Text>
            </View>
          ))}
          {displayPokemon.moves.length > 8 && (
            <View
              style={[
                styles.moveChip,
                styles.moreMovesChip,
                { backgroundColor: moreMovesChipColor },
              ]}
            >
              <Text style={[styles.moveText, textStyle]}>
                +{displayPokemon.moves.length - 8} more
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderDescription = () => {
    if (!species) return null;

    const englishEntry = species.flavor_text_entries.find(
      entry => entry.language.name === 'en',
    );

    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, textStyle]}>Description</Text>
        <Text style={[styles.descriptionText, textStyle]}>
          {englishEntry?.flavor_text.replace(/\f/g, ' ') ||
            'No description available.'}
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, backgroundStyle]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </Pressable>

        <Pressable
          style={styles.favoriteButton}
          onPress={() => toggleFavorite(displayPokemon.id)}
        >
          <Text style={styles.favoriteIcon}>{isFavorite ? '❤️' : '🤍'}</Text>
        </Pressable>
      </View>

      <ScrollView
        style={backgroundStyle}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Pokemon Image and Basic Info */}
        <View style={styles.pokemonHeader}>
          <View style={styles.imageContainer}>
            <Image
              source={{
                uri:
                  displayPokemon.sprites.other?.['official-artwork']
                    ?.front_default ||
                  displayPokemon.sprites.front_default ||
                  'https://via.placeholder.com/200x200?text=No+Image',
              }}
              style={styles.pokemonImage}
              resizeMode="contain"
            />
          </View>

          <Text style={[styles.pokemonName, textStyle]}>
            {displayPokemon.name.charAt(0).toUpperCase() +
              displayPokemon.name.slice(1)}
          </Text>

          <Text style={[styles.pokemonId, textStyle]}>
            #{displayPokemon.id.toString().padStart(3, '0')}
          </Text>

          {/* Types */}
          <View style={styles.typesContainer}>
            {displayPokemon.types &&
              Array.isArray(displayPokemon.types) &&
              displayPokemon.types.map((type, index) => (
                <View
                  key={index}
                  style={[
                    styles.typeChip,
                    { backgroundColor: getTypeColor(type.type.name) },
                  ]}
                >
                  <Text style={styles.typeText}>
                    {type.type.name.toUpperCase()}
                  </Text>
                </View>
              ))}
          </View>

          {/* Physical Stats */}
          <View style={styles.physicalStats}>
            <View style={styles.physicalStatItem}>
              <Text style={[styles.physicalStatValue, textStyle]}>
                {formatHeight(displayPokemon.height)}
              </Text>
              <Text style={[styles.physicalStatLabel, textStyle]}>Height</Text>
            </View>

            <View style={styles.physicalStatDivider} />

            <View style={styles.physicalStatItem}>
              <Text style={[styles.physicalStatValue, textStyle]}>
                {formatWeight(displayPokemon.weight)}
              </Text>
              <Text style={[styles.physicalStatLabel, textStyle]}>Weight</Text>
            </View>

            <View style={styles.physicalStatDivider} />

            <View style={styles.physicalStatItem}>
              <Text style={[styles.physicalStatValue, textStyle]}>
                {displayPokemon.base_experience || 'N/A'}
              </Text>
              <Text style={[styles.physicalStatLabel, textStyle]}>
                Base Exp
              </Text>
            </View>
          </View>
        </View>

        {/* Loading State */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#007AFF" />
            <Text style={[styles.loadingText, textStyle]}>
              Loading details...
            </Text>
          </View>
        )}

        {/* Error State */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
            <Button
              title="Retry"
              onPress={() => {
                clearDetailError();
                loadFullPokemonData();
              }}
              size="small"
              variant="outline"
            />
          </View>
        )}

        {/* Description */}
        {renderDescription()}

        {/* Stats */}
        {renderStats()}

        {/* Abilities */}
        {renderAbilities()}

        {/* Moves */}
        {renderMoves()}

        {/* Spacer for bottom */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#007AFF',
  },
  favoriteButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteIcon: {
    fontSize: 24,
  },
  scrollContent: {
    padding: 16,
  },
  pokemonHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  imageContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  pokemonImage: {
    width: '100%',
    height: '100%',
  },
  pokemonName: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  pokemonId: {
    fontSize: 18,
    fontWeight: '600',
    opacity: 0.7,
    marginBottom: 12,
  },
  typesContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  typeChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  typeText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 12,
  },
  physicalStats: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  physicalStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  physicalStatValue: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  physicalStatLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  physicalStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    opacity: 0.7,
  },
  errorContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffebee',
    borderRadius: 12,
    margin: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#c62828',
    marginBottom: 12,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statName: {
    width: 80,
    fontSize: 12,
    fontWeight: '600',
  },
  statValue: {
    width: 40,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'right',
    marginRight: 12,
  },
  statBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  statFill: {
    height: '100%',
    borderRadius: 4,
  },
  abilitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  abilityChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  abilityText: {
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  hiddenBadge: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FF9800',
    textTransform: 'uppercase',
  },
  movesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  moveChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    minWidth: (SCREEN_WIDTH - 48) / 3 - 8,
  },
  moreMovesChip: {
    alignItems: 'center',
  },
  moveText: {
    fontSize: 12,
    textTransform: 'capitalize',
    textAlign: 'center',
  },
  bottomSpacer: {
    height: 20,
  },
  noDataText: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default PokemonDetailScreen;
