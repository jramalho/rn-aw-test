import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import {
  Text,
  Button,
  Card,
  ProgressBar,
  Portal,
  Dialog,
  List,
} from '../components';
import { useTheme } from '../hooks';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, BattleAction, BattlePokemon } from '../types';
import { useBattleStore } from '../store/battleStore';
import { usePokemonStore } from '../store/pokemonStore';
import {
  generateTrainerTeam,
  OPPONENT_TRAINERS,
  OpponentTrainer,
  generateBattleMoves,
} from '../utils/battleUtils';

type BattleScreenRouteProp = RouteProp<RootStackParamList, 'Battle'>;
type BattleScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Battle'
>;

const { width } = Dimensions.get('window');

export default function BattleScreen() {
  const navigation = useNavigation<BattleScreenNavigationProp>();
  const route = useRoute<BattleScreenRouteProp>();
  const theme = useTheme();
  const { teamId, opponentTrainer } = route.params;

  const {
    currentBattle,
    isProcessingTurn,
    startBattle,
    executePlayerAction,
    forfeitBattle,
    clearCurrentBattle,
  } = useBattleStore();

  const { savedTeams, pokemonList } = usePokemonStore();

  const [switchDialogVisible, setSwitchDialogVisible] = useState(false);
  const [_selectedMove, _setSelectedMove] = useState<number | null>(null);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [selectedTrainer, setSelectedTrainer] =
    useState<OpponentTrainer | null>(opponentTrainer || null);

  // Initialize battle
  useEffect(() => {
    if (!currentBattle) {
      const team = savedTeams.find(t => t.id === teamId);

      if (!team || team.pokemon.length === 0) {
        Alert.alert('Error', 'Invalid team selected', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
        return;
      }

      // Use provided trainer or pick a random one
      const trainer =
        selectedTrainer ||
        OPPONENT_TRAINERS[Math.floor(Math.random() * OPPONENT_TRAINERS.length)];
      setSelectedTrainer(trainer);

      // Generate opponent team based on trainer
      const opponentPokemon = generateTrainerTeam(pokemonList, trainer);

      if (opponentPokemon.length === 0) {
        Alert.alert('Error', 'Failed to generate opponent team', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
        return;
      }

      startBattle(team.pokemon, opponentPokemon);
    }
  }, [
    currentBattle,
    navigation,
    pokemonList,
    savedTeams,
    selectedTrainer,
    startBattle,
    teamId,
  ]);

  // Update battle log when battle state changes
  useEffect(() => {
    if (currentBattle && currentBattle.turns.length > 0) {
      const lastTurn = currentBattle.turns[currentBattle.turns.length - 1];
      const newMessages = lastTurn.events.map(event => event.message);
      setBattleLog(prev => [...prev, ...newMessages]);
    }
  }, [currentBattle]);

  // Check if battle ended
  useEffect(() => {
    if (currentBattle && currentBattle.status !== 'ongoing') {
      const message =
        currentBattle.status === 'won'
          ? 'Congratulations! You won the battle!'
          : currentBattle.status === 'forfeit'
          ? 'You forfeited the battle.'
          : 'You lost the battle!';

      setTimeout(() => {
        Alert.alert('Battle Ended', message, [
          {
            text: 'OK',
            onPress: () => {
              clearCurrentBattle();
              navigation.goBack();
            },
          },
        ]);
      }, 500);
    }
  }, [clearCurrentBattle, currentBattle, navigation]);

  if (!currentBattle) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Preparing battle...</Text>
      </View>
    );
  }

  const playerPokemon =
    currentBattle.playerTeam.pokemon[
      currentBattle.playerTeam.activePokemonIndex
    ];
  const opponentPokemon =
    currentBattle.opponentTeam.pokemon[
      currentBattle.opponentTeam.activePokemonIndex
    ];
  const moves = generateBattleMoves(playerPokemon);

  const handleAttack = async (moveIndex: number) => {
    if (isProcessingTurn) return;

    const action: BattleAction = {
      type: 'attack',
      moveIndex,
    };

    await executePlayerAction(action);
  };

  const handleSwitch = (pokemonIndex: number) => {
    if (isProcessingTurn) return;

    const action: BattleAction = {
      type: 'switch',
      targetPokemonIndex: pokemonIndex,
    };

    executePlayerAction(action);
    setSwitchDialogVisible(false);
  };

  const handleForfeit = () => {
    Alert.alert(
      'Forfeit Battle',
      'Are you sure you want to forfeit? This will count as a loss.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Forfeit',
          style: 'destructive',
          onPress: () => {
            forfeitBattle();
            navigation.goBack();
          },
        },
      ],
    );
  };

  const renderPokemonCard = (pokemon: BattlePokemon, isOpponent: boolean) => {
    const hpPercentage = pokemon.currentHP / pokemon.maxHP;
    const hpColor =
      hpPercentage > 0.5
        ? '#4caf50'
        : hpPercentage > 0.2
        ? '#ff9800'
        : '#f44336';

    return (
      <Card style={[styles.pokemonCard, isOpponent && styles.opponentCard]}>
        <Card.Content>
          <View style={styles.pokemonHeader}>
            <Text variant="titleLarge" style={styles.pokemonName}>
              {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
            </Text>
            <Text variant="bodyMedium">Lv. 50</Text>
          </View>

          <View style={styles.hpContainer}>
            <Text variant="bodySmall" style={styles.hpText}>
              HP: {pokemon.currentHP} / {pokemon.maxHP}
            </Text>
            <ProgressBar
              progress={hpPercentage}
              color={hpColor}
              style={styles.hpBar}
            />
          </View>

          {pokemon.sprites.other?.['official-artwork']?.front_default && (
            <View style={styles.spriteContainer}>
              {/* In a real app, you'd render the image here */}
              <Text style={styles.spriteText}>🎮</Text>
            </View>
          )}

          <View style={styles.typesContainer}>
            {pokemon.types.map((typeInfo, index) => (
              <View
                key={index}
                style={[
                  styles.typeChip,
                  { backgroundColor: getTypeColor(typeInfo.type.name) },
                ]}
              >
                <Text style={styles.typeText}>
                  {typeInfo.type.name.toUpperCase()}
                </Text>
              </View>
            ))}
          </View>

          {pokemon.status !== 'normal' && (
            <Text style={[styles.statusText, { color: theme.colors.error }]}>
              Status: {pokemon.status.toUpperCase()}
            </Text>
          )}
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Opponent Pokemon */}
        <View style={styles.battleSection}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {selectedTrainer
              ? `${selectedTrainer.name} (${selectedTrainer.title})`
              : 'Opponent'}
          </Text>
          {renderPokemonCard(opponentPokemon, true)}
        </View>

        {/* Battle Log */}
        <Card style={styles.battleLogCard}>
          <Card.Title title="Battle Log" />
          <Card.Content>
            <ScrollView style={styles.battleLog}>
              {battleLog.slice(-5).map((message, index) => (
                <Text key={index} variant="bodySmall" style={styles.logMessage}>
                  {message}
                </Text>
              ))}
              {battleLog.length === 0 && (
                <Text variant="bodySmall" style={styles.logMessageEmpty}>
                  Battle started! Choose your move.
                </Text>
              )}
            </ScrollView>
          </Card.Content>
        </Card>

        {/* Player Pokemon */}
        <View style={styles.battleSection}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Your Pokemon
          </Text>
          {renderPokemonCard(playerPokemon, false)}
        </View>
      </ScrollView>

      {/* Battle Controls */}
      {currentBattle.status === 'ongoing' && (
        <View style={styles.controls}>
          {/* Move Buttons */}
          <View style={styles.movesGrid}>
            {moves.map((move, index) => (
              <Button
                key={index}
                mode="contained"
                onPress={() => handleAttack(index)}
                disabled={isProcessingTurn}
                style={[
                  styles.moveButton,
                  { backgroundColor: getTypeColor(move.type) },
                ]}
                labelStyle={styles.moveButtonLabel}
              >
                {move.name}
              </Button>
            ))}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <Button
              mode="outlined"
              onPress={() => setSwitchDialogVisible(true)}
              disabled={isProcessingTurn}
              style={styles.actionButton}
            >
              Switch
            </Button>
            <Button
              mode="outlined"
              onPress={handleForfeit}
              disabled={isProcessingTurn}
              style={styles.actionButton}
              textColor={theme.colors.error}
            >
              Forfeit
            </Button>
          </View>
        </View>
      )}

      {/* Switch Pokemon Dialog */}
      <Portal>
        <Dialog
          visible={switchDialogVisible}
          onDismiss={() => setSwitchDialogVisible(false)}
        >
          <Dialog.Title>Switch Pokemon</Dialog.Title>
          <Dialog.ScrollArea>
            <ScrollView>
              {currentBattle.playerTeam.pokemon.map((pokemon, index) => {
                const isActive =
                  index === currentBattle.playerTeam.activePokemonIndex;
                const isFainted = pokemon.status === 'fainted';

                return (
                  <List.Item
                    key={pokemon.id}
                    title={
                      pokemon.name.charAt(0).toUpperCase() +
                      pokemon.name.slice(1)
                    }
                    description={`HP: ${pokemon.currentHP}/${pokemon.maxHP}`}
                    disabled={isActive || isFainted}
                    onPress={() => handleSwitch(index)}
                    left={props => <List.Icon {...props} icon="pokeball" />}
                    right={() => (
                      <Text>
                        {isActive ? '(Active)' : isFainted ? '(Fainted)' : ''}
                      </Text>
                    )}
                  />
                );
              })}
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setSwitchDialogVisible(false)}>
              Cancel
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

function getTypeColor(type: string): string {
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
  return typeColors[type] || '#A8A878';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
  },
  scrollView: {
    flex: 1,
  },
  battleSection: {
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  pokemonCard: {
    marginBottom: 8,
  },
  opponentCard: {
    backgroundColor: '#ffebee',
  },
  pokemonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pokemonName: {
    fontWeight: 'bold',
  },
  hpContainer: {
    marginBottom: 12,
  },
  hpText: {
    marginBottom: 4,
  },
  hpBar: {
    height: 8,
    borderRadius: 4,
  },
  spriteContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  spriteText: {
    fontSize: 48,
  },
  typesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 8,
  },
  typeChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  statusText: {
    marginTop: 8,
    fontWeight: 'bold',
  },
  battleLogCard: {
    margin: 16,
    marginTop: 0,
  },
  battleLog: {
    maxHeight: 120,
  },
  logMessage: {
    marginBottom: 4,
    lineHeight: 20,
  },
  logMessageEmpty: {
    fontStyle: 'italic',
    opacity: 0.6,
  },
  controls: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  movesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  moveButton: {
    flex: 1,
    minWidth: (width - 48) / 2,
  },
  moveButtonLabel: {
    fontSize: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
  },
});
