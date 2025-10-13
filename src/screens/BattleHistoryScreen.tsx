import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Card, useTheme, Divider, IconButton } from 'react-native-paper';
import { useBattleStore } from '../store/battleStore';

export default function BattleHistoryScreen() {
  const theme = useTheme();

  const { battleHistory, getBattleStats } = useBattleStore();
  const stats = getBattleStats();

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return (
      date.toLocaleDateString() +
      ' ' +
      date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    );
  };

  const formatDuration = (start: number, end?: number) => {
    if (!end) return 'Ongoing';
    const duration = Math.floor((end - start) / 1000);
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}m ${seconds}s`;
  };

  const renderBattleItem = ({
    item: battle,
    index,
  }: {
    item: (typeof battleHistory.battles)[0];
    index: number;
  }) => {
    const playerWon = battle.status === 'won';
    const statusColor = playerWon ? theme.colors.primary : theme.colors.error;
    const statusIcon = playerWon
      ? 'trophy'
      : battle.status === 'forfeit'
      ? 'flag'
      : 'close-circle';

    return (
      <Card style={styles.battleCard} mode="elevated">
        <Card.Content>
          <View style={styles.battleHeader}>
            <View style={styles.battleInfo}>
              <Text variant="titleMedium" style={styles.battleTitle}>
                Battle #{battleHistory.battles.length - index}
              </Text>
              <Text variant="bodySmall" style={styles.battleDate}>
                {formatDate(battle.createdAt)}
              </Text>
            </View>
            <View
              style={[styles.statusBadge, { backgroundColor: statusColor }]}
            >
              <IconButton icon={statusIcon} iconColor="#fff" size={20} />
              <Text style={styles.statusText}>
                {battle.status === 'won'
                  ? 'Victory'
                  : battle.status === 'forfeit'
                  ? 'Forfeit'
                  : 'Defeat'}
              </Text>
            </View>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.teamsContainer}>
            {/* Player Team */}
            <View style={styles.teamSection}>
              <Text variant="labelMedium" style={styles.teamLabel}>
                Your Team
              </Text>
              {battle.playerTeam.pokemon.slice(0, 3).map((pokemon, _idx) => (
                <View key={pokemon.id} style={styles.pokemonRow}>
                  <Text variant="bodySmall">
                    {pokemon.name.charAt(0).toUpperCase() +
                      pokemon.name.slice(1)}
                  </Text>
                  <Text
                    variant="bodySmall"
                    style={
                      pokemon.status === 'fainted'
                        ? styles.faintedText
                        : undefined
                    }
                  >
                    {pokemon.status === 'fainted'
                      ? 'Fainted'
                      : `${pokemon.currentHP}/${pokemon.maxHP} HP`}
                  </Text>
                </View>
              ))}
              {battle.playerTeam.pokemon.length > 3 && (
                <Text variant="bodySmall" style={styles.moreText}>
                  +{battle.playerTeam.pokemon.length - 3} more
                </Text>
              )}
            </View>

            {/* Opponent Team */}
            <View style={styles.teamSection}>
              <Text variant="labelMedium" style={styles.teamLabel}>
                Opponent Team
              </Text>
              {battle.opponentTeam.pokemon.slice(0, 3).map((pokemon, _idx) => (
                <View key={pokemon.id} style={styles.pokemonRow}>
                  <Text variant="bodySmall">
                    {pokemon.name.charAt(0).toUpperCase() +
                      pokemon.name.slice(1)}
                  </Text>
                  <Text
                    variant="bodySmall"
                    style={
                      pokemon.status === 'fainted'
                        ? styles.faintedText
                        : undefined
                    }
                  >
                    {pokemon.status === 'fainted'
                      ? 'Fainted'
                      : `${pokemon.currentHP}/${pokemon.maxHP} HP`}
                  </Text>
                </View>
              ))}
              {battle.opponentTeam.pokemon.length > 3 && (
                <Text variant="bodySmall" style={styles.moreText}>
                  +{battle.opponentTeam.pokemon.length - 3} more
                </Text>
              )}
            </View>
          </View>

          <View style={styles.battleStats}>
            <Text variant="bodySmall">Turns: {battle.turns.length}</Text>
            <Text variant="bodySmall">
              Duration: {formatDuration(battle.createdAt, battle.completedAt)}
            </Text>
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      {/* Stats Card */}
      <Card style={styles.statsCard} mode="elevated">
        <Card.Title title="Battle Statistics" />
        <Card.Content>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text
                variant="headlineMedium"
                style={[styles.statValue, { color: theme.colors.primary }]}
              >
                {stats.wins}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Wins
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text
                variant="headlineMedium"
                style={[styles.statValue, { color: theme.colors.error }]}
              >
                {stats.losses}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Losses
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="headlineMedium" style={styles.statValue}>
                {stats.winRate}%
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Win Rate
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Battle History List */}
      {battleHistory.battles.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text variant="titleMedium" style={styles.emptyText}>
            No battles yet
          </Text>
          <Text variant="bodyMedium" style={styles.emptySubtext}>
            Start a battle from your saved teams to see your battle history here
          </Text>
        </View>
      ) : (
        <FlatList
          data={[...battleHistory.battles].reverse()}
          renderItem={renderBattleItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  statsCard: {
    margin: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontWeight: 'bold',
  },
  statLabel: {
    marginTop: 4,
    opacity: 0.7,
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  battleCard: {
    marginBottom: 12,
  },
  battleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  battleInfo: {
    flex: 1,
  },
  battleTitle: {
    fontWeight: 'bold',
  },
  battleDate: {
    marginTop: 2,
    opacity: 0.7,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingRight: 12,
  },
  statusText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  divider: {
    marginBottom: 12,
  },
  teamsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  teamSection: {
    flex: 1,
  },
  teamLabel: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  pokemonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  faintedText: {
    opacity: 0.5,
    textDecorationLine: 'line-through',
  },
  moreText: {
    marginTop: 4,
    fontStyle: 'italic',
    opacity: 0.7,
  },
  battleStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  emptySubtext: {
    textAlign: 'center',
    opacity: 0.7,
  },
});
