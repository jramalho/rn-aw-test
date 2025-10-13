import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { Text, Card, Chip,  } from '../components';
import { useTheme } from '../hooks';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { OPPONENT_TRAINERS, OpponentTrainer } from '../utils/battleUtils';

type OpponentSelectionScreenRouteProp = RouteProp<RootStackParamList, 'OpponentSelection'>;
type OpponentSelectionScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'OpponentSelection'>;

export default function OpponentSelectionScreen() {
  const navigation = useNavigation<OpponentSelectionScreenNavigationProp>();
  const route = useRoute<OpponentSelectionScreenRouteProp>();
  const theme = useTheme();
  const { teamId } = route.params;

  const handleTrainerSelect = (trainer: OpponentTrainer) => {
    navigation.navigate('Battle', { teamId, opponentTrainer: trainer });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return '#4caf50';
      case 'medium':
        return '#ff9800';
      case 'hard':
        return '#f44336';
      case 'expert':
        return '#9c27b0';
      default:
        return theme.colors.primary;
    }
  };

  const getStrategyIcon = (strategy: string) => {
    switch (strategy) {
      case 'random':
        return '🎲';
      case 'type-focused':
        return '⚡';
      case 'balanced':
        return '⚖️';
      case 'offensive':
        return '⚔️';
      case 'defensive':
        return '🛡️';
      case 'legendary':
        return '👑';
      default:
        return '🎮';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.headerTitle}>
          Choose Your Opponent
        </Text>
        <Text variant="bodyMedium" style={styles.headerSubtitle}>
          Select a trainer to battle against
        </Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {OPPONENT_TRAINERS.map((trainer, index) => (
          <Pressable
            key={index}
            onPress={() => handleTrainerSelect(trainer)}
            activeOpacity={0.7}
          >
            <Card style={styles.trainerCard} mode="elevated">
              <Card.Content>
                <View style={styles.trainerHeader}>
                  <View style={styles.trainerInfo}>
                    <Text variant="titleLarge" style={styles.trainerName}>
                      {trainer.name}
                    </Text>
                    <Text variant="bodyMedium" style={styles.trainerTitle}>
                      {trainer.title}
                    </Text>
                  </View>
                  <Text style={styles.strategyIcon}>
                    {getStrategyIcon(trainer.strategy)}
                  </Text>
                </View>

                <View style={styles.trainerDetails}>
                  <View style={styles.detailRow}>
                    <Text variant="bodySmall" style={styles.detailLabel}>
                      Team Size:
                    </Text>
                    <Text variant="bodySmall" style={styles.detailValue}>
                      {trainer.teamSize} Pokémon
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text variant="bodySmall" style={styles.detailLabel}>
                      Strategy:
                    </Text>
                    <Text variant="bodySmall" style={styles.detailValue}>
                      {trainer.strategy.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text variant="bodySmall" style={styles.detailLabel}>
                      Difficulty:
                    </Text>
                    <Chip
                      style={[styles.difficultyChip, { backgroundColor: getDifficultyColor(trainer.difficulty) }]}
                      textStyle={styles.difficultyText}
                    >
                      {trainer.difficulty.toUpperCase()}
                    </Chip>
                  </View>
                </View>
              </Card.Content>
            </Card>
          </Pressable>
        ))}

        <Pressable
          onPress={() => handleTrainerSelect({
            name: 'Random Trainer',
            title: 'Wild Trainer',
            strategy: 'random',
            difficulty: 'medium',
            teamSize: 6,
          })}
          activeOpacity={0.7}
        >
          <Card style={[styles.trainerCard, styles.randomCard]} mode="elevated">
            <Card.Content>
              <View style={styles.trainerHeader}>
                <View style={styles.trainerInfo}>
                  <Text variant="titleLarge" style={styles.trainerName}>
                    Random Trainer
                  </Text>
                  <Text variant="bodyMedium" style={styles.trainerTitle}>
                    Wild Trainer
                  </Text>
                </View>
                <Text style={styles.strategyIcon}>❓</Text>
              </View>
              <Text variant="bodySmall" style={styles.randomDescription}>
                Face a surprise opponent with a random team!
              </Text>
            </Card.Content>
          </Card>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#007AFF',
    paddingTop: 60,
  },
  headerTitle: {
    color: '#ffffff',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: '#e0e7ff',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  trainerCard: {
    marginBottom: 12,
  },
  randomCard: {
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
  },
  trainerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  trainerInfo: {
    flex: 1,
  },
  trainerName: {
    fontWeight: 'bold',
    marginBottom: 2,
  },
  trainerTitle: {
    opacity: 0.7,
  },
  strategyIcon: {
    fontSize: 40,
  },
  trainerDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    opacity: 0.7,
    fontWeight: '600',
  },
  detailValue: {
    fontWeight: '500',
  },
  difficultyChip: {
    height: 24,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
    marginVertical: 0,
    marginHorizontal: 8,
  },
  randomDescription: {
    marginTop: 8,
    fontStyle: 'italic',
    opacity: 0.8,
  },
});
