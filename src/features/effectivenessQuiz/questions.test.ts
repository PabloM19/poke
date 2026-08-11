import { describe, expect, it } from 'vitest'
import { attackMultiplier } from '@/features/historical'
import { answerForMultiplier, generateEffectivenessQuestions } from './questions'

describe('preguntas de ¿Es eficaz?', () => {
  it('mapea los cuatro multiplicadores a respuestas educativas', () => {
    expect([2, 1, 0.5, 0].map((value) => answerForMultiplier(value as 0 | 0.5 | 1 | 2)))
      .toEqual(['super-effective', 'normal', 'not-very-effective', 'no-effect'])
  })

  it('utiliza relaciones reales para ×2, ×1, ×0,5 y ×0', () => {
    expect(attackMultiplier('fire', ['grass'], 4)).toBe(2)
    expect(attackMultiplier('normal', ['water'], 4)).toBe(1)
    expect(attackMultiplier('fire', ['water'], 4)).toBe(0.5)
    expect(attackMultiplier('normal', ['ghost'], 4)).toBe(0)
  })

  it('adapta el universo de tipos a la generación activa', () => {
    const firstGeneration = generateEffectivenessQuestions(1, 10, () => 0.25)
    const secondGeneration = generateEffectivenessQuestions(2, 10, () => 0.25)
    expect(firstGeneration.flatMap(({ attackingType, defendingType }) => [attackingType, defendingType]))
      .not.toEqual(expect.arrayContaining(['dark', 'steel']))
    expect(secondGeneration.flatMap(({ attackingType, defendingType }) => [attackingType, defendingType]))
      .toEqual(expect.arrayContaining(['dark', 'steel']))
  })

  it('genera diez cruces únicos y equilibrados', () => {
    const questions = generateEffectivenessQuestions(4, 10, () => 0.25)
    expect(questions).toHaveLength(10)
    expect(new Set(questions.map((question) => `${question.attackingType}:${question.defendingType}`)).size).toBe(10)
    const counts = questions.reduce<Record<string, number>>((result, question) => ({ ...result, [question.multiplier]: (result[question.multiplier] ?? 0) + 1 }), {})
    expect(counts).toEqual({ 0: 2, 1: 3, 2: 3, '0.5': 2 })
  })
})
