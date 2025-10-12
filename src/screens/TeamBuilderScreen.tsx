import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Alert,
  Platform,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePokemonStore } from '../store/pokemonStore';
import { Pokemon } from '../types';
import { useNavigation } from '@react-navigation/native';

const TeamBuilderScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const isDarkMode = useColorScheme() === 'dark';
  const navigation = useNavigation();
  
  const { team, removeFromTeam, clearTeam } = usePokemonStore();

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5',
  };

  const textStyle = {
    color: isDarkMode ? '#ffffff' : '#000000',
  };

  const handleRemovePokemon = (pokemonId: number) => {
    Alert.alert(
      'Remove Pokemon',
      'Are you sure you want to remove this Pokemon from your team?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => removeFromTeam(pokemonId)
        },
      ]
    );
  };

  const handleClearTeam = () => {
    if (team.length === 0) return;
    
    Alert.alert(
      'Clear Team',
      'Are you sure you want to remove all Pokemon from your team?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: () => clearTeam()
        },
      ]
    );
  };

  const handlePokemonPress = (pokemon: Pokemon) => {
    (navigation as any).navigate('PokemonDetail', { pokemon });
  };

  const handleAddPokemon = () => {
    (navigation as any).navigate('PokemonList');
  };

  const getTypeColor = (typeName: string): string => {
    const typeColors: Record<string, string> = {
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
    return typeColors[typeName.toLowerCase()] || '#68A090';
  };

  const TeamSlot = ({ pokemon, position }: { pokemon?: Pokemon; position: number }) => {
    if (!pokemon) {
      return (
        <TouchableOpacity
          style={[styles.emptySlot, { backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff' }]}
          onPress={handleAddPokemon}
          accessibilityLabel={`Empty team slot ${position}`}
          accessibilityHint="Tap to add a Pokemon to your team"
          accessibilityRole="button"
        >
          <Text style={[styles.emptySlotText, { color: isDarkMode ? '#6b7280' : '#9ca3af' }]}>
            +
          </Text>
          <Text style={[styles.emptySlotLabel, { color: isDarkMode ? '#6b7280' : '#9ca3af' }]}>
            Add Pokemon
          </Text>
        </TouchableOpacity>
      );
    }

    const primaryType = pokemon.types[0]?.type.name || 'normal';
    const typeColor = getTypeColor(primaryType);

    return (
      <TouchableOpacity
        style={[styles.filledSlot, { backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff' }]}
        onPress={() => handlePokemonPress(pokemon)}
        onLongPress={() => handleRemovePokemon(pokemon.id)}
        accessibilityLabel={`${pokemon.name}, position ${position}`}
        accessibilityHint="Tap to view details, long press to remove"
        accessibilityRole="button"
      >
        <View style={styles.pokemonHeader}>
          <View style={styles.pokemonInfo}>
            <Text style={[styles.pokemonName, textStyle]}>
              {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
            </Text>
            <Text style={[styles.pokemonNumber, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]}>
              #{pokemon.id.toString().padStart(3, '0')}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemovePokemon(pokemon.id)}
            accessibilityLabel="Remove from team"
            accessibilityRole="button"
          >
            <Text style={styles.removeButtonText}>×</Text>
          </TouchableOpacity>
        </View>

        {pokemon.sprites.other?.['official-artwork']?.front_default && (
          <View style={styles.spriteContainer}>
            <Text style={styles.spriteEmoji}>🎮</Text>
          </View>
        )}

        <View style={styles.typesContainer}>
          {pokemon.types.map((typeInfo, index) => (
            <View
              key={index}
              style={[styles.typeTag, { backgroundColor: getTypeColor(typeInfo.type.name) }]}
            >
              <Text style={styles.typeText}>
                {typeInfo.type.name.toUpperCase()}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.statsContainer}>
          {pokemon.stats.slice(0, 3).map((stat, index) => (
            <View key={index} style={styles.statItem}>
              <Text style={[styles.statLabel, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]}>
                {stat.stat.name.substring(0, 3).toUpperCase()}
              </Text>
              <Text style={[styles.statValue, textStyle]}>
                {stat.base_stat}
              </Text>
            </View>
          ))}
        </View>
      </TouchableOpacity>
    );
  };

  const calculateTeamStats = () => {
    if (team.length === 0) return null;

    const totalStats = team.reduce((acc, pokemon) => {
      pokemon.stats.forEach(stat => {
        const statName = stat.stat.name;
        acc[statName] = (acc[statName] || 0) + stat.base_stat;
      });
      return acc;
    }, {} as Record<string, number>);

    const avgStats = Object.entries(totalStats).reduce((acc, [name, value]) => {
      acc[name] = Math.round(value / team.length);
      return acc;
    }, {} as Record<string, number>);

    return avgStats;
  };

  const getTeamTypes = () => {
    const typeCount: Record<string, number> = {};
    team.forEach(pokemon => {
      pokemon.types.forEach(typeInfo => {
        const typeName = typeInfo.type.name;
        typeCount[typeName] = (typeCount[typeName] || 0) + 1;
      });
    });
    return typeCount;
  };

  const teamStats = calculateTeamStats();
  const teamTypes = getTeamTypes();

  return (
    <View style={[styles.container, backgroundStyle]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? 50 : 20 }]}>
        <Text style={styles.headerTitle}>Team Builder</Text>
        <Text style={styles.headerSubtitle}>
          {team.length}/6 Pokemon
        </Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        {/* Team Grid */}
        <View style={styles.teamGrid}>
          {[0, 1, 2, 3, 4, 5].map(index => (
            <TeamSlot
              key={index}
              pokemon={team[index]}
              position={index + 1}
            />
          ))}
        </View>

        {/* Team Statistics */}
        {team.length > 0 && (
          <>
            <View style={[styles.statsSection, { backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff' }]}>
              <Text style={[styles.sectionTitle, textStyle]}>Team Statistics</Text>
              
              {teamStats && (
                <View style={styles.statsGrid}>
                  {Object.entries(teamStats).map(([statName, value]) => (
                    <View key={statName} style={styles.avgStatItem}>
                      <Text style={[styles.avgStatLabel, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]}>
                        {statName.replace('-', ' ').toUpperCase()}
                      </Text>
                      <Text style={[styles.avgStatValue, textStyle]}>
                        {value}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Type Coverage */}
            <View style={[styles.statsSection, { backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff' }]}>
              <Text style={[styles.sectionTitle, textStyle]}>Type Coverage</Text>
              
              <View style={styles.typeCoverage}>
                {Object.entries(teamTypes).map(([typeName, count]) => (
                  <View key={typeName} style={styles.typeCoverageItem}>
                    <View
                      style={[
                        styles.typeCoverageTag,
                        { backgroundColor: getTypeColor(typeName) }
                      ]}
                    >
                      <Text style={styles.typeCoverageText}>
                        {typeName.toUpperCase()}
                      </Text>
                    </View>
                    <Text style={[styles.typeCoverageCount, textStyle]}>
                      ×{count}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Clear Team Button */}
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClearTeam}
              accessibilityLabel="Clear entire team"
              accessibilityHint="Removes all Pokemon from your team"
              accessibilityRole="button"
            >
              <Text style={styles.clearButtonText}>Clear Team</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Empty State */}
        {team.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateEmoji}>🎮</Text>
            <Text style={[styles.emptyStateTitle, textStyle]}>
              Build Your Dream Team
            </Text>
            <Text style={[styles.emptyStateText, { color: isDarkMode ? '#9ca3af' : '#6b7280' }]}>
              Add up to 6 Pokemon to create the ultimate team!
            </Text>
            <TouchableOpacity
              style={styles.emptyStateButton}
              onPress={handleAddPokemon}
              accessibilityLabel="Go to Pokédex"
              accessibilityRole="button"
            >
              <Text style={styles.emptyStateButtonText}>
                Browse Pokédex
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: '#007AFF',
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#e0e7ff',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  teamGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  emptySlot: {
    width: '48%',
    aspectRatio: 0.75,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#cbd5e1',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  emptySlotText: {
    fontSize: 48,
    fontWeight: '300',
  },
  emptySlotLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  filledSlot: {
    width: '48%',
    aspectRatio: 0.75,
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pokemonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  pokemonInfo: {
    flex: 1,
  },
  pokemonName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  pokemonNumber: {
    fontSize: 12,
  },
  removeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 22,
  },
  spriteContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  spriteEmoji: {
    fontSize: 48,
  },
  typesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 8,
  },
  typeTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsSection: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  avgStatItem: {
    width: '30%',
    alignItems: 'center',
  },
  avgStatLabel: {
    fontSize: 10,
    marginBottom: 4,
  },
  avgStatValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  typeCoverage: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeCoverageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  typeCoverageTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  typeCoverageText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  typeCoverageCount: {
    fontSize: 14,
    fontWeight: '500',
  },
  clearButton: {
    backgroundColor: '#ef4444',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  clearButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyStateEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  emptyStateButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TeamBuilderScreen;
