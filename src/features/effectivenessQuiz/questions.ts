import { attackMultiplier, getTypeNamesForGeneration } from '@/features/historical'
import type { GenId } from '@/lib/pokeapi'
import {
  EFFECTIVENESS_TOTAL_ROUNDS,
  type EffectivenessAnswer,
  type EffectivenessMultiplier,
  type GeneratedEffectivenessQuestion,
} from './model'

export const EFFECTIVENESS_ANSWERS: readonly EffectivenessAnswer[] = [
  'super-effective',
  'normal',
  'not-very-effective',
  'no-effect',
]

const ANSWER_LABELS: Record<EffectivenessAnswer, string> = {
  'super-effective': 'Supereficaz',
  normal: 'Eficacia normal',
  'not-very-effective': 'Poco eficaz',
  'no-effect': 'Sin efecto',
}

export function answerForMultiplier(multiplier: EffectivenessMultiplier): EffectivenessAnswer {
  if (multiplier === 2) return 'super-effective'
  if (multiplier === 0.5) return 'not-very-effective'
  if (multiplier === 0) return 'no-effect'
  return 'normal'
}

export function effectivenessAnswerLabel(answer: EffectivenessAnswer): string {
  return ANSWER_LABELS[answer]
}

export function effectivenessMultiplierLabel(multiplier: EffectivenessMultiplier): string {
  if (multiplier === 0.5) return '×0,5'
  return `×${multiplier}`
}

function shuffled<T>(values: readonly T[], random: () => number): T[] {
  const result = [...values]
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[result[index], result[swapIndex]] = [result[swapIndex], result[index]]
  }
  return result
}

export function generateEffectivenessQuestions(
  generation: GenId,
  total = EFFECTIVENESS_TOTAL_ROUNDS,
  random: () => number = Math.random,
): GeneratedEffectivenessQuestion[] {
  const types = getTypeNamesForGeneration(generation)
  const pools = new Map<EffectivenessMultiplier, GeneratedEffectivenessQuestion[]>([
    [0, []], [0.5, []], [1, []], [2, []],
  ])

  for (const attackingType of types) {
    for (const defendingType of types) {
      const multiplier = attackMultiplier(attackingType, [defendingType], generation)
      if (multiplier !== 0 && multiplier !== 0.5 && multiplier !== 1 && multiplier !== 2) continue
      pools.get(multiplier)?.push({ attackingType, defendingType, multiplier })
    }
  }

  for (const [multiplier, pool] of pools) pools.set(multiplier, shuffled(pool, random))

  const balancedPattern: EffectivenessMultiplier[] = [2, 1, 0.5, 0, 2, 1, 0.5, 0, 2, 1]
  const requested = Array.from({ length: total }, (_, index) => balancedPattern[index % balancedPattern.length])
  const questions = requested.map((multiplier) => {
    const question = pools.get(multiplier)?.pop()
    if (!question) throw new Error(`No existen cruces ×${multiplier} en la generación seleccionada`)
    return question
  })
  return shuffled(questions, random)
}
