import {
  getTypeEffectiveness,
  getEffectivenessMessage,
  pokemonToBattlePokemon,
  generateBattleMoves,
  calculateDamage,
  generateOpponentTeam,
  isBattleOver,
} from '../battleUtils';
import { Pokemon, BattlePokemon, BattleTeam } from '../../types';

// Mock Pokemon data
const mockPokemon: Pokemon = {
  id: 25,
  name: 'pikachu',
  base_experience: 112,
  height: 4,
  weight: 60,
  order: 35,
  is_default: true,
  abilities: [],
  forms: [],
  game_indices: [],
  held_items: [],
  location_area_encounters: '',
  moves: [],
  sprites: {
    front_default: 'sprite.png',
    front_shiny: null,
    front_female: null,
    front_shiny_female: null,
    back_default: null,
    back_shiny: null,
    back_female: null,
    back_shiny_female: null,
    other: {
      'official-artwork': {
        front_default: 'artwork.png',
      },
    },
  },
  cries: {
    latest: '',
    legacy: '',
  },
  species: { name: 'pikachu', url: '' },
  stats: [
    { base_stat: 35, effort: 0, stat: { name: 'hp', url: '' } },
    { base_stat: 55, effort: 0, stat: { name: 'attack', url: '' } },
    { base_stat: 40, effort: 0, stat: { name: 'defense', url: '' } },
    { base_stat: 50, effort: 0, stat: { name: 'special-attack', url: '' } },
    { base_stat: 50, effort: 0, stat: { name: 'special-defense', url: '' } },
    { base_stat: 90, effort: 0, stat: { name: 'speed', url: '' } },
  ],
  types: [{ slot: 1, type: { name: 'electric', url: '' } }],
};

