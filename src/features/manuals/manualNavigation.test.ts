import { describe, expect, it } from 'vitest'
import {
  getAdjacentManualEntries,
  getManualEntry,
  manualNavigationEntries,
} from './manualNavigation'

describe('manualNavigation', () => {
  it('mantiene rutas únicas y orden editorial continuo de 21 a 86', () => {
    expect(new Set(manualNavigationEntries.map((entry) => entry.path)).size)
      .toBe(manualNavigationEntries.length)
    expect(manualNavigationEntries[0].pages[0]).toBe(21)
    expect(manualNavigationEntries.at(-1)?.pages[1]).toBe(86)

    for (let index = 1; index < manualNavigationEntries.length; index += 1) {
      expect(manualNavigationEntries[index].pages[0])
        .toBe(manualNavigationEntries[index - 1].pages[1] + 1)
    }
  })

  it('resuelve entradas y navegación anterior/siguiente', () => {
    const path = '/manuales/entrenador/combate'
    expect(getManualEntry(path)?.pages).toEqual([49, 54])
    expect(getAdjacentManualEntries(path)).toMatchObject({
      previous: { path: '/manuales/entrenador/explorar-region' },
      next: { path: '/manuales/entrenador/captura' },
    })
    expect(getManualEntry('/manuales/no-existe')).toBeNull()
  })
})
