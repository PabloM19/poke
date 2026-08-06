export type GenerationFilter = 1 | 2 | 3 | 4 | 5 | null

export function filterSpeciesByGeneration<T extends { generationId: number }>(
  items: readonly T[],
  generation: GenerationFilter
): readonly T[] {
  return generation == null
    ? items
    : items.filter((item) => item.generationId === generation)
}
