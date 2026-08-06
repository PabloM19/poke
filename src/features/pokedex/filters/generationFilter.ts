import type { SpeciesIndexItem } from '@/lib/pokedex'

export type GenerationFilter = 1 | 2 | 3 | 4 | 5 | null

export function filterSpeciesByGeneration(
  items: readonly SpeciesIndexItem[],
  generation: GenerationFilter
): readonly SpeciesIndexItem[] {
  return generation == null
    ? items
    : items.filter((item) => item.generationId === generation)
}
