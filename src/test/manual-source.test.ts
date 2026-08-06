import { describe, expect, it } from 'vitest'
import source from '../../docs/sources/manual-pokemon-ds-contenido-revisado.md?raw'

describe('fuente canónica del manual', () => {
  it('declara la edición de 156 páginas', () => {
    expect(source).toContain('amplía el manual a **156 páginas**')
  })

  it('contiene todas las páginas detalladas de la 21 a la 156 sin huecos', () => {
    const pages = [...source.matchAll(/^### Página (\d+)/gm)].map((match) =>
      Number(match[1])
    )

    expect(pages).toEqual(Array.from({ length: 136 }, (_, index) => index + 21))
  })

  it('mantiene los once juegos de la colección', () => {
    const games = [
      'Pokémon Perla',
      'Pokémon Platino',
      'Pokémon Oro HeartGold',
      'Pokémon Negro',
      'Pokémon Negro 2',
      'Equipo de Rescate Azul',
      'Exploradores de la Oscuridad',
      'Pokémon Ranger',
      'Pokémon Dash',
      'Pokémon Link!',
      'Pokémon Conquest',
    ]

    for (const game of games) expect(source).toContain(game)
  })
})
