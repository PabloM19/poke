import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { getTypeDuelSession, saveTypeDuelSession, type TypeDuelRound, type TypeDuelSession } from '@/features/typeDuel'
import { TypeDuelHistoryPage } from './TypeDuelHistoryPage'
import { TypeDuelSessionDetailPage } from './TypeDuelSessionDetailPage'

function round(index: number): TypeDuelRound {
  return {
    index,
    left: { id: 25, name: 'Pikachu', sprite: null, types: ['electric'] },
    right: { id: 130, name: 'Gyarados', sprite: null, types: ['water', 'flying'] },
    leftBest: { attackingType: 'electric', multiplier: 4 },
    rightBest: { attackingType: 'water', multiplier: 1 },
    correctAnswer: 'left',
    userAnswer: index === 1 ? 'right' : 'left',
    isCorrect: index !== 1,
  }
}

function savedSession(): TypeDuelSession {
  return {
    id: 'saved-session',
    gameType: 'type-duel',
    name: '',
    activeGameId: 'platino',
    gameTitle: 'Pokémon Platino',
    pokedexLabel: 'Pokédex regional de Sinnoh',
    generation: 4,
    mode: 'normal',
    startedAt: Date.UTC(2026, 7, 11, 10),
    finishedAt: Date.UTC(2026, 7, 11, 10, 5),
    score: 9,
    bestStreak: 9,
    totalRounds: 10,
    rounds: Array.from({ length: 10 }, (_, index) => round(index + 1)),
  }
}

function renderRoutes(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/more/juegos/duelo-tipos/historial" element={<TypeDuelHistoryPage />} />
        <Route path="/more/juegos/duelo-tipos/historial/:sessionId" element={<TypeDuelSessionDetailPage />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('historial visual de Duelo de tipos', () => {
  it('abre un intento persistido, muestra sus rondas y permite renombrarlo', async () => {
    const user = userEvent.setup()
    saveTypeDuelSession(savedSession())
    renderRoutes('/more/juegos/duelo-tipos/historial')

    expect(screen.getByRole('link', { name: /Intento 1 Pokémon Platino 9\/10/ })).toBeInTheDocument()
    await user.click(screen.getByRole('link', { name: /Intento 1 Pokémon Platino 9\/10/ }))

    expect(await screen.findByRole('heading', { name: 'Intento 1' })).toBeInTheDocument()
    expect(screen.getAllByText(/Pikachu/).length).toBeGreaterThan(0)
    expect(screen.getByText((_, element) => (
      element?.tagName === 'DIV' && element.textContent === 'Tu respuesta: Gyarados'
    ))).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Editar nombre' }))
    const input = screen.getByRole('textbox', { name: 'Nombre del intento' })
    await user.clear(input)
    await user.type(input, 'Repaso eléctrico')
    await user.click(screen.getByRole('button', { name: 'Guardar nombre' }))

    expect(screen.getByRole('heading', { name: 'Repaso eléctrico' })).toBeInTheDocument()
    expect(getTypeDuelSession('saved-session')?.name).toBe('Repaso eléctrico')
  })

  it('vuelve a abrir la sesión guardada tras remontar la pantalla', () => {
    saveTypeDuelSession(savedSession(), 'Sesión persistente')
    const first = renderRoutes('/more/juegos/duelo-tipos/historial/saved-session')
    expect(screen.getByRole('heading', { name: 'Sesión persistente' })).toBeInTheDocument()
    first.unmount()

    renderRoutes('/more/juegos/duelo-tipos/historial/saved-session')
    expect(screen.getByRole('heading', { name: 'Sesión persistente' })).toBeInTheDocument()
    expect(screen.getAllByText(/^Ronda \d+$/)).toHaveLength(10)
  })
})
