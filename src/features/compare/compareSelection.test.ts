import { describe, expect, it } from 'vitest'
import {
  addCompareId,
  compareSearchParams,
  parseCompareIds,
  removeCompareId,
  replaceCompareId,
} from './compareSelection'

describe('selección de Comparar', () => {
  it('lee 2–4 ids desde URL, elimina duplicados e ignora inválidos', () => {
    expect(parseCompareIds('?ids=25,150,25,0,abc,649,4,7')).toEqual([25, 150, 649, 4])
    expect(parseCompareIds('?other=1')).toEqual([])
  })

  it('serializa una URL canónica y limpia valores', () => {
    expect(compareSearchParams([25, 150, 25, -1, 650]).toString()).toBe('ids=25%2C150')
    expect(compareSearchParams([]).toString()).toBe('')
  })

  it('controla duplicados, límite e ids inválidos', () => {
    expect(addCompareId([25], 150)).toEqual({ status: 'added', ids: [25, 150] })
    expect(addCompareId([25], 25)).toEqual({ status: 'duplicate', ids: [25] })
    expect(addCompareId([1, 2, 3, 4], 5)).toEqual({ status: 'full', ids: [1, 2, 3, 4] })
    expect(addCompareId([], 650)).toEqual({ status: 'invalid', ids: [] })
    expect(removeCompareId([25, 150], 25)).toEqual([150])
  })

  it('sustituye un participante sin alterar los demás', () => {
    expect(replaceCompareId([388, 8, 25], 1, 9)).toEqual({
      status: 'replaced',
      ids: [388, 9, 25],
    })
    expect(replaceCompareId([388, 8], 0, 8).status).toBe('duplicate')
    expect(replaceCompareId([388, 8], 4, 9).status).toBe('missing')
  })
})
