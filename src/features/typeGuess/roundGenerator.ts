import { selectPokemonStatsForGeneration, selectPokemonTypesForGeneration } from '@/features/historical'
import type { PokemonSummaryItem } from '@/features/pokedex/summary'
import { getPokemon, type Pokemon, type ServiceOptions } from '@/lib/pokeapi'
import type { TypeGuessPokemonSnapshot } from './model'

type PokemonLoader = (id: number, options?: ServiceOptions) => Promise<Pokemon>

export interface GenerateTypeGuessPokemonOptions {
  items: readonly PokemonSummaryItem[]
  entryNumbers: ReadonlyMap<number, number>
  generation: 4 | 5
  excludedIds?: ReadonlySet<number>
  random?: () => number
  loadPokemon?: PokemonLoader
  signal?: AbortSignal
}

export async function generateTypeGuessPokemon({
  items,
  entryNumbers,
  generation,
  excludedIds = new Set(),
  random = Math.random,
  loadPokemon = getPokemon,
  signal,
}: GenerateTypeGuessPokemonOptions): Promise<TypeGuessPokemonSnapshot> {
  if (items.length === 0) throw new Error('La Pokédex seleccionada no tiene Pokémon disponibles')
  const unused = items.filter((item) => !excludedIds.has(item.id))
  const available = unused.length > 0 ? unused : items
  const item = available[Math.min(available.length - 1, Math.floor(random() * available.length))]
  const pokemon = await loadPokemon(item.id, { signal })
  const actualTypes = selectPokemonTypesForGeneration(pokemon, generation).map((entry) => entry.type.name)
  const stats = selectPokemonStatsForGeneration(pokemon, generation).map((entry) => ({
    name: entry.stat.name,
    value: entry.base_stat ?? 0,
  }))
  if (actualTypes.length === 0) throw new Error(`No se pudieron resolver los tipos de ${item.nameEs}`)
  const standoutStat = [...stats].sort((left, right) => right.value - left.value)[0] ?? null
  return {
    id: item.id,
    name: item.nameEs,
    sprite: pokemon.sprites.official_artwork ?? pokemon.sprites.front_default ?? item.sprite,
    actualTypes,
    regionalNumber: entryNumbers.get(item.id) ?? item.id,
    height: pokemon.height ?? null,
    weight: pokemon.weight ?? null,
    totalBaseStats: stats.reduce((total, stat) => total + stat.value, 0),
    standoutStat,
  }
}

