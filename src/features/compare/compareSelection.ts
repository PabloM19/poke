export const MIN_COMPARE_POKEMON = 2
export const MAX_COMPARE_POKEMON = 4
export const MAX_COMPARE_SPECIES_ID = 649

function validId(value: number): boolean {
  return Number.isSafeInteger(value) && value >= 1 && value <= MAX_COMPARE_SPECIES_ID
}

export function parseCompareIds(input: string | URLSearchParams): readonly number[] {
  const params = typeof input === 'string'
    ? new URLSearchParams(input.startsWith('?') ? input.slice(1) : input)
    : input
  const raw = params.get('ids') ?? ''
  const ids: number[] = []
  for (const part of raw.split(',')) {
    if (!/^\d+$/.test(part.trim())) continue
    const id = Number(part)
    if (!validId(id) || ids.includes(id)) continue
    ids.push(id)
    if (ids.length === MAX_COMPARE_POKEMON) break
  }
  return ids
}

export function compareSearchParams(ids: readonly number[]): URLSearchParams {
  const cleaned = [...new Set(ids.filter(validId))].slice(0, MAX_COMPARE_POKEMON)
  const params = new URLSearchParams()
  if (cleaned.length > 0) params.set('ids', cleaned.join(','))
  return params
}

export type AddCompareResult =
  | { status: 'added'; ids: readonly number[] }
  | { status: 'duplicate' | 'full' | 'invalid'; ids: readonly number[] }

export function addCompareId(ids: readonly number[], speciesId: number): AddCompareResult {
  if (!validId(speciesId)) return { status: 'invalid', ids }
  if (ids.includes(speciesId)) return { status: 'duplicate', ids }
  if (ids.length >= MAX_COMPARE_POKEMON) return { status: 'full', ids }
  return { status: 'added', ids: [...ids, speciesId] }
}

export function removeCompareId(ids: readonly number[], speciesId: number): readonly number[] {
  return ids.filter((id) => id !== speciesId)
}
