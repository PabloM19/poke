import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { getTypeGuessSession, saveTypeGuessSession, type TypeGuessSession } from '@/features/typeGuess'
import { TypeGuessHistoryPage } from './TypeGuessHistoryPage'
import { TypeGuessSessionDetailPage } from './TypeGuessSessionDetailPage'

function session(): TypeGuessSession {
  return {
    id: 'guess-type-saved', gameType: 'type-guess', name: '', activeGameId: 'platino', gameTitle: 'Pokémon Platino', pokedexLabel: 'Pokédex regional de Sinnoh', generation: 4,
    startedAt: 1_000, finishedAt: 2_000, score: 8, bestStreak: 5, totalRounds: 10, partialAnswers: 1, withoutDetails: 6,
    rounds: Array.from({ length: 10 }, (_, index) => ({
      index: index + 1,
      pokemon: { id: 130, name: 'Gyarados', sprite: null, actualTypes: ['water', 'flying'], regionalNumber: 24 },
      selectedTypes: index === 0 ? ['water'] : ['water', 'flying'], result: index === 0 ? 'partial' as const : 'correct' as const,
      hintUsed: index === 0, answeredAt: 1_000 + index,
    })),
  }
}

function renderRoutes(path: string) {
  return render(<MemoryRouter initialEntries={[path]}><Routes><Route path="/more/juegos/adivina-el-tipo/historial" element={<TypeGuessHistoryPage />} /><Route path="/more/juegos/adivina-el-tipo/historial/:sessionId" element={<TypeGuessSessionDetailPage />} /></Routes></MemoryRouter>)
}

describe('historial de Adivina el tipo', () => {
  it('muestra respuestas, detalles consultados y permite renombrar', async () => {
    const user = userEvent.setup()
    saveTypeGuessSession(session())
    renderRoutes('/more/juegos/adivina-el-tipo/historial')
    await user.click(screen.getByRole('link', { name: /Intento 1 Pokémon Platino 8\/10/ }))
    expect(await screen.findByRole('heading', { name: 'Intento 1' })).toBeInTheDocument()
    expect(screen.getAllByText('Parcial')).toHaveLength(1)
    expect(screen.getByText('Consultaste los detalles.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Editar nombre' }))
    const input = screen.getByRole('textbox', { name: 'Nombre del intento' })
    await user.clear(input)
    await user.type(input, 'Tipos de agua')
    await user.click(screen.getByRole('button', { name: 'Guardar nombre' }))
    expect(getTypeGuessSession('guess-type-saved')?.name).toBe('Tipos de agua')
  })
})
