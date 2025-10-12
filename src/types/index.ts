// Navigation Types
export type RootStackParamList = {
  Main: undefined;
  Home: undefined;
  Profile: undefined;
  Settings: undefined;
  PokemonList: undefined;
  PokemonDetail: { pokemon: Pokemon };
  TeamBuilder: undefined;
  PerformanceDashboard: undefined;
  Search: undefined;
};

// Pokemon API Types
export interface Pokemon {
  id: number;
  name: string;
  base_experience: number;
  height: number;
  weight: number;
  order: number;
  is_default: boolean;
  abilities: PokemonAbility[];
  forms: NamedAPIResource[];
  game_indices: VersionGameIndex[];
  held_items: PokemonHeldItem[];
  location_area_encounters: string;
  moves: PokemonMove[];
  sprites: PokemonSprites;
  cries: PokemonCries;
  species: NamedAPIResource;
  stats: PokemonStat[];
  types: PokemonType[];
  past_abilities?: PokemonAbilityPast[];
  past_types?: PokemonTypePast[];
}

export interface PokemonAbility {
  is_hidden: boolean;
  slot: number;
  ability: NamedAPIResource;
}

export interface PokemonAbilityPast {
  generation: NamedAPIResource;
  abilities: PokemonAbility[];
}

export interface PokemonHeldItem {
  item: NamedAPIResource;
  version_details: PokemonHeldItemVersion[];
}

export interface PokemonHeldItemVersion {
  version: NamedAPIResource;
  rarity: number;
}

export interface PokemonMove {
  move: NamedAPIResource;
  version_group_details: PokemonMoveVersion[];
}

export interface PokemonMoveVersion {
  move_learn_method: NamedAPIResource;
  version_group: NamedAPIResource;
  level_learned_at: number;
}

export interface PokemonSprites {
  front_default: string | null;
  front_shiny: string | null;
  front_female: string | null;
  front_shiny_female: string | null;
  back_default: string | null;
  back_shiny: string | null;
  back_female: string | null;
  back_shiny_female: string | null;
  other: {
    dream_world?: {
      front_default?: string;
      front_female?: string;
    };
    home?: {
      front_default?: string;
      front_female?: string;
      front_shiny?: string;
      front_shiny_female?: string;
    };
    'official-artwork'?: {
      front_default?: string;
      front_shiny?: string;
    };
    showdown?: {
      front_default?: string;
      front_female?: string;
      front_shiny?: string;
      front_shiny_female?: string;
      back_default?: string;
      back_female?: string;
      back_shiny?: string;
      back_shiny_female?: string;
    };
  };
  versions: any;
}

export interface PokemonCries {
  latest: string;
  legacy: string;
}

export interface PokemonStat {
  base_stat: number;
  effort: number;
  stat: NamedAPIResource;
}

export interface PokemonType {
  slot: number;
  type: NamedAPIResource;
}

export interface PokemonTypePast {
  generation: NamedAPIResource;
  types: PokemonType[];
}

export interface VersionGameIndex {
  game_index: number;
  version: NamedAPIResource;
}

// Pokemon Species Types
export interface PokemonSpecies {
  id: number;
  name: string;
  order: number;
  gender_rate: number;
  capture_rate: number;
  base_happiness: number;
  is_baby: boolean;
  is_legendary: boolean;
  is_mythical: boolean;
  hatch_counter: number;
  has_gender_differences: boolean;
  forms_switchable: boolean;
  growth_rate: NamedAPIResource;
  pokedex_numbers: PokemonSpeciesDexEntry[];
  egg_groups: NamedAPIResource[];
  color: NamedAPIResource;
  shape: NamedAPIResource;
  evolves_from_species: NamedAPIResource | null;
  evolution_chain: APIResource;
  habitat: NamedAPIResource | null;
  generation: NamedAPIResource;
  names: Name[];
  pal_park_encounters: PalParkEncounterArea[];
  flavor_text_entries: FlavorText[];
  form_descriptions: Description[];
  genera: Genus[];
  varieties: PokemonSpeciesVariety[];
}

export interface PokemonSpeciesDexEntry {
  entry_number: number;
  pokedex: NamedAPIResource;
}

export interface PalParkEncounterArea {
  base_score: number;
  rate: number;
  area: NamedAPIResource;
}

export interface Genus {
  genus: string;
  language: NamedAPIResource;
}

export interface PokemonSpeciesVariety {
  is_default: boolean;
  pokemon: NamedAPIResource;
}

