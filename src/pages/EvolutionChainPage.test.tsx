import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GameProvider } from '@/features/games'
import { getEvolutionChainSessions, type GeneratedEvolutionRound } from '@/features/evolutionChain'

const mocks = vi.hoisted(() => ({ generateEvolutionRound: vi.fn(), getRegionalPokedex: vi.fn() }))

vi.mock('@/features/manuals/mainGames/gameDataServices', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/features/manuals/mainGames/gameDataServices')>()
  return { ...actual, getRegionalPokedex: mocks.getRegionalPokedex }
})

vi.mock('@/features/evolutionChain', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/features/evolutionChain')>()
  return { ...actual, generateEvolutionRound: mocks.generateEvolutionRound }
})

import { EvolutionChainPage } from './EvolutionChainPage'

function generated(index: number): GeneratedEvolutionRound {
  const offset = index * 10
  return {
    family: {
      chainId: index + 1,
      stages: [
        { id: offset + 1, name: 'Bulbasaur', sprite: 'bulbasaur.png', method: null },
        { id: offset + 2, name: 'Ivysaur', sprite: 'ivysaur.png', method: 'Nivel 16' },
        { id: offset + 3, name: 'Venusaur', sprite: 'venusaur.png', method: 'Nivel 32' },
      ],
    },
    presentedOrder: [offset + 3, offset + 1, offset + 2],
  }
}

function renderPage() {
  return render(<MemoryRouter><GameProvider><EvolutionChainPage /></GameProvider></MemoryRouter>)
}

beforeEach(() => {
  let index = 0
  mocks.generateEvolutionRound.mockReset().mockImplementation(async () => generated(index++))
  mocks.getRegionalPokedex.mockReset().mockResolvedValue({
    id: 1, name: 'original-sinnoh', entries: [
      { entryNumber: 1, species: { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon-species/1/' } },
      { entryNumber: 2, species: { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon-species/2/' } },
      { entryNumber: 3, species: { name: 'venusaur', url: 'https://pokeapi.co/api/v2/pokemon-species/3/' } },
    ],
  })
})

async function selectOrder(user: ReturnType<typeof userEvent.setup>, names: readonly string[]) {
  for (const name of names) await user.click(await screen.findByRole('button', { name: new RegExp(`^${name}, sin ordenar$`) }))
  await user.click(screen.getByRole('button', { name: 'Comprobar' }))
}

describe('Cadena evolutiva', () => {
  it('ordena por pulsación, corrige, calcula la racha y guarda 10 familias', async () => {
    const user = userEvent.setup()
    renderPage()
    expect(await screen.findByText('3 especies disponibles')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Empezar · 10 familias' }))

    for (let round = 1; round <= 10; round += 1) {
      const order = round === 1 ? ['Ivysaur', 'Bulbasaur', 'Venusaur'] : ['Bulbasaur', 'Ivysaur', 'Venusaur']
      await selectOrder(user, order)
      expect(await screen.findByRole('heading', { name: round === 1 ? 'Casi' : '¡Correcto!' })).toBeInTheDocument()
      if (round === 1) expect(screen.getByText('1 / 10')).toBeInTheDocument()
      expect(screen.getByText('Nivel 32')).toBeInTheDocument()
      const nextLabel = round === 10 ? 'Ver resultado' : 'Siguiente familia'
      await user.click(screen.getByRole('button', { name: nextLabel }))
    }

    expect(await screen.findByRole('heading', { name: 'Partida completada' })).toBeInTheDocument()
    expect(screen.getByText('9 / 10')).toBeInTheDocument()
    expect(screen.getByText('90 %')).toBeInTheDocument()
    expect(screen.getByText('Familias para repasar')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Guardar intento' }))
    await user.click(screen.getByRole('button', { name: 'Guardar' }))
    expect(getEvolutionChainSessions()[0]).toMatchObject({ score: 9, bestStreak: 9, totalRounds: 10 })
    expect(getEvolutionChainSessions()[0].rounds).toHaveLength(10)
  })

  it('permite deshacer una posición y no comprueba hasta completar la cadena', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('3 especies disponibles')
    await user.click(screen.getByRole('button', { name: 'Empezar · 10 familias' }))
    const check = await screen.findByRole('button', { name: 'Comprobar' })
    expect(check).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'Bulbasaur, sin ordenar' }))
    expect(screen.getByRole('button', { name: 'Bulbasaur, posición 1' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Bulbasaur, posición 1' }))
    expect(screen.getByRole('button', { name: 'Bulbasaur, sin ordenar' })).toBeInTheDocument()
    expect(check).toBeDisabled()
  })
})
