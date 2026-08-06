import type { NamedAPIResource } from '@/lib/pokeapi'

export interface RegionalPokedexEntry {
  entryNumber: number
  species: NamedAPIResource
}

export interface RegionalPokedex {
  id: number
  name: string
  entries: RegionalPokedexEntry[]
}

export interface GameMoveDetail {
  level: number
  method: NamedAPIResource
  versionGroup: NamedAPIResource
}

export interface PokemonGameMove {
  move: NamedAPIResource
  details: GameMoveDetail[]
}

export interface EncounterDetail {
  chance: number
  minLevel: number
  maxLevel: number
  method: NamedAPIResource
  conditions: NamedAPIResource[]
}

export interface VersionEncounter {
  version: NamedAPIResource
  maxChance: number
  details: EncounterDetail[]
}

export interface EncounterArea {
  locationArea: NamedAPIResource
  versions: VersionEncounter[]
}

export interface EvolutionDetail {
  trigger: NamedAPIResource
  versionGroup: NamedAPIResource | null
  minLevel: number | null
  minHappiness: number | null
  minBeauty: number | null
  timeOfDay: string
  item: NamedAPIResource | null
  heldItem: NamedAPIResource | null
  knownMove: NamedAPIResource | null
  location: NamedAPIResource | null
}

export interface EvolutionNode {
  species: NamedAPIResource
  details: EvolutionDetail[]
  evolvesTo: EvolutionNode[]
}

export interface EvolutionChain {
  id: number
  chain: EvolutionNode
}

export interface MoveName {
  id: number
  name: string
  names: Array<{ name: string; language: NamedAPIResource }>
}
