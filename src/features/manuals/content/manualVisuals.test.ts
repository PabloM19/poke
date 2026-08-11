import { describe, expect, it } from 'vitest'
import { publishedManualArticles } from './articles'
import { manualVisualCatalog, manualVisualStats } from './manualVisuals'

describe('manualVisualCatalog', () => {
  it('mantiene el catálogo real sin referencias a imágenes generadas', () => {
    const realVisuals = Object.values(manualVisualCatalog).filter((visual) => Boolean(visual.src))

    expect(realVisuals.length).toBeGreaterThanOrEqual(26)
    expect(manualVisualStats.realAssets).toBe(realVisuals.length)
    for (const visual of realVisuals) {
      expect(visual.credit?.toLowerCase()).not.toContain('generad')
      expect(visual.src).not.toMatch(/\.webp$/)
      expect(visual.src).toMatch(/^\/manuals\/visuals\/[a-z0-9-]+\.(?:jpg|png)$/)
    }
  })

  it('conserva una descripción exacta para cada placeholder editorial', () => {
    const placeholders = Object.values(manualVisualCatalog).filter((visual) => !visual.src)

    expect(placeholders).toHaveLength(26)
    for (const visual of placeholders) {
      expect(visual.id.length).toBeGreaterThan(3)
      expect(visual.alt.length).toBeGreaterThan(12)
      expect(visual.caption.length).toBeGreaterThan(12)
      expect(visual.placeholderDescription.length).toBeGreaterThan(12)
    }
  })

  it('acompaña con una figura todos los capítulos editoriales generales', () => {
    const generalArticles = publishedManualArticles.filter((article) => Math.max(...article.printReference.pages) <= 86)

    for (const article of generalArticles) {
      expect(
        article.blocks.some((block) => block.type === 'figure' || block.type === 'carousel'),
        `visual para ${article.path}`,
      ).toBe(true)
    }
  })
})
