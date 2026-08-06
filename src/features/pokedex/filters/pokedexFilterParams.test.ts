import { describe, expect, it } from 'vitest'
import { parsePokedexFilterParams, serializePokedexFilterParams } from './pokedexFilterParams'

const bounds = { min: 180, max: 720 }

describe('pokedex filter params', () => {
  it('lee una combinación compartible completa', () => {
    const filters = parsePokedexFilterParams(
      new URLSearchParams('gen=4&type=steel&type2=dragon&min=400&max=700&sort=total-desc'),
      bounds
    )
    expect(filters).toEqual({
      generation: 4,
      types: ['steel', 'dragon'],
      minTotal: 400,
      maxTotal: 700,
      sort: 'total-desc',
    })
  })

  it('normaliza rangos invertidos y descarta valores inválidos o duplicados', () => {
    const filters = parsePokedexFilterParams(
      new URLSearchParams('gen=9&type=dragon&type2=dragon&min=900&max=100&sort=random'),
      bounds
    )
    expect(filters).toEqual({
      generation: null,
      types: ['dragon'],
      minTotal: 180,
      maxTotal: 720,
      sort: 'number-asc',
    })
  })

  it('omite defaults y conserva un round trip canónico', () => {
    const filters = {
      generation: 5 as const,
      types: ['fire', 'fighting'] as const,
      minTotal: 300,
      maxTotal: 600,
      sort: 'name-asc' as const,
    }
    const params = serializePokedexFilterParams(
      { ...filters, types: [...filters.types] },
      bounds
    )

    expect(params.toString()).toBe('gen=5&type=fire&type2=fighting&min=300&max=600&sort=name-asc')
    expect(parsePokedexFilterParams(params, bounds)).toEqual(filters)
    expect(serializePokedexFilterParams({
      generation: null,
      types: [],
      minTotal: bounds.min,
      maxTotal: bounds.max,
      sort: 'number-asc',
    }, bounds).toString()).toBe('')
  })
})
