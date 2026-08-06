import { describe, expect, it, vi } from 'vitest'
import { getStored, setStored } from '@/lib/storage'
import {
  addFavoriteSpecies,
  clearFavorites,
  FAVORITES_CHANGED_EVENT,
  getFavoriteSpeciesIds,
  isFavoriteSpecies,
  removeFavoriteSpecies,
  toggleFavoriteSpecies,
} from './favoritesStore'

describe('favoritesStore', () => {
  it('añade por id, evita duplicados y conserva el orden', () => {
    expect(getFavoriteSpeciesIds()).toEqual([])
    expect(addFavoriteSpecies(25)).toBe(true)
    expect(addFavoriteSpecies(150)).toBe(true)
    expect(addFavoriteSpecies(25)).toBe(true)
    expect(getFavoriteSpeciesIds()).toEqual([25, 150])
    expect(isFavoriteSpecies(25)).toBe(true)
  })

  it('alterna y elimina favoritos', () => {
    expect(toggleFavoriteSpecies(1)).toEqual({ saved: true, isFavorite: true })
    expect(toggleFavoriteSpecies(1)).toEqual({ saved: true, isFavorite: false })
    addFavoriteSpecies(4)
    expect(removeFavoriteSpecies(4)).toBe(true)
    expect(getFavoriteSpeciesIds()).toEqual([])
  })

  it('limpia ids inválidos, duplicados y versiones desconocidas', () => {
    setStored('favorites:v1', {
      version: 1,
      speciesIds: [25, 25, 0, -1, 650, 150, 'pikachu'],
      updatedAt: Date.now(),
    })
    expect(getFavoriteSpeciesIds()).toEqual([25, 150])
    expect(getStored<{ speciesIds: number[] }>('favorites:v1')?.speciesIds).toEqual([25, 150])

    setStored('favorites:v1', { version: 99, speciesIds: [25] })
    expect(getFavoriteSpeciesIds()).toEqual([])
    expect(getStored('favorites:v1')).toBeNull()
  })

  it('rechaza ids fuera de Gen I–V y notifica cambios válidos', () => {
    const listener = vi.fn()
    window.addEventListener(FAVORITES_CHANGED_EVENT, listener)

    expect(addFavoriteSpecies(650)).toBe(false)
    expect(addFavoriteSpecies(0)).toBe(false)
    expect(listener).not.toHaveBeenCalled()
    expect(addFavoriteSpecies(649)).toBe(true)
    expect(listener).toHaveBeenCalledTimes(1)
    expect(clearFavorites()).toBe(true)
    expect(getFavoriteSpeciesIds()).toEqual([])

    window.removeEventListener(FAVORITES_CHANGED_EVENT, listener)
  })
})
