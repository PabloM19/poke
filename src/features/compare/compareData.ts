import { getPokemon, getPokemonSpecies, getSpanishName, type GenId } from '@/lib/pokeapi'
import {
  selectPokemonStatsForGeneration,
  selectPokemonTypesForGeneration,
} from '@/features/historical'

export interface ComparePokemonData {
  speciesId: number
  name: string
  artworkUrl: string | null
  spriteUrl: string | null
  types: readonly string[]
  stats: readonly { name: string; value: number }[]
  total: number
}

export async function getComparePokemonData(
  speciesId: number,
  generation: GenId,
  signal?: AbortSignal
): Promise<ComparePokemonData> {
  const species = await getPokemonSpecies(speciesId, { signal })
  const variety = species.varieties.find((entry) => entry.is_default) ?? species.varieties[0]
  const pokemon = await getPokemon(variety?.pokemon.name ?? species.name, { signal })
  const stats = selectPokemonStatsForGeneration(pokemon, generation).map((entry) => ({
    name: entry.stat.name,
    value: entry.base_stat,
  }))
  return {
    speciesId,
    name: getSpanishName(species) ?? species.name,
    artworkUrl: pokemon.sprites.official_artwork ?? null,
    spriteUrl: pokemon.sprites.front_default,
    types: selectPokemonTypesForGeneration(pokemon, generation).map((entry) => entry.type.name),
    stats,
    total: stats.reduce((sum, stat) => sum + stat.value, 0),
  }
}
