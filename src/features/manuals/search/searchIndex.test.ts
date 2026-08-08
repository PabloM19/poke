import { describe, expect, it } from 'vitest'
import { searchManuals } from './searchIndex'

describe('searchManuals', () => {
  it('encuentra conceptos dentro de la prosa canónica', () => {
    expect(searchManuals('hambre').map((result) => result.path))
      .toContain('/manuales/mundo-misterioso/supervivencia')
    expect(searchManuals('Poké Ball').map((result) => result.path))
      .toContain('/manuales/entrenador/captura')
  })

  it('encuentra juegos y envía Perla a su ficha publicada', () => {
    expect(searchManuals('Pokémon Perla')[0]).toMatchObject({
      kind: 'game',
      path: '/manuales/juegos/perla',
    })
    expect(searchManuals('Pokémon Platino')[0]).toMatchObject({
      kind: 'game',
      path: '/manuales/juegos/platino',
    })
    expect(searchManuals('HeartGold')[0]).toMatchObject({
      kind: 'game',
      path: '/manuales/juegos/oro-heartgold',
    })
    expect(searchManuals('Pokémon Negro')[0]).toMatchObject({
      kind: 'game',
      path: '/manuales/juegos/negro',
    })
    expect(searchManuals('Pokémon Negro 2')[0]).toMatchObject({
      kind: 'game',
      path: '/manuales/juegos/negro-2',
    })
    expect(searchManuals('Equipo de Rescate Azul')[0]).toMatchObject({
      kind: 'game',
      path: '/manuales/juegos/equipo-rescate-azul',
    })
    expect(searchManuals('Exploradores de la Oscuridad')[0]).toMatchObject({
      kind: 'game',
      path: '/manuales/juegos/exploradores-oscuridad',
    })
    expect(searchManuals('Conquest')[0]).toMatchObject({
      kind: 'game',
      path: '/manuales/otros',
    })
    expect(searchManuals('Pokémon Ranger')[0]).toMatchObject({
      kind: 'game',
      path: '/manuales/juegos/ranger',
    })
    expect(searchManuals('Pokémon Dash')[0]).toMatchObject({
      kind: 'game',
      path: '/manuales/juegos/dash',
    })
  })

  it('normaliza tildes y códigos con o sin guion', () => {
    expect(searchManuals('evolucion').some((result) => result.title === 'Experiencia y evolución')).toBe(true)
    expect(searchManuals('r01')[0]).toMatchObject({
      kind: 'resource',
      title: 'R-01 · Tabla de tipos',
      path: '/manuales/recursos/r-01',
    })
  })

  it('no devuelve ruido para consultas de una letra', () => {
    expect(searchManuals('r')).toEqual([])
  })
})
