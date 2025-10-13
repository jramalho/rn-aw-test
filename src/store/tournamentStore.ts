/**
 * Tournament Store
 * Manages tournament state using Zustand with persistence
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Tournament,
  TournamentStatus,
  TournamentFormat,
  TournamentParticipant,
  TournamentMatch,
  TournamentRound,
  TournamentHistory,
  Pokemon,
  Battle,
} from '../types';
import { generateTrainerTeam, OPPONENT_TRAINERS } from '../utils/battleUtils';

interface TournamentState {
  currentTournament: Tournament | null;
  tournamentHistory: TournamentHistory;
  isProcessing: boolean;

  // Actions
  createTournament: (
    name: string,
    format: TournamentFormat,
    playerTeam: Pokemon[],
    participantCount: number,
    pokemonList: Pokemon[]
  ) => void;
  startTournament: () => void;
  advanceTournament: (matchId: string, battle: Battle) => void;
  cancelTournament: () => void;
  clearCurrentTournament: () => void;
  getTournamentStats: () => { wins: number; totalTournaments: number; winRate: number };
}

/**
 * Generate AI participants for the tournament
 */
function generateAIParticipants(
  count: number,
  pokemonList: Pokemon[]
): TournamentParticipant[] {
  const participants: TournamentParticipant[] = [];
  const usedTrainers = new Set<string>();

  for (let i = 0; i < count; i++) {
    // Select a unique trainer
    let trainer = OPPONENT_TRAINERS[Math.floor(Math.random() * OPPONENT_TRAINERS.length)];
    while (usedTrainers.has(trainer.name) && usedTrainers.size < OPPONENT_TRAINERS.length) {
      trainer = OPPONENT_TRAINERS[Math.floor(Math.random() * OPPONENT_TRAINERS.length)];
    }
    usedTrainers.add(trainer.name);

    const team = generateTrainerTeam(pokemonList, trainer);

    participants.push({
      id: `ai_${i}_${Date.now()}`,
      name: trainer.name,
      team,
      isPlayer: false,
      wins: 0,
      losses: 0,
      eliminated: false,
    });
  }

  return participants;
}

/**
 * Create bracket structure for single elimination tournament
 */
function createSingleEliminationBracket(
  participants: TournamentParticipant[]
): TournamentRound[] {
  const rounds: TournamentRound[] = [];
  let currentParticipants = [...participants];
  let roundNumber = 1;

  // Create rounds until we have a winner
  while (currentParticipants.length > 1) {
    const matches: TournamentMatch[] = [];
    const matchesInRound = Math.ceil(currentParticipants.length / 2);

    for (let i = 0; i < matchesInRound; i++) {
      const participant1 = currentParticipants[i * 2];
      const participant2 = currentParticipants[i * 2 + 1];

      matches.push({
        id: `match_r${roundNumber}_m${i + 1}`,
        roundNumber,
        matchNumber: i + 1,
        participant1,
        participant2: participant2 || undefined, // Bye if odd number
        status: 'pending',
      });
    }

    rounds.push({
      roundNumber,
      matches,
      status: 'pending',
    });

    // Prepare for next round (half the participants)
    currentParticipants = Array(matchesInRound).fill(null);
    roundNumber++;
  }

  return rounds;
}

/**
 * Simulate AI vs AI match
 */
function simulateAIMatch(participant1: TournamentParticipant, participant2: TournamentParticipant): TournamentParticipant {
  // Simple simulation based on team stats
  const getTeamPower = (team: Pokemon[]) => {
    return team.reduce((sum, p) => {
      const totalStats = p.stats.reduce((s, stat) => s + stat.base_stat, 0);
      return sum + totalStats;
    }, 0);
  };

  const power1 = getTeamPower(participant1.team);
  const power2 = getTeamPower(participant2.team);
  
  // Add some randomness (80% power, 20% luck)
  const score1 = power1 * 0.8 + Math.random() * power1 * 0.2;
  const score2 = power2 * 0.8 + Math.random() * power2 * 0.2;

  return score1 > score2 ? participant1 : participant2;
}

