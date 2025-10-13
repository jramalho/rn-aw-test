/**
 * Tournament Battle Screen
 * Handles battles within a tournament context
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { Text, Button, Card, ProgressBar, Portal, Dialog, List, IconButton, Chip,  } from '../components';
import { useTheme } from '../hooks';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, BattleAction, BattlePokemon } from '../types';
import { useBattleStore } from '../store/battleStore';
import { useTournamentStore } from '../store/tournamentStore';
import { generateBattleMoves } from '../utils/battleUtils';

type TournamentBattleRouteProp = RouteProp<RootStackParamList, 'TournamentBattle'>;
type TournamentBattleNavigationProp = NativeStackNavigationProp<RootStackParamList, 'TournamentBattle'>;

const { width } = Dimensions.get('window');

export default function TournamentBattleScreen() {
  const navigation = useNavigation<TournamentBattleNavigationProp>();
  const route = useRoute<TournamentBattleRouteProp>();
  const theme = useTheme();
  const { tournamentId, matchId } = route.params;

  const {
    currentBattle,
    isProcessingTurn,
    startBattle,
    executePlayerAction,
    forfeitBattle,
    clearCurrentBattle,
  } = useBattleStore();

  const {
    currentTournament,
    advanceTournament,
  } = useTournamentStore();

  const [switchDialogVisible, setSwitchDialogVisible] = useState(false);
  const [selectedMove, setSelectedMove] = useState<number | null>(null);
  const [battleLog, setBattleLog] = useState<string[]>([]);

  // Find the tournament match
  const match = currentTournament?.rounds
    .flatMap(r => r.matches)
    .find(m => m.id === matchId);

  // Initialize battle
  useEffect(() => {
    if (!currentBattle && match && currentTournament) {
      const participant1 = match.participant1!;
      const participant2 = match.participant2!;

      startBattle(participant1.team, participant2.team);
    }
  }, [match, currentBattle]);

  // Update battle log
  useEffect(() => {
    if (currentBattle && currentBattle.turns.length > 0) {
      const lastTurn = currentBattle.turns[currentBattle.turns.length - 1];
      const newMessages = lastTurn.events.map(event => event.message);
      setBattleLog(prev => [...prev, ...newMessages]);
    }
  }, [currentBattle?.turns.length]);

  // Check if battle ended
  useEffect(() => {
    if (currentBattle && currentBattle.status !== 'ongoing') {
      const message = currentBattle.status === 'won'
        ? `Victory! You defeated ${match?.participant2?.name}!`
        : currentBattle.status === 'lost'
        ? `Defeat! ${match?.participant2?.name} won!`
        : 'Battle ended';

      setTimeout(() => {
        Alert.alert(
          'Battle Complete',
          message,
          [
            {
              text: 'Continue',
              onPress: () => {
                // Advance tournament
                advanceTournament(matchId, currentBattle);
                clearCurrentBattle();
                navigation.goBack();
              },
            },
          ]
        );
      }, 1000);
    }
  }, [currentBattle?.status]);

  if (!currentTournament || !match) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text variant="bodyLarge" style={{ marginTop: 16 }}>
          Loading battle...
        </Text>
      </View>
    );
  }

  if (!currentBattle) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text variant="bodyLarge" style={{ marginTop: 16 }}>
          Preparing battle...
        </Text>
      </View>
    );
  }

  const playerPokemon = currentBattle.playerTeam.pokemon[currentBattle.playerTeam.activePokemonIndex];
  const opponentPokemon = currentBattle.opponentTeam.pokemon[currentBattle.opponentTeam.activePokemonIndex];
  const moves = generateBattleMoves(playerPokemon);

  const canSwitch = currentBattle.playerTeam.pokemon.some(
    (p, idx) => idx !== currentBattle.playerTeam.activePokemonIndex && p.status !== 'fainted'
  );

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
      'Are you sure you want to forfeit? You will lose this tournament match.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Forfeit',
          style: 'destructive',
          onPress: () => {
            forfeitBattle();
            setTimeout(() => {
              if (currentBattle) {
                advanceTournament(matchId, currentBattle);
              }
              clearCurrentBattle();
              navigation.goBack();
            }, 500);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Tournament Header */}
      <View style={[styles.tournamentHeader, { backgroundColor: theme.colors.secondaryContainer }]}>
        <Text variant="titleSmall" style={{ color: theme.colors.onSecondaryContainer }}>
          {currentTournament.name}
        </Text>
        <Chip compact icon="trophy">Tournament Match</Chip>
      </View>

      {/* Battle UI */}
      <ScrollView style={styles.content}>
        {/* Opponent Pokemon */}
        <Card style={styles.pokemonCard}>
          <Card.Content>
            <View style={styles.pokemonHeader}>
              <View>
                <Text variant="titleLarge">{opponentPokemon.name}</Text>
                <Text variant="bodySmall">{match.participant2?.name}</Text>
              </View>
              <Text variant="bodySmall">
                Lv. {Math.floor(opponentPokemon.base_experience / 10) || 50}
              </Text>
            </View>
            
            <View style={styles.hpBar}>
              <View style={styles.hpBarHeader}>
                <Text variant="bodySmall">HP</Text>
                <Text variant="bodySmall">
                  {opponentPokemon.currentHP} / {opponentPokemon.maxHP}
                </Text>
              </View>
              <ProgressBar
                progress={opponentPokemon.currentHP / opponentPokemon.maxHP}
                color={
                  opponentPokemon.currentHP / opponentPokemon.maxHP > 0.5
                    ? '#4CAF50'
                    : opponentPokemon.currentHP / opponentPokemon.maxHP > 0.2
                    ? '#FF9800'
                    : '#F44336'
                }
                style={styles.progressBar}
              />
            </View>
          </Card.Content>
        </Card>

        {/* Player Pokemon */}
        <Card style={styles.pokemonCard}>
          <Card.Content>
            <View style={styles.pokemonHeader}>
              <View>
                <Text variant="titleLarge">{playerPokemon.name}</Text>
                <Text variant="bodySmall">You</Text>
              </View>
              <Text variant="bodySmall">
                Lv. {Math.floor(playerPokemon.base_experience / 10) || 50}
              </Text>
            </View>
            
            <View style={styles.hpBar}>
              <View style={styles.hpBarHeader}>
                <Text variant="bodySmall">HP</Text>
                <Text variant="bodySmall">
                  {playerPokemon.currentHP} / {playerPokemon.maxHP}
                </Text>
              </View>
              <ProgressBar
                progress={playerPokemon.currentHP / playerPokemon.maxHP}
                color={
                  playerPokemon.currentHP / playerPokemon.maxHP > 0.5
                    ? '#4CAF50'
                    : playerPokemon.currentHP / playerPokemon.maxHP > 0.2
                    ? '#FF9800'
                    : '#F44336'
                }
                style={styles.progressBar}
              />
            </View>
          </Card.Content>
        </Card>

        {/* Battle Log */}
        {battleLog.length > 0 && (
          <Card style={styles.logCard}>
            <Card.Title title="Battle Log" />
            <Card.Content>
              <ScrollView style={styles.log} nestedScrollEnabled>
                {battleLog.slice(-10).map((message, index) => (
                  <Text key={index} variant="bodySmall" style={styles.logMessage}>
                    {message}
                  </Text>
                ))}
              </ScrollView>
            </Card.Content>
          </Card>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <Text variant="titleMedium" style={styles.actionsTitle}>
            Choose Your Action
          </Text>

          <View style={styles.movesGrid}>
            {moves.map((move, index) => (
              <Button
                key={index}
                mode="contained"
                onPress={() => handleAttack(index)}
                disabled={isProcessingTurn || currentBattle.status !== 'ongoing'}
                style={styles.moveButton}
                contentStyle={styles.moveButtonContent}
              >
                <View>
                  <Text variant="labelLarge">{move.name}</Text>
                  <Text variant="bodySmall">
                    {move.type} • {move.category}
                  </Text>
                </View>
              </Button>
            ))}
          </View>

          <View style={styles.utilityButtons}>
            <Button
              mode="outlined"
              onPress={() => setSwitchDialogVisible(true)}
              disabled={!canSwitch || isProcessingTurn || currentBattle.status !== 'ongoing'}
              icon="swap-horizontal"
              style={styles.utilityButton}
            >
              Switch
            </Button>
            <Button
              mode="outlined"
              onPress={handleForfeit}
              disabled={isProcessingTurn || currentBattle.status !== 'ongoing'}
              icon="flag"
              style={styles.utilityButton}
            >
              Forfeit
            </Button>
          </View>
        </View>
      </ScrollView>

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
                const isActive = index === currentBattle.playerTeam.activePokemonIndex;
                const isFainted = pokemon.status === 'fainted';

                return (
                  <List.Item
                    key={index}
                    title={pokemon.name}
                    description={`HP: ${pokemon.currentHP}/${pokemon.maxHP} • ${pokemon.status}`}
                    disabled={isActive || isFainted}
                    onPress={() => handleSwitch(index)}
                    left={props => (
                      <List.Icon
                        {...props}
                        icon={isActive ? 'check-circle' : isFainted ? 'close-circle' : 'circle-outline'}
                      />
                    )}
                  />
                );
              })}
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setSwitchDialogVisible(false)}>Cancel</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tournamentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  content: {
    flex: 1,
  },
  pokemonCard: {
    margin: 16,
    marginBottom: 8,
  },
  pokemonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  hpBar: {
    marginTop: 8,
  },
  hpBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  logCard: {
    margin: 16,
    marginTop: 8,
  },
  log: {
    maxHeight: 150,
  },
  logMessage: {
    marginBottom: 4,
    opacity: 0.8,
  },
  actions: {
    padding: 16,
    paddingTop: 8,
  },
  actionsTitle: {
    marginBottom: 12,
  },
  movesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  moveButton: {
    flex: 1,
    minWidth: (width - 48) / 2,
  },
  moveButtonContent: {
    height: 60,
  },
  utilityButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  utilityButton: {
    flex: 1,
  },
});
