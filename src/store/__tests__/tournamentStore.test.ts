/**
 * Tournament Store Tests
 */

import { renderHook, act } from '@testing-library/react-native';
import { useTournamentStore } from '../tournamentStore';
import { TournamentFormat, Pokemon } from '../../types';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock battle utils
jest.mock('../../utils/battleUtils', () => ({
  generateTrainerTeam: jest.fn((pokemonList, trainer) => {
    // Return mock team based on trainer team size
    return pokemonList.slice(0, trainer.teamSize);
  }),
  OPPONENT_TRAINERS: [
    {
      name: 'Trainer 1',
      title: 'Test Trainer',
      strategy: 'balanced',
      difficulty: 'medium',
      teamSize: 3,
    },
    {
      name: 'Trainer 2',
      title: 'Test Trainer',
      strategy: 'balanced',
      difficulty: 'medium',
      teamSize: 3,
    },
  ],
}));

const createMockPokemon = (id: number): Pokemon => ({
  id,
  name: `Pokemon${id}`,
  base_experience: 100,
  height: 10,
  weight: 100,
  order: id,
  is_default: true,
  abilities: [],
  forms: [],
  game_indices: [],
  held_items: [],
  location_area_encounters: '',
  moves: [],
  sprites: {
    front_default: null,
    front_shiny: null,
    front_female: null,
    front_shiny_female: null,
    back_default: null,
    back_shiny: null,
    back_female: null,
    back_shiny_female: null,
    other: {},
    versions: {},
  },
  cries: {
    latest: '',
    legacy: '',
  },
  species: { name: `pokemon${id}`, url: '' },
  stats: [
    { base_stat: 50, effort: 0, stat: { name: 'hp', url: '' } },
    { base_stat: 50, effort: 0, stat: { name: 'attack', url: '' } },
    { base_stat: 50, effort: 0, stat: { name: 'defense', url: '' } },
    { base_stat: 50, effort: 0, stat: { name: 'special-attack', url: '' } },
    { base_stat: 50, effort: 0, stat: { name: 'special-defense', url: '' } },
    { base_stat: 50, effort: 0, stat: { name: 'speed', url: '' } },
  ],
  types: [
    { slot: 1, type: { name: 'normal', url: '' } },
  ],
});

