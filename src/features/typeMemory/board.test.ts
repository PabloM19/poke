import { describe, expect, it } from 'vitest'
import { availableMemoryTypes, cardsFormMemoryPair, createTypeMemoryBoard, formatMemoryDuration, shuffleItems } from './board'

describe('tablero de Memoria de tipos', () => {
  it.each([
    ['easy', 4, 8],
    ['normal', 6, 12],
    ['hard', 9, 18],
  ] as const)('crea dificultad %s con tipos únicos y dos cartas por pareja', (difficulty, pairs, cards) => {
    let seed = 0
    const board = createTypeMemoryBoard(4, difficulty, () => ((seed = (seed * 9301 + 49297) % 233280) / 233280))
    expect(board.types).toHaveLength(pairs)
    expect(new Set(board.types)).toHaveLength(pairs)
    expect(board.cards).toHaveLength(cards)
    for (const type of board.types) {
      const pair = board.cards.filter((card) => card.type === type)
      expect(pair.map((card) => card.kind).sort()).toEqual(['name', 'symbol'])
      expect(cardsFormMemoryPair(pair[0], pair[1])).toBe(true)
    }
  })

  it('respeta los tipos históricos y no introduce Hada en Generaciones IV–V', () => {
    expect(availableMemoryTypes(4)).toContain('steel')
    expect(availableMemoryTypes(4)).toContain('dark')
    expect(availableMemoryTypes(4)).not.toContain('fairy')
    expect(availableMemoryTypes(5)).not.toContain('fairy')
  })

  it('baraja sin mutar el origen y formatea tiempos sin presión visual', () => {
    const source = [1, 2, 3, 4]
    expect(shuffleItems(source, () => 0)).toEqual([2, 3, 4, 1])
    expect(source).toEqual([1, 2, 3, 4])
    expect(formatMemoryDuration(74_900)).toBe('1:14')
  })
})
