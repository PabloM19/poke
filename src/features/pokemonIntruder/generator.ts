import { getTypeNamesForGeneration, selectPokemonTypesForGeneration } from '@/features/historical'
import type { PokemonSummaryItem } from '@/features/pokedex/summary'
import { getPokemon, type Pokemon, type ServiceOptions } from '@/lib/pokeapi'
import type { GeneratedIntruderRound, IntruderPokemonSnapshot } from './model'

type PokemonLoader = (id: number, options?: ServiceOptions) => Promise<Pokemon>

function shuffled<T>(values: readonly T[], random: () => number): T[] {
  const result = [...values]
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[result[index], result[swapIndex]] = [result[swapIndex], result[index]]
  }
  return result
}

async function resolvePokemon(
  item: PokemonSummaryItem,
  generation: 4 | 5,
  loadPokemon: PokemonLoader,
  signal?: AbortSignal,
): Promise<IntruderPokemonSnapshot> {
  const pokemon = await loadPokemon(item.id, { signal })
  const types = selectPokemonTypesForGeneration(pokemon, generation).map((entry) => entry.type.name)
  if (types.length < 1 || types.length > 2) throw new Error(`No se pudieron resolver los tipos históricos de ${item.nameEs}`)
  return {
    id: item.id,
    name: item.nameEs,
    sprite: pokemon.sprites.official_artwork ?? pokemon.sprites.front_default ?? item.sprite,
    types,
  }
}

function triples<T>(values: readonly T[]): T[][] {
  const result: T[][] = []
  for (let first = 0; first < values.length - 2; first += 1) {
    for (let second = first + 1; second < values.length - 1; second += 1) {
      for (let third = second + 1; third < values.length; third += 1) {
        result.push([values[first], values[second], values[third]])
      }
    }
  }
  return result
}

export function hasUnambiguousIntruder(
  pokemon: readonly IntruderPokemonSnapshot[],
  targetType: string,
  intruderId: number,
): boolean {
  if (pokemon.length !== 4) return false
  const intruder = pokemon.find((entry) => entry.id === intruderId)
  if (!intruder || intruder.types.includes(targetType)) return false
  const typeOwners = new Map<string, Set<number>>()
  for (const entry of pokemon) for (const type of entry.types) {
    const owners = typeOwners.get(type) ?? new Set<number>()
    owners.add(entry.id)
    typeOwners.set(type, owners)
  }
  const threeAgainstOne = [...typeOwners.entries()].filter(([, owners]) => owners.size === 3)
  const targetOwners = typeOwners.get(targetType)
  if (targetOwners?.size !== 3) return false
  return threeAgainstOne.every(([, owners]) => !owners.has(intruderId))
}

function leastUsedPosition(positionCounts: readonly number[], random: () => number): number {
  const counts = Array.from({ length: 4 }, (_, index) => positionCounts[index] ?? 0)
  const minimum = Math.min(...counts)
  const candidates = counts.flatMap((count, index) => count === minimum ? [index] : [])
  return candidates[Math.min(candidates.length - 1, Math.floor(random() * candidates.length))]
}

export interface GenerateIntruderRoundOptions {
  items: readonly PokemonSummaryItem[]
  generation: 4 | 5
  excludedPokemonIds?: ReadonlySet<number>
  excludedTypes?: ReadonlySet<string>
  intruderPositionCounts?: readonly number[]
  random?: () => number
  loadPokemon?: PokemonLoader
  signal?: AbortSignal
}

export async function generateIntruderRound({
  items,
  generation,
  excludedPokemonIds = new Set(),
  excludedTypes = new Set(),
  intruderPositionCounts = [0, 0, 0, 0],
  random = Math.random,
  loadPokemon = getPokemon,
  signal,
}: GenerateIntruderRoundOptions): Promise<GeneratedIntruderRound> {
  if (items.length < 4) throw new Error('La Pokédex seleccionada no tiene suficientes Pokémon')
  const available = items.filter((item) => !excludedPokemonIds.has(item.id))
  const types = getTypeNamesForGeneration(generation)
  const supportedTypes = types.filter((type) => available.filter((item) => item.types.includes(type)).length >= 3)
  const freshTypes = supportedTypes.filter((type) => !excludedTypes.has(type))
  const typeCandidates = shuffled(freshTypes.length > 0 ? freshTypes : supportedTypes, random)
  const resolved = new Map<number, Promise<IntruderPokemonSnapshot>>()
  const load = (item: PokemonSummaryItem) => {
    const existing = resolved.get(item.id)
    if (existing) return existing
    const pending = resolvePokemon(item, generation, loadPokemon, signal)
    resolved.set(item.id, pending)
    return pending
  }

  for (const targetType of typeCandidates) {
    const memberCandidates = shuffled(available.filter((item) => item.types.includes(targetType)), random)
    const outsiderCandidates = shuffled(available.filter((item) => !item.types.includes(targetType)), random)
    const memberTriples = shuffled(triples(memberCandidates.slice(0, 7)), random)
    const attempts = Math.min(12, memberTriples.length, outsiderCandidates.length)
    for (let attempt = 0; attempt < attempts; attempt += 1) {
      if (signal?.aborted) throw new DOMException('Solicitud cancelada', 'AbortError')
      const resolvedGroup = await Promise.all(memberTriples[attempt].map(load))
      const intruder = await load(outsiderCandidates[attempt])
      if (!resolvedGroup.every((pokemon) => pokemon.types.includes(targetType)) || intruder.types.includes(targetType)) continue
      const four = [...resolvedGroup, intruder]
      if (!hasUnambiguousIntruder(four, targetType, intruder.id)) continue
      const groupOrder = shuffled(resolvedGroup, random)
      const intruderPosition = leastUsedPosition(intruderPositionCounts, random)
      groupOrder.splice(intruderPosition, 0, intruder)
      return { criterion: { kind: 'shared-type', type: targetType }, pokemon: groupOrder, intruderId: intruder.id }
    }
  }
  throw new Error('No encontramos una combinación clara sin repetir Pokémon')
}
