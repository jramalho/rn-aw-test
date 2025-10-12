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
 * Team generation strategies
 */
export type TeamStrategy = 'random' | 'type-focused' | 'balanced' | 'offensive' | 'defensive' | 'legendary';
export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'expert';

export interface OpponentTrainer {
  name: string;
  title: string;
  strategy: TeamStrategy;
  difficulty: DifficultyLevel;
  teamSize: number;
}

/**
 * Predefined opponent trainers
 */
export const OPPONENT_TRAINERS: OpponentTrainer[] = [
  { name: 'Joey', title: 'Youngster', strategy: 'random', difficulty: 'easy', teamSize: 3 },
  { name: 'Misty', title: 'Gym Leader', strategy: 'type-focused', difficulty: 'medium', teamSize: 4 },
  { name: 'Brock', title: 'Gym Leader', strategy: 'type-focused', difficulty: 'medium', teamSize: 4 },
  { name: 'Lt. Surge', title: 'Gym Leader', strategy: 'type-focused', difficulty: 'medium', teamSize: 5 },
  { name: 'Sabrina', title: 'Gym Leader', strategy: 'type-focused', difficulty: 'hard', teamSize: 5 },
  { name: 'Blue', title: 'Rival', strategy: 'balanced', difficulty: 'hard', teamSize: 6 },
  { name: 'Lance', title: 'Champion', strategy: 'legendary', difficulty: 'expert', teamSize: 6 },
  { name: 'Red', title: 'Master Trainer', strategy: 'balanced', difficulty: 'expert', teamSize: 6 },
];

/**
 * Get Pokemon types for filtering
 */
function getPokemonTypes(pokemon: Pokemon): string[] {
  return pokemon.types.map(t => t.type.name);
}

/**
 * Calculate Pokemon power level based on base stats
 */
function getPokemonPowerLevel(pokemon: Pokemon): number {
  return pokemon.stats.reduce((sum, stat) => sum + stat.base_stat, 0);
}

/**
 * Generate a type-focused team
 */
function generateTypeFocusedTeam(allPokemon: Pokemon[], teamSize: number, difficulty: DifficultyLevel): Pokemon[] {
  // Pick a random type to focus on
  const availableTypes = ['fire', 'water', 'grass', 'electric', 'psychic', 'fighting', 'dragon', 'ghost'];
  const focusType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
  
  // Filter Pokemon of that type
  const typedPokemon = allPokemon.filter(p => 
    getPokemonTypes(p).includes(focusType)
  );
  
  // Sort by power level based on difficulty
  const sortedByPower = [...typedPokemon].sort((a, b) => {
    const powerA = getPokemonPowerLevel(a);
    const powerB = getPokemonPowerLevel(b);
    return difficulty === 'easy' ? powerA - powerB : powerB - powerA;
  });
  
  // Take appropriate number based on difficulty
  const startIndex = difficulty === 'easy' ? 0 : difficulty === 'medium' ? Math.floor(sortedByPower.length * 0.3) : Math.floor(sortedByPower.length * 0.5);
  return sortedByPower.slice(startIndex, startIndex + teamSize);
}

/**
 * Generate a balanced team with diverse types
 */
function generateBalancedTeam(allPokemon: Pokemon[], teamSize: number, difficulty: DifficultyLevel): Pokemon[] {
  const team: Pokemon[] = [];
  const usedTypes: string[] = [];
  
  // Sort by power level
  const sortedByPower = [...allPokemon].sort((a, b) => {
    const powerA = getPokemonPowerLevel(a);
    const powerB = getPokemonPowerLevel(b);
    return difficulty === 'easy' ? powerA - powerB : powerB - powerA;
  });
  
  // Select Pokemon with diverse types
  for (const pokemon of sortedByPower) {
    const types = getPokemonTypes(pokemon);
    const hasNewType = types.some(type => !usedTypes.includes(type));
    
    if (hasNewType || team.length === 0) {
      team.push(pokemon);
      types.forEach(type => {
        if (!usedTypes.includes(type)) {
          usedTypes.push(type);
        }
      });
      
      if (team.length >= teamSize) break;
    }
  }
  
  // Fill remaining slots if needed
  while (team.length < teamSize && team.length < sortedByPower.length) {
    const remaining = sortedByPower.filter(p => !team.includes(p));
    if (remaining.length > 0) {
      team.push(remaining[0]);
    } else {
      break;
    }
  }
  
  return team;
}

/**
 * Generate an offensive team (high attack stats)
 */
