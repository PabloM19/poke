import type { GenerationFilter } from './generationFilter'
import {
  POKEMON_TYPES,
  type PokedexFilters,
  type PokedexSort,
  type PokemonTypeName,
  type TotalBounds,
} from './pokedexFilters'

const SORT_VALUES: PokedexSort[] = ['number-asc', 'name-asc', 'total-desc', 'total-asc']

function parseGeneration(value: string | null): GenerationFilter {
  const generation = Number(value)
  return Number.isInteger(generation) && generation >= 1 && generation <= 5
    ? generation as Exclude<GenerationFilter, null>
    : null
}

function parseType(value: string | null): PokemonTypeName | null {
  return POKEMON_TYPES.includes(value as PokemonTypeName)
    ? value as PokemonTypeName
    : null
}

function parseBound(value: string | null, fallback: number, bounds: TotalBounds): number {
  if (value == null || !/^\d+$/.test(value)) return fallback
  return Math.min(bounds.max, Math.max(bounds.min, Number(value)))
}

export function parsePokedexFilterParams(
  params: URLSearchParams,
  bounds: TotalBounds
): PokedexFilters {
  const firstType = parseType(params.get('type'))
  const secondType = parseType(params.get('type2'))
  const types = [firstType, secondType]
    .filter((type): type is PokemonTypeName => type != null)
    .filter((type, index, values) => values.indexOf(type) === index)
    .slice(0, 2)

  const parsedMin = parseBound(params.get('min'), bounds.min, bounds)
  const parsedMax = parseBound(params.get('max'), bounds.max, bounds)
  const sortParam = params.get('sort') as PokedexSort | null

  return {
    generation: parseGeneration(params.get('gen')),
    types,
    minTotal: Math.min(parsedMin, parsedMax),
    maxTotal: Math.max(parsedMin, parsedMax),
    sort: sortParam != null && SORT_VALUES.includes(sortParam)
      ? sortParam
      : 'number-asc',
  }
}

export function serializePokedexFilterParams(
  filters: PokedexFilters,
  bounds: TotalBounds
): URLSearchParams {
  const params = new URLSearchParams()
  if (filters.generation != null) params.set('gen', String(filters.generation))
  if (filters.types[0]) params.set('type', filters.types[0])
  if (filters.types[1] && filters.types[1] !== filters.types[0]) {
    params.set('type2', filters.types[1])
  }
  if (filters.minTotal !== bounds.min) params.set('min', String(filters.minTotal))
  if (filters.maxTotal !== bounds.max) params.set('max', String(filters.maxTotal))
  if (filters.sort !== 'number-asc') params.set('sort', filters.sort)
  return params
}
