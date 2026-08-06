import { gameDefinitions, resourceDefinitions } from '../content/definitions'
import { publishedManualArticles } from '../content/articles'
import type { ManualBlock } from '../content/types'

export type ManualSearchResultKind = 'article' | 'game' | 'resource'

export interface ManualSearchResult {
  id: string
  kind: ManualSearchResultKind
  title: string
  description: string
  path: string
  score: number
}

function normalize(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es')
}

function compact(value: string): string {
  return normalize(value).replace(/[^a-z0-9]+/g, '')
}

function blockText(block: ManualBlock): string {
  if ('text' in block) return block.text
  if ('items' in block) return block.items.join(' ')
  if (block.type === 'type-example') return block.matchups.join(' ')
  if (block.type === 'table') return [...block.headers, ...block.rows.flat()].join(' ')
  return ''
}

function gameDestination(family: 'main' | 'pmd' | 'spin-off'): string {
  if (family === 'spin-off') return '/manuales/otros'
  if (family === 'pmd') return '/manuales/mundo-misterioso/misiones-y-fracaso'
  return '/manuales/empezar/recursos-y-coleccion'
}

function resourceDestination(code: string): string {
  return ['R-05', 'R-06'].includes(code)
    ? '/manuales/otros'
    : '/manuales/empezar/recursos-y-coleccion'
}

const searchableEntries = [
  ...publishedManualArticles.map((article) => ({
    id: article.id,
    kind: 'article' as const,
    title: article.title,
    description: article.summary,
    path: article.path,
    searchText: [
      article.title,
      article.summary,
      ...article.searchTerms,
      ...article.blocks.map(blockText),
    ].join(' '),
  })),
  ...gameDefinitions.map((game) => ({
    id: `game-${game.slug}`,
    kind: 'game' as const,
    title: game.title,
    description: game.family === 'main'
      ? 'Juego de la saga principal'
      : game.family === 'pmd' ? 'Juego de Mundo Misterioso' : 'Otra forma de jugar',
    path: gameDestination(game.family),
    searchText: `${game.title} ${game.slug} ${game.version ?? ''} ${game.versionGroup ?? ''}`,
  })),
  ...resourceDefinitions.map((resource) => ({
    id: `resource-${resource.code}`,
    kind: 'resource' as const,
    title: `${resource.code} · ${resource.title}`,
    description: 'Recurso complementario del manual',
    path: resourceDestination(resource.code),
    searchText: `${resource.code} ${resource.title}`,
  })),
]

export function searchManuals(query: string, limit = 12): readonly ManualSearchResult[] {
  const normalizedQuery = normalize(query.trim())
  if (normalizedQuery.length < 2) return []
  const compactQuery = compact(query)
  const terms = normalizedQuery.split(/\s+/).filter(Boolean)

  const results: ManualSearchResult[] = []
  for (const entry of searchableEntries) {
    const title = normalize(entry.title)
    const text = normalize(entry.searchText)
    const compactText = compact(entry.searchText)
    if (!terms.every((term) => text.includes(term)) && !compactText.includes(compactQuery)) continue
    let score = entry.kind === 'article' ? 20 : 30
    if (title === normalizedQuery || compact(entry.title) === compactQuery) score += 100
    else if (title.startsWith(normalizedQuery)) score += 70
    else if (title.includes(normalizedQuery)) score += 45
    results.push({
      id: entry.id,
      kind: entry.kind,
      title: entry.title,
      description: entry.description,
      path: entry.path,
      score,
    })
  }
  return results
    .sort((left, right) => right.score - left.score || left.title.localeCompare(right.title, 'es'))
    .slice(0, limit)
}
