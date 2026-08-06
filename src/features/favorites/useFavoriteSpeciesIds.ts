import { useEffect, useState } from 'react'
import { FAVORITES_CHANGED_EVENT, getFavoriteSpeciesIds } from './favoritesStore'

export function useFavoriteSpeciesIds(): readonly number[] {
  const [ids, setIds] = useState(() => getFavoriteSpeciesIds())

  useEffect(() => {
    const refresh = () => setIds(getFavoriteSpeciesIds())
    window.addEventListener(FAVORITES_CHANGED_EVENT, refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener(FAVORITES_CHANGED_EVENT, refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])

  return ids
}
