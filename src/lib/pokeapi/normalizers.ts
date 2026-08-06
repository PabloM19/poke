import { PokeApiError } from './errors'
import type {
  Generation,
  LanguageName,
  NamedAPIResource,
  Pokemon,
  PokemonStat,
  PokemonSpecies,
  PokemonType,
  Type,
  TypeRelations,
} from './models'

type UnknownRecord = Record<string, unknown>

function parseError(path: string, field: string): never {
  throw new PokeApiError(`Respuesta inválida: ${field}`, {
    path,
    kind: 'parse',
  })
}

function asRecord(value: unknown, path: string, field: string): UnknownRecord {
  if (value == null || typeof value !== 'object' || Array.isArray(value)) {
    return parseError(path, field)
  }
  return value as UnknownRecord
}

function asArray(value: unknown, path: string, field: string): unknown[] {
  if (!Array.isArray(value)) return parseError(path, field)
  return value
}

function asString(value: unknown, path: string, field: string): string {
  if (typeof value !== 'string') return parseError(path, field)
  return value
}

function asNumber(value: unknown, path: string, field: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return parseError(path, field)
  }
  return value
}

function asBoolean(value: unknown, path: string, field: string): boolean {
  if (typeof value !== 'boolean') return parseError(path, field)
  return value
}

function asNullableString(
  value: unknown,
  path: string,
  field: string
): string | null {
  if (value === null) return null
  return asString(value, path, field)
}

function normalizeNamedResource(
  value: unknown,
  path: string,
  field: string
): NamedAPIResource {
  const record = asRecord(value, path, field)
  return {
    name: asString(record.name, path, `${field}.name`),
    url: asString(record.url, path, `${field}.url`),
  }
}

function normalizePokemonType(
  value: unknown,
  path: string,
  field: string
): PokemonType {
  const record = asRecord(value, path, field)
  return {
    slot: asNumber(record.slot, path, `${field}.slot`),
    type: normalizeNamedResource(record.type, path, `${field}.type`),
  }
}

function normalizePokemonStat(
  value: unknown,
  path: string,
  field: string
): PokemonStat {
  const stat = asRecord(value, path, field)
  return {
    base_stat: asNumber(stat.base_stat, path, `${field}.base_stat`),
    stat: normalizeNamedResource(stat.stat, path, `${field}.stat`),
  }
}

function normalizeLanguageName(
  value: unknown,
  path: string,
  field: string
): LanguageName {
  const record = asRecord(value, path, field)
  return {
    name: asString(record.name, path, `${field}.name`),
    language: normalizeNamedResource(
      record.language,
      path,
      `${field}.language`
    ),
  }
}

function normalizeRelations(
  value: unknown,
  path: string,
  field: string
): TypeRelations {
  const record = asRecord(value, path, field)
  const list = (key: keyof TypeRelations) =>
    asArray(record[key], path, `${field}.${key}`).map((entry, index) =>
      normalizeNamedResource(entry, path, `${field}.${key}[${index}]`)
    )

  return {
    double_damage_to: list('double_damage_to'),
    half_damage_to: list('half_damage_to'),
    no_damage_to: list('no_damage_to'),
    double_damage_from: list('double_damage_from'),
    half_damage_from: list('half_damage_from'),
    no_damage_from: list('no_damage_from'),
  }
}

