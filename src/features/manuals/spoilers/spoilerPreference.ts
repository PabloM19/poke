import { createContext, useContext } from 'react'
import type { SpoilerLevel } from '../content/types'

export interface SpoilerPreferenceValue {
  level: SpoilerLevel
  setLevel: (level: SpoilerLevel) => void
}

export const spoilerLevelRank: Record<SpoilerLevel, number> = {
  none: 0,
  mechanics: 1,
  guide: 2,
}

export function canShowSpoilerLevel(preference: SpoilerLevel, content: SpoilerLevel): boolean {
  return spoilerLevelRank[content] <= spoilerLevelRank[preference]
}

export const SpoilerPreferenceContext = createContext<SpoilerPreferenceValue | null>(null)

export function useSpoilerPreference(): SpoilerPreferenceValue {
  const value = useContext(SpoilerPreferenceContext)
  if (value == null) throw new Error('useSpoilerPreference debe usarse dentro de SpoilerPreferenceProvider')
  return value
}
