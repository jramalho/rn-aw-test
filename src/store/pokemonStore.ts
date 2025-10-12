import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Pokemon, PokemonSpecies, EvolutionChain, Type } from '../types';
import pokemonApi from '../utils/pokemonApi';

interface PokemonState {
  // Pokemon list state
  pokemonList: Pokemon[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  offset: number;
  limit: number;

  // Search state
  searchQuery: string;
  searchResults: Pokemon[];
  isSearching: boolean;
  searchError: string | null;
  searchSuggestions: string[];

  // Current Pokemon detail
  currentPokemon: Pokemon | null;
  currentSpecies: PokemonSpecies | null;
  currentEvolutionChain: EvolutionChain | null;
  isLoadingDetail: boolean;
  detailError: string | null;

  // Favorites
  favorites: number[];

  // Team state
  team: Pokemon[];

  // Filter state
  selectedType: string | null;
  availableTypes: Type[];

  // Actions
  loadPokemonList: (refresh?: boolean) => Promise<void>;
  loadMore: () => Promise<void>;
  searchPokemon: (query: string) => Promise<void>;
  loadPokemonDetail: (pokemon: Pokemon) => Promise<void>;
  toggleFavorite: (pokemonId: number) => void;
  addToTeam: (pokemon: Pokemon) => boolean;
  removeFromTeam: (pokemonId: number) => void;
  clearTeam: () => void;
  isInTeam: (pokemonId: number) => boolean;
  setSelectedType: (type: string | null) => void;
  loadTypes: () => Promise<void>;
  getSuggestions: (query: string) => Promise<void>;
  clearSearch: () => void;
  clearError: () => void;
  clearDetailError: () => void;
}

export const usePokemonStore = create<PokemonState>()(
  persist(
    (set, get) => ({
      // Initial state
      pokemonList: [],
      isLoading: false,
      isLoadingMore: false,
      error: null,
      hasMore: true,
      offset: 0,
      limit: 20,

      searchQuery: '',
      searchResults: [],
      isSearching: false,
      searchError: null,
      searchSuggestions: [],

      currentPokemon: null,
      currentSpecies: null,
      currentEvolutionChain: null,
      isLoadingDetail: false,
      detailError: null,

      favorites: [],

      team: [],

      selectedType: null,
      availableTypes: [],

      // Actions
      loadPokemonList: async (refresh = false) => {
        const { offset, limit, pokemonList, isLoading, selectedType } = get();
        
        if (isLoading) return;

        set({ isLoading: true, error: null });

        try {
          const newOffset = refresh ? 0 : offset;
          
          if (selectedType) {
            // Load Pokemon by type
            const typeData = await pokemonApi.getType(selectedType);
            const pokemonPromises = typeData.pokemon
              .slice(newOffset, newOffset + limit)
              .map(p => pokemonApi.getPokemon(p.pokemon.name));
            
            const newPokemons = await Promise.all(pokemonPromises);
            
            set({
              pokemonList: refresh ? newPokemons : [...pokemonList, ...newPokemons],
              offset: newOffset + limit,
              hasMore: newOffset + limit < typeData.pokemon.length,
              isLoading: false,
            });
          } else {
            // Load regular Pokemon list
            const response = await pokemonApi.getPokemonList(newOffset, limit);
            const pokemonPromises = response.results.map(p => 
              pokemonApi.getPokemon(p.name)
            );
            
            const newPokemons = await Promise.all(pokemonPromises);
            
            set({
              pokemonList: refresh ? newPokemons : [...pokemonList, ...newPokemons],
              offset: newOffset + limit,
              hasMore: response.next !== null,
              isLoading: false,
            });
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to load Pokemon',
            isLoading: false,
          });
        }
      },

      loadMore: async () => {
        const { hasMore, isLoadingMore, isLoading } = get();
        
        if (!hasMore || isLoadingMore || isLoading) return;

        set({ isLoadingMore: true });

        try {
          await get().loadPokemonList(false);
        } finally {
          set({ isLoadingMore: false });
        }
      },

      searchPokemon: async (query: string) => {
        set({ 
          searchQuery: query, 
          isSearching: true, 
          searchError: null,
          searchResults: [] 
        });

        if (!query.trim()) {
          set({ isSearching: false, searchResults: [] });
          return;
        }

        try {
          const results = await pokemonApi.searchPokemonAdvanced({ name: query });
          
          set({
            searchResults: results,
            isSearching: false,
          });
        } catch (error) {
          set({
            searchError: error instanceof Error ? error.message : 'Search failed',
            isSearching: false,
          });
        }
      },

      loadPokemonDetail: async (pokemon: Pokemon) => {
        set({ 
          currentPokemon: pokemon,
          isLoadingDetail: true, 
          detailError: null,
          currentSpecies: null,
          currentEvolutionChain: null,
        });

        try {
          // Load species data
          const species = await pokemonApi.getPokemonSpecies(pokemon.id);
          set({ currentSpecies: species });

          // Load evolution chain if available
          if (species.evolution_chain) {
            const evolutionChainId = parseInt(
              species.evolution_chain.url.split('/').slice(-2, -1)[0],
              10
            );
            const evolutionChain = await pokemonApi.getEvolutionChain(evolutionChainId);
            set({ currentEvolutionChain: evolutionChain });
          }

          set({ isLoadingDetail: false });
        } catch (error) {
          set({
            detailError: error instanceof Error ? error.message : 'Failed to load Pokemon details',
            isLoadingDetail: false,
          });
        }
      },

      toggleFavorite: (pokemonId: number) => {
        const { favorites } = get();
        const isFavorite = favorites.includes(pokemonId);
        
        set({
          favorites: isFavorite
            ? favorites.filter(id => id !== pokemonId)
            : [...favorites, pokemonId],
        });
      },

      addToTeam: (pokemon: Pokemon) => {
        const { team } = get();
        
        // Check if team is full (max 6 Pokemon)
        if (team.length >= 6) {
          return false;
        }
        
        // Check if Pokemon is already in team
        if (team.some(p => p.id === pokemon.id)) {
          return false;
        }
        
        set({ team: [...team, pokemon] });
        return true;
      },

      removeFromTeam: (pokemonId: number) => {
        const { team } = get();
        set({ team: team.filter(p => p.id !== pokemonId) });
      },

      clearTeam: () => {
        set({ team: [] });
      },

      isInTeam: (pokemonId: number) => {
        const { team } = get();
        return team.some(p => p.id === pokemonId);
      },

      setSelectedType: (type: string | null) => {
        set({ 
          selectedType: type,
          pokemonList: [],
          offset: 0,
          hasMore: true,
        });
        
        // Reload list with new type filter
        get().loadPokemonList(true);
      },

      loadTypes: async () => {
        try {
          const response = await pokemonApi.getAllTypes();
          const typePromises = response.results
            .filter(type => !['unknown', 'shadow'].includes(type.name))
            .map(type => pokemonApi.getType(type.name));
          
          const types = await Promise.all(typePromises);
          set({ availableTypes: types });
        } catch (error) {
          console.error('Failed to load types:', error);
        }
      },

      getSuggestions: async (query: string) => {
        if (!query.trim()) {
          set({ searchSuggestions: [] });
          return;
        }

        try {
          const suggestions = await pokemonApi.getPokemonSuggestions(query, 8);
          set({ searchSuggestions: suggestions });
        } catch (error) {
          console.error('Failed to get suggestions:', error);
          set({ searchSuggestions: [] });
        }
      },

      clearSearch: () => {
        set({
          searchQuery: '',
          searchResults: [],
          searchError: null,
          searchSuggestions: [],
        });
      },

      clearError: () => {
        set({ error: null });
      },

      clearDetailError: () => {
        set({ detailError: null });
      },
    }),
    {
      name: 'pokemon-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        favorites: state.favorites,
        team: state.team,
        selectedType: state.selectedType,
      }),
    }
  )
);