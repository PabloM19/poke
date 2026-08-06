export const POKEMON_SUMMARY_SNAPSHOT_VERSION = 'v1' as const
export const POKEMON_SUMMARY_EXPECTED_COUNT = 649

export interface PokemonBaseStats {
  hp: number
  attack: number
  defense: number
  specialAttack: number
  specialDefense: number
  speed: number
}

export interface PokemonSummaryItem {
  id: number
  name: string
  nameEs: string
  generationId: number
  types: string[]
  stats: PokemonBaseStats
  total: number
  sprite: string | null
}

export interface PokemonSummarySnapshot {
  version: typeof POKEMON_SUMMARY_SNAPSHOT_VERSION
  generatedAt: string
  source: 'pokeapi.co'
  count: number
  items: PokemonSummaryItem[]
}

export interface NormalizeSnapshotOptions {
  expectedCount?: number
}

const STAT_KEYS = [
  'hp',
  'attack',
  'defense',
  'specialAttack',
  'specialDefense',
  'speed',
] as const

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

export function generationForSpeciesId(id: number): number | null {
  if (!Number.isInteger(id) || id < 1 || id > POKEMON_SUMMARY_EXPECTED_COUNT) return null
  if (id <= 151) return 1
  if (id <= 251) return 2
  if (id <= 386) return 3
  if (id <= 493) return 4
  return 5
}

function normalizeStats(value: unknown): PokemonBaseStats | null {
  if (!isRecord(value)) return null

  const entries = STAT_KEYS.map((key) => value[key])
  if (!entries.every((stat) => Number.isInteger(stat) && Number(stat) >= 0)) return null

  return {
    hp: Number(value.hp),
    attack: Number(value.attack),
    defense: Number(value.defense),
    specialAttack: Number(value.specialAttack),
    specialDefense: Number(value.specialDefense),
    speed: Number(value.speed),
  }
}

export function normalizePokemonSummaryItem(value: unknown): PokemonSummaryItem | null {
  if (!isRecord(value)) return null
  if (!Number.isInteger(value.id)) return null

  const id = Number(value.id)
  const expectedGeneration = generationForSpeciesId(id)
  if (expectedGeneration == null || value.generationId !== expectedGeneration) return null
  if (!isNonEmptyString(value.name) || !isNonEmptyString(value.nameEs)) return null

  if (!Array.isArray(value.types) || value.types.length < 1 || value.types.length > 2) return null
  if (!value.types.every(isNonEmptyString) || new Set(value.types).size !== value.types.length) return null

  const stats = normalizeStats(value.stats)
  if (stats == null || !Number.isInteger(value.total)) return null
  const calculatedTotal = STAT_KEYS.reduce((sum, key) => sum + stats[key], 0)
  if (value.total !== calculatedTotal) return null

  if (value.sprite !== null && !isNonEmptyString(value.sprite)) return null
  if (typeof value.sprite === 'string' && !value.sprite.startsWith('https://')) return null

  return {
    id,
    name: value.name.trim(),
    nameEs: value.nameEs.trim(),
    generationId: expectedGeneration,
    types: [...value.types],
    stats,
    total: calculatedTotal,
    sprite: value.sprite,
  }
}

export function normalizePokemonSummarySnapshot(
  value: unknown,
  { expectedCount = POKEMON_SUMMARY_EXPECTED_COUNT }: NormalizeSnapshotOptions = {}
): PokemonSummarySnapshot | null {
  if (!isRecord(value)) return null
  if (value.version !== POKEMON_SUMMARY_SNAPSHOT_VERSION) return null
  if (value.source !== 'pokeapi.co') return null
  if (!isNonEmptyString(value.generatedAt) || Number.isNaN(Date.parse(value.generatedAt))) return null
  if (!Number.isInteger(value.count) || value.count !== expectedCount) return null
  if (!Array.isArray(value.items) || value.items.length !== expectedCount) return null

  const items: PokemonSummaryItem[] = []
  let previousId = 0
  for (const rawItem of value.items) {
    const item = normalizePokemonSummaryItem(rawItem)
    if (item == null || item.id <= previousId) return null
    items.push(item)
    previousId = item.id
  }

  return {
    version: POKEMON_SUMMARY_SNAPSHOT_VERSION,
    generatedAt: new Date(value.generatedAt).toISOString(),
    source: 'pokeapi.co',
    count: expectedCount,
    items,
  }
}
