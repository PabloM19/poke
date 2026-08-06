import type { PokemonSummaryItem } from '@/features/pokedex/summary'
import type { GenerationFilter } from './generationFilter'

export const POKEMON_TYPES = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison',
  'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark',
  'steel', 'fairy',
] as const

export type PokemonTypeName = (typeof POKEMON_TYPES)[number]
export type PokedexSort = 'number-asc' | 'name-asc' | 'total-desc' | 'total-asc'

export interface PokedexFilters {
  generation: GenerationFilter
  types: PokemonTypeName[]
  minTotal: number
  maxTotal: number
  sort: PokedexSort
}

export interface TotalBounds {
  min: number
  max: number
}

const spanishCollator = new Intl.Collator('es', { sensitivity: 'base' })

export function getTotalBounds(items: readonly PokemonSummaryItem[]): TotalBounds {
  if (items.length === 0) return { min: 0, max: 0 }
  return items.reduce(
    (bounds, item) => ({
      min: Math.min(bounds.min, item.total),
      max: Math.max(bounds.max, item.total),
    }),
    { min: Number.POSITIVE_INFINITY, max: Number.NEGATIVE_INFINITY }
  )
}

export function filterAndSortPokemon(
  items: readonly PokemonSummaryItem[],
  filters: PokedexFilters
): PokemonSummaryItem[] {
  const filtered = items.filter((item) => (
    (filters.generation == null || item.generationId === filters.generation)
    && filters.types.every((type) => item.types.includes(type))
    && item.total >= filters.minTotal
    && item.total <= filters.maxTotal
  ))

  return filtered.sort((left, right) => {
    switch (filters.sort) {
      case 'name-asc':
        return spanishCollator.compare(left.nameEs, right.nameEs) || left.id - right.id
      case 'total-desc':
        return right.total - left.total || left.id - right.id
      case 'total-asc':
        return left.total - right.total || left.id - right.id
      case 'number-asc':
        return left.id - right.id
    }
  })
}
