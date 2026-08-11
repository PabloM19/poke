import { selectPokemonTypesForGeneration } from '@/features/historical'
import type { PokemonSummaryItem } from '@/features/pokedex/summary'
import { getPokemon, type Pokemon, type ServiceOptions } from '@/lib/pokeapi'
import type { GeneratedTypeDuelRound, TypeDuelMode, TypeDuelPokemonSnapshot } from './model'
import { evaluateTypeMatchup } from './typeMatchup'

type PokemonLoader = (id: number, options?: ServiceOptions) => Promise<Pokemon>

export interface GenerateTypeDuelRoundOptions {
  items: readonly PokemonSummaryItem[]
  generation: 4 | 5
  mode: TypeDuelMode
  excludedIds?: ReadonlySet<number>
  random?: () => number
  loadPokemon?: PokemonLoader
  signal?: AbortSignal
}

function shuffled<T>(values: readonly T[], random: () => number): T[] {
  const result = [...values]
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[result[index], result[swapIndex]] = [result[swapIndex], result[index]]
  }
  return result
}

export async function resolveDuelPokemon(
  item: PokemonSummaryItem,
  generation: 4 | 5,
  loadPokemon: PokemonLoader = getPokemon,
  signal?: AbortSignal,
): Promise<TypeDuelPokemonSnapshot> {
  const pokemon = await loadPokemon(item.id, { signal })
  const types = selectPokemonTypesForGeneration(pokemon, generation).map((entry) => entry.type.name)
  if (types.length === 0) throw new Error(`No se pudieron resolver los tipos de ${item.nameEs}`)
  return {
    id: item.id,
    name: item.nameEs,
    sprite: pokemon.sprites.official_artwork ?? pokemon.sprites.front_default ?? item.sprite,
    types,
  }
}

function isLearningMatchup(round: GeneratedTypeDuelRound): boolean {
  if (round.left.types.length > 1 || round.right.types.length > 1) return false
  if (round.correctAnswer === 'neutral') return false
  const winner = Math.max(round.leftBest.multiplier, round.rightBest.multiplier)
  const loser = Math.min(round.leftBest.multiplier, round.rightBest.multiplier)
  return winner >= 2 && loser <= 1
}

function summaryPokemon(item: PokemonSummaryItem): TypeDuelPokemonSnapshot {
  return {
    id: item.id,
    name: item.nameEs,
    sprite: item.sprite,
    types: item.types,
  }
}

export async function generateTypeDuelRound({
  items,
  generation,
  mode,
  excludedIds = new Set(),
  random = Math.random,
  loadPokemon = getPokemon,
  signal,
}: GenerateTypeDuelRoundOptions): Promise<GeneratedTypeDuelRound> {
  if (items.length < 2) throw new Error('La Pokédex seleccionada no tiene suficientes Pokémon')

  const unused = items.filter((item) => !excludedIds.has(item.id))
  const available = unused.length >= 2 ? unused : items
  const preferred = mode === 'learn'
    ? available.filter((item) => item.types.length === 1 && !item.types.includes('fairy'))
    : available
  const candidates = shuffled(preferred.length >= 2 ? preferred : available, random)
  const pairs = Array.from({ length: Math.floor(candidates.length / 2) }, (_, index) => (
    [candidates[index * 2], candidates[index * 2 + 1]] as const
  ))
  const orderedPairs = mode === 'learn'
    ? [
        ...pairs.filter(([left, right]) => isLearningMatchup(evaluateTypeMatchup(
          summaryPokemon(left),
          summaryPokemon(right),
          generation,
        ))),
        ...pairs.filter(([left, right]) => !isLearningMatchup(evaluateTypeMatchup(
          summaryPokemon(left),
          summaryPokemon(right),
          generation,
        ))),
      ]
    : pairs
  const maxAttempts = Math.min(mode === 'learn' ? 3 : 1, orderedPairs.length)
  let fallback: GeneratedTypeDuelRound | null = null

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const [leftItem, rightItem] = orderedPairs[attempt]
    const [left, right] = await Promise.all([
      resolveDuelPokemon(leftItem, generation, loadPokemon, signal),
      resolveDuelPokemon(rightItem, generation, loadPokemon, signal),
    ])
    const round = evaluateTypeMatchup(left, right, generation)
    fallback = round
    if (mode === 'normal' || isLearningMatchup(round)) return round
  }

  if (fallback) return fallback
  throw new Error('No se pudo preparar un enfrentamiento para esta Pokédex')
}
