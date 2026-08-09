import { describe, expect, it } from 'vitest'
import { createManualReturnState, readManualReturn } from './manualReturn'

describe('retorno desde una ficha Pokémon al manual', () => {
  it('acepta solo rutas internas del manual', () => {
    const state = createManualReturnState('/manuales/juegos/perla', 'Volver a Pokémon Perla')
    expect(readManualReturn(state)).toEqual(state.manualReturn)
    expect(readManualReturn({ manualReturn: { path: 'https://example.com', label: 'Fuera' } })).toBeNull()
    expect(readManualReturn({ manualReturn: { path: '/search', label: 'Buscar' } })).toBeNull()
    expect(readManualReturn(null)).toBeNull()
  })
})
