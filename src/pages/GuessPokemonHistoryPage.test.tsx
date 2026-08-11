import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { getPokemonSilhouetteSession, savePokemonSilhouetteSession, type PokemonSilhouetteSession } from '@/features/pokemonSilhouette'
import { GuessPokemonHistoryPage } from './GuessPokemonHistoryPage'
import { GuessPokemonSessionDetailPage } from './GuessPokemonSessionDetailPage'

function session(): PokemonSilhouetteSession {
  return {
    id: 'guess-saved', gameType: 'pokemon-silhouette', name: '', activeGameId: 'platino',
    gameTitle: 'Pokémon Platino', pokedexLabel: 'Pokédex regional de Sinnoh', generation: 4,
    startedAt: 1_000, finishedAt: 2_000, score: 9, bestStreak: 6, totalRounds: 10,
    points: 24, perfectRounds: 4,
    rounds: Array.from({ length: 10 }, (_, index) => ({
      index: index + 1,
      pokemon: { id: 1, name: 'Bulbasaur', sprite: null, types: ['grass', 'poison'], regionalNumber: 1, generationId: 1 },
      selectedLetters: ['B'], incorrectLetters: ['X', 'M', 'R'], fullGuesses: ['Bulbasur'], errors: 3,
      hints: [
        { kind: 'letter' as const, label: 'Letra revelada' as const, value: 'B', letter: 'B' },
        { kind: 'type' as const, label: 'Tipo primario' as const, value: 'grass', type: 'grass' },
      ],
      result: index === 9 ? 'failed' as const : 'solved' as const,
      points: index === 9 ? 0 : 1,
    })),
  }
}

function renderRoutes(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/more/juegos/quien-es-ese-pokemon/historial" element={<GuessPokemonHistoryPage />} />
        <Route path="/more/juegos/quien-es-ese-pokemon/historial/:sessionId" element={<GuessPokemonSessionDetailPage />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('historial visual de siluetas', () => {
  it('muestra letras, pistas y permite renombrar el intento', async () => {
    const user = userEvent.setup()
    savePokemonSilhouetteSession(session())
    renderRoutes('/more/juegos/quien-es-ese-pokemon/historial')
    await user.click(screen.getByRole('link', { name: /Intento 1 Pokémon Platino 9\/10/ }))
    expect(await screen.findByRole('heading', { name: 'Intento 1' })).toBeInTheDocument()
    expect(screen.getAllByText('X · M · R')).toHaveLength(10)
    expect(screen.getAllByText('Planta').length).toBeGreaterThanOrEqual(10)

    await user.click(screen.getByRole('button', { name: 'Editar nombre' }))
    const input = screen.getByRole('textbox', { name: 'Nombre del intento' })
    await user.clear(input)
    await user.type(input, 'Repaso de siluetas')
    await user.click(screen.getByRole('button', { name: 'Guardar nombre' }))
    expect(getPokemonSilhouetteSession('guess-saved')?.name).toBe('Repaso de siluetas')
  })
})
