/**
 * Modelos TypeScript mínimos (subset) para recursos PokeAPI que usamos.
 * Solo lo necesario para nombres multi-idioma, tipos, stats base y matchups por generación.
 */

/** Recurso con nombre y URL (usado en toda la API). */
export interface NamedAPIResource {
  name: string
  url: string
}

/** Sprites mínimos: frontal por defecto y opcionales para variantes. */
export interface PokemonSprites {
  front_default: string | null
  front_shiny?: string | null
  front_female?: string | null
  front_shiny_female?: string | null
}

/** Tipo de un Pokémon con slot (orden). */
export interface PokemonType {
  slot: number
  type: NamedAPIResource
}

/** Stat base con referencia al nombre del stat. */
export interface PokemonStat {
  base_stat: number
  stat: NamedAPIResource
}

/** Pokémon mínimo: id, nombre, stats, tipos, sprites. past_* opcionales para formas anteriores. */
export interface Pokemon {
  id: number
  name: string
  stats: PokemonStat[]
  types: PokemonType[]
  sprites: PokemonSprites
  past_types?: Array<{ generation: NamedAPIResource; types: PokemonType[] }>
  past_stats?: unknown
}

/** Nombre en un idioma. */
export interface LanguageName {
  name: string
  language: NamedAPIResource
}

/** Especie mínima: id, nombre, nombres multi-idioma, generación, variedades. */
export interface PokemonSpecies {
  id: number
  name: string
  names: LanguageName[]
  generation: NamedAPIResource
  varieties: Array<{ is_default: boolean; pokemon: NamedAPIResource }>
}

/** Relaciones de daño de un tipo. */
export interface TypeRelations {
  double_damage_from: NamedAPIResource[]
  half_damage_from: NamedAPIResource[]
  no_damage_from: NamedAPIResource[]
}

/** Tipo (recurso /type): id, nombre, damage_relations. past_damage_relations opcional. */
export interface Type {
  id: number
  name: string
  damage_relations: TypeRelations
  past_damage_relations?: unknown
}

/** Generación: id, nombre, especies y tipos de la generación. */
export interface Generation {
  id: number
  name: string
  pokemon_species: NamedAPIResource[]
  types: NamedAPIResource[]
}