export function normalizePokemon(raw: unknown, path: string): Pokemon {
  const record = asRecord(raw, path, 'pokemon')
  const sprites = asRecord(record.sprites, path, 'pokemon.sprites')

  return {
    id: asNumber(record.id, path, 'pokemon.id'),
    name: asString(record.name, path, 'pokemon.name'),
    sprites: {
      front_default: asNullableString(
        sprites.front_default,
        path,
        'pokemon.sprites.front_default'
      ),
    },
    stats: asArray(record.stats, path, 'pokemon.stats').map((entry, index) =>
      normalizePokemonStat(entry, path, `pokemon.stats[${index}]`)
    ),
    types: asArray(record.types, path, 'pokemon.types').map((entry, index) =>
      normalizePokemonType(entry, path, `pokemon.types[${index}]`)
    ),
    past_types: Array.isArray(record.past_types)
      ? record.past_types.map((entry, index) => {
          const past = asRecord(entry, path, `pokemon.past_types[${index}]`)
          return {
            generation: normalizeNamedResource(
              past.generation,
              path,
              `pokemon.past_types[${index}].generation`
            ),
            types: asArray(
              past.types,
              path,
              `pokemon.past_types[${index}].types`
            ).map((type, typeIndex) =>
              normalizePokemonType(
                type,
                path,
                `pokemon.past_types[${index}].types[${typeIndex}]`
              )
            ),
          }
      })
      : [],
    past_stats: Array.isArray(record.past_stats)
      ? record.past_stats.map((entry, index) => {
          const past = asRecord(entry, path, `pokemon.past_stats[${index}]`)
          return {
            generation: normalizeNamedResource(
              past.generation,
              path,
              `pokemon.past_stats[${index}].generation`
            ),
            stats: asArray(
              past.stats,
              path,
              `pokemon.past_stats[${index}].stats`
            ).map((stat, statIndex) =>
              normalizePokemonStat(
                stat,
                path,
                `pokemon.past_stats[${index}].stats[${statIndex}]`
              )
            ),
          }
        })
      : [],
  }
}

export function normalizePokemonSpecies(
  raw: unknown,
  path: string
): PokemonSpecies {
  const record = asRecord(raw, path, 'pokemon-species')
  return {
    id: asNumber(record.id, path, 'pokemon-species.id'),
    name: asString(record.name, path, 'pokemon-species.name'),
    names: asArray(record.names, path, 'pokemon-species.names').map(
      (entry, index) =>
        normalizeLanguageName(entry, path, `pokemon-species.names[${index}]`)
    ),
    generation: normalizeNamedResource(
      record.generation,
      path,
      'pokemon-species.generation'
    ),
    varieties: asArray(
      record.varieties,
      path,
      'pokemon-species.varieties'
    ).map((entry, index) => {
      const variety = asRecord(
        entry,
        path,
        `pokemon-species.varieties[${index}]`
      )
      return {
        is_default: asBoolean(
          variety.is_default,
          path,
          `pokemon-species.varieties[${index}].is_default`
        ),
        pokemon: normalizeNamedResource(
          variety.pokemon,
          path,
          `pokemon-species.varieties[${index}].pokemon`
        ),
      }
    }),
    evolution_chain:
      record.evolution_chain === null
        ? null
        : {
            url: asString(
              asRecord(
                record.evolution_chain,
                path,
                'pokemon-species.evolution_chain'
              ).url,
              path,
              'pokemon-species.evolution_chain.url'
            ),
          },
  }
}

export function normalizeGeneration(raw: unknown, path: string): Generation {
  const record = asRecord(raw, path, 'generation')
  return {
    id: asNumber(record.id, path, 'generation.id'),
    name: asString(record.name, path, 'generation.name'),
    pokemon_species: asArray(
      record.pokemon_species,
      path,
      'generation.pokemon_species'
    ).map((entry, index) =>
      normalizeNamedResource(
        entry,
        path,
        `generation.pokemon_species[${index}]`
      )
    ),
    types: asArray(record.types, path, 'generation.types').map((entry, index) =>
      normalizeNamedResource(entry, path, `generation.types[${index}]`)
    ),
  }
}

export function normalizeType(raw: unknown, path: string): Type {
  const record = asRecord(raw, path, 'type')
  return {
    id: asNumber(record.id, path, 'type.id'),
    name: asString(record.name, path, 'type.name'),
    damage_relations: normalizeRelations(
      record.damage_relations,
      path,
      'type.damage_relations'
    ),
    past_damage_relations: Array.isArray(record.past_damage_relations)
      ? record.past_damage_relations.map((entry, index) => {
          const past = asRecord(
            entry,
            path,
            `type.past_damage_relations[${index}]`
          )
          return {
            generation: normalizeNamedResource(
              past.generation,
              path,
              `type.past_damage_relations[${index}].generation`
            ),
            damage_relations: normalizeRelations(
              past.damage_relations,
              path,
              `type.past_damage_relations[${index}].damage_relations`
            ),
          }
        })
      : [],
  }
}