describe('battleUtils', () => {
  describe('getTypeEffectiveness', () => {
    it('should return super effective multiplier', () => {
      expect(getTypeEffectiveness('water', ['fire'])).toBe(2);
    });

    it('should return not very effective multiplier', () => {
      expect(getTypeEffectiveness('water', ['grass'])).toBe(0.5);
    });

    it('should return no effect multiplier', () => {
      expect(getTypeEffectiveness('electric', ['ground'])).toBe(0);
    });

    it('should return neutral multiplier', () => {
      expect(getTypeEffectiveness('water', ['normal'])).toBe(1);
    });

    it('should handle multiple types', () => {
      // Water is super effective against both Ground and Rock
      expect(getTypeEffectiveness('water', ['ground', 'rock'])).toBe(4);
    });
  });

  describe('getEffectivenessMessage', () => {
    it('should return no effect message', () => {
      expect(getEffectivenessMessage(0)).toBe("It doesn't affect the opponent!");
    });

    it('should return not very effective message', () => {
      expect(getEffectivenessMessage(0.5)).toBe("It's not very effective...");
    });

    it('should return super effective message', () => {
      expect(getEffectivenessMessage(2)).toBe("It's super effective!");
    });

    it('should return empty string for neutral', () => {
      expect(getEffectivenessMessage(1)).toBe('');
    });
  });

  describe('pokemonToBattlePokemon', () => {
    it('should convert Pokemon to BattlePokemon', () => {
      const battlePokemon = pokemonToBattlePokemon(mockPokemon);

      expect(battlePokemon.id).toBe(mockPokemon.id);
      expect(battlePokemon.name).toBe(mockPokemon.name);
      expect(battlePokemon.currentHP).toBe(35);
      expect(battlePokemon.maxHP).toBe(35);
      expect(battlePokemon.status).toBe('normal');
      expect(battlePokemon.statusTurns).toBe(0);
    });

    it('should use default HP if stat not found', () => {
      const pokemonWithoutHP = { ...mockPokemon, stats: [] };
      const battlePokemon = pokemonToBattlePokemon(pokemonWithoutHP);

      expect(battlePokemon.currentHP).toBe(100);
      expect(battlePokemon.maxHP).toBe(100);
    });
  });

  describe('generateBattleMoves', () => {
    it('should generate battle moves for Pokemon', () => {
      const moves = generateBattleMoves(mockPokemon);

      expect(moves).toHaveLength(4);
      expect(moves[0].type).toBe('electric');
      expect(moves[0].pp).toBe(15);
      expect(moves[0].maxPP).toBe(15);
    });

    it('should include secondary type move if available', () => {
      const dualTypePokemon = {
        ...mockPokemon,
        types: [
          { slot: 1, type: { name: 'electric', url: '' } },
          { slot: 2, type: { name: 'flying', url: '' } },
        ],
      };

      const moves = generateBattleMoves(dualTypePokemon);
      const flyingMove = moves.find(m => m.type === 'flying');

      expect(flyingMove).toBeDefined();
    });
  });

  describe('calculateDamage', () => {
    let attacker: BattlePokemon;
    let defender: BattlePokemon;

    beforeEach(() => {
      attacker = pokemonToBattlePokemon(mockPokemon);
      defender = pokemonToBattlePokemon({
        ...mockPokemon,
        id: 1,
        types: [{ slot: 1, type: { name: 'water', url: '' } }],
      });
    });

    it('should calculate damage', () => {
      const move = {
        name: 'Thunder Shock',
        type: 'electric',
        power: 40,
        accuracy: 100,
        pp: 15,
        maxPP: 15,
        category: 'special' as const,
      };

      const damage = calculateDamage(attacker, defender, move);

      expect(damage).toBeGreaterThan(0);
      expect(damage).toBeLessThanOrEqual(defender.maxHP);
    });

    it('should apply type effectiveness', () => {
      const electricMove = {
        name: 'Thunder Shock',
        type: 'electric',
        power: 40,
        accuracy: 100,
        pp: 15,
        maxPP: 15,
        category: 'special' as const,
      };

      const damage = calculateDamage(attacker, defender, electricMove);

      // Electric is super effective against water
      expect(damage).toBeGreaterThan(20);
    });

    it('should apply STAB bonus', () => {
      const electricMove = {
        name: 'Thunder Shock',
        type: 'electric',
        power: 40,
        accuracy: 100,
        pp: 15,
        maxPP: 15,
        category: 'special' as const,
      };

      const nonElectricDefender = pokemonToBattlePokemon({
        ...mockPokemon,
        id: 1,
        types: [{ slot: 1, type: { name: 'normal', url: '' } }],
      });

      const damage = calculateDamage(attacker, nonElectricDefender, electricMove);

      // STAB should increase damage
      expect(damage).toBeGreaterThan(0);
    });
  });

  describe('generateOpponentTeam', () => {
    it('should generate opponent team with specified size', () => {
      const allPokemon = [mockPokemon, { ...mockPokemon, id: 2 }, { ...mockPokemon, id: 3 }];
      const opponentTeam = generateOpponentTeam(allPokemon, 2);

      expect(opponentTeam).toHaveLength(2);
    });

    it('should not exceed available Pokemon', () => {
      const allPokemon = [mockPokemon, { ...mockPokemon, id: 2 }];
      const opponentTeam = generateOpponentTeam(allPokemon, 10);

      expect(opponentTeam).toHaveLength(2);
    });
  });

  describe('isBattleOver', () => {
    let playerTeam: BattleTeam;
    let opponentTeam: BattleTeam;

    beforeEach(() => {
      playerTeam = {
        pokemon: [pokemonToBattlePokemon(mockPokemon)],
        activePokemonIndex: 0,
      };

      opponentTeam = {
        pokemon: [pokemonToBattlePokemon({ ...mockPokemon, id: 2 })],
        activePokemonIndex: 0,
      };
    });

    it('should return null when both teams have Pokemon alive', () => {
      expect(isBattleOver(playerTeam, opponentTeam)).toBeNull();
    });

    it('should return opponent winner when player team fainted', () => {
      playerTeam.pokemon[0].status = 'fainted';
      expect(isBattleOver(playerTeam, opponentTeam)).toBe('opponent');
    });

    it('should return player winner when opponent team fainted', () => {
      opponentTeam.pokemon[0].status = 'fainted';
      expect(isBattleOver(playerTeam, opponentTeam)).toBe('player');
    });
  });
});
