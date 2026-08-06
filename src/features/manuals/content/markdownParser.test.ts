import { describe, expect, it } from 'vitest'
import { publishedManualArticles } from './articles'
import { parseManualPage } from './markdownParser'
import { manualSourcePages } from './manualSource'

function page(number: number) {
  const source = manualSourcePages.find((candidate) => candidate.page === number)
  if (!source) throw new Error(`Falta la página ${number}`)
  return parseManualPage(source)
}

describe('parseManualPage', () => {
  it('transforma ejemplos de tipos, pasos y tablas', () => {
    expect(page(25)).toContainEqual({
      type: 'type-example',
      title: 'Ejemplo de tipos',
      matchups: ['Agua vence a Fuego', 'Fuego vence a Planta', 'Planta vence a Agua.'],
    })
    expect(page(55)).toContainEqual(expect.objectContaining({
      type: 'steps',
      items: expect.arrayContaining(['Reduce sus PS sin debilitarlos.']),
    }))
    expect(page(80)).toContainEqual(expect.objectContaining({
      type: 'table',
      headers: ['Juego', 'Qué haces', 'Control principal', 'Sesión'],
    }))
  })

  it('oculta instrucciones de maquetación sin perder la prosa', () => {
    const blocks = page(21)
    expect(JSON.stringify(blocks)).not.toContain('Visual sugerido')
    expect(JSON.stringify(blocks)).toContain('personas y los Pokémon viven')
  })

  it('publica los 24 artículos de 21–136 con contenido real', () => {
    expect(publishedManualArticles).toHaveLength(24)
    expect(publishedManualArticles.every((article) => article.blocks.length > 0)).toBe(true)
    expect(publishedManualArticles[0].printReference.pages[0]).toBe(21)
    expect(publishedManualArticles.at(-1)?.printReference.pages.at(-1)).toBe(136)
    expect(manualSourcePages.find((source) => source.page === 86)?.markdown)
      .not.toContain('Páginas 87–128')
    expect(JSON.stringify(publishedManualArticles.at(-1)?.blocks)).toContain('desastres naturales')
  })
})
