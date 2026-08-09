import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getStored, setStored } from '@/lib/storage'
import {
  clearRecentActivity,
  getRecentActivity,
  RECENT_ACTIVITY_STORAGE_KEY,
  recordRecentActivity,
} from './recentActivity'

describe('actividad reciente', () => {
  beforeEach(() => {
    localStorage.clear()
    clearRecentActivity()
  })

  it('deduplica Pokémon y actualiza su recencia', () => {
    vi.useFakeTimers()
    vi.setSystemTime(10)
    const pokemon = (id: number, title: string) => ({
      kind: 'pokemon' as const,
      id: String(id),
      speciesId: id,
      route: `/pokemon/${id}`,
      title,
      subtitle: `#${id}`,
      spriteUrl: null,
      types: ['electric'],
    })
    recordRecentActivity(pokemon(25, 'Pikachu'))
    vi.setSystemTime(20)
    recordRecentActivity(pokemon(150, 'Mewtwo'))
    vi.setSystemTime(30)
    recordRecentActivity(pokemon(25, 'Pikachu'))

    expect(getRecentActivity().map((item) => item.id)).toEqual(['25', '150'])
    expect(getRecentActivity()[0].timestamp).toBe(30)
    vi.useRealTimers()
  })

  it('descarta estructuras corruptas sin romper', () => {
    setStored(RECENT_ACTIVITY_STORAGE_KEY, { version: 9, items: 'mal' })
    expect(getRecentActivity()).toEqual([])
    expect(getStored(RECENT_ACTIVITY_STORAGE_KEY)).toBeNull()
  })
})
