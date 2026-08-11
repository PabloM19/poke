import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GameProvider } from '@/features/games'
import { getPokemonIntruderSessions, type GeneratedIntruderRound } from '@/features/pokemonIntruder'

const mocks = vi.hoisted(() => ({ generateIntruderRound: vi.fn(), getRegionalPokedex: vi.fn() }))

vi.mock('@/features/manuals/mainGames/gameDataServices', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/features/manuals/mainGames/gameDataServices')>()
  return { ...actual, getRegionalPokedex: mocks.getRegionalPokedex }
})

vi.mock('@/features/pokemonIntruder', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/features/pokemonIntruder')>()
  return { ...actual, generateIntruderRound: mocks.generateIntruderRound }
})

import { PokemonIntruderPage } from './PokemonIntruderPage'

function generated(index: number): GeneratedIntruderRound {
  const offset = index * 100
  return {
    criterion: { kind: 'shared-type', type: 'grass' },
    pokemon: [
      { id: offset + 1, name: 'Bulbasaur', sprite: 'bulbasaur.png', types: ['grass', 'poison'] },
      { id: offset + 43, name: 'Oddish', sprite: 'oddish.png', types: ['grass', 'poison'] },
      { id: offset + 4, name: 'Charmander', sprite: 'charmander.png', types: ['fire'] },
      { id: offset + 69, name: 'Bellsprout', sprite: 'bellsprout.png', types: ['grass', 'poison'] },
    ],
    intruderId: offset + 4,
  }
}

function renderPage() {
  return render(<MemoryRouter><GameProvider><PokemonIntruderPage /></GameProvider></MemoryRouter>)
}

beforeEach(() => {
  let index = 0
  mocks.generateIntruderRound.mockReset().mockImplementation(async () => generated(index++))
  mocks.getRegionalPokedex.mockReset().mockResolvedValue({
    id: 1, name: 'original-sinnoh', entries: [
      { entryNumber: 1, species: { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon-species/1/' } },
      { entryNumber: 4, species: { name: 'charmander', url: 'https://pokeapi.co/api/v2/pokemon-species/4/' } },
      { entryNumber: 43, species: { name: 'oddish', url: 'https://pokeapi.co/api/v2/pokemon-species/43/' } },
      { entryNumber: 69, species: { name: 'bellsprout', url: 'https://pokeapi.co/api/v2/pokemon-species/69/' } },
    ],
  })
})

describe('Pokémon intruso', () => {
  it('responde al tocar una card, revela tipos y guarda diez rondas', async () => {
    const user = userEvent.setup()
    renderPage()
    expect(await screen.findByText('4 especies disponibles')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Empezar · 10 grupos' }))
    expect(await screen.findByRole('button', { name: 'Charmander' })).toBeInTheDocument()
    expect(screen.queryByText('Planta')).not.toBeInTheDocument()

    for (let round = 1; round <= 10; round += 1) {
      await user.click(await screen.findByRole('button', { name: round === 2 ? 'Bulbasaur' : 'Charmander' }))
      expect(await screen.findByRole('heading', { name: round === 2 ? 'No exactamente' : '¡Correcto!' })).toBeInTheDocument()
      expect(screen.getAllByText('Planta').length).toBeGreaterThan(0)
      if (round === 1) expect(screen.getByText('1 / 10')).toBeInTheDocument()
      const nextLabel = round === 10 ? 'Ver resultado' : 'Siguiente grupo'
      await user.click(screen.getByRole('button', { name: nextLabel }))
    }

    expect(await screen.findByRole('heading', { name: 'Partida completada' })).toBeInTheDocument()
    expect(screen.getByText('9 / 10')).toBeInTheDocument()
    expect(screen.getByText('90 %')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Guardar intento' }))
    await user.click(screen.getByRole('button', { name: 'Guardar' }))
    expect(getPokemonIntruderSessions()[0]).toMatchObject({ score: 9, bestStreak: 8, totalRounds: 10 })
    expect(getPokemonIntruderSessions()[0].rounds).toHaveLength(10)
  })

  it('no permite cambiar la respuesta después del primer toque', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('4 especies disponibles')
    await user.click(screen.getByRole('button', { name: 'Empezar · 10 grupos' }))
    await user.click(await screen.findByRole('button', { name: 'Bulbasaur' }))
    expect(screen.getByRole('button', { name: 'Charmander, intruso' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Bulbasaur, tu elección' })).toBeDisabled()
    expect(screen.getByRole('heading', { name: 'No exactamente' })).toBeInTheDocument()
  })
})
