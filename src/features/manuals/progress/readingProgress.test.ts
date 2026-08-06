import { beforeEach, describe, expect, it } from 'vitest'
import { getStored, setStored } from '@/lib/storage'
import {
  getManualReadingProgress,
  manualLessonCount,
  recordLastRead,
  setArticleCompleted,
} from './readingProgress'

const key = 'manuals:reading:v1'
const validPath = '/manuales/entrenador/combate'

describe('progreso de lectura', () => {
  beforeEach(() => localStorage.clear())

  it('guarda el último artículo y permite completar/deshacer', () => {
    expect(manualLessonCount).toBe(20)
    expect(recordLastRead(validPath).lastPath).toBe(validPath)
    expect(setArticleCompleted(validPath, true).completedPaths).toEqual([validPath])
    expect(setArticleCompleted(validPath, true).completedPaths).toEqual([validPath])
    expect(setArticleCompleted(validPath, false).completedPaths).toEqual([])
  })

  it('limpia estructuras corruptas y filtra rutas desconocidas', () => {
    setStored(key, { lastPath: '/manuales/no-existe', completedPaths: [validPath, '/mal', validPath], updatedAt: 'ayer' })
    expect(getManualReadingProgress()).toEqual({
      lastPath: null,
      completedPaths: [validPath],
      updatedAt: 0,
    })

    setStored(key, { completedPaths: 'no-array' })
    expect(getManualReadingProgress().completedPaths).toEqual([])
    expect(getStored(key)).toBeNull()
  })

  it('ignora rutas no publicadas', () => {
    recordLastRead('/manuales/juegos/oro-heartgold')
    expect(getManualReadingProgress().lastPath).toBeNull()
  })
})
