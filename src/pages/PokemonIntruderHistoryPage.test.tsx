import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { getPokemonIntruderSession, savePokemonIntruderSession, type PokemonIntruderSession } from '@/features/pokemonIntruder'
import { PokemonIntruderHistoryPage } from './PokemonIntruderHistoryPage'
import { PokemonIntruderSessionDetailPage } from './PokemonIntruderSessionDetailPage'

function session(): PokemonIntruderSession {
  const pokemon = [
    { id: 1, name: 'Bulbasaur', sprite: '1.png', types: ['grass', 'poison'] },
    { id: 43, name: 'Oddish', sprite: '43.png', types: ['grass', 'poison'] },
    { id: 69, name: 'Bellsprout', sprite: '69.png', types: ['grass', 'poison'] },
    { id: 4, name: 'Charmander', sprite: '4.png', types: ['fire'] },
  ]
  return {
    id: 'intruder-saved', gameType: 'pokemon-intruder', name: '', activeGameId: 'platino', gameTitle: 'Pokémon Platino', pokedexLabel: 'Pokédex regional de Sinnoh',
    generation: 4, startedAt: 1_000, finishedAt: 2_000, score: 9, bestStreak: 8, totalRounds: 10,
    rounds: Array.from({ length: 10 }, (_, index) => ({ index: index + 1, criterion: { kind: 'shared-type' as const, type: 'grass' }, pokemon, intruderId: 4, selectedId: index === 0 ? 1 : 4, correct: index !== 0 })),
  }
}

function renderRoutes(path: string) {
  return render(<MemoryRouter initialEntries={[path]}><Routes><Route path="/more/juegos/pokemon-intruso/historial" element={<PokemonIntruderHistoryPage />} /><Route path="/more/juegos/pokemon-intruso/historial/:sessionId" element={<PokemonIntruderSessionDetailPage />} /></Routes></MemoryRouter>)
}

describe('historial de Pokémon intruso', () => {
  it('revisa elección, intruso, criterio y permite renombrar', async () => {
    const user = userEvent.setup()
    savePokemonIntruderSession(session())
    renderRoutes('/more/juegos/pokemon-intruso/historial')
    await user.click(screen.getByRole('link', { name: /Intento 1 Pokémon Platino 9\/10/ }))
    expect(await screen.findByRole('heading', { name: 'Intento 1' })).toBeInTheDocument()
    expect(screen.getAllByText('Bulbasaur').length).toBeGreaterThan(0)
    expect(screen.getByText('Intruso:').parentElement).toHaveTextContent('Intruso: Charmander')
    expect(screen.getAllByText('Planta').length).toBeGreaterThan(0)
    await user.click(screen.getByRole('button', { name: 'Editar nombre' }))
    const input = screen.getByRole('textbox', { name: 'Nombre del intento' })
    await user.clear(input)
    await user.type(input, 'Intrusos de tipos')
    await user.click(screen.getByRole('button', { name: 'Guardar nombre' }))
    expect(getPokemonIntruderSession('intruder-saved')?.name).toBe('Intrusos de tipos')
  })
})