export const useTournamentStore = create<TournamentState>()(
  persist(
    (set, get) => ({
      currentTournament: null,
      tournamentHistory: {
        tournaments: [],
        wins: 0,
        totalTournaments: 0,
      },
      isProcessing: false,

      createTournament: (
        name: string,
        format: TournamentFormat,
        playerTeam: Pokemon[],
        participantCount: number,
        pokemonList: Pokemon[]
      ) => {
        const tournamentId = `tournament_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Create player participant
        const playerParticipant: TournamentParticipant = {
          id: 'player',
          name: 'You',
          team: playerTeam,
          isPlayer: true,
          wins: 0,
          losses: 0,
          eliminated: false,
        };

        // Generate AI participants
        const aiParticipants = generateAIParticipants(participantCount - 1, pokemonList);
        
        // Combine and shuffle participants
        const allParticipants = [playerParticipant, ...aiParticipants]
          .sort(() => Math.random() - 0.5);

        // Create bracket based on format
        let rounds: TournamentRound[] = [];
        if (format === TournamentFormat.SINGLE_ELIMINATION) {
          rounds = createSingleEliminationBracket(allParticipants);
        }

        const tournament: Tournament = {
          id: tournamentId,
          name,
          format,
          status: TournamentStatus.REGISTRATION,
          participants: allParticipants,
          rounds,
          currentRound: 0,
          createdAt: Date.now(),
        };

        set({ currentTournament: tournament });
      },

      startTournament: () => {
        const { currentTournament } = get();
        if (!currentTournament || currentTournament.status !== TournamentStatus.REGISTRATION) {
          return;
        }

        // Update tournament status and start first round
        const updatedTournament: Tournament = {
          ...currentTournament,
          status: TournamentStatus.IN_PROGRESS,
          startedAt: Date.now(),
          currentRound: 1,
          rounds: currentTournament.rounds.map((round, index) => 
            index === 0 
              ? { ...round, status: 'in_progress' }
              : round
          ),
        };

        // Simulate AI vs AI matches in the first round
        const firstRound = updatedTournament.rounds[0];
        const updatedMatches = firstRound.matches.map(match => {
          // If player is not in this match, simulate it
          if (
            match.participant1 &&
            match.participant2 &&
            !match.participant1.isPlayer &&
            !match.participant2.isPlayer
          ) {
            const winner = simulateAIMatch(match.participant1, match.participant2);
            return {
              ...match,
              winner,
              status: 'completed' as const,
            };
          }
          return match;
        });

        updatedTournament.rounds[0] = {
          ...firstRound,
          matches: updatedMatches,
        };

        set({ currentTournament: updatedTournament });
      },

      advanceTournament: (matchId: string, battle: Battle) => {
        const { currentTournament, tournamentHistory } = get();
        if (!currentTournament) return;

        set({ isProcessing: true });

        try {
          // Find the match and update it
          const currentRoundIndex = currentTournament.currentRound - 1;
          const currentRound = currentTournament.rounds[currentRoundIndex];
          const matchIndex = currentRound.matches.findIndex(m => m.id === matchId);
          
          if (matchIndex === -1) {
            console.error('Match not found');
            return;
          }

          const match = currentRound.matches[matchIndex];
          
          // Determine winner from battle
          const winner = battle.status === 'won' ? match.participant1! : match.participant2!;
          const loser = battle.status === 'won' ? match.participant2! : match.participant1!;

          // Update participants
          winner.wins++;
          loser.losses++;
          loser.eliminated = true;

          // Update match
          const updatedMatch: TournamentMatch = {
            ...match,
            battle,
            winner,
            status: 'completed',
          };

          // Update current round
          const updatedMatches = [...currentRound.matches];
          updatedMatches[matchIndex] = updatedMatch;

          const allMatchesComplete = updatedMatches.every(m => m.status === 'completed');
          
          const updatedRound: TournamentRound = {
            ...currentRound,
            matches: updatedMatches,
            status: allMatchesComplete ? 'completed' : 'in_progress',
          };

          const updatedRounds = [...currentTournament.rounds];
          updatedRounds[currentRoundIndex] = updatedRound;

          // Check if tournament is complete
          const isLastRound = currentRoundIndex === currentTournament.rounds.length - 1;
          let tournamentComplete = false;
          let tournamentWinner: TournamentParticipant | undefined;

          if (allMatchesComplete) {
            if (isLastRound) {
              // Tournament complete!
              tournamentComplete = true;
              tournamentWinner = winner;
            } else {
              // Advance to next round
              const nextRoundIndex = currentRoundIndex + 1;
              const nextRound = updatedRounds[nextRoundIndex];
              
              // Populate next round matches with winners
              const winners = updatedMatches
                .map(m => m.winner)
                .filter((w): w is TournamentParticipant => w !== undefined);

              const nextRoundMatches = nextRound.matches.map((m, i) => ({
                ...m,
                participant1: winners[i * 2],
                participant2: winners[i * 2 + 1],
              }));

              // Simulate AI vs AI matches in next round
              const simulatedMatches = nextRoundMatches.map(m => {
                if (
                  m.participant1 &&
                  m.participant2 &&
                  !m.participant1.isPlayer &&
                  !m.participant2.isPlayer
                ) {
                  const matchWinner = simulateAIMatch(m.participant1, m.participant2);
                  return {
                    ...m,
                    winner: matchWinner,
                    status: 'completed' as const,
                  };
                }
                return m;
              });

              updatedRounds[nextRoundIndex] = {
                ...nextRound,
                matches: simulatedMatches,
                status: 'in_progress',
              };
            }
          }

          const updatedTournament: Tournament = {
            ...currentTournament,
            rounds: updatedRounds,
            currentRound: allMatchesComplete && !isLastRound 
              ? currentTournament.currentRound + 1 
              : currentTournament.currentRound,
            status: tournamentComplete ? TournamentStatus.COMPLETED : TournamentStatus.IN_PROGRESS,
            winner: tournamentWinner,
            completedAt: tournamentComplete ? Date.now() : undefined,
          };

          set({ currentTournament: updatedTournament });

          // If tournament complete, update history
          if (tournamentComplete) {
            set({
              tournamentHistory: {
                tournaments: [...tournamentHistory.tournaments, updatedTournament],
                wins: tournamentWinner?.isPlayer ? tournamentHistory.wins + 1 : tournamentHistory.wins,
                totalTournaments: tournamentHistory.totalTournaments + 1,
              },
            });
          }
        } finally {
          set({ isProcessing: false });
        }
      },

      cancelTournament: () => {
        const { currentTournament, tournamentHistory } = get();
        if (!currentTournament) return;

        const cancelledTournament: Tournament = {
          ...currentTournament,
          status: TournamentStatus.CANCELLED,
          completedAt: Date.now(),
        };

        set({
          currentTournament: null,
          tournamentHistory: {
            tournaments: [...tournamentHistory.tournaments, cancelledTournament],
            wins: tournamentHistory.wins,
            totalTournaments: tournamentHistory.totalTournaments,
          },
        });
      },

      clearCurrentTournament: () => {
        set({ currentTournament: null });
      },

      getTournamentStats: () => {
        const { tournamentHistory } = get();
        const winRate = tournamentHistory.totalTournaments > 0
          ? (tournamentHistory.wins / tournamentHistory.totalTournaments) * 100
          : 0;

        return {
          wins: tournamentHistory.wins,
          totalTournaments: tournamentHistory.totalTournaments,
          winRate: Math.round(winRate * 10) / 10,
        };
      },
    }),
    {
      name: 'tournament-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        tournamentHistory: state.tournamentHistory,
      }),
    }
  )
);
