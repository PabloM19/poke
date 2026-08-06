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
    const lessons = manualNavigationEntries.filter((entry) => entry.pages[1] <= 86)
    expect(lessons[0].pages[0]).toBe(21)
    expect(lessons.at(-1)?.pages[1]).toBe(86)

    for (let index = 1; index < lessons.length; index += 1) {
      expect(lessons[index].pages[0])
        .toBe(lessons[index - 1].pages[1] + 1)
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

  it('publica R-01 y R-02 con rutas estables', () => {
    expect(getManualEntry('/manuales/recursos/r-01')).toMatchObject({ family: 'resources', pages: [153, 154] })
    expect(getManualEntry('/manuales/recursos/r-02')).toMatchObject({ family: 'resources', pages: [153, 154] })
  })
})
