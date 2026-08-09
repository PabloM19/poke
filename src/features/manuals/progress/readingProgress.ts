import { getStored, removeStored, setStored } from '@/lib/storage'
import { recordRecentActivity } from '@/features/activity'
import { getPublishedManualArticle, publishedManualArticles } from '../content/articles'

const STORAGE_KEY = 'manuals:reading:v2'
const LEGACY_STORAGE_KEY = 'manuals:reading:v1'
export const MANUAL_PROGRESS_EVENT = 'pokeapp:manual-progress'
const validPaths = new Set(publishedManualArticles.map((article) => article.path))

export interface ManualReadingEntry {
  path: string
  sectionId: string | null
  sectionTitle: string | null
  progress: number
  updatedAt: number
}

export interface ManualReadingProgress {
  version: 2
  lastPath: string | null
  completedPaths: readonly string[]
  entries: readonly ManualReadingEntry[]
  updatedAt: number
}

const emptyProgress = (): ManualReadingProgress => ({
  version: 2,
  lastPath: null,
  completedPaths: [],
  entries: [],
  updatedAt: 0,
})

function notify(): void {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(MANUAL_PROGRESS_EVENT))
}

function isReadingEntry(value: unknown): value is ManualReadingEntry {
  if (value == null || typeof value !== 'object') return false
  const entry = value as Partial<ManualReadingEntry>
  return typeof entry.path === 'string' && validPaths.has(entry.path) &&
    (entry.sectionId == null || typeof entry.sectionId === 'string') &&
    (entry.sectionTitle == null || typeof entry.sectionTitle === 'string') &&
    typeof entry.progress === 'number' && entry.progress >= 0 && entry.progress <= 1 &&
    typeof entry.updatedAt === 'number' && Number.isFinite(entry.updatedAt)
}

function normalize(raw: unknown, allowLegacy = false): ManualReadingProgress | null {
  if (raw == null || typeof raw !== 'object') return null
  const value = raw as Partial<ManualReadingProgress>
  if (!allowLegacy && value.version !== 2) return null
  if (!Array.isArray(value.completedPaths) ||
      !value.completedPaths.every((path) => typeof path === 'string')) return null

  const completedPaths = [...new Set(value.completedPaths.filter((path) => validPaths.has(path)))]
  const lastPath = typeof value.lastPath === 'string' && validPaths.has(value.lastPath)
    ? value.lastPath
    : null
  const entries = Array.isArray(value.entries)
    ? value.entries.filter(isReadingEntry).sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 8)
    : []
  return {
    version: 2,
    lastPath,
    completedPaths,
    entries,
    updatedAt: typeof value.updatedAt === 'number' ? value.updatedAt : 0,
  }
}

function migrateLegacy(): ManualReadingProgress | null {
  const legacy = getStored<unknown>(LEGACY_STORAGE_KEY)
  const normalized = normalize(legacy, true)
  if (!normalized) return null
  setStored(STORAGE_KEY, normalized)
  removeStored(LEGACY_STORAGE_KEY)
  return normalized
}

export function getManualReadingProgress(): ManualReadingProgress {
  const raw = getStored<unknown>(STORAGE_KEY)
  if (raw == null) return migrateLegacy() ?? emptyProgress()
  const normalized = normalize(raw)
  if (normalized) return normalized
  removeStored(STORAGE_KEY)
  return emptyProgress()
}

function saveProgress(progress: ManualReadingProgress): boolean {
  const written = setStored(STORAGE_KEY, progress)
  notify()
  return written
}

export function recordLastRead(path: string): ManualReadingProgress {
  const current = getManualReadingProgress()
  if (!validPaths.has(path)) return current
  const existing = current.entries.find((entry) => entry.path === path)
  const updatedAt = Date.now()
  const entry: ManualReadingEntry = existing
    ? { ...existing, updatedAt }
    : { path, sectionId: null, sectionTitle: null, progress: 0, updatedAt }
  const next = {
    ...current,
    lastPath: path,
    entries: [entry, ...current.entries.filter((item) => item.path !== path)].slice(0, 8),
    updatedAt,
  }
  saveProgress(next)
  return next
}

export function recordReadingPosition(
  path: string,
  position: Pick<ManualReadingEntry, 'sectionId' | 'sectionTitle' | 'progress'>,
): ManualReadingProgress {
  const current = getManualReadingProgress()
  if (!validPaths.has(path)) return current
  const updatedAt = Date.now()
  const entry: ManualReadingEntry = {
    path,
    sectionId: position.sectionId,
    sectionTitle: position.sectionTitle,
    progress: Math.max(0, Math.min(1, position.progress)),
    updatedAt,
  }
  const next = {
    ...current,
    lastPath: path,
    entries: [entry, ...current.entries.filter((item) => item.path !== path)].slice(0, 8),
    updatedAt,
  }
  saveProgress(next)

  const article = getPublishedManualArticle(path)
  if (article) {
    recordRecentActivity({
      kind: 'manual',
      id: path,
      route: position.sectionId ? `${path}#${position.sectionId}` : path,
      title: article.title,
      subtitle: position.sectionTitle ?? 'Continúa la lectura',
      sectionId: position.sectionId,
      sectionTitle: position.sectionTitle,
      progress: entry.progress,
    })
  }
  return next
}

export function setArticleCompleted(path: string, completed: boolean): ManualReadingProgress {
  const current = getManualReadingProgress()
  if (!validPaths.has(path)) return current
  const paths = new Set(current.completedPaths)
  if (completed) paths.add(path)
  else paths.delete(path)
  const next = {
    ...current,
    lastPath: path,
    completedPaths: [...paths],
    updatedAt: Date.now(),
  }
  saveProgress(next)
  return next
}

export function clearManualReadingActivity(): ManualReadingProgress {
  const current = getManualReadingProgress()
  const next: ManualReadingProgress = {
    ...current,
    lastPath: null,
    entries: [],
    updatedAt: Date.now(),
  }
  saveProgress(next)
  return next
}

export const manualLessonCount = publishedManualArticles.length
