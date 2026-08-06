import { useCallback, useEffect, useState } from 'react'
import {
  FAVORITES_CHANGED_EVENT,
  isFavoriteSpecies,
  toggleFavoriteSpecies,
} from './favoritesStore'

export function useFavoriteSpecies(speciesId: number) {
  const [isFavorite, setIsFavorite] = useState(() => isFavoriteSpecies(speciesId))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const refresh = () => setIsFavorite(isFavoriteSpecies(speciesId))
    window.addEventListener(FAVORITES_CHANGED_EVENT, refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener(FAVORITES_CHANGED_EVENT, refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [speciesId])

  const toggle = useCallback(() => {
    const result = toggleFavoriteSpecies(speciesId)
    if (!result.saved) {
      setError('No se pudo guardar el favorito en este navegador.')
      return
    }
    setError(null)
    setIsFavorite(result.isFavorite)
  }, [speciesId])

  return { isFavorite, toggle, error }
}
