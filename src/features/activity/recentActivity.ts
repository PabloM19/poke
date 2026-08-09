import { getStored, removeStored, setStored } from '@/lib/storage'

export const RECENT_ACTIVITY_VERSION = 1
export const RECENT_ACTIVITY_STORAGE_KEY = 'recent-activity:v1'
export const RECENT_ACTIVITY_EVENT = 'pokeapp:recent-activity'

interface RecentActivityBase {
  id: string
  route: string
  title: string
  subtitle: string
  timestamp: number
}

export interface RecentPokemonActivity extends RecentActivityBase {
  kind: 'pokemon'
  speciesId: number
  spriteUrl: string | null
  types: readonly string[]
}

export interface RecentManualActivity extends RecentActivityBase {
  kind: 'manual'
  sectionId: string | null
  sectionTitle: string | null
  progress: number
}

export interface RecentComparisonActivity extends RecentActivityBase {
  kind: 'comparison'
  pokemonIds: readonly number[]
}

export type RecentActivity =
  | RecentPokemonActivity
  | RecentManualActivity
  | RecentComparisonActivity

export type RecentActivityInput =
  | Omit<RecentPokemonActivity, 'timestamp'>
  | Omit<RecentManualActivity, 'timestamp'>
  | Omit<RecentComparisonActivity, 'timestamp'>

interface RecentActivityStore {
  version: typeof RECENT_ACTIVITY_VERSION
  items: readonly RecentActivity[]
}

const KIND_LIMITS: Record<RecentActivity['kind'], number> = {
  pokemon: 8,
  manual: 6,
  comparison: 3,
}

let memoryStore: RecentActivityStore = { version: RECENT_ACTIVITY_VERSION, items: [] }

function isRoute(value: unknown): value is string {
  return typeof value === 'string' && value.startsWith('/') && value.length <= 300
}

function isBase(value: unknown): value is RecentActivityBase & { kind: string } {
  if (value == null || typeof value !== 'object') return false
  const item = value as Partial<RecentActivityBase> & { kind?: unknown }
  return typeof item.kind === 'string' &&
    typeof item.id === 'string' && item.id.length > 0 && item.id.length <= 120 &&
    isRoute(item.route) &&
    typeof item.title === 'string' && item.title.length > 0 && item.title.length <= 120 &&
    typeof item.subtitle === 'string' && item.subtitle.length <= 180 &&
    typeof item.timestamp === 'number' && Number.isFinite(item.timestamp)
}

function isActivity(value: unknown): value is RecentActivity {
  if (!isBase(value)) return false
  const item = value as Partial<RecentActivity>
  if (item.kind === 'pokemon') {
    return Number.isInteger(item.speciesId) && Number(item.speciesId) > 0 &&
      (item.spriteUrl == null || typeof item.spriteUrl === 'string') &&
      Array.isArray(item.types) && item.types.every((type) => typeof type === 'string')
  }
  if (item.kind === 'manual') {
    return (item.sectionId == null || typeof item.sectionId === 'string') &&
      (item.sectionTitle == null || typeof item.sectionTitle === 'string') &&
      typeof item.progress === 'number' && item.progress >= 0 && item.progress <= 1
  }
  if (item.kind === 'comparison') {
    return Array.isArray(item.pokemonIds) && item.pokemonIds.length >= 2 &&
      item.pokemonIds.every((id) => Number.isInteger(id) && id > 0)
  }
  return false
}

function notify(): void {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(RECENT_ACTIVITY_EVENT))
}

export function getRecentActivity(): readonly RecentActivity[] {
  const raw = getStored<unknown>(RECENT_ACTIVITY_STORAGE_KEY)
  if (raw == null) return memoryStore.items
  if (typeof raw !== 'object') {
    removeStored(RECENT_ACTIVITY_STORAGE_KEY)
    memoryStore = { version: RECENT_ACTIVITY_VERSION, items: [] }
    return memoryStore.items
  }
  const value = raw as Partial<RecentActivityStore>
  if (value.version !== RECENT_ACTIVITY_VERSION || !Array.isArray(value.items)) {
    removeStored(RECENT_ACTIVITY_STORAGE_KEY)
    memoryStore = { version: RECENT_ACTIVITY_VERSION, items: [] }
    return memoryStore.items
  }
  const items = value.items.filter(isActivity).sort((a, b) => b.timestamp - a.timestamp)
  memoryStore = { version: RECENT_ACTIVITY_VERSION, items }
  return memoryStore.items
}

export function recordRecentActivity(input: RecentActivityInput): readonly RecentActivity[] {
  const timestamp = Date.now()
  const nextItem = { ...input, timestamp } as RecentActivity
  if (!isActivity(nextItem)) return getRecentActivity()

  const existing = getRecentActivity().filter((item) => !(item.kind === nextItem.kind && item.id === nextItem.id))
  const candidates = [nextItem, ...existing].sort((a, b) => b.timestamp - a.timestamp)
  const counts: Partial<Record<RecentActivity['kind'], number>> = {}
  const items = candidates.filter((item) => {
    const count = counts[item.kind] ?? 0
    if (count >= KIND_LIMITS[item.kind]) return false
    counts[item.kind] = count + 1
    return true
  }).slice(0, 17)

  memoryStore = { version: RECENT_ACTIVITY_VERSION, items }
  setStored(RECENT_ACTIVITY_STORAGE_KEY, memoryStore)
  notify()
  return items
}

export function clearRecentActivity(): void {
  memoryStore = { version: RECENT_ACTIVITY_VERSION, items: [] }
  removeStored(RECENT_ACTIVITY_STORAGE_KEY)
  notify()
}
