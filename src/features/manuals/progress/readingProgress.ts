import { getStored, removeStored, setStored } from '@/lib/storage'
import { publishedManualArticles } from '../content/articles'

const STORAGE_KEY = 'manuals:reading:v1'
const validPaths = new Set(publishedManualArticles.map((article) => article.path))

export interface ManualReadingProgress {
  lastPath: string | null
  completedPaths: readonly string[]
  updatedAt: number
}

const emptyProgress = (): ManualReadingProgress => ({
  lastPath: null,
  completedPaths: [],
  updatedAt: 0,
})

export function getManualReadingProgress(): ManualReadingProgress {
  const raw = getStored<unknown>(STORAGE_KEY)
  if (raw == null) return emptyProgress()
  if (typeof raw !== 'object') {
    removeStored(STORAGE_KEY)
    return emptyProgress()
  }
  const value = raw as Partial<ManualReadingProgress>
  if (!Array.isArray(value.completedPaths) ||
      !value.completedPaths.every((path) => typeof path === 'string')) {
    removeStored(STORAGE_KEY)
    return emptyProgress()
  }

  const completedPaths = [...new Set(value.completedPaths.filter((path) => validPaths.has(path)))]
  const lastPath = typeof value.lastPath === 'string' && validPaths.has(value.lastPath)
    ? value.lastPath
    : null
  return {
    lastPath,
    completedPaths,
    updatedAt: typeof value.updatedAt === 'number' ? value.updatedAt : 0,
  }
}

function saveProgress(progress: ManualReadingProgress): boolean {
  return setStored(STORAGE_KEY, progress)
}

export function recordLastRead(path: string): ManualReadingProgress {
  const current = getManualReadingProgress()
  if (!validPaths.has(path)) return current
  const next = { ...current, lastPath: path, updatedAt: Date.now() }
  saveProgress(next)
  return next
}

export function setArticleCompleted(path: string, completed: boolean): ManualReadingProgress {
  const current = getManualReadingProgress()
  if (!validPaths.has(path)) return current
  const paths = new Set(current.completedPaths)
  if (completed) paths.add(path)
  else paths.delete(path)
  const next = {
    lastPath: path,
    completedPaths: [...paths],
    updatedAt: Date.now(),
  }
  saveProgress(next)
  return next
}

export const manualLessonCount = publishedManualArticles.length
