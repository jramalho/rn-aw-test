/**
 * Pokemon Battle System Utilities
 * Handles battle mechanics, type effectiveness, damage calculation, and AI
 */

import { Pokemon, BattlePokemon, BattleMove, BattleTeam } from '../types';

// Type effectiveness chart (simplified)
const TYPE_EFFECTIVENESS: Record<string, Record<string, number>> = {
  normal: { rock: 0.5, ghost: 0, steel: 0.5 },
  fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  grass: { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
  ice: { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
  poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  ground: { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
  flying: { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug: { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
  rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon: { dragon: 2, steel: 0.5, fairy: 0 },
  dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
  fairy: { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 },
};

/**
 * Calculate type effectiveness multiplier
 */
export function getTypeEffectiveness(attackType: string, defenderTypes: string[]): number {
  let multiplier = 1;

  for (const defenderType of defenderTypes) {
    const effectiveness = TYPE_EFFECTIVENESS[attackType]?.[defenderType];
    if (effectiveness !== undefined) {
      multiplier *= effectiveness;
    }
  }

  return multiplier;
}

/**
 * Get effectiveness message based on multiplier
 */
export function getEffectivenessMessage(multiplier: number): string {
  if (multiplier === 0) return "It doesn't affect the opponent!";
  if (multiplier < 1) return "It's not very effective...";
  if (multiplier > 1) return "It's super effective!";
  return '';
}

/**
 * Convert Pokemon to BattlePokemon
 */
export function pokemonToBattlePokemon(pokemon: Pokemon): BattlePokemon {
  const hpStat = pokemon.stats.find(s => s.stat.name === 'hp')?.base_stat || 100;
  
  return {
    ...pokemon,
    currentHP: hpStat,
    maxHP: hpStat,
    status: 'normal',
    statusTurns: 0,
  };
}

/**
 * Generate battle moves from Pokemon moves
 */
export function generateBattleMoves(pokemon: Pokemon): BattleMove[] {
  // Use the first 4 moves or generate basic moves
  const moves: BattleMove[] = [];
  
  // Get Pokemon's type-based moves
  const primaryType = pokemon.types[0]?.type.name || 'normal';
  const secondaryType = pokemon.types[1]?.type.name;

  // Create type-based moves
  const movesData: Array<{ name: string; type: string; power: number; accuracy: number; category: 'physical' | 'special' }> = [
    { name: `${capitalize(primaryType)} Strike`, type: primaryType, power: 80, accuracy: 100, category: 'physical' },
    { name: `${capitalize(primaryType)} Blast`, type: primaryType, power: 90, accuracy: 85, category: 'special' },
  ];

  if (secondaryType) {
    movesData.push({ name: `${capitalize(secondaryType)} Attack`, type: secondaryType, power: 75, accuracy: 95, category: 'physical' });
  }

  // Add a status move
  movesData.push({ name: 'Quick Attack', type: 'normal', power: 40, accuracy: 100, category: 'physical' });

  movesData.forEach(moveData => {
    moves.push({
      name: moveData.name,
      type: moveData.type,
      power: moveData.power,
      accuracy: moveData.accuracy,
      pp: 15,
      maxPP: 15,
      category: moveData.category,
    });
  });

  return moves.slice(0, 4);
}

/**
 * Calculate damage for an attack
 */
export function calculateDamage(
  attacker: BattlePokemon,
  defender: BattlePokemon,
  move: BattleMove
): number {
  // Get attacker's attack stat (physical or special)
  const attackStat = move.category === 'physical' 
    ? attacker.stats.find(s => s.stat.name === 'attack')?.base_stat || 50
    : attacker.stats.find(s => s.stat.name === 'special-attack')?.base_stat || 50;

  // Get defender's defense stat
  const defenseStat = move.category === 'physical'
    ? defender.stats.find(s => s.stat.name === 'defense')?.base_stat || 50
    : defender.stats.find(s => s.stat.name === 'special-defense')?.base_stat || 50;

  // Calculate type effectiveness
  const defenderTypes = defender.types.map(t => t.type.name);
  const effectiveness = getTypeEffectiveness(move.type, defenderTypes);

  // STAB (Same Type Attack Bonus)
  const attackerTypes = attacker.types.map(t => t.type.name);
  const stab = attackerTypes.includes(move.type) ? 1.5 : 1;

  // Damage formula (simplified Pokemon damage calculation)
  const level = 50; // Assume level 50 for all Pokemon
  const baseDamage = ((2 * level / 5 + 2) * move.power * attackStat / defenseStat) / 50 + 2;
  
  // Apply modifiers
  const damage = Math.floor(baseDamage * stab * effectiveness * (Math.random() * 0.15 + 0.85));

  return Math.max(1, damage);
}

/**
 * Generate an AI opponent team
 */
export function generateOpponentTeam(allPokemon: Pokemon[], teamSize: number = 6): Pokemon[] {
  // Get a random selection of Pokemon
  const shuffled = [...allPokemon].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(teamSize, shuffled.length));
}

/**
 * AI decision making for battle
 */
export function getAIAction(
  aiTeam: BattleTeam,
  playerTeam: BattleTeam
): { moveIndex: number; shouldSwitch: boolean; switchToIndex?: number } {
  const aiPokemon = aiTeam.pokemon[aiTeam.activePokemonIndex];
  const playerPokemon = playerTeam.pokemon[playerTeam.activePokemonIndex];

  // If AI pokemon is low on HP and has a healthy replacement, switch
  const hpPercentage = aiPokemon.currentHP / aiPokemon.maxHP;
  if (hpPercentage < 0.3) {
    const healthyPokemonIndex = aiTeam.pokemon.findIndex(
      (p, i) => i !== aiTeam.activePokemonIndex && p.status !== 'fainted' && p.currentHP / p.maxHP > 0.5
    );
    
    if (healthyPokemonIndex !== -1) {
      return { moveIndex: 0, shouldSwitch: true, switchToIndex: healthyPokemonIndex };
    }
  }

  // Otherwise, choose best move based on type effectiveness
  const moves = generateBattleMoves(aiPokemon);
  const playerTypes = playerPokemon.types.map(t => t.type.name);
  
  let bestMoveIndex = 0;
  let bestEffectiveness = 0;

  moves.forEach((move, index) => {
    const effectiveness = getTypeEffectiveness(move.type, playerTypes);
    if (effectiveness > bestEffectiveness) {
      bestEffectiveness = effectiveness;
      bestMoveIndex = index;
    }
  });

  return { moveIndex: bestMoveIndex, shouldSwitch: false };
}

/**
 * Check if battle is over
 */
export function isBattleOver(playerTeam: BattleTeam, opponentTeam: BattleTeam): 'player' | 'opponent' | null {
  const playerAlive = playerTeam.pokemon.some(p => p.status !== 'fainted');
  const opponentAlive = opponentTeam.pokemon.some(p => p.status !== 'fainted');

  if (!playerAlive) return 'opponent';
  if (!opponentAlive) return 'player';
  return null;
}

/**
 * Helper: Capitalize first letter
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
