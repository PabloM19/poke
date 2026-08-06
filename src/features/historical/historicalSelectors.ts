import type {
  GenId,
  NamedAPIResource,
  Pokemon,
  PokemonStat,
  PokemonType,
  Type,
  TypeRelations,
} from '@/lib/pokeapi'

const ROMAN_GENERATIONS: Record<string, number> = {
  i: 1, ii: 2, iii: 3, iv: 4, v: 5, vi: 6, vii: 7, viii: 8, ix: 9,
}

const STAT_ORDER = [
  'hp', 'attack', 'defense', 'special-attack', 'special', 'special-defense', 'speed',
]

export function getGenerationResourceId(resource: NamedAPIResource): number | null {
  const urlMatch = /\/generation\/(\d+)\/?$/.exec(resource.url)
  if (urlMatch) return Number(urlMatch[1])

  const nameMatch = /^generation-([ivx]+)$/.exec(resource.name)
  return nameMatch ? ROMAN_GENERATIONS[nameMatch[1]] ?? null : null
}

function clonePokemonTypes(types: readonly PokemonType[]): PokemonType[] {
  return types
    .map((entry) => ({ slot: entry.slot, type: { ...entry.type } }))
    .sort((left, right) => left.slot - right.slot)
}

function cloneRelations(relations: TypeRelations): TypeRelations {
  return {
    double_damage_to: relations.double_damage_to.map((resource) => ({ ...resource })),
    half_damage_to: relations.half_damage_to.map((resource) => ({ ...resource })),
    no_damage_to: relations.no_damage_to.map((resource) => ({ ...resource })),
    double_damage_from: relations.double_damage_from.map((resource) => ({ ...resource })),
    half_damage_from: relations.half_damage_from.map((resource) => ({ ...resource })),
    no_damage_from: relations.no_damage_from.map((resource) => ({ ...resource })),
  }
}

function applicableSnapshot<T extends { generation: NamedAPIResource }>(
  snapshots: readonly T[],
  generation: GenId
): T | null {
  return snapshots
    .map((snapshot) => ({ snapshot, lastGeneration: getGenerationResourceId(snapshot.generation) }))
    .filter((entry): entry is { snapshot: T; lastGeneration: number } => (
      entry.lastGeneration != null && entry.lastGeneration >= generation
    ))
    .sort((left, right) => left.lastGeneration - right.lastGeneration)[0]?.snapshot ?? null
}

export function selectPokemonTypesForGeneration(
  pokemon: Pokemon,
  generation: GenId
): PokemonType[] {
  const historical = applicableSnapshot(pokemon.past_types, generation)
  return clonePokemonTypes(historical?.types ?? pokemon.types)
}

export function selectPokemonStatsForGeneration(
  pokemon: Pokemon,
  generation: GenId
): PokemonStat[] {
  const stats = new Map(
    pokemon.stats.map((entry) => [entry.stat.name, {
      base_stat: entry.base_stat,
      stat: { ...entry.stat },
    }])
  )

  const applicableOverrides = pokemon.past_stats
    .map((snapshot) => ({
      snapshot,
      lastGeneration: getGenerationResourceId(snapshot.generation),
    }))
    .filter((entry): entry is { snapshot: Pokemon['past_stats'][number]; lastGeneration: number } => (
      entry.lastGeneration != null && entry.lastGeneration >= generation
    ))
    .sort((left, right) => right.lastGeneration - left.lastGeneration)

  for (const { snapshot } of applicableOverrides) {
    for (const entry of snapshot.stats) {
      if (entry.stat.name === 'special') {
        stats.delete('special-attack')
        stats.delete('special-defense')
      }
      stats.set(entry.stat.name, {
        base_stat: entry.base_stat,
        stat: { ...entry.stat },
      })
    }
  }

  return [...stats.values()].sort((left, right) => (
    STAT_ORDER.indexOf(left.stat.name) - STAT_ORDER.indexOf(right.stat.name)
  ))
}

export function selectTypeRelationsForGeneration(
  type: Type,
  generation: GenId
): TypeRelations {
  const historical = applicableSnapshot(type.past_damage_relations, generation)
  return cloneRelations(historical?.damage_relations ?? type.damage_relations)
}
