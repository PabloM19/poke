import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GameProvider } from '@/features/games'
import { getTypeDuelSessions, type GeneratedTypeDuelRound } from '@/features/typeDuel'

const mocks = vi.hoisted(() => ({
  generateTypeDuelRound: vi.fn(),
  getRegionalPokedex: vi.fn(),
}))

vi.mock('@/features/manuals/mainGames/gameDataServices', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/features/manuals/mainGames/gameDataServices')>()
  return { ...actual, getRegionalPokedex: mocks.getRegionalPokedex }
})

vi.mock('@/features/typeDuel', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/features/typeDuel')>()
  return { ...actual, generateTypeDuelRound: mocks.generateTypeDuelRound }
})

import { TypeDuelPage } from './TypeDuelPage'

const generatedRound: GeneratedTypeDuelRound = {
  left: { id: 25, name: 'Pikachu', sprite: null, types: ['electric'] },
  right: { id: 7, name: 'Squirtle', sprite: null, types: ['water'] },
  leftBest: { attackingType: 'electric', multiplier: 2 },
  rightBest: { attackingType: 'water', multiplier: 1 },
  correctAnswer: 'left',
}

function renderPage() {
  return render(
    <MemoryRouter>
      <GameProvider><TypeDuelPage /></GameProvider>
    </MemoryRouter>
  )
}

beforeEach(() => {
  mocks.generateTypeDuelRound.mockReset().mockResolvedValue(generatedRound)
  mocks.getRegionalPokedex.mockReset().mockResolvedValue({
    id: 1,
    name: 'original-sinnoh',
    entries: [
      { entryNumber: 1, species: { name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon-species/25/' } },
      { entryNumber: 2, species: { name: 'squirtle', url: 'https://pokeapi.co/api/v2/pokemon-species/7/' } },
    ],
  })
})

describe('Duelo de tipos', () => {
  it('completa diez rondas, actualiza el marcador y guarda un intento automático', async () => {
    const user = userEvent.setup()
    renderPage()

    expect(await screen.findByText('2 especies disponibles')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Empezar · 10 rondas' }))

    for (let index = 0; index < 10; index += 1) {
      await user.click(await screen.findByRole('button', { name: 'Pikachu' }))
      expect(await screen.findByText('Correcto')).toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: index === 9 ? 'Ver resultado' : 'Siguiente ronda' }))
    }

    expect(await screen.findByRole('heading', { name: 'Resultado' })).toBeInTheDocument()
    expect(screen.getByText('10 / 10')).toBeInTheDocument()
    expect(screen.getByText('100 %')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Guardar intento' }))
    expect(screen.getByPlaceholderText('Intento 1')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(screen.getByRole('link', { name: 'Ver intento guardado' })).toBeInTheDocument()
    expect(getTypeDuelSessions()).toHaveLength(1)
    expect(getTypeDuelSessions()[0]).toMatchObject({ name: 'Intento 1', score: 10, bestStreak: 10 })
    expect(getTypeDuelSessions()[0].rounds).toHaveLength(10)
  })
})