// Type and Ability Details
export interface Type {
  id: number;
  name: string;
  damage_relations: TypeRelations;
  past_damage_relations: TypeRelationsPast[];
  game_indices: GenerationGameIndex[];
  generation: NamedAPIResource;
  move_damage_class: NamedAPIResource | null;
  names: Name[];
  pokemon: TypePokemon[];
  moves: NamedAPIResource[];
}

export interface TypeRelations {
  no_damage_to: NamedAPIResource[];
  half_damage_to: NamedAPIResource[];
  double_damage_to: NamedAPIResource[];
  no_damage_from: NamedAPIResource[];
  half_damage_from: NamedAPIResource[];
  double_damage_from: NamedAPIResource[];
}

export interface TypeRelationsPast {
  generation: NamedAPIResource;
  damage_relations: TypeRelations;
}

export interface TypePokemon {
  slot: number;
  pokemon: NamedAPIResource;
}

export interface Ability {
  id: number;
  name: string;
  is_main_series: boolean;
  generation: NamedAPIResource;
  names: Name[];
  effect_entries: VerboseEffect[];
  effect_changes: AbilityEffectChange[];
  flavor_text_entries: AbilityFlavorText[];
  pokemon: AbilityPokemon[];
}

export interface AbilityEffectChange {
  effect_entries: Effect[];
  version_group: NamedAPIResource;
}

export interface AbilityFlavorText {
  flavor_text: string;
  language: NamedAPIResource;
  version_group: NamedAPIResource;
}

export interface AbilityPokemon {
  is_hidden: boolean;
  slot: number;
  pokemon: NamedAPIResource;
}

// API Response Types
export interface NamedAPIResourceList {
  count: number;
  next: string | null;
  previous: string | null;
  results: NamedAPIResource[];
}

export interface APIResourceList {
  count: number;
  next: string | null;
  previous: string | null;
  results: APIResource[];
}

// Common Types
export interface APIResource {
  url: string;
}

export interface NamedAPIResource {
  name: string;
  url: string;
}

export interface Name {
  name: string;
  language: NamedAPIResource;
}

export interface Description {
  description: string;
  language: NamedAPIResource;
}

export interface Effect {
  effect: string;
  language: NamedAPIResource;
}

export interface VerboseEffect {
  effect: string;
  short_effect: string;
  language: NamedAPIResource;
}

export interface FlavorText {
  flavor_text: string;
  language: NamedAPIResource;
  version?: NamedAPIResource;
  version_group?: NamedAPIResource;
}

export interface GenerationGameIndex {
  game_index: number;
  generation: NamedAPIResource;
}

// Evolution Chain Types
export interface EvolutionChain {
  id: number;
  baby_trigger_item: NamedAPIResource | null;
  chain: ChainLink;
}

export interface ChainLink {
  is_baby: boolean;
  species: NamedAPIResource;
  evolution_details: EvolutionDetail[];
  evolves_to: ChainLink[];
}

export interface EvolutionDetail {
  item: NamedAPIResource | null;
  trigger: NamedAPIResource;
  gender: number | null;
  held_item: NamedAPIResource | null;
  known_move: NamedAPIResource | null;
  known_move_type: NamedAPIResource | null;
  location: NamedAPIResource | null;
  min_level: number | null;
  min_happiness: number | null;
  min_beauty: number | null;
  min_affection: number | null;
  needs_overworld_rain: boolean;
  party_species: NamedAPIResource | null;
  party_type: NamedAPIResource | null;
  relative_physical_stats: number | null;
  time_of_day: string;
  trade_species: NamedAPIResource | null;
  turn_upside_down: boolean;
}

// App State Types
export interface PokemonListState {
  pokemons: Pokemon[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  offset: number;
  searchQuery: string;
}

export interface PokemonDetailState {
  pokemon: Pokemon | null;
  species: PokemonSpecies | null;
  evolutionChain: EvolutionChain | null;
  loading: boolean;
  error: string | null;
}

// Theme Types  
export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    error: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  typography: {
    h1: TextStyle;
    h2: TextStyle;
    body: TextStyle;
    caption: TextStyle;
  };
}

// Component Props
export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
}

export interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  onPress?: () => void;
}

export interface PokemonCardProps {
  pokemon: Pokemon;
  onPress: (pokemon: Pokemon) => void;
}

export interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSearch: () => void;
  onClear: () => void;
  placeholder?: string;
  loading?: boolean;
}

// Import TextStyle from React Native
import { TextStyle } from 'react-native';

// Re-export auth types
export * from './auth';
