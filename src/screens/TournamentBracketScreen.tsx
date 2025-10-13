/**
 * Tournament Bracket Screen
 * Display tournament bracket and manage match progression
 */

import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { Text, Button, Card, Surface, Chip, IconButton, Divider,  } from '../components';
import { useTheme } from '../hooks';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, TournamentMatch, TournamentStatus } from '../types';
import { useTournamentStore } from '../store/tournamentStore';

type TournamentBracketRouteProp = RouteProp<RootStackParamList, 'TournamentBracket'>;
type TournamentBracketNavigationProp = NativeStackNavigationProp<RootStackParamList, 'TournamentBracket'>;

const { width } = Dimensions.get('window');

export default function TournamentBracketScreen() {
  const navigation = useNavigation<TournamentBracketNavigationProp>();
  const route = useRoute<TournamentBracketRouteProp>();
  const theme = useTheme();
  const { tournamentId } = route.params;

  const {
    currentTournament,
    startTournament,
    cancelTournament,
    clearCurrentTournament,
    isProcessing,
  } = useTournamentStore();

  useEffect(() => {
    if (!currentTournament || currentTournament.id !== tournamentId) {
      Alert.alert('Tournament Not Found', 'The tournament could not be loaded', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    }
  }, [currentTournament, tournamentId]);

  if (!currentTournament) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text variant="bodyLarge" style={{ marginTop: 16 }}>
          Loading tournament...
        </Text>
      </View>
    );
  }

  const handleStartTournament = () => {
    startTournament();
  };

  const handleCancelTournament = () => {
    Alert.alert(
      'Cancel Tournament',
      'Are you sure you want to cancel this tournament?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: () => {
            cancelTournament();
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleMatchPress = (match: TournamentMatch) => {
    if (match.status === 'completed') {
      Alert.alert('Match Complete', `Winner: ${match.winner?.name}`);
      return;
    }

    if (match.status === 'pending') {
      Alert.alert('Match Pending', 'This match is not yet available');
      return;
    }

    // Check if player is in this match
    const isPlayerMatch = match.participant1?.isPlayer || match.participant2?.isPlayer;
    
    if (!isPlayerMatch) {
      Alert.alert('AI Match', 'This match will be simulated automatically');
      return;
    }

    // Player can battle
    navigation.navigate('TournamentBattle', {
      tournamentId: currentTournament.id,
      matchId: match.id,
    });
  };

  const handleViewResults = () => {
    const winner = currentTournament.winner;
    const message = winner?.isPlayer
      ? '🏆 Congratulations! You are the Tournament Champion! 🏆'
      : `Tournament Complete!\n\n${winner?.name} is the champion!`;

    Alert.alert('Tournament Results', message, [
      {
        text: 'OK',
        onPress: () => {
          clearCurrentTournament();
          navigation.navigate('TournamentLobby');
        },
      },
    ]);
  };

  const renderMatch = (match: TournamentMatch) => {
    const isPlayerMatch = match.participant1?.isPlayer || match.participant2?.isPlayer;
    const canBattle = match.status === 'in_progress' && isPlayerMatch;

    return (
      <Card
        key={match.id}
        style={[
          styles.matchCard,
          match.status === 'completed' && styles.completedMatch,
          canBattle && styles.activeMatch,
        ]}
        onPress={() => handleMatchPress(match)}
      >
        <Card.Content>
          <View style={styles.matchHeader}>
            <Text variant="labelSmall">Match {match.matchNumber}</Text>
            {match.status === 'completed' && (
              <Chip compact icon="check">Complete</Chip>
            )}
            {canBattle && (
              <Chip compact icon="sword-cross" mode="flat">
                Your Turn!
              </Chip>
            )}
          </View>

          <View style={styles.participants}>
            <View style={[
              styles.participant,
              match.winner?.id === match.participant1?.id && styles.winner
            ]}>
              <Text
                variant="bodyMedium"
                style={[
                  styles.participantName,
                  match.participant1?.isPlayer && styles.playerName
                ]}
              >
                {match.participant1?.name || 'TBD'}
              </Text>
              {match.participant1?.isPlayer && (
                <Chip compact icon="account">You</Chip>
              )}
            </View>

            <Text variant="titleMedium" style={styles.vs}>VS</Text>

            <View style={[
              styles.participant,
              match.winner?.id === match.participant2?.id && styles.winner
            ]}>
              <Text
                variant="bodyMedium"
                style={[
                  styles.participantName,
                  match.participant2?.isPlayer && styles.playerName
                ]}
              >
                {match.participant2?.name || 'TBD'}
              </Text>
              {match.participant2?.isPlayer && (
                <Chip compact icon="account">You</Chip>
              )}
            </View>
          </View>

          {match.winner && (
            <View style={styles.winnerBanner}>
              <Text variant="labelSmall" style={{ color: theme.colors.onPrimary }}>
                Winner: {match.winner.name}
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  const currentRound = currentTournament.rounds[currentTournament.currentRound - 1];
  const roundName = currentTournament.rounds.length === 1 ? 'Final' :
    currentTournament.currentRound === currentTournament.rounds.length ? 'Final' :
    currentTournament.currentRound === currentTournament.rounds.length - 1 ? 'Semi-Finals' :
    currentTournament.currentRound === currentTournament.rounds.length - 2 ? 'Quarter-Finals' :
    `Round ${currentTournament.currentRound}`;

  return (
    <View style={styles.container}>
      <Surface style={[styles.header, { backgroundColor: theme.colors.primaryContainer }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerText}>
            <Text variant="headlineSmall" style={{ color: theme.colors.onPrimaryContainer }}>
              {currentTournament.name}
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onPrimaryContainer }}>
              {currentTournament.participants.length} Participants • {currentTournament.format}
            </Text>
          </View>
          
          {currentTournament.status === TournamentStatus.REGISTRATION && (
            <IconButton
              icon="close"
              size={24}
              onPress={handleCancelTournament}
              iconColor={theme.colors.onPrimaryContainer}
            />
          )}
        </View>

        {currentTournament.status !== TournamentStatus.REGISTRATION && (
          <View style={styles.progressChips}>
            {currentTournament.rounds.map((round, index) => (
              <Chip
                key={index}
                compact
                mode={round.status === 'completed' ? 'flat' : 'outlined'}
                selected={index === currentTournament.currentRound - 1}
                icon={
                  round.status === 'completed' ? 'check' :
                  round.status === 'in_progress' ? 'progress-clock' :
                  undefined
                }
              >
                R{round.roundNumber}
              </Chip>
            ))}
          </View>
        )}
      </Surface>

      <ScrollView style={styles.content}>
        {currentTournament.status === TournamentStatus.REGISTRATION ? (
          <Card style={styles.registrationCard}>
            <Card.Content>
              <Text variant="titleLarge" style={{ textAlign: 'center', marginBottom: 16 }}>
                Ready to Begin?
              </Text>
              <Text variant="bodyMedium" style={{ textAlign: 'center', marginBottom: 24 }}>
                The bracket is set! Start the tournament to begin competing.
              </Text>
              
              <Button
                mode="contained"
                onPress={handleStartTournament}
                icon="play"
                disabled={isProcessing}
                loading={isProcessing}
              >
                Start Tournament
              </Button>
              
              <Button
                mode="outlined"
                onPress={handleCancelTournament}
                style={{ marginTop: 12 }}
              >
                Cancel
              </Button>
            </Card.Content>
          </Card>
        ) : currentTournament.status === TournamentStatus.COMPLETED ? (
          <Card style={styles.completionCard}>
            <Card.Content>
              <Text variant="displaySmall" style={{ textAlign: 'center', marginBottom: 8 }}>
                🏆
              </Text>
              <Text variant="titleLarge" style={{ textAlign: 'center', marginBottom: 16 }}>
                Tournament Complete!
              </Text>
              <Text variant="headlineSmall" style={{ textAlign: 'center', marginBottom: 24 }}>
                Champion: {currentTournament.winner?.name}
              </Text>
              
              <Button
                mode="contained"
                onPress={handleViewResults}
                icon="trophy"
              >
                View Results
              </Button>
            </Card.Content>
          </Card>
        ) : null}

        {currentTournament.status === TournamentStatus.IN_PROGRESS && currentRound && (
          <View>
            <Text variant="titleLarge" style={styles.roundTitle}>
              {roundName}
            </Text>
            
            {currentRound.matches.map(renderMatch)}
          </View>
        )}

        {/* Show all rounds in accordion */}
        {currentTournament.status === TournamentStatus.IN_PROGRESS && (
          <View style={styles.allRoundsSection}>
            <Divider style={{ marginVertical: 16 }} />
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Full Bracket
            </Text>
            
            {currentTournament.rounds.map((round, roundIndex) => {
              const rName = currentTournament.rounds.length === 1 ? 'Final' :
                roundIndex === currentTournament.rounds.length - 1 ? 'Final' :
                roundIndex === currentTournament.rounds.length - 2 ? 'Semi-Finals' :
                roundIndex === currentTournament.rounds.length - 3 ? 'Quarter-Finals' :
                `Round ${round.roundNumber}`;

              return (
                <View key={round.roundNumber} style={styles.roundSection}>
                  <Text variant="titleSmall" style={styles.roundSubtitle}>
                    {rName}
                  </Text>
                  {round.matches.map(renderMatch)}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
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
  header: {
    padding: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerText: {
    flex: 1,
  },
  progressChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  content: {
    flex: 1,
  },
  registrationCard: {
    margin: 16,
  },
  completionCard: {
    margin: 16,
  },
  roundTitle: {
    padding: 16,
    paddingBottom: 8,
  },
  matchCard: {
    margin: 8,
    marginHorizontal: 16,
  },
  completedMatch: {
    opacity: 0.7,
  },
  activeMatch: {
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  participants: {
    gap: 8,
  },
  participant: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  participantName: {
    flex: 1,
  },
  playerName: {
    fontWeight: 'bold',
  },
  winner: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  vs: {
    textAlign: 'center',
    marginVertical: 4,
    opacity: 0.5,
  },
  winnerBanner: {
    marginTop: 12,
    padding: 8,
    backgroundColor: '#4CAF50',
    borderRadius: 4,
    alignItems: 'center',
  },
  allRoundsSection: {
    marginTop: 16,
  },
  sectionTitle: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  roundSection: {
    marginBottom: 16,
  },
  roundSubtitle: {
    paddingHorizontal: 16,
    marginBottom: 4,
    opacity: 0.7,
  },
});
