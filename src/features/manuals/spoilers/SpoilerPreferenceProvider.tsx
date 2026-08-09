import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { getSetting, setSetting } from '@/lib/storage'
import type { SpoilerLevel } from '../content/types'
import { SpoilerPreferenceContext } from './spoilerPreference'

export function SpoilerPreferenceProvider({
  children,
  initialLevel,
}: {
  children: ReactNode
  initialLevel?: SpoilerLevel
}) {
  const [level, setLevelState] = useState<SpoilerLevel>(() => initialLevel ?? getSetting('spoilerLevel', 'none'))
  const setLevel = useCallback((next: SpoilerLevel) => {
    setLevelState(next)
    setSetting('spoilerLevel', next)
  }, [])
  const value = useMemo(() => ({ level, setLevel }), [level, setLevel])
  return <SpoilerPreferenceContext.Provider value={value}>{children}</SpoilerPreferenceContext.Provider>
}
