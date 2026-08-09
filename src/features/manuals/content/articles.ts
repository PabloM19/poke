import { parseManualPage } from './markdownParser'
import {
  getSourcePagesForArticle,
  manualArticleDefinitions,
  printReferenceFor,
} from './manualSource'
import type { ManualArticle, ManualArticleDefinition } from './types'

export function buildManualArticle(definition: ManualArticleDefinition): ManualArticle {
  const blocks = getSourcePagesForArticle(definition).flatMap((page) => [
    { type: 'heading' as const, text: page.title ?? page.heading, level: 2 as const },
    ...parseManualPage(page),
  ])
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
