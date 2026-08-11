import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { getEffectivenessSession, saveEffectivenessSession, type EffectivenessSession } from '@/features/effectivenessQuiz'
import { EffectivenessHistoryPage } from './EffectivenessHistoryPage'
import { EffectivenessSessionDetailPage } from './EffectivenessSessionDetailPage'

function session(): EffectivenessSession {
  return {
    id: 'effective-saved', gameType: 'type-effectiveness', name: '', activeGameId: 'platino', gameTitle: 'Pokémon Platino', pokedexLabel: 'Tabla de tipos · Generación IV', generation: 4,
    startedAt: 1_000, finishedAt: 2_000, score: 9, bestStreak: 8, totalRounds: 10,
    rounds: Array.from({ length: 10 }, (_, index) => ({ index: index + 1, attackingType: index === 0 ? 'normal' : 'fire', defendingType: index === 0 ? 'ghost' : 'grass', multiplier: index === 0 ? 0 as const : 2 as const, selectedAnswer: index === 0 ? 'normal' as const : 'super-effective' as const, correct: index !== 0 })),
  }
}

function renderRoutes(path: string) {
  return render(<MemoryRouter initialEntries={[path]}><Routes><Route path="/more/juegos/es-eficaz/historial" element={<EffectivenessHistoryPage />} /><Route path="/more/juegos/es-eficaz/historial/:sessionId" element={<EffectivenessSessionDetailPage />} /></Routes></MemoryRouter>)
}

describe('historial de ¿Es eficaz?', () => {
  it('revisa respuestas y permite renombrar una sesión persistida', async () => {
    const user = userEvent.setup()
    saveEffectivenessSession(session())
    renderRoutes('/more/juegos/es-eficaz/historial')
    await user.click(screen.getByRole('link', { name: /Intento 1 Pokémon Platino 9\/10/ }))
    expect(await screen.findByRole('heading', { name: 'Intento 1' })).toBeInTheDocument()
    expect(screen.getByText('Respuesta correcta:', { exact: false }).parentElement).toHaveTextContent('Respuesta correcta: Sin efecto')
    expect(screen.getByText('×0')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Editar nombre' }))
    const input = screen.getByRole('textbox', { name: 'Nombre del intento' })
    await user.clear(input)
    await user.type(input, 'Tabla básica')
    await user.click(screen.getByRole('button', { name: 'Guardar nombre' }))
    expect(getEffectivenessSession('effective-saved')?.name).toBe('Tabla básica')
  })
})
