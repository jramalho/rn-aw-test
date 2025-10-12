/**
 * Tournament Lobby Screen
 * Create and manage tournament entries
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Text,
  Button,
  Card,
  SegmentedButtons,
  TextInput,
  List,
  Chip,
  useTheme,
  Surface,
  Divider,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, TournamentFormat, SavedTeam } from '../types';
import { useTournamentStore } from '../store/tournamentStore';
import { usePokemonStore } from '../store/pokemonStore';

type TournamentLobbyNavigationProp = NativeStackNavigationProp<RootStackParamList, 'TournamentLobby'>;

const PARTICIPANT_COUNTS = [4, 8, 16];

export default function TournamentLobbyScreen() {
  const navigation = useNavigation<TournamentLobbyNavigationProp>();
  const theme = useTheme();
  
  const { createTournament, currentTournament, tournamentHistory } = useTournamentStore();
  const { savedTeams, pokemonList } = usePokemonStore();

  const [tournamentName, setTournamentName] = useState('');
  const [format, setFormat] = useState<TournamentFormat>(TournamentFormat.SINGLE_ELIMINATION);
  const [participantCount, setParticipantCount] = useState(8);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  const handleCreateTournament = () => {
    if (!tournamentName.trim()) {
      Alert.alert('Invalid Name', 'Please enter a tournament name');
      return;
    }

    if (!selectedTeamId) {
      Alert.alert('No Team Selected', 'Please select a team to participate');
      return;
    }

    const team = savedTeams.find(t => t.id === selectedTeamId);
    if (!team || team.pokemon.length === 0) {
      Alert.alert('Invalid Team', 'Selected team has no Pokemon');
      return;
    }

    if (pokemonList.length < 20) {
      Alert.alert(
        'Not Enough Pokemon',
        'Please load more Pokemon in the Pokemon List screen before creating a tournament'
      );
      return;
    }

    createTournament(
      tournamentName,
      format,
      team.pokemon,
      participantCount,
      pokemonList
    );

    // Navigate to bracket
    if (currentTournament) {
      navigation.navigate('TournamentBracket', { tournamentId: currentTournament.id });
    }
  };

  const stats = useTournamentStore(state => state.getTournamentStats());

  return (
    <ScrollView style={styles.container}>
      <Surface style={[styles.header, { backgroundColor: theme.colors.primaryContainer }]}>
        <Text variant="headlineMedium" style={{ color: theme.colors.onPrimaryContainer }}>
          Tournament Lobby
        </Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.onPrimaryContainer, marginTop: 8 }}>
          Compete against AI trainers in bracket-style tournaments
        </Text>
      </Surface>

      {/* Stats Card */}
      <Card style={styles.card}>
        <Card.Title title="Your Tournament Stats" />
        <Card.Content>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text variant="headlineMedium" style={{ color: theme.colors.primary }}>
                {stats.wins}
              </Text>
              <Text variant="bodySmall">Wins</Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="headlineMedium" style={{ color: theme.colors.secondary }}>
                {stats.totalTournaments}
              </Text>
              <Text variant="bodySmall">Tournaments</Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="headlineMedium" style={{ color: theme.colors.tertiary }}>
                {stats.winRate}%
              </Text>
              <Text variant="bodySmall">Win Rate</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Create Tournament Form */}
      <Card style={styles.card}>
        <Card.Title title="Create New Tournament" />
        <Card.Content>
          <TextInput
            label="Tournament Name"
            value={tournamentName}
            onChangeText={setTournamentName}
            mode="outlined"
            style={styles.input}
            placeholder="e.g., Champion's League"
          />

          <Text variant="titleSmall" style={styles.sectionTitle}>
            Tournament Format
          </Text>
          <SegmentedButtons
            value={format}
            onValueChange={value => setFormat(value as TournamentFormat)}
            buttons={[
              {
                value: TournamentFormat.SINGLE_ELIMINATION,
                label: 'Single Elim',
                icon: 'trophy',
              },
              {
                value: TournamentFormat.DOUBLE_ELIMINATION,
                label: 'Double Elim',
                icon: 'trophy-variant',
                disabled: true,
              },
              {
                value: TournamentFormat.ROUND_ROBIN,
                label: 'Round Robin',
                icon: 'sync',
                disabled: true,
              },
            ]}
            style={styles.segmentedButtons}
          />
          
          <Text variant="bodySmall" style={styles.helperText}>
            Only Single Elimination is currently available
          </Text>

          <Text variant="titleSmall" style={styles.sectionTitle}>
            Number of Participants
          </Text>
          <View style={styles.chipContainer}>
            {PARTICIPANT_COUNTS.map(count => (
              <Chip
                key={count}
                selected={participantCount === count}
                onPress={() => setParticipantCount(count)}
                style={styles.chip}
                mode={participantCount === count ? 'flat' : 'outlined'}
              >
                {count} Trainers
              </Chip>
            ))}
          </View>

          <Text variant="titleSmall" style={styles.sectionTitle}>
            Select Your Team
          </Text>
          
          {savedTeams.length === 0 ? (
            <View style={styles.emptyState}>
              <Text variant="bodyMedium" style={{ textAlign: 'center', color: theme.colors.onSurfaceVariant }}>
                No saved teams found
              </Text>
              <Button
                mode="outlined"
                onPress={() => navigation.navigate('TeamBuilder')}
                style={{ marginTop: 12 }}
              >
                Build a Team
              </Button>
            </View>
          ) : (
            savedTeams.map(team => (
              <List.Item
                key={team.id}
                title={team.name}
                description={`${team.pokemon.length} Pokemon${team.description ? ` • ${team.description}` : ''}`}
                left={props => (
                  <List.Icon
                    {...props}
                    icon={selectedTeamId === team.id ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'}
                    color={selectedTeamId === team.id ? theme.colors.primary : theme.colors.onSurfaceVariant}
                  />
                )}
                onPress={() => setSelectedTeamId(team.id)}
                style={[
                  styles.teamItem,
                  selectedTeamId === team.id && { backgroundColor: theme.colors.primaryContainer }
                ]}
              />
            ))
          )}
        </Card.Content>
      </Card>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <Button
          mode="contained"
          onPress={handleCreateTournament}
          icon="trophy"
          disabled={!tournamentName.trim() || !selectedTeamId || pokemonList.length < 20}
          style={styles.button}
        >
          Create Tournament
        </Button>
        
        {tournamentHistory.tournaments.length > 0 && (
          <Button
            mode="outlined"
            onPress={() => Alert.alert('Coming Soon', 'Tournament history view is coming soon!')}
            icon="history"
            style={styles.button}
          >
            View History
          </Button>
        )}
      </View>

      {/* Info Card */}
      <Card style={styles.card}>
        <Card.Title title="How It Works" titleVariant="titleMedium" />
        <Card.Content>
          <List.Item
            title="Create Tournament"
            description="Set up a tournament with your chosen format and team size"
            left={props => <List.Icon {...props} icon="numeric-1-circle" />}
          />
          <Divider />
          <List.Item
            title="View Bracket"
            description="See the tournament bracket with all matchups"
            left={props => <List.Icon {...props} icon="numeric-2-circle" />}
          />
          <Divider />
          <List.Item
            title="Battle"
            description="Face opponents in your matches while AI simulates other battles"
            left={props => <List.Icon {...props} icon="numeric-3-circle" />}
          />
          <Divider />
          <List.Item
            title="Win Trophy"
            description="Advance through rounds to become the champion!"
            left={props => <List.Icon {...props} icon="numeric-4-circle" />}
          />
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    marginBottom: 8,
  },
  card: {
    margin: 8,
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  input: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  segmentedButtons: {
    marginBottom: 4,
  },
  helperText: {
    marginBottom: 8,
    opacity: 0.7,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  chip: {
    marginRight: 8,
  },
  teamItem: {
    borderRadius: 8,
    marginVertical: 4,
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
  },
  actions: {
    padding: 16,
    gap: 12,
  },
  button: {
    marginBottom: 8,
  },
});
