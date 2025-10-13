/**
 * Tournament Types
 * Defines tournament structure for Pokemon group battles
 */

import { Pokemon, Battle } from './index';

export enum TournamentStatus {
  REGISTRATION = 'registration',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum TournamentFormat {
  SINGLE_ELIMINATION = 'single_elimination',
  DOUBLE_ELIMINATION = 'double_elimination',
  ROUND_ROBIN = 'round_robin',
}

export interface TournamentParticipant {
  id: string;
  name: string;
  team: Pokemon[];
  isPlayer: boolean;
  wins: number;
  losses: number;
  eliminated: boolean;
}

export interface TournamentMatch {
  id: string;
  roundNumber: number;
  matchNumber: number;
  participant1?: TournamentParticipant;
  participant2?: TournamentParticipant;
  winner?: TournamentParticipant;
  battle?: Battle;
  status: 'pending' | 'in_progress' | 'completed';
  nextMatchId?: string; // For bracket progression
}

export interface TournamentRound {
  roundNumber: number;
  matches: TournamentMatch[];
  status: 'pending' | 'in_progress' | 'completed';
}

export interface Tournament {
  id: string;
  name: string;
  format: TournamentFormat;
  status: TournamentStatus;
  participants: TournamentParticipant[];
  rounds: TournamentRound[];
  currentRound: number;
  winner?: TournamentParticipant;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
}

export interface TournamentHistory {
  tournaments: Tournament[];
  wins: number;
  totalTournaments: number;
}