function generateOffensiveTeam(allPokemon: Pokemon[], teamSize: number, difficulty: DifficultyLevel): Pokemon[] {
  const sortedByOffense = [...allPokemon].sort((a, b) => {
    const attackA = a.stats.find(s => s.stat.name === 'attack')?.base_stat || 0;
    const spAttackA = a.stats.find(s => s.stat.name === 'special-attack')?.base_stat || 0;
    const totalOffenseA = attackA + spAttackA;
    
    const attackB = b.stats.find(s => s.stat.name === 'attack')?.base_stat || 0;
    const spAttackB = b.stats.find(s => s.stat.name === 'special-attack')?.base_stat || 0;
    const totalOffenseB = attackB + spAttackB;
    
    return totalOffenseB - totalOffenseA;
  });
  
  const startIndex = difficulty === 'easy' ? Math.floor(sortedByOffense.length * 0.7) : difficulty === 'medium' ? Math.floor(sortedByOffense.length * 0.4) : 0;
  return sortedByOffense.slice(startIndex, startIndex + teamSize);
}

/**
 * Generate a defensive team (high defense/HP stats)
 */
function generateDefensiveTeam(allPokemon: Pokemon[], teamSize: number, difficulty: DifficultyLevel): Pokemon[] {
  const sortedByDefense = [...allPokemon].sort((a, b) => {
    const hpA = a.stats.find(s => s.stat.name === 'hp')?.base_stat || 0;
    const defenseA = a.stats.find(s => s.stat.name === 'defense')?.base_stat || 0;
    const spDefenseA = a.stats.find(s => s.stat.name === 'special-defense')?.base_stat || 0;
    const totalDefenseA = hpA + defenseA + spDefenseA;
    
    const hpB = b.stats.find(s => s.stat.name === 'hp')?.base_stat || 0;
    const defenseB = b.stats.find(s => s.stat.name === 'defense')?.base_stat || 0;
    const spDefenseB = b.stats.find(s => s.stat.name === 'special-defense')?.base_stat || 0;
    const totalDefenseB = hpB + defenseB + spDefenseB;
    
    return totalDefenseB - totalDefenseA;
  });
  
  const startIndex = difficulty === 'easy' ? Math.floor(sortedByDefense.length * 0.7) : difficulty === 'medium' ? Math.floor(sortedByDefense.length * 0.4) : 0;
  return sortedByDefense.slice(startIndex, startIndex + teamSize);
}

/**
 * Generate a legendary/powerful team
 */
function generateLegendaryTeam(allPokemon: Pokemon[], teamSize: number, difficulty: DifficultyLevel): Pokemon[] {
  // Sort by total base stats (power level)
  const sortedByPower = [...allPokemon].sort((a, b) => {
    return getPokemonPowerLevel(b) - getPokemonPowerLevel(a);
  });
  
  // Take the most powerful Pokemon
  const powerThreshold = difficulty === 'expert' ? 0 : difficulty === 'hard' ? Math.floor(sortedByPower.length * 0.1) : Math.floor(sortedByPower.length * 0.2);
  return sortedByPower.slice(powerThreshold, powerThreshold + teamSize);
}

/**
 * Generate an AI opponent team with strategy
 */
export function generateOpponentTeam(
  allPokemon: Pokemon[], 
  teamSize: number = 6,
  strategy: TeamStrategy = 'random',
  difficulty: DifficultyLevel = 'medium'
): Pokemon[] {
  if (allPokemon.length === 0) return [];
  
  // Ensure teamSize doesn't exceed available Pokemon
  const actualTeamSize = Math.min(teamSize, allPokemon.length);
  
  switch (strategy) {
    case 'type-focused':
      return generateTypeFocusedTeam(allPokemon, actualTeamSize, difficulty);
    case 'balanced':
      return generateBalancedTeam(allPokemon, actualTeamSize, difficulty);
    case 'offensive':
      return generateOffensiveTeam(allPokemon, actualTeamSize, difficulty);
    case 'defensive':
      return generateDefensiveTeam(allPokemon, actualTeamSize, difficulty);
    case 'legendary':
      return generateLegendaryTeam(allPokemon, actualTeamSize, difficulty);
    case 'random':
    default:
      // Simple random selection for 'random' strategy
      const shuffled = [...allPokemon].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, actualTeamSize);
  }
}

/**
 * Generate opponent team from a trainer profile
 */
export function generateTrainerTeam(
  allPokemon: Pokemon[],
  trainer: OpponentTrainer
): Pokemon[] {
  return generateOpponentTeam(allPokemon, trainer.teamSize, trainer.strategy, trainer.difficulty);
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