describe('useTournamentStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    const { result } = renderHook(() => useTournamentStore());
    act(() => {
      result.current.clearCurrentTournament();
    });
  });

  describe('Tournament Creation', () => {
    it('should create a tournament with correct initial state', () => {
      const { result } = renderHook(() => useTournamentStore());
      const playerTeam = [createMockPokemon(1), createMockPokemon(2), createMockPokemon(3)];
      const pokemonList = Array.from({ length: 20 }, (_, i) => createMockPokemon(i + 1));

      act(() => {
        result.current.createTournament(
          'Test Tournament',
          TournamentFormat.SINGLE_ELIMINATION,
          playerTeam,
          4,
          pokemonList
        );
      });

      expect(result.current.currentTournament).toBeDefined();
      expect(result.current.currentTournament?.name).toBe('Test Tournament');
      expect(result.current.currentTournament?.format).toBe(TournamentFormat.SINGLE_ELIMINATION);
      expect(result.current.currentTournament?.participants).toHaveLength(4);
      expect(result.current.currentTournament?.status).toBe('registration');
    });

    it('should create correct bracket structure for 4 participants', () => {
      const { result } = renderHook(() => useTournamentStore());
      const playerTeam = [createMockPokemon(1)];
      const pokemonList = Array.from({ length: 20 }, (_, i) => createMockPokemon(i + 1));

      act(() => {
        result.current.createTournament(
          'Test Tournament',
          TournamentFormat.SINGLE_ELIMINATION,
          playerTeam,
          4,
          pokemonList
        );
      });

      // 4 participants should create 2 rounds (semi-final and final)
      expect(result.current.currentTournament?.rounds).toHaveLength(2);
      expect(result.current.currentTournament?.rounds[0].matches).toHaveLength(2);
      expect(result.current.currentTournament?.rounds[1].matches).toHaveLength(1);
    });

    it('should include player participant', () => {
      const { result } = renderHook(() => useTournamentStore());
      const playerTeam = [createMockPokemon(1)];
      const pokemonList = Array.from({ length: 20 }, (_, i) => createMockPokemon(i + 1));

      act(() => {
        result.current.createTournament(
          'Test Tournament',
          TournamentFormat.SINGLE_ELIMINATION,
          playerTeam,
          4,
          pokemonList
        );
      });

      const playerParticipant = result.current.currentTournament?.participants.find(
        p => p.isPlayer
      );
      expect(playerParticipant).toBeDefined();
      expect(playerParticipant?.name).toBe('You');
      expect(playerParticipant?.team).toEqual(playerTeam);
    });
  });

  describe('Tournament Progression', () => {
    it('should start tournament and change status', () => {
      const { result } = renderHook(() => useTournamentStore());
      const playerTeam = [createMockPokemon(1)];
      const pokemonList = Array.from({ length: 20 }, (_, i) => createMockPokemon(i + 1));

      act(() => {
        result.current.createTournament(
          'Test Tournament',
          TournamentFormat.SINGLE_ELIMINATION,
          playerTeam,
          4,
          pokemonList
        );
      });

      act(() => {
        result.current.startTournament();
      });

      expect(result.current.currentTournament?.status).toBe('in_progress');
      expect(result.current.currentTournament?.currentRound).toBe(1);
      expect(result.current.currentTournament?.startedAt).toBeDefined();
    });

    it('should simulate AI vs AI matches on tournament start', () => {
      const { result } = renderHook(() => useTournamentStore());
      const playerTeam = [createMockPokemon(1)];
      const pokemonList = Array.from({ length: 20 }, (_, i) => createMockPokemon(i + 1));

      act(() => {
        result.current.createTournament(
          'Test Tournament',
          TournamentFormat.SINGLE_ELIMINATION,
          playerTeam,
          4,
          pokemonList
        );
      });

      act(() => {
        result.current.startTournament();
      });

      // Check if non-player matches were simulated
      const firstRound = result.current.currentTournament?.rounds[0];
      const aiMatches = firstRound?.matches.filter(
        m => m.participant1 && m.participant2 && !m.participant1.isPlayer && !m.participant2.isPlayer
      );

      aiMatches?.forEach(match => {
        expect(match.status).toBe('completed');
        expect(match.winner).toBeDefined();
      });
    });
  });

  describe('Tournament Statistics', () => {
    it('should calculate tournament stats correctly', () => {
      const { result } = renderHook(() => useTournamentStore());

      const stats = result.current.getTournamentStats();
      expect(stats).toHaveProperty('wins');
      expect(stats).toHaveProperty('totalTournaments');
      expect(stats).toHaveProperty('winRate');
    });

    it('should return 0 win rate for no tournaments', () => {
      const { result } = renderHook(() => useTournamentStore());

      const stats = result.current.getTournamentStats();
      expect(stats.wins).toBe(0);
      expect(stats.totalTournaments).toBe(0);
      expect(stats.winRate).toBe(0);
    });
  });

  describe('Tournament Cancellation', () => {
    it('should cancel tournament and clear current', () => {
      const { result } = renderHook(() => useTournamentStore());
      const playerTeam = [createMockPokemon(1)];
      const pokemonList = Array.from({ length: 20 }, (_, i) => createMockPokemon(i + 1));

      act(() => {
        result.current.createTournament(
          'Test Tournament',
          TournamentFormat.SINGLE_ELIMINATION,
          playerTeam,
          4,
          pokemonList
        );
      });

      act(() => {
        result.current.cancelTournament();
      });

      expect(result.current.currentTournament).toBeNull();
    });
  });

  describe('Tournament State Management', () => {
    it('should clear current tournament', () => {
      const { result } = renderHook(() => useTournamentStore());
      const playerTeam = [createMockPokemon(1)];
      const pokemonList = Array.from({ length: 20 }, (_, i) => createMockPokemon(i + 1));

      act(() => {
        result.current.createTournament(
          'Test Tournament',
          TournamentFormat.SINGLE_ELIMINATION,
          playerTeam,
          4,
          pokemonList
        );
      });

      expect(result.current.currentTournament).not.toBeNull();

      act(() => {
        result.current.clearCurrentTournament();
      });

      expect(result.current.currentTournament).toBeNull();
    });
  });
});
