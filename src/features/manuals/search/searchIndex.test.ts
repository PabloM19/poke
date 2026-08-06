import { describe, expect, it } from 'vitest'
import { searchManuals } from './searchIndex'

describe('searchManuals', () => {
  it('encuentra conceptos dentro de la prosa canónica', () => {
    expect(searchManuals('hambre').map((result) => result.path))
      .toContain('/manuales/mundo-misterioso/supervivencia')
    expect(searchManuals('Poké Ball').map((result) => result.path))
      .toContain('/manuales/entrenador/captura')
  })

  it('encuentra juegos y los envía a una lección ya publicada', () => {
    expect(searchManuals('Pokémon Perla')[0]).toMatchObject({
      kind: 'game',
      path: '/manuales/empezar/recursos-y-coleccion',
    })
    expect(searchManuals('Conquest')[0]).toMatchObject({
      kind: 'game',
      path: '/manuales/otros',
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
