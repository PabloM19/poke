import { selectPokemonTypesForGeneration } from '@/features/historical'
import type { PokemonSummaryItem } from '@/features/pokedex/summary'
import { getPokemon, type Pokemon, type ServiceOptions } from '@/lib/pokeapi'
import type { PokemonSilhouetteSnapshot } from './model'

type PokemonLoader = (id: number, options?: ServiceOptions) => Promise<Pokemon>

export interface GeneratePokemonSilhouetteOptions {
  items: readonly PokemonSummaryItem[]
  entryNumbers: ReadonlyMap<number, number>
  generation: 4 | 5
  excludedIds?: ReadonlySet<number>
  random?: () => number
  loadPokemon?: PokemonLoader
  signal?: AbortSignal
}

export async function generatePokemonSilhouette({
  items,
  entryNumbers,
  generation,
  excludedIds = new Set(),
  random = Math.random,
  loadPokemon = getPokemon,
  signal,
}: GeneratePokemonSilhouetteOptions): Promise<PokemonSilhouetteSnapshot> {
  if (items.length === 0) throw new Error('La Pokédex seleccionada no tiene Pokémon disponibles')
  const unused = items.filter((item) => !excludedIds.has(item.id))
  const available = unused.length > 0 ? unused : items
  const item = available[Math.min(available.length - 1, Math.floor(random() * available.length))]
  const pokemon = await loadPokemon(item.id, { signal })
  const types = selectPokemonTypesForGeneration(pokemon, generation).map((entry) => entry.type.name)
  if (types.length === 0) throw new Error(`No se pudieron resolver los tipos de ${item.nameEs}`)
  return {
    id: item.id,
    name: item.nameEs,
    sprite: pokemon.sprites.official_artwork ?? pokemon.sprites.front_default ?? item.sprite,
    types,
    regionalNumber: entryNumbers.get(item.id) ?? item.id,
    generationId: item.generationId,
  }
}

