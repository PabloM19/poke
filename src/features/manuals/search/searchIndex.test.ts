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
      path: '/manuales/juegos/conquest',
    })
    expect(searchManuals('Pokémon Ranger')[0]).toMatchObject({
      kind: 'game',
      path: '/manuales/juegos/ranger',
    })
    expect(searchManuals('Pokémon Dash')[0]).toMatchObject({
      kind: 'game',
      path: '/manuales/juegos/dash',
    })
    expect(searchManuals('Pokémon Link')[0]).toMatchObject({
      kind: 'game',
      path: '/manuales/juegos/link',
    })
  })

  it('normaliza tildes y códigos con o sin guion', () => {
    expect(searchManuals('evolucion').some((result) => result.title === 'Experiencia y evolución')).toBe(true)
    expect(searchManuals('r01')[0]).toMatchObject({
      kind: 'resource',
      title: 'R-01 · Tabla de tipos',
      path: '/manuales/recursos/r-01',
    })
    expect(searchManuals('r03')[0]).toMatchObject({
      kind: 'resource',
      title: 'R-03 · Iconos y símbolos',
      path: '/manuales/recursos/r-03',
    })
    expect(searchManuals('r04')[0]).toMatchObject({
      kind: 'resource',
      title: 'R-04 · Kit de exploración PMD',
      path: '/manuales/recursos/r-04',
    })
    expect(searchManuals('r05')[0]).toMatchObject({
      kind: 'resource',
      title: 'R-05 · Técnica de captura Ranger',
      path: '/manuales/recursos/r-05',
    })
    expect(searchManuals('r06')[0]).toMatchObject({
      kind: 'resource',
      title: 'R-06 · Recordatorio táctico Conquest',
      path: '/manuales/recursos/r-06',
    })
  })

  it('no devuelve ruido para consultas de una letra', () => {
    expect(searchManuals('r')).toEqual([])
  })

  it('filtra por el nivel máximo de spoilers', () => {
    expect(searchManuals('Conquest', 12, 'none').map((result) => result.path))
      .not.toContain('/manuales/juegos/conquest')
    expect(searchManuals('Conquest', 12, 'none').map((result) => result.path))
      .toContain('/manuales/otros')
    expect(searchManuals('Conquest', 12, 'mechanics')[0]).toMatchObject({ path: '/manuales/juegos/conquest' })
    expect(searchManuals('R-01', 12, 'none')[0]).toMatchObject({ path: '/manuales/recursos/r-01' })
  })
})
