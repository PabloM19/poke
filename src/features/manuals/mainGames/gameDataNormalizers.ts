import { PokeApiError, type NamedAPIResource } from '@/lib/pokeapi'
import type {
  EncounterArea,
  EvolutionChain,
  EvolutionDetail,
  EvolutionNode,
  MoveName,
  PokemonGameMove,
  RegionalPokedex,
} from './gameDataModels'

type UnknownRecord = Record<string, unknown>

function invalid(path: string, field: string): never {
  throw new PokeApiError(`Respuesta inválida: ${field}`, { path, kind: 'parse' })
}

function record(value: unknown, path: string, field: string): UnknownRecord {
  return value != null && typeof value === 'object' && !Array.isArray(value)
    ? value as UnknownRecord
    : invalid(path, field)
}

function array(value: unknown, path: string, field: string): unknown[] {
  return Array.isArray(value) ? value : invalid(path, field)
}

function string(value: unknown, path: string, field: string): string {
  return typeof value === 'string' ? value : invalid(path, field)
}

function number(value: unknown, path: string, field: string): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : invalid(path, field)
}

function nullableNumber(value: unknown, path: string, field: string): number | null {
  return value === null ? null : number(value, path, field)
}

function resource(value: unknown, path: string, field: string): NamedAPIResource {
  const data = record(value, path, field)
  return { name: string(data.name, path, `${field}.name`), url: string(data.url, path, `${field}.url`) }
}

function nullableResource(value: unknown, path: string, field: string): NamedAPIResource | null {
  return value === null ? null : resource(value, path, field)
}

export function normalizeRegionalPokedex(raw: unknown, path: string): RegionalPokedex {
  const data = record(raw, path, 'pokedex')
  return {
    id: number(data.id, path, 'pokedex.id'),
    name: string(data.name, path, 'pokedex.name'),
    entries: array(data.pokemon_entries, path, 'pokedex.pokemon_entries').map((value, index) => {
      const entry = record(value, path, `pokedex.pokemon_entries[${index}]`)
      return {
        entryNumber: number(entry.entry_number, path, `pokedex.pokemon_entries[${index}].entry_number`),
        species: resource(entry.pokemon_species, path, `pokedex.pokemon_entries[${index}].pokemon_species`),
      }
    }),
  }
}

export function normalizePokemonGameMoves(raw: unknown, path: string): PokemonGameMove[] {
  const data = record(raw, path, 'pokemon')
  return array(data.moves, path, 'pokemon.moves').map((value, index) => {
    const move = record(value, path, `pokemon.moves[${index}]`)
    return {
      move: resource(move.move, path, `pokemon.moves[${index}].move`),
      details: array(move.version_group_details, path, `pokemon.moves[${index}].version_group_details`).map((detailValue, detailIndex) => {
        const detail = record(detailValue, path, `pokemon.moves[${index}].version_group_details[${detailIndex}]`)
        return {
          level: number(detail.level_learned_at, path, `pokemon.moves[${index}].version_group_details[${detailIndex}].level_learned_at`),
          method: resource(detail.move_learn_method, path, `pokemon.moves[${index}].version_group_details[${detailIndex}].move_learn_method`),
          versionGroup: resource(detail.version_group, path, `pokemon.moves[${index}].version_group_details[${detailIndex}].version_group`),
        }
      }),
    }
  })
}

export function normalizeEncounters(raw: unknown, path: string): EncounterArea[] {
  return array(raw, path, 'encounters').map((value, index) => {
    const area = record(value, path, `encounters[${index}]`)
    return {
      locationArea: resource(area.location_area, path, `encounters[${index}].location_area`),
      versions: array(area.version_details, path, `encounters[${index}].version_details`).map((versionValue, versionIndex) => {
        const version = record(versionValue, path, `encounters[${index}].version_details[${versionIndex}]`)
        return {
          version: resource(version.version, path, `encounters[${index}].version_details[${versionIndex}].version`),
          maxChance: number(version.max_chance, path, `encounters[${index}].version_details[${versionIndex}].max_chance`),
          details: array(version.encounter_details, path, `encounters[${index}].version_details[${versionIndex}].encounter_details`).map((detailValue, detailIndex) => {
            const detail = record(detailValue, path, `encounters[${index}].version_details[${versionIndex}].encounter_details[${detailIndex}]`)
            return {
              chance: number(detail.chance, path, 'encounter.chance'),
              minLevel: number(detail.min_level, path, 'encounter.min_level'),
              maxLevel: number(detail.max_level, path, 'encounter.max_level'),
              method: resource(detail.method, path, 'encounter.method'),
              conditions: array(detail.condition_values, path, 'encounter.condition_values').map((condition, conditionIndex) => resource(condition, path, `encounter.condition_values[${conditionIndex}]`)),
            }
          }),
        }
      }),
    }
  })
}

function normalizeEvolutionDetail(value: unknown, path: string, field: string): EvolutionDetail {
  const detail = record(value, path, field)
  return {
    trigger: resource(detail.trigger, path, `${field}.trigger`),
    versionGroup: nullableResource(detail.version_group ?? null, path, `${field}.version_group`),
    minLevel: nullableNumber(detail.min_level, path, `${field}.min_level`),
    minHappiness: nullableNumber(detail.min_happiness, path, `${field}.min_happiness`),
    minBeauty: nullableNumber(detail.min_beauty, path, `${field}.min_beauty`),
    timeOfDay: string(detail.time_of_day, path, `${field}.time_of_day`),
    item: nullableResource(detail.item, path, `${field}.item`),
    heldItem: nullableResource(detail.held_item, path, `${field}.held_item`),
    knownMove: nullableResource(detail.known_move, path, `${field}.known_move`),
    location: nullableResource(detail.location, path, `${field}.location`),
  }
}

function normalizeEvolutionNode(value: unknown, path: string, field: string): EvolutionNode {
  const node = record(value, path, field)
  return {
    species: resource(node.species, path, `${field}.species`),
    details: array(node.evolution_details, path, `${field}.evolution_details`).map((detail, index) => normalizeEvolutionDetail(detail, path, `${field}.evolution_details[${index}]`)),
    evolvesTo: array(node.evolves_to, path, `${field}.evolves_to`).map((child, index) => normalizeEvolutionNode(child, path, `${field}.evolves_to[${index}]`)),
  }
}

export function normalizeEvolutionChain(raw: unknown, path: string): EvolutionChain {
  const data = record(raw, path, 'evolution-chain')
  return {
    id: number(data.id, path, 'evolution-chain.id'),
    chain: normalizeEvolutionNode(data.chain, path, 'evolution-chain.chain'),
  }
}

export function normalizeMoveName(raw: unknown, path: string): MoveName {
  const data = record(raw, path, 'move')
  return {
    id: number(data.id, path, 'move.id'),
    name: string(data.name, path, 'move.name'),
    names: array(data.names, path, 'move.names').map((value, index) => {
      const name = record(value, path, `move.names[${index}]`)
      return {
        name: string(name.name, path, `move.names[${index}].name`),
        language: resource(name.language, path, `move.names[${index}].language`),
      }
    }),
  }
}
