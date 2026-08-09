import { describe, expect, it } from 'vitest'
import { manualNavigationEntries } from '../manualNavigation'
import { gameDefinitions, resourceDefinitions } from './definitions'
import {
  getSourcePagesForArticle,
  manualArticleDefinitions,
  manualContentRevision,
  manualEdition,
  manualSourcePages,
  manualSourceSha256,
  pagesInRange,
} from './manualSource'

describe('integridad editorial del manual', () => {
  it('extrae una vez cada página canónica de 21 a 156', () => {
    expect(manualEdition).toBe('ds-156-v1')
    expect(manualContentRevision).toBe('2026-08-06')
    expect(manualSourceSha256).toBe(
      'b0f171fc829902ca182f0ca1cca224ea857d1cf6e568e549470d416533ad6d00'
    )
    expect(manualSourcePages.map((page) => page.page)).toEqual(
      pagesInRange([21, 156])
    )
    expect(manualSourcePages.every((page) => page.heading && page.markdown)).toBe(true)
  })

  it('contabiliza cada página 21–156 en un solo artículo', () => {
    const coverage = new Map<number, number>()
    for (const definition of manualArticleDefinitions) {
      for (const page of pagesInRange(definition.pageRange)) {
        coverage.set(page, (coverage.get(page) ?? 0) + 1)
      }
      expect(getSourcePagesForArticle(definition)).toHaveLength(
        definition.pageRange[1] - definition.pageRange[0] + 1
      )
    }

    for (let page = 21; page <= 156; page += 1) {
      expect(coverage.get(page), `cobertura de página ${page}`).toBe(1)
    }
  })

  it('mantiene ids, rutas y orden únicos', () => {
    expect(new Set(manualArticleDefinitions.map((entry) => entry.id)).size)
      .toBe(manualArticleDefinitions.length)
    expect(new Set(manualArticleDefinitions.map((entry) => entry.path)).size)
      .toBe(manualArticleDefinitions.length)
    expect(manualArticleDefinitions.map((entry) => entry.order))
      .toEqual(Array.from({ length: manualArticleDefinitions.length }, (_, index) => index + 1))
  })

  it('sincroniza las rutas publicadas de Fase 2 con el manifiesto', () => {
    const published = manualArticleDefinitions.filter((entry) => entry.pageRange[1] <= 86)
    expect(manualNavigationEntries.filter((entry) => entry.pages[1] <= 86).map((entry) => ({ path: entry.path, pages: entry.pages })))
      .toEqual(published.map((entry) => ({ path: entry.path, pages: entry.pageRange })))
  })

  it('define exactamente once juegos y seis recursos estables', () => {
    expect(gameDefinitions).toHaveLength(11)
    expect(resourceDefinitions.map((resource) => resource.code))
      .toEqual(['R-01', 'R-02', 'R-03', 'R-04', 'R-05', 'R-06'])
    expect(gameDefinitions.find((game) => game.slug === 'perla')).toMatchObject({
      generation: 4,
      version: 'pearl',
      versionGroup: 'diamond-pearl',
      pokedex: 'original-sinnoh',
    })
    expect(gameDefinitions.filter((game) => game.family !== 'main').every(
      (game) => game.version == null && game.versionGroup == null && game.pokedex == null
    )).toBe(true)
  })
})
