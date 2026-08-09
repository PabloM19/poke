import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ManualArticleContent } from '../components/ManualArticleContent'
import { manualNavigationEntries } from '../manualNavigation'
import { publishedManualArticles } from './articles'

describe('referencias de la edición física', () => {
  it('mantiene los 30 artículos dentro de las 156 páginas canónicas', () => {
    expect(publishedManualArticles).toHaveLength(30)
    for (const article of publishedManualArticles) {
      expect(article.printReference.edition).toBe('ds-156-v1')
      expect(article.printReference.pages.length).toBeGreaterThan(0)
      expect(article.printReference.pages.every((page) => Number.isInteger(page) && page >= 1 && page <= 156)).toBe(true)
      expect(new Set(article.printReference.pages).size).toBe(article.printReference.pages.length)
      const navigation = manualNavigationEntries.find((entry) => entry.path === article.path)
      expect(navigation?.pages).toEqual([
        article.printReference.pages[0],
        article.printReference.pages.at(-1),
      ])
    }
  })

  it.each(publishedManualArticles.map((article) => [article.path, article] as const))(
    'muestra la referencia visible en %s',
    (_path, article) => {
      const view = render(<ManualArticleContent article={article} />)
      expect(screen.getByText(/^En el manual físico: páginas /)).toBeInTheDocument()
      view.unmount()
    }
  )
})
