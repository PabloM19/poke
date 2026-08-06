import { describe, expect, it } from 'vitest'
import { gameDefinitions } from '@/features/manuals/content/definitions'
import { MAIN_GAME_CONTEXTS } from './gameCatalog'

describe('main game catalog', () => {
  it('mantiene exactos los cinco contextos PokeAPI', () => {
    expect(MAIN_GAME_CONTEXTS.map(({ slug, generation, version, versionGroup, pokedex }) => ({
      slug, generation, version, versionGroup, pokedex,
    }))).toEqual([
      { slug: 'perla', generation: 4, version: 'pearl', versionGroup: 'diamond-pearl', pokedex: 'original-sinnoh' },
      { slug: 'platino', generation: 4, version: 'platinum', versionGroup: 'platinum', pokedex: 'extended-sinnoh' },
      { slug: 'oro-heartgold', generation: 4, version: 'heartgold', versionGroup: 'heartgold-soulsilver', pokedex: 'updated-johto' },
      { slug: 'negro', generation: 5, version: 'black', versionGroup: 'black-white', pokedex: 'original-unova' },
      { slug: 'negro-2', generation: 5, version: 'black-2', versionGroup: 'black-2-white-2', pokedex: 'updated-unova' },
    ])
  })

  it('es la misma fuente que usa el manifiesto editorial', () => {
    expect(gameDefinitions.filter((game) => game.family === 'main').map((game) => game.slug))
      .toEqual(MAIN_GAME_CONTEXTS.map((game) => game.slug))
  })
})
