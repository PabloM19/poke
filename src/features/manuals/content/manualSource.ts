import generated from './manual-pages.generated.json'
import manifest from './manual-manifest.json'
import type {
  ManualArticleDefinition,
  ManualContentFamily,
  ManualSourcePage,
  PrintReference,
  SpoilerLevel,
} from './types'

const families = new Set<ManualContentFamily>([
  'start',
  'trainer',
  'mystery-dungeon',
  'other',
  'main-game',
  'pmd-game',
  'spin-off',
  'resources',
])
const spoilerLevels = new Set<SpoilerLevel>(['none', 'mechanics', 'guide'])

function assertArticleDefinition(value: unknown): asserts value is ManualArticleDefinition {
  if (typeof value !== 'object' || value == null) throw new Error('Artículo de manual inválido')
  const record = value as Record<string, unknown>
  if (
    typeof record.id !== 'string' ||
    typeof record.slug !== 'string' ||
    typeof record.path !== 'string' ||
    !record.path.startsWith('/manuales') ||
    typeof record.title !== 'string' ||
    typeof record.summary !== 'string' ||
    !Number.isInteger(record.order) ||
    !families.has(record.family as ManualContentFamily) ||
    !spoilerLevels.has(record.spoilerLevel as SpoilerLevel) ||
    !Array.isArray(record.pageRange) ||
    record.pageRange.length !== 2 ||
    !record.pageRange.every(Number.isInteger) ||
    !Array.isArray(record.searchTerms) ||
    !record.searchTerms.every((term) => typeof term === 'string')
  ) {
    throw new Error(`Definición editorial inválida: ${String(record.id ?? 'sin id')}`)
  }
}

export const manualEdition = generated.edition as PrintReference['edition']
export const manualSourceSha256 = generated.sourceSha256
export const manualSourcePages: readonly ManualSourcePage[] = generated.pages
export const manualArticleDefinitions: readonly ManualArticleDefinition[] = manifest.map((entry) => {
  assertArticleDefinition(entry)
  return entry
})

export function pagesInRange(range: readonly [number, number]): readonly number[] {
  return Array.from({ length: range[1] - range[0] + 1 }, (_, index) => range[0] + index)
}

export function getSourcePagesForArticle(
  definition: ManualArticleDefinition
): readonly ManualSourcePage[] {
  const expected = new Set(pagesInRange(definition.pageRange))
  return manualSourcePages.filter((page) => expected.has(page.page))
}

export function printReferenceFor(
  definition: ManualArticleDefinition
): PrintReference {
  return {
    edition: manualEdition,
    pages: pagesInRange(definition.pageRange),
  }
}
