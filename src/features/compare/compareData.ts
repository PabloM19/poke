import { getPokemon, getPokemonSpecies, getSpanishName } from '@/lib/pokeapi'

export interface ComparePokemonData {
  speciesId: number
  name: string
  spriteUrl: string | null
  types: readonly string[]
  stats: readonly { name: string; value: number }[]
  total: number
}

export async function getComparePokemonData(
  speciesId: number,
  signal?: AbortSignal
): Promise<ComparePokemonData> {
  const species = await getPokemonSpecies(speciesId, { signal })
  const variety = species.varieties.find((entry) => entry.is_default) ?? species.varieties[0]
  const pokemon = await getPokemon(variety?.pokemon.name ?? species.name, { signal })
  const stats = pokemon.stats.map((entry) => ({
    name: entry.stat.name,
    value: entry.base_stat,
  }))
  return {
    speciesId,
    name: getSpanishName(species) ?? species.name,
    spriteUrl: pokemon.sprites.front_default,
    types: pokemon.types.map((entry) => entry.type.name),
    stats,
    total: stats.reduce((sum, stat) => sum + stat.value, 0),
  }
}
