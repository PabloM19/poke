import { describe, expect, it } from 'vitest'
import { correctTypeGuess, toggleTypeSelection } from './correction'

describe('corrección de Adivina el tipo', () => {
  it.each([
    ['Pikachu', ['electric'], ['electric']],
    ['Bulbasaur', ['poison', 'grass'], ['grass', 'poison']],
    ['Charizard', ['flying', 'fire'], ['fire', 'flying']],
    ['Gyarados', ['water', 'flying'], ['water', 'flying']],
    ['Gengar', ['poison', 'ghost'], ['ghost', 'poison']],
  ])('valida la combinación real de %s sin depender del orden', (_name, selected, actual) => {
    expect(correctTypeGuess(selected, actual).result).toBe('correct')
  })

  it('compara conjuntos sin depender del orden', () => {
    expect(correctTypeGuess(['flying', 'water'], ['water', 'flying']).result).toBe('correct')
  })

  it('distingue respuestas parciales e indica tipos acertados, sobrantes y ausentes', () => {
    expect(correctTypeGuess(['grass'], ['grass', 'poison'])).toEqual({
      result: 'partial', matchedTypes: ['grass'], missingTypes: ['poison'], extraTypes: [],
    })
    expect(correctTypeGuess(['grass', 'ground'], ['grass', 'poison'])).toEqual({
      result: 'partial', matchedTypes: ['grass'], missingTypes: ['poison'], extraTypes: ['ground'],
    })
    expect(correctTypeGuess(['fire'], ['water', 'flying']).result).toBe('incorrect')
  })

  it('selecciona, deselecciona y sustituye el tipo más antiguo al llegar a dos', () => {
    expect(toggleTypeSelection([], 'water')).toEqual(['water'])
    expect(toggleTypeSelection(['water'], 'flying')).toEqual(['water', 'flying'])
    expect(toggleTypeSelection(['water', 'flying'], 'fire')).toEqual(['flying', 'fire'])
    expect(toggleTypeSelection(['water', 'flying'], 'water')).toEqual(['flying'])
  })
})
