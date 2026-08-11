import { describe, expect, it } from 'vitest'
import type { TypeDuelPokemonSnapshot } from './model'
import { attackMultiplier, evaluateTypeMatchup } from './typeMatchup'

function pokemon(id: number, name: string, types: string[]): TypeDuelPokemonSnapshot {
  return { id, name, types, sprite: null }
}

describe('Duelo de tipos: cálculo de ventaja', () => {
  it('calcula correctamente ×4, ×0, ×0,25 y tipos dobles', () => {
    expect(attackMultiplier('electric', ['water', 'flying'], 4)).toBe(4)
    expect(attackMultiplier('electric', ['ground'], 4)).toBe(0)
    expect(attackMultiplier('grass', ['fire', 'flying'], 4)).toBe(0.25)
    expect(attackMultiplier('ice', ['dragon', 'flying'], 4)).toBe(4)
    expect(attackMultiplier('fire', ['water'], 4)).toBe(0.5)
    expect(attackMultiplier('normal', ['water'], 4)).toBe(1)
    expect(attackMultiplier('fire', ['grass'], 4)).toBe(2)
  })

  it('elige la izquierda comparando el mejor STAB de ambos lados', () => {
    const result = evaluateTypeMatchup(
      pokemon(25, 'Pikachu', ['electric']),
      pokemon(130, 'Gyarados', ['water', 'flying']),
      4,
    )

    expect(result.correctAnswer).toBe('left')
    expect(result.leftBest).toEqual({ attackingType: 'electric', multiplier: 4 })
    expect(result.rightBest).toEqual({ attackingType: 'water', multiplier: 1 })
  })

  it('marca como neutral un cruce ambiguo donde ambos mejores STAB valen ×2', () => {
    const result = evaluateTypeMatchup(
      pokemon(6, 'Charizard', ['fire', 'flying']),
      pokemon(271, 'Lombre', ['water', 'grass']),
      5,
    )

    expect(result.leftBest.multiplier).toBe(2)
    expect(result.rightBest.multiplier).toBe(2)
    expect(result.correctAnswer).toBe('neutral')
  })

  it('respeta inmunidades al resolver la ventaja relativa', () => {
    const result = evaluateTypeMatchup(
      pokemon(25, 'Pikachu', ['electric']),
      pokemon(50, 'Diglett', ['ground']),
      4,
    )

    expect(result.leftBest.multiplier).toBe(0)
    expect(result.rightBest.multiplier).toBe(2)
    expect(result.correctAnswer).toBe('right')
  })
})
