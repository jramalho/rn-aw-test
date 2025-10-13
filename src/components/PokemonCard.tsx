import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  useColorScheme,
  Alert,
} from 'react-native';
import { Pokemon } from '../types';
import {
  getPokemonTypeColor,
  formatPokemonName,
  formatPokemonId,
  getPokemonImageUrl,
} from '../utils';
import { usePokemonStore } from '../store/pokemonStore';

interface PokemonCardProps {
  pokemon: Pokemon;
  onPress: (pokemon: Pokemon) => void;
  showTeamButton?: boolean;
}

const PokemonCard: React.FC<PokemonCardProps> = ({
  pokemon,
  onPress,
  showTeamButton = true,
}) => {
  const isDarkMode = useColorScheme() === 'dark';
  const { addToTeam, isInTeam } = usePokemonStore();

  const backgroundColor = {
    backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff',
  };

  const textColor = {
    color: isDarkMode ? '#ffffff' : '#000000',
  };

  const subtextColor = {
    color: isDarkMode ? '#cccccc' : '#666666',
  };

  const primaryType = pokemon.types[0]?.type.name || 'normal';
  const typeColor = getPokemonTypeColor(primaryType);
  const inTeam = isInTeam(pokemon.id);

  // Build accessibility label with comprehensive information
  const hp = pokemon.stats.find(s => s.stat.name === 'hp')?.base_stat || 0;
  const attack =
    pokemon.stats.find(s => s.stat.name === 'attack')?.base_stat || 0;
  const defense =
    pokemon.stats.find(s => s.stat.name === 'defense')?.base_stat || 0;
  const typesText = pokemon.types.map(t => t.type.name).join(' and ');

  const accessibilityLabel = `${formatPokemonName(
    pokemon.name,
  )}, number ${formatPokemonId(
    pokemon.id,
  )}, ${typesText} type. HP ${hp}, Attack ${attack}, Defense ${defense}`;

  const handleAddToTeam = (e: any) => {
    e.stopPropagation();

    if (inTeam) {
      Alert.alert('Already in Team', 'This Pokemon is already in your team!');
      return;
    }

    const success = addToTeam(pokemon);

    if (!success) {
      Alert.alert(
        'Team Full',
        'Your team can only have up to 6 Pokemon. Remove one to add more.',
      );
    } else {
      Alert.alert(
        'Added to Team',
        `${formatPokemonName(pokemon.name)} has been added to your team!`,
      );
    }
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        backgroundColor,
        { borderLeftColor: typeColor },
        pressed && styles.pressed,
      ]}
      onPress={() => onPress(pokemon)}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint="Double tap to view detailed information about this Pokémon"
    >
      {/* Pokemon Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: getPokemonImageUrl(pokemon.id) }}
          style={styles.pokemonImage}
          resizeMode="contain"
          accessible={true}
          accessibilityLabel={`${formatPokemonName(pokemon.name)} sprite image`}
          accessibilityIgnoresInvertColors={true}
        />
      </View>

      {/* Pokemon Info */}
      <View style={styles.infoContainer}>
        <View style={styles.headerRow}>
          <Text style={[styles.pokemonId, subtextColor]}>
            {formatPokemonId(pokemon.id)}
          </Text>
          <View style={styles.typesContainer}>
            {pokemon.types.slice(0, 2).map((typeSlot, index) => (
              <View
                key={index}
                style={[
                  styles.typeChip,
                  { backgroundColor: getPokemonTypeColor(typeSlot.type.name) },
                ]}
              >
                <Text style={styles.typeText}>
                  {typeSlot.type.name.toUpperCase()}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={[styles.pokemonName, textColor]}>
          {formatPokemonName(pokemon.name)}
        </Text>

        {/* Stats Preview */}
        <View style={styles.statsRow}>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, subtextColor]}>HP</Text>
              <Text style={[styles.statValue, textColor]}>
                {pokemon.stats.find(s => s.stat.name === 'hp')?.base_stat || 0}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, subtextColor]}>ATK</Text>
              <Text style={[styles.statValue, textColor]}>
                {pokemon.stats.find(s => s.stat.name === 'attack')?.base_stat ||
                  0}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, subtextColor]}>DEF</Text>
              <Text style={[styles.statValue, textColor]}>
                {pokemon.stats.find(s => s.stat.name === 'defense')
                  ?.base_stat || 0}
              </Text>
            </View>
          </View>

          {showTeamButton && (
            <TouchableOpacity
              style={[styles.teamButton, inTeam && styles.teamButtonActive]}
              onPress={handleAddToTeam}
              accessibilityLabel={inTeam ? 'In team' : 'Add to team'}
              accessibilityHint={
                inTeam
                  ? 'This Pokemon is already in your team'
                  : 'Add this Pokemon to your team'
              }
              accessibilityRole="button"
            >
              <Text style={styles.teamButtonText}>{inTeam ? '✓' : '+'}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  imageContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  pokemonImage: {
    width: 70,
    height: 70,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  pokemonId: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.7,
  },
  typesContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  typeChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  typeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '700',
  },
  pokemonName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    opacity: 0.7,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  teamButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  teamButtonActive: {
    backgroundColor: '#22c55e',
  },
  teamButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default PokemonCard;
