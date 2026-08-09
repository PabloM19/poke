import { beforeEach, describe, expect, it } from 'vitest'
import { getStored, setStored } from '@/lib/storage'
import {
  getManualReadingProgress,
  manualLessonCount,
  recordLastRead,
  recordReadingPosition,
  setArticleCompleted,
} from './readingProgress'

const key = 'manuals:reading:v2'
const validPath = '/manuales/entrenador/combate'

describe('progreso de lectura', () => {
  beforeEach(() => localStorage.clear())

  it('guarda el último artículo y permite completar/deshacer', () => {
    expect(manualLessonCount).toBe(30)
    expect(recordLastRead(validPath).lastPath).toBe(validPath)
    expect(setArticleCompleted(validPath, true).completedPaths).toEqual([validPath])
    expect(setArticleCompleted(validPath, true).completedPaths).toEqual([validPath])
    expect(setArticleCompleted(validPath, false).completedPaths).toEqual([])
  })

  it('limpia estructuras corruptas y filtra rutas desconocidas', () => {
    setStored(key, { version: 2, lastPath: '/manuales/no-existe', completedPaths: [validPath, '/mal', validPath], entries: [], updatedAt: 'ayer' })
    expect(getManualReadingProgress()).toEqual({
      version: 2,
      lastPath: null,
      completedPaths: [validPath],
      entries: [],
      updatedAt: 0,
    })

    setStored(key, { version: 2, completedPaths: 'no-array' })
    expect(getManualReadingProgress().completedPaths).toEqual([])
    expect(getStored(key)).toBeNull()
  })

  it('ignora rutas no publicadas', () => {
    recordLastRead('/manuales/recursos/r-03')
    expect(getManualReadingProgress().lastPath).toBeNull()
  })

  it('guarda una sección estable y un porcentaje limitado', () => {
    const progress = recordReadingPosition(validPath, {
      sectionId: 'seccion-4',
      sectionTitle: 'Afinidad de tipos',
      progress: 1.4,
    })
    expect(progress.entries[0]).toMatchObject({
      path: validPath,
      sectionId: 'seccion-4',
      sectionTitle: 'Afinidad de tipos',
      progress: 1,
    })
  })
})
