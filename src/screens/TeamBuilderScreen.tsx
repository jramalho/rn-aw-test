import React, { useState } from 'react';
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
  Modal,
  TextInput,
} from 'react-native';
import { usePokemonStore } from '../store/pokemonStore';
import { Pokemon, SavedTeam } from '../types';
import { useNavigation } from '@react-navigation/native';

const TeamBuilderScreen: React.FC = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const navigation = useNavigation();

  const {
    team,
    savedTeams,
    currentTeamId,
    removeFromTeam,
    clearTeam,
    saveCurrentTeam,
    loadTeam,
    deleteTeam,
    // updateTeam: _updateTeam, // Unused
    getTeamAnalysis: _getTeamAnalysis,
  } = usePokemonStore();

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');
  const [showAnalysis, setShowAnalysis] = useState(false);

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
          onPress: () => removeFromTeam(pokemonId),
        },
      ],
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
          onPress: () => clearTeam(),
        },
      ],
    );
  };

  const handlePokemonPress = (pokemon: Pokemon) => {
    (navigation as any).navigate('PokemonDetail', { pokemon });
  };

  const handleAddPokemon = () => {
    (navigation as any).navigate('PokemonList');
  };

  const handleStartBattle = () => {
    if (team.length === 0) {
      Alert.alert('Empty Team', 'Add at least one Pokemon before battling.');
      return;
    }

    // Must save team before battling
    if (!currentTeamId) {
      Alert.alert(
        'Save Team First',
        'You need to save your team before starting a battle.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Save Team', onPress: () => setShowSaveModal(true) },
        ],
      );
      return;
    }

    // Navigate to opponent selection screen
    (navigation as any).navigate('OpponentSelection', {
      teamId: currentTeamId,
    });
  };

  const handleStartTournament = () => {
    if (team.length === 0) {
      Alert.alert(
        'Empty Team',
        'Add at least one Pokemon before entering a tournament.',
      );
      return;
    }

    // Navigate to tournament lobby
    (navigation as any).navigate('TournamentLobby');
  };

  const handleSaveTeam = () => {
    if (team.length === 0) {
      Alert.alert('Empty Team', 'Add at least one Pokemon before saving.');
      return;
    }

    // Pre-fill name if editing existing team
    const currentTeam = savedTeams.find(t => t.id === currentTeamId);
    if (currentTeam) {
      setTeamName(currentTeam.name);
      setTeamDescription(currentTeam.description || '');
    } else {
      setTeamName('');
      setTeamDescription('');
    }

    setShowSaveModal(true);
  };

  const handleSaveConfirm = () => {
    if (!teamName.trim()) {
      Alert.alert('Invalid Name', 'Please enter a team name.');
      return;
    }

    try {
      saveCurrentTeam(teamName.trim(), teamDescription.trim() || undefined);
      setShowSaveModal(false);
      setTeamName('');
      setTeamDescription('');
      Alert.alert('Success', 'Team saved successfully!');
    } catch (saveError) {
      Alert.alert(
        'Error',
        saveError instanceof Error ? saveError.message : 'Failed to save team',
      );
    }
  };

  const handleLoadTeam = (teamId: string) => {
    try {
      loadTeam(teamId);
      setShowLoadModal(false);
      Alert.alert('Success', 'Team loaded successfully!');
    } catch (loadError) {
      Alert.alert(
        'Error',
        loadError instanceof Error ? loadError.message : 'Failed to load team',
      );
    }
  };

  const handleDeleteTeam = (teamToDelete: SavedTeam) => {
    Alert.alert(
      'Delete Team',
      `Are you sure you want to delete "${teamToDelete.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteTeam(teamToDelete.id);
            Alert.alert('Success', 'Team deleted successfully!');
          },
        },
      ],
    );
  };

  // Unused function - kept for future use
  // const handleNewTeam = () => {
  //   if (team.length > 0) {
  //     Alert.alert(
  //       'New Team',
  //       'Creating a new team will clear the current team. Do you want to save it first?',
  //       [
  //         { text: 'Cancel', style: 'cancel' },
  //         { text: 'Discard', style: 'destructive', onPress: () => clearTeam() },
  //         { text: 'Save First', onPress: handleSaveTeam },
  //       ]
  //     );
  //   }
  // };

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

  const TeamSlot = ({
    pokemon,
    position,
  }: {
    pokemon?: Pokemon;
    position: number;
  }) => {
    if (!pokemon) {
      return (
        <TouchableOpacity
          style={[
            styles.emptySlot,
            { backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff' },
          ]}
          onPress={handleAddPokemon}
          accessibilityLabel={`Empty team slot ${position}`}
          accessibilityHint="Tap to add a Pokemon to your team"
          accessibilityRole="button"
        >
          <Text
            style={[
              styles.emptySlotText,
              { color: isDarkMode ? '#6b7280' : '#9ca3af' },
            ]}
          >
            +
          </Text>
          <Text
            style={[
              styles.emptySlotLabel,
              { color: isDarkMode ? '#6b7280' : '#9ca3af' },
            ]}
          >
            Add Pokemon
          </Text>
        </TouchableOpacity>
      );
    }

    // const primaryType = pokemon.types[0]?.type.name || 'normal'; // Unused
    // const typeColor = ...; // Unused

    return (
      <TouchableOpacity
        style={[
          styles.filledSlot,
          { backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff' },
        ]}
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
            <Text
              style={[
                styles.pokemonNumber,
                { color: isDarkMode ? '#9ca3af' : '#6b7280' },
              ]}
            >
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
              style={[
                styles.typeTag,
                { backgroundColor: getTypeColor(typeInfo.type.name) },
              ]}
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
              <Text
                style={[
                  styles.statLabel,
                  { color: isDarkMode ? '#9ca3af' : '#6b7280' },
                ]}
              >
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
  const teamAnalysis = _getTeamAnalysis();
  const currentTeam = savedTeams.find(t => t.id === currentTeamId);

  return (
    <View style={[styles.container, backgroundStyle]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View
        style={[styles.header, { paddingTop: Platform.OS === 'ios' ? 50 : 20 }]}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Team Builder</Text>
            <Text style={styles.headerSubtitle}>
              {team.length}/6 Pokemon
              {currentTeam ? ` • ${currentTeam.name}` : ''}
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => setShowLoadModal(true)}
              accessibilityLabel="Load saved team"
            >
              <Text style={styles.headerButtonText}>📂</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleSaveTeam}
              accessibilityLabel="Save current team"
            >
              <Text style={styles.headerButtonText}>💾</Text>
            </TouchableOpacity>
            {team.length > 0 && (
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => setShowAnalysis(!showAnalysis)}
                accessibilityLabel="Toggle team analysis"
              >
                <Text style={styles.headerButtonText}>📊</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        {/* Team Grid */}
        <View style={styles.teamGrid}>
          {[0, 1, 2, 3, 4, 5].map(index => (
            <TeamSlot key={index} pokemon={team[index]} position={index + 1} />
          ))}
        </View>

        {/* Team Statistics */}
        {team.length > 0 && (
          <>
            {/* Team Analysis Section (Collapsible) */}
            {showAnalysis && teamAnalysis && (
              <View
                style={[
                  styles.statsSection,
                  { backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff' },
                ]}
              >
                <Text style={[styles.sectionTitle, textStyle]}>
                  Team Analysis
                </Text>

                {/* Weaknesses */}
                {teamAnalysis.weaknesses.length > 0 && (
                  <View style={styles.analysisSubsection}>
                    <Text
                      style={[
                        styles.analysisLabel,
                        { color: isDarkMode ? '#ef4444' : '#dc2626' },
                      ]}
                    >
                      ⚠️ Weaknesses
                    </Text>
                    <View style={styles.typeCoverage}>
                      {teamAnalysis.weaknesses.slice(0, 5).map(typeName => (
                        <View
                          key={typeName}
                          style={[
                            styles.typeCoverageTag,
                            {
                              backgroundColor: getTypeColor(typeName),
                              opacity: 0.8,
                            },
                          ]}
                        >
                          <Text style={styles.typeCoverageText}>
                            {typeName.toUpperCase()}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Resistances */}
                {teamAnalysis.resistances.length > 0 && (
                  <View style={styles.analysisSubsection}>
                    <Text
                      style={[
                        styles.analysisLabel,
                        { color: isDarkMode ? '#10b981' : '#059669' },
                      ]}
                    >
                      🛡️ Resistances
                    </Text>
                    <View style={styles.typeCoverage}>
                      {teamAnalysis.resistances.slice(0, 5).map(typeName => (
                        <View
                          key={typeName}
                          style={[
                            styles.typeCoverageTag,
                            {
                              backgroundColor: getTypeColor(typeName),
                              opacity: 0.8,
                            },
                          ]}
                        >
                          <Text style={styles.typeCoverageText}>
                            {typeName.toUpperCase()}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Immunities */}
                {teamAnalysis.immunities.length > 0 && (
                  <View style={styles.analysisSubsection}>
                    <Text
                      style={[
                        styles.analysisLabel,
                        { color: isDarkMode ? '#3b82f6' : '#2563eb' },
                      ]}
                    >
                      🔰 Immunities
                    </Text>
                    <View style={styles.typeCoverage}>
                      {teamAnalysis.immunities.map(typeName => (
                        <View
                          key={typeName}
                          style={[
                            styles.typeCoverageTag,
                            {
                              backgroundColor: getTypeColor(typeName),
                              opacity: 0.8,
                            },
                          ]}
                        >
                          <Text style={styles.typeCoverageText}>
                            {typeName.toUpperCase()}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            )}

            <View
              style={[
                styles.statsSection,
                { backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff' },
              ]}
            >
              <Text style={[styles.sectionTitle, textStyle]}>
                Team Statistics
              </Text>

              {teamStats && (
                <View style={styles.statsGrid}>
                  {Object.entries(teamStats).map(([statName, value]) => (
                    <View key={statName} style={styles.avgStatItem}>
                      <Text
                        style={[
                          styles.avgStatLabel,
                          { color: isDarkMode ? '#9ca3af' : '#6b7280' },
                        ]}
                      >
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
            <View
              style={[
                styles.statsSection,
                { backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff' },
              ]}
            >
              <Text style={[styles.sectionTitle, textStyle]}>
                Type Coverage
              </Text>

              <View style={styles.typeCoverage}>
                {Object.entries(teamTypes).map(([typeName, count]) => (
                  <View key={typeName} style={styles.typeCoverageItem}>
                    <View
                      style={[
                        styles.typeCoverageTag,
                        { backgroundColor: getTypeColor(typeName) },
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

            {/* Battle and Clear Buttons */}
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity
                style={[styles.actionButton, styles.battleButton]}
                onPress={handleStartBattle}
                accessibilityLabel="Start battle with this team"
                accessibilityHint="Opens the battle screen"
                accessibilityRole="button"
              >
                <Text style={styles.battleButtonText}>⚔️ Start Battle</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.tournamentButton]}
                onPress={handleStartTournament}
                accessibilityLabel="Enter tournament with this team"
                accessibilityHint="Opens the tournament lobby"
                accessibilityRole="button"
              >
                <Text style={styles.tournamentButtonText}>🏆 Tournament</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.clearButton]}
                onPress={handleClearTeam}
                accessibilityLabel="Clear entire team"
                accessibilityHint="Removes all Pokemon from your team"
                accessibilityRole="button"
              >
                <Text style={styles.clearButtonText}>🗑️ Clear Team</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Empty State */}
        {team.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateEmoji}>🎮</Text>
            <Text style={[styles.emptyStateTitle, textStyle]}>
              Build Your Dream Team
            </Text>
            <Text
              style={[
                styles.emptyStateText,
                { color: isDarkMode ? '#9ca3af' : '#6b7280' },
              ]}
            >
              Add up to 6 Pokemon to create the ultimate team!
            </Text>
            <TouchableOpacity
              style={styles.emptyStateButton}
              onPress={handleAddPokemon}
              accessibilityLabel="Go to Pokédex"
              accessibilityRole="button"
            >
              <Text style={styles.emptyStateButtonText}>Browse Pokédex</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Save Team Modal */}
      <Modal
        visible={showSaveModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSaveModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff' },
            ]}
          >
            <Text style={[styles.modalTitle, textStyle]}>
              {currentTeamId ? 'Update Team' : 'Save Team'}
            </Text>

            <TextInput
              style={[
                styles.modalInput,
                {
                  backgroundColor: isDarkMode ? '#2a2a2a' : '#f5f5f5',
                  color: isDarkMode ? '#ffffff' : '#000000',
                },
              ]}
              placeholder="Team Name"
              placeholderTextColor={isDarkMode ? '#6b7280' : '#9ca3af'}
              value={teamName}
              onChangeText={setTeamName}
              maxLength={30}
            />

            <TextInput
              style={[
                styles.modalInput,
                styles.modalTextArea,
                {
                  backgroundColor: isDarkMode ? '#2a2a2a' : '#f5f5f5',
                  color: isDarkMode ? '#ffffff' : '#000000',
                },
              ]}
              placeholder="Description (optional)"
              placeholderTextColor={isDarkMode ? '#6b7280' : '#9ca3af'}
              value={teamDescription}
              onChangeText={setTeamDescription}
              maxLength={100}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => {
                  setShowSaveModal(false);
                  setTeamName('');
                  setTeamDescription('');
                }}
              >
                <Text style={styles.modalButtonSecondaryText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleSaveConfirm}
              >
                <Text style={styles.modalButtonPrimaryText}>
                  {currentTeamId ? 'Update' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Load Team Modal */}
      <Modal
        visible={showLoadModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLoadModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              styles.modalContentLarge,
              { backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff' },
            ]}
          >
            <Text style={[styles.modalTitle, textStyle]}>Saved Teams</Text>

            {savedTeams.length === 0 ? (
              <View style={styles.emptyTeamsContainer}>
                <Text
                  style={[
                    styles.emptyTeamsText,
                    { color: isDarkMode ? '#9ca3af' : '#6b7280' },
                  ]}
                >
                  No saved teams yet. Build and save your first team!
                </Text>
              </View>
            ) : (
              <ScrollView style={styles.teamsListScroll}>
                {savedTeams.map(savedTeam => (
                  <View
                    key={savedTeam.id}
                    style={[
                      styles.teamListItem,
                      { backgroundColor: isDarkMode ? '#2a2a2a' : '#f5f5f5' },
                      savedTeam.id === currentTeamId &&
                        styles.teamListItemActive,
                    ]}
                  >
                    <TouchableOpacity
                      style={styles.teamListItemMain}
                      onPress={() => handleLoadTeam(savedTeam.id)}
                    >
                      <View style={styles.teamListItemContent}>
                        <Text style={[styles.teamListItemName, textStyle]}>
                          {savedTeam.name}
                        </Text>
                        {savedTeam.description && (
                          <Text
                            style={[
                              styles.teamListItemDescription,
                              { color: isDarkMode ? '#9ca3af' : '#6b7280' },
                            ]}
                          >
                            {savedTeam.description}
                          </Text>
                        )}
                        <View style={styles.teamListItemMeta}>
                          <Text
                            style={[
                              styles.teamListItemMetaText,
                              { color: isDarkMode ? '#9ca3af' : '#6b7280' },
                            ]}
                          >
                            {savedTeam.pokemon.length} Pokemon
                          </Text>
                          <Text
                            style={[
                              styles.teamListItemMetaText,
                              { color: isDarkMode ? '#9ca3af' : '#6b7280' },
                            ]}
                          >
                            {new Date(savedTeam.updatedAt).toLocaleDateString()}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.teamListItemDelete}
                      onPress={() => handleDeleteTeam(savedTeam)}
                    >
                      <Text style={styles.teamListItemDeleteText}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}

            <TouchableOpacity
              style={[
                styles.modalButton,
                styles.modalButtonSecondary,
                { marginTop: 16 },
              ]}
              onPress={() => setShowLoadModal(false)}
            >
              <Text style={styles.modalButtonSecondaryText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtonText: {
    fontSize: 18,
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
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  battleButton: {
    backgroundColor: '#10b981',
  },
  battleButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  tournamentButton: {
    backgroundColor: '#f59e0b',
  },
  tournamentButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  clearButton: {
    backgroundColor: '#ef4444',
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
  analysisSubsection: {
    marginBottom: 16,
  },
  analysisLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  modalContentLarge: {
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
  },
  modalInput: {
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  modalTextArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalButtonPrimary: {
    backgroundColor: '#007AFF',
  },
  modalButtonPrimaryText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonSecondary: {
    backgroundColor: '#e5e7eb',
  },
  modalButtonSecondaryText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyTeamsContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyTeamsText: {
    fontSize: 14,
    textAlign: 'center',
  },
  teamsListScroll: {
    maxHeight: 400,
  },
  teamListItem: {
    flexDirection: 'row',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
  },
  teamListItemActive: {
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  teamListItemMain: {
    flex: 1,
    padding: 12,
  },
  teamListItemContent: {
    flex: 1,
  },
  teamListItemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  teamListItemDescription: {
    fontSize: 12,
    marginBottom: 8,
  },
  teamListItemMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  teamListItemMetaText: {
    fontSize: 11,
  },
  teamListItemDelete: {
    width: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  teamListItemDeleteText: {
    fontSize: 20,
  },
});

export default TeamBuilderScreen;
