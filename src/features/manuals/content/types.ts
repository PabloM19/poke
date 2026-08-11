export type SpoilerLevel = 'none' | 'mechanics' | 'guide'

export type ManualContentFamily =
  | 'start'
  | 'trainer'
  | 'mystery-dungeon'
  | 'other'
  | 'main-game'
  | 'pmd-game'
  | 'spin-off'
  | 'resources'

export interface PrintReference {
  edition: 'ds-156-v1'
  pages: readonly number[]
}

export type ManualFigureAspectRatio = '16:9' | '4:3' | '3:2' | 'portrait'
export type ManualFigureKind = 'screenshot' | 'artwork' | 'diagram'

export interface ManualFigureData {
  id: string
  src?: string
  alt: string
  caption: string
  credit?: string
  aspectRatio?: ManualFigureAspectRatio
  objectFit?: 'contain' | 'cover'
  kind?: ManualFigureKind
  placeholderDescription: string
}

export type ManualBlock =
  | { type: 'heading'; text: string; level: 2 | 3 }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: readonly string[]; ordered?: boolean }
  | { type: 'steps'; title?: string; items: readonly string[] }
  | { type: 'tip' | 'note' | 'warning'; title?: string; text: string }
  | { type: 'type-example'; title?: string; matchups: readonly string[] }
  | { type: 'table'; headers: readonly string[]; rows: readonly (readonly string[])[] }
  | { type: 'pokemon-grid'; title?: string; speciesIds: readonly number[] }
  | ({ type: 'figure' } & ManualFigureData)
  | { type: 'carousel'; id: string; label: string; figures: readonly ManualFigureData[] }
  | { type: 'print-reference'; reference: PrintReference }

export interface ManualArticle {
  id: string
  slug: string
  path: string
  title: string
  summary: string
  order: number
  family: ManualContentFamily
  spoilerLevel: SpoilerLevel
  printReference: PrintReference
  blocks: readonly ManualBlock[]
  searchTerms: readonly string[]
}

export interface ManualArticleDefinition extends Omit<ManualArticle, 'blocks' | 'printReference'> {
  pageRange: readonly [number, number]
}

export interface ManualSourcePage {
  page: number
  heading: string
  title: string | null
  markdown: string
}

export interface GameDefinition {
  slug: string
  title: string
  family: 'main' | 'pmd' | 'spin-off'
  generation: number | null
  version: string | null
  versionGroup: string | null
  pokedex: string | null
  printReference: PrintReference
}

export interface ResourceDefinition {
  code: `R-0${1 | 2 | 3 | 4 | 5 | 6}`
  title: string
  path: string
  spoilerLevel: SpoilerLevel
  relatedGames: readonly string[]
}

export interface PokemonReference {
  speciesId: number
  name: string
  description?: string
}
