import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Battle,
  BattleTeam,
  BattlePokemon,
  BattleAction,
  BattleEvent,
  BattleTurn,
  BattleHistory,
  Pokemon,
} from '../types';
import {
  pokemonToBattlePokemon,
  generateBattleMoves,
  calculateDamage,
  getTypeEffectiveness,
  getEffectivenessMessage,
  isBattleOver,
  getAIAction,
} from '../utils/battleUtils';

interface BattleState {
  currentBattle: Battle | null;
  battleHistory: BattleHistory;
  isProcessingTurn: boolean;

  // Actions
  startBattle: (playerPokemon: Pokemon[], opponentPokemon: Pokemon[]) => void;
  executePlayerAction: (action: BattleAction) => Promise<void>;
  switchPokemon: (pokemonIndex: number, team: 'player' | 'opponent') => void;
  forfeitBattle: () => void;
  endBattle: () => void;
  clearCurrentBattle: () => void;
  getBattleStats: () => { wins: number; losses: number; winRate: number };
}

export const useBattleStore = create<BattleState>()(
  persist(
    (set, get) => ({
      currentBattle: null,
      battleHistory: {
        battles: [],
        wins: 0,
        losses: 0,
        totalBattles: 0,
      },
      isProcessingTurn: false,

      startBattle: (playerPokemon: Pokemon[], opponentPokemon: Pokemon[]) => {
        const battleId = `battle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Convert to battle pokemon
        const playerTeam: BattleTeam = {
          pokemon: playerPokemon.map(pokemonToBattlePokemon),
          activePokemonIndex: 0,
        };

        const opponentTeam: BattleTeam = {
          pokemon: opponentPokemon.map(pokemonToBattlePokemon),
          activePokemonIndex: 0,
        };

        const battle: Battle = {
          id: battleId,
          playerTeam,
          opponentTeam,
          turns: [],
          status: 'ongoing',
          createdAt: Date.now(),
        };

        set({ currentBattle: battle });
      },

      executePlayerAction: async (action: BattleAction) => {
        const { currentBattle, isProcessingTurn } = get();
        
        if (!currentBattle || isProcessingTurn || currentBattle.status !== 'ongoing') {
          return;
        }

        set({ isProcessingTurn: true });

        try {
          // Get AI action
          const aiAction = getAIAction(currentBattle.opponentTeam, currentBattle.playerTeam);
          const opponentAction: BattleAction = aiAction.shouldSwitch
            ? { type: 'switch', targetPokemonIndex: aiAction.switchToIndex }
            : { type: 'attack', moveIndex: aiAction.moveIndex };

          // Process turn
          const events: BattleEvent[] = [];
          const updatedPlayerTeam = { ...currentBattle.playerTeam };
          const updatedOpponentTeam = { ...currentBattle.opponentTeam };

          // Handle switches first
          if (action.type === 'switch' && action.targetPokemonIndex !== undefined) {
            updatedPlayerTeam.activePokemonIndex = action.targetPokemonIndex;
            events.push({
              type: 'switch',
              target: 'player',
              pokemonIndex: action.targetPokemonIndex,
              message: `You sent out ${updatedPlayerTeam.pokemon[action.targetPokemonIndex].name}!`,
            });
          }

          if (opponentAction.type === 'switch' && opponentAction.targetPokemonIndex !== undefined) {
            updatedOpponentTeam.activePokemonIndex = opponentAction.targetPokemonIndex;
            events.push({
              type: 'switch',
              target: 'opponent',
              pokemonIndex: opponentAction.targetPokemonIndex,
              message: `Opponent sent out ${updatedOpponentTeam.pokemon[opponentAction.targetPokemonIndex].name}!`,
            });
          }

          // Handle attacks
          if (action.type === 'attack' && action.moveIndex !== undefined) {
            const playerPokemon = updatedPlayerTeam.pokemon[updatedPlayerTeam.activePokemonIndex];
            const opponentPokemon = updatedOpponentTeam.pokemon[updatedOpponentTeam.activePokemonIndex];
            const move = generateBattleMoves(playerPokemon)[action.moveIndex];

            const damage = calculateDamage(playerPokemon, opponentPokemon, move);
            const newHP = Math.max(0, opponentPokemon.currentHP - damage);
            
            updatedOpponentTeam.pokemon[updatedOpponentTeam.activePokemonIndex] = {
              ...opponentPokemon,
              currentHP: newHP,
              status: newHP === 0 ? 'fainted' : opponentPokemon.status,
            };

            events.push({
              type: 'damage',
              target: 'opponent',
              pokemonIndex: updatedOpponentTeam.activePokemonIndex,
              amount: damage,
              message: `${playerPokemon.name} used ${move.name}!`,
            });

            const effectiveness = getTypeEffectiveness(
              move.type,
              opponentPokemon.types.map(t => t.type.name)
            );
            const effectivenessMsg = getEffectivenessMessage(effectiveness);
            if (effectivenessMsg) {
              events.push({
                type: 'message',
                target: 'opponent',
                message: effectivenessMsg,
              });
            }

            if (newHP === 0) {
              events.push({
                type: 'faint',
                target: 'opponent',
                pokemonIndex: updatedOpponentTeam.activePokemonIndex,
                message: `${opponentPokemon.name} fainted!`,
              });
            }
          }

          // Opponent attacks if not fainted
          if (
            opponentAction.type === 'attack' &&
            opponentAction.moveIndex !== undefined &&
            updatedOpponentTeam.pokemon[updatedOpponentTeam.activePokemonIndex].status !== 'fainted'
          ) {
            const opponentPokemon = updatedOpponentTeam.pokemon[updatedOpponentTeam.activePokemonIndex];
            const playerPokemon = updatedPlayerTeam.pokemon[updatedPlayerTeam.activePokemonIndex];
            const move = generateBattleMoves(opponentPokemon)[opponentAction.moveIndex];

            const damage = calculateDamage(opponentPokemon, playerPokemon, move);
            const newHP = Math.max(0, playerPokemon.currentHP - damage);
            
            updatedPlayerTeam.pokemon[updatedPlayerTeam.activePokemonIndex] = {
              ...playerPokemon,
              currentHP: newHP,
              status: newHP === 0 ? 'fainted' : playerPokemon.status,
            };

            events.push({
              type: 'damage',
              target: 'player',
              pokemonIndex: updatedPlayerTeam.activePokemonIndex,
              amount: damage,
              message: `Opponent's ${opponentPokemon.name} used ${move.name}!`,
            });

            const effectiveness = getTypeEffectiveness(
              move.type,
              playerPokemon.types.map(t => t.type.name)
            );
            const effectivenessMsg = getEffectivenessMessage(effectiveness);
            if (effectivenessMsg) {
              events.push({
                type: 'message',
                target: 'player',
                message: effectivenessMsg,
              });
            }

            if (newHP === 0) {
              events.push({
                type: 'faint',
                target: 'player',
                pokemonIndex: updatedPlayerTeam.activePokemonIndex,
                message: `${playerPokemon.name} fainted!`,
              });
            }
          }

          // Create turn record
          const turn: BattleTurn = {
            turnNumber: currentBattle.turns.length + 1,
            playerAction: action,
            opponentAction,
            events,
          };

          // Check if battle is over
          const winner = isBattleOver(updatedPlayerTeam, updatedOpponentTeam);
          const battleStatus = winner === 'player' ? 'won' : winner === 'opponent' ? 'lost' : 'ongoing';

          const updatedBattle: Battle = {
            ...currentBattle,
            playerTeam: updatedPlayerTeam,
            opponentTeam: updatedOpponentTeam,
            turns: [...currentBattle.turns, turn],
            status: battleStatus,
            completedAt: battleStatus !== 'ongoing' ? Date.now() : undefined,
          };

          set({ currentBattle: updatedBattle });

          // If battle ended, update history
          if (battleStatus !== 'ongoing') {
            const { battleHistory } = get();
            set({
              battleHistory: {
                battles: [...battleHistory.battles, updatedBattle],
                wins: battleStatus === 'won' ? battleHistory.wins + 1 : battleHistory.wins,
                losses: battleStatus === 'lost' ? battleHistory.losses + 1 : battleHistory.losses,
                totalBattles: battleHistory.totalBattles + 1,
              },
            });
          }
        } finally {
          set({ isProcessingTurn: false });
        }
      },

      switchPokemon: (pokemonIndex: number, team: 'player' | 'opponent') => {
        const { currentBattle } = get();
        if (!currentBattle) return;

        if (team === 'player') {
          set({
            currentBattle: {
              ...currentBattle,
              playerTeam: {
                ...currentBattle.playerTeam,
                activePokemonIndex: pokemonIndex,
              },
            },
          });
        } else {
          set({
            currentBattle: {
              ...currentBattle,
              opponentTeam: {
                ...currentBattle.opponentTeam,
                activePokemonIndex: pokemonIndex,
              },
            },
          });
        }
      },

      forfeitBattle: () => {
        const { currentBattle, battleHistory } = get();
        if (!currentBattle || currentBattle.status !== 'ongoing') return;

        const forfeitedBattle: Battle = {
          ...currentBattle,
          status: 'forfeit',
          completedAt: Date.now(),
        };

        set({
          currentBattle: forfeitedBattle,
          battleHistory: {
            battles: [...battleHistory.battles, forfeitedBattle],
            wins: battleHistory.wins,
            losses: battleHistory.losses + 1,
            totalBattles: battleHistory.totalBattles + 1,
          },
        });
      },

      endBattle: () => {
        const { currentBattle, battleHistory } = get();
        if (!currentBattle) return;

        // Only add to history if not already added
        const alreadyInHistory = battleHistory.battles.some(b => b.id === currentBattle.id);
        if (!alreadyInHistory && currentBattle.status !== 'ongoing') {
          set({
            battleHistory: {
              battles: [...battleHistory.battles, currentBattle],
              wins: currentBattle.status === 'won' ? battleHistory.wins + 1 : battleHistory.wins,
              losses: currentBattle.status === 'lost' || currentBattle.status === 'forfeit' 
                ? battleHistory.losses + 1 
                : battleHistory.losses,
              totalBattles: battleHistory.totalBattles + 1,
            },
          });
        }
      },

      clearCurrentBattle: () => {
        set({ currentBattle: null });
      },

      getBattleStats: () => {
        const { battleHistory } = get();
        const winRate = battleHistory.totalBattles > 0 
          ? (battleHistory.wins / battleHistory.totalBattles) * 100 
          : 0;

        return {
          wins: battleHistory.wins,
          losses: battleHistory.losses,
          winRate: Math.round(winRate * 10) / 10,
        };
      },
    }),
    {
      name: 'battle-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        battleHistory: state.battleHistory,
      }),
    }
  )
);
