import { describe, expect, it } from 'vitest'
import {
  humanizePokeApiName,
  translateGeneration,
  translateMoveLearnMethod,
  translatePokemonStat,
  translatePokemonType,
  translateVersionGroup,
} from './pokemonTerms'

describe('pokemon terms localization', () => {
  it('traduce tipos y stats, incluida Especial de Gen I', () => {
    expect(translatePokemonType('electric')).toBe('Eléctrico')
    expect(translatePokemonType('dark')).toBe('Siniestro')
    expect(translatePokemonStat('special')).toBe('Especial')
    expect(translatePokemonStat('special-defense', true)).toBe('Def. Esp.')
  })

  it('traduce métodos y contextos técnicos de los cinco juegos', () => {
    expect(translateMoveLearnMethod('level-up')).toBe('Subiendo de nivel')
    expect(translateMoveLearnMethod('machine')).toBe('MT o MO')
    expect(translateVersionGroup('black-2-white-2')).toBe('Negro 2 y Blanco 2')
    expect(translateGeneration('generation-iv')).toBe('Generación IV')
  })

  it('convierte valores futuros en etiquetas legibles', () => {
    expect(humanizePokeApiName('some-future-value')).toBe('Some future value')
    expect(translateMoveLearnMethod('new-method')).toBe('New method')
    expect(humanizePokeApiName('')).toBe('—')
  })
})
