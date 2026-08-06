import type { Pokemon, PokemonSpecies } from '@/lib/pokeapi'

export const pikachuPokemonFixture: Pokemon = {
  id: 25,
  name: 'pikachu',
  sprites: {
    front_default:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png',
  },
  types: [
    {
      slot: 1,
      type: {
        name: 'electric',
        url: 'https://pokeapi.co/api/v2/type/13/',
      },
    },
  ],
  stats: [
    {
      base_stat: 35,
      stat: {
        name: 'hp',
        url: 'https://pokeapi.co/api/v2/stat/1/',
      },
    },
  ],
}

export const pikachuSpeciesFixture: PokemonSpecies = {
  id: 25,
  name: 'pikachu',
  generation: {
    name: 'generation-i',
    url: 'https://pokeapi.co/api/v2/generation/1/',
  },
  names: [
    {
      name: 'Pikachu',
      language: {
        name: 'es',
        url: 'https://pokeapi.co/api/v2/language/7/',
      },
    },
  ],
  varieties: [
    {
      is_default: true,
      pokemon: {
        name: 'pikachu',
        url: 'https://pokeapi.co/api/v2/pokemon/25/',
      },
    },
  ],
}
