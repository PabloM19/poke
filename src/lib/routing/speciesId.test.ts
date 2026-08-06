import { describe, expect, it } from 'vitest'
import { parseSpeciesIdParam } from './speciesId'

describe('parseSpeciesIdParam', () => {
  it.each([
    [undefined, null],
    ['', null],
    ['0', null],
    ['-1', null],
    ['25abc', null],
    ['2.5', null],
    ['025', null],
    ['25', 25],
    ['649', 649],
  ])('convierte %s en %s', (value, expected) => {
    expect(parseSpeciesIdParam(value)).toBe(expected)
  })
})
