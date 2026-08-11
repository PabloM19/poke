import { getTypeNamesForGeneration } from '@/features/historical'
import { isPokemonType, type PokemonTypeSlug } from '@/features/types'
import { TYPE_MEMORY_DIFFICULTIES, type TypeMemoryCard, type TypeMemoryDifficulty } from './model'

export function shuffleItems<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const shuffled = [...items]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]]
  }
  return shuffled
}

export function availableMemoryTypes(generation: 4 | 5): PokemonTypeSlug[] {
  return getTypeNamesForGeneration(generation).filter(isPokemonType)
}

export function createTypeMemoryBoard(
  generation: 4 | 5,
  difficulty: TypeMemoryDifficulty,
  random: () => number = Math.random,
): { cards: TypeMemoryCard[]; types: PokemonTypeSlug[] } {
  const pairCount = TYPE_MEMORY_DIFFICULTIES[difficulty].pairCount
  const types = shuffleItems(availableMemoryTypes(generation), random).slice(0, pairCount)
  const cards = types.flatMap((type): TypeMemoryCard[] => [
    { id: `${type}:name`, type, kind: 'name' },
    { id: `${type}:symbol`, type, kind: 'symbol' },
  ])
  return { cards: shuffleItems(cards, random), types }
}

export function cardsFormMemoryPair(first: TypeMemoryCard, second: TypeMemoryCard): boolean {
  return first.id !== second.id && first.type === second.type && first.kind !== second.kind
}

export function formatMemoryDuration(durationMs: number): string {
  const totalSeconds = Math.max(0, Math.floor(durationMs / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  return `${minutes}:${String(totalSeconds % 60).padStart(2, '0')}`
}
