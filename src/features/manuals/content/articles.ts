import { parseManualPage } from './markdownParser'
import {
  getSourcePagesForArticle,
  manualArticleDefinitions,
  printReferenceFor,
} from './manualSource'
import type { ManualArticle, ManualArticleDefinition } from './types'
import { insertManualVisuals } from './manualVisuals'

export function buildManualArticle(definition: ManualArticleDefinition): ManualArticle {
  const blocks = getSourcePagesForArticle(definition).flatMap((page) => {
    const pageBlocks = parseManualPage(page)
    return [
      { type: 'heading' as const, text: page.title ?? page.heading, level: 2 as const },
      ...insertManualVisuals(page.page, pageBlocks),
    ]
  })
  return {
    ...definition,
    printReference: printReferenceFor(definition),
    blocks,
  }
}

export const publishedManualArticles: readonly ManualArticle[] = manualArticleDefinitions
  .filter((definition) => definition.pageRange[1] <= 156)
  .map(buildManualArticle)

export function getPublishedManualArticle(pathname: string): ManualArticle | null {
  return publishedManualArticles.find((article) => article.path === pathname) ?? null
}
