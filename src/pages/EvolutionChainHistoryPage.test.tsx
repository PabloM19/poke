import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { getEvolutionChainSession, saveEvolutionChainSession, type EvolutionChainSession } from '@/features/evolutionChain'
import { EvolutionChainHistoryPage } from './EvolutionChainHistoryPage'
import { EvolutionChainSessionDetailPage } from './EvolutionChainSessionDetailPage'

function session(): EvolutionChainSession {
  const pokemon = [
    { id: 1, name: 'Bulbasaur', sprite: '1.png', method: null },
    { id: 2, name: 'Ivysaur', sprite: '2.png', method: 'Nivel 16' },
    { id: 3, name: 'Venusaur', sprite: '3.png', method: 'Nivel 32' },
  ]
  return {
    id: 'evolution-saved', gameType: 'evolution-chain', name: '', activeGameId: 'platino', gameTitle: 'Pokémon Platino', pokedexLabel: 'Pokédex regional de Sinnoh',
    generation: 4, startedAt: 1_000, finishedAt: 2_000, score: 9, bestStreak: 8, totalRounds: 10,
    rounds: Array.from({ length: 10 }, (_, index) => ({ index: index + 1, chainId: index + 1, pokemon, presentedOrder: [3, 1, 2], selectedOrder: index === 0 ? [2, 1, 3] : [1, 2, 3], correctOrder: [1, 2, 3], correct: index !== 0 })),
  }
}

function renderRoutes(path: string) {
  return render(<MemoryRouter initialEntries={[path]}><Routes><Route path="/more/juegos/cadena-evolutiva/historial" element={<EvolutionChainHistoryPage />} /><Route path="/more/juegos/cadena-evolutiva/historial/:sessionId" element={<EvolutionChainSessionDetailPage />} /></Routes></MemoryRouter>)
}

describe('historial de Cadena evolutiva', () => {
  it('revisa ambos órdenes, métodos y permite renombrar', async () => {
    const user = userEvent.setup()
    saveEvolutionChainSession(session())
    renderRoutes('/more/juegos/cadena-evolutiva/historial')
    await user.click(screen.getByRole('link', { name: /Intento 1 Pokémon Platino 9\/10/ }))
    expect(await screen.findByRole('heading', { name: 'Intento 1' })).toBeInTheDocument()
    expect(screen.getByText('Ivysaur → Bulbasaur → Venusaur')).toBeInTheDocument()
    expect(screen.getAllByText('Bulbasaur → Ivysaur → Venusaur').length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Nivel 32/).length).toBeGreaterThan(0)
    await user.click(screen.getByRole('button', { name: 'Editar nombre' }))
    const input = screen.getByRole('textbox', { name: 'Nombre del intento' })
    await user.clear(input)
    await user.type(input, 'Familias clásicas')
    await user.click(screen.getByRole('button', { name: 'Guardar nombre' }))
    expect(getEvolutionChainSession('evolution-saved')?.name).toBe('Familias clásicas')
  })
})
