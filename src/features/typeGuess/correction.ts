import type { TypeGuessResult } from './model'

export interface TypeGuessCorrection {
  result: TypeGuessResult
  matchedTypes: readonly string[]
  missingTypes: readonly string[]
  extraTypes: readonly string[]
}

export function correctTypeGuess(selectedTypes: readonly string[], actualTypes: readonly string[]): TypeGuessCorrection {
  const selected = new Set(selectedTypes)
  const actual = new Set(actualTypes)
  const matchedTypes = [...actual].filter((type) => selected.has(type))
  const missingTypes = [...actual].filter((type) => !selected.has(type))
  const extraTypes = [...selected].filter((type) => !actual.has(type))
  const exact = selected.size === actual.size && missingTypes.length === 0
  return {
    result: exact ? 'correct' : matchedTypes.length > 0 ? 'partial' : 'incorrect',
    matchedTypes,
    missingTypes,
    extraTypes,
  }
}

export function toggleTypeSelection(current: readonly string[], type: string, max = 2): readonly string[] {
  if (current.includes(type)) return current.filter((entry) => entry !== type)
  if (current.length < max) return [...current, type]
  return [current[current.length - 1], type]
}

