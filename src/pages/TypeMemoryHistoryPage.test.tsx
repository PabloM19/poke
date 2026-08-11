import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { getTypeMemorySession, saveTypeMemorySession, type TypeMemorySession } from '@/features/typeMemory'
import { TypeMemoryHistoryPage } from './TypeMemoryHistoryPage'
import { TypeMemorySessionDetailPage } from './TypeMemorySessionDetailPage'

function memorySession(): TypeMemorySession {
  return {
    id: 'memory-session', gameType: 'type-memory', name: '', activeGameId: 'platino', gameTitle: 'Pokémon Platino',
    pokedexLabel: 'Tabla de tipos · Generación IV', generation: 4, startedAt: 1_000, finishedAt: 75_000,
    score: 4, bestStreak: 2, totalRounds: 4, difficulty: 'easy', pairCount: 4, attempts: 5, durationMs: 74_000,
    typesUsed: ['fire', 'water', 'grass', 'electric'],
    rounds: [
      { index: 1, firstCardId: 'fire:name', secondCardId: 'water:symbol', firstType: 'fire', secondType: 'water', matched: false },
      { index: 2, firstCardId: 'fire:name', secondCardId: 'fire:symbol', firstType: 'fire', secondType: 'fire', matched: true },
      { index: 3, firstCardId: 'water:name', secondCardId: 'water:symbol', firstType: 'water', secondType: 'water', matched: true },
      { index: 4, firstCardId: 'grass:name', secondCardId: 'grass:symbol', firstType: 'grass', secondType: 'grass', matched: true },
      { index: 5, firstCardId: 'electric:name', secondCardId: 'electric:symbol', firstType: 'electric', secondType: 'electric', matched: true },
    ],
  }
}

function renderRoutes(path: string) {
  return render(<MemoryRouter initialEntries={[path]}><Routes><Route path="/more/juegos/memoria-tipos/historial" element={<TypeMemoryHistoryPage />} /><Route path="/more/juegos/memoria-tipos/historial/:sessionId" element={<TypeMemorySessionDetailPage />} /></Routes></MemoryRouter>)
}

describe('historial de Memoria de tipos', () => {
  it('muestra dificultad, intentos, tiempo y tipos, y permite renombrar', async () => {
    const user = userEvent.setup()
    saveTypeMemorySession(memorySession())
    renderRoutes('/more/juegos/memoria-tipos/historial')
    const attempt = screen.getByRole('link', { name: /Intento 1 Pokémon Platino Fácil · 4 parejas · 5 intentos · 1:14/ })
    await user.click(attempt)
    expect(await screen.findByRole('heading', { name: 'Intento 1' })).toBeInTheDocument()
    expect(screen.getByText('Tipos practicados')).toBeInTheDocument()
    expect(screen.getByText('Fuego')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Editar nombre' }))
    const input = screen.getByRole('textbox', { name: 'Nombre del intento' })
    await user.clear(input)
    await user.type(input, 'Memoria básica')
    await user.click(screen.getByRole('button', { name: 'Guardar nombre' }))
    expect(getTypeMemorySession('memory-session')?.name).toBe('Memoria básica')
  })
})
