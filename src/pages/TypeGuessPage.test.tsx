import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GameProvider } from '@/features/games'
import { getTypeGuessSessions, type TypeGuessPokemonSnapshot } from '@/features/typeGuess'

const mocks = vi.hoisted(() => ({ generateTypeGuessPokemon: vi.fn(), getRegionalPokedex: vi.fn() }))

vi.mock('@/features/manuals/mainGames/gameDataServices', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/features/manuals/mainGames/gameDataServices')>()
  return { ...actual, getRegionalPokedex: mocks.getRegionalPokedex }
})

vi.mock('@/features/typeGuess', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/features/typeGuess')>()
  return { ...actual, generateTypeGuessPokemon: mocks.generateTypeGuessPokemon }
})

import { TypeGuessPage } from './TypeGuessPage'

const pikachu: TypeGuessPokemonSnapshot = { id: 25, name: 'Pikachu', sprite: 'pikachu.png', actualTypes: ['electric'], regionalNumber: 104, height: 4, weight: 60, totalBaseStats: 320, standoutStat: { name: 'speed', value: 90 } }
const bulbasaur: TypeGuessPokemonSnapshot = { id: 1, name: 'Bulbasaur', sprite: 'bulbasaur.png', actualTypes: ['grass', 'poison'], regionalNumber: 1, height: 7, weight: 69, totalBaseStats: 318, standoutStat: { name: 'special-attack', value: 65 } }
const gyarados: TypeGuessPokemonSnapshot = { id: 130, name: 'Gyarados', sprite: 'gyarados.png', actualTypes: ['water', 'flying'], regionalNumber: 24, height: 65, weight: 2350, totalBaseStats: 540, standoutStat: { name: 'attack', value: 125 } }

function renderPage() {
  return render(<MemoryRouter><GameProvider><TypeGuessPage /></GameProvider></MemoryRouter>)
}

beforeEach(() => {
  mocks.generateTypeGuessPokemon.mockReset()
    .mockResolvedValueOnce(pikachu)
    .mockResolvedValueOnce(bulbasaur)
    .mockResolvedValueOnce(gyarados)
    .mockResolvedValue(pikachu)
  mocks.getRegionalPokedex.mockReset().mockResolvedValue({
    id: 1, name: 'original-sinnoh', entries: [
      { entryNumber: 1, species: { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon-species/1/' } },
      { entryNumber: 24, species: { name: 'gyarados', url: 'https://pokeapi.co/api/v2/pokemon-species/130/' } },
      { entryNumber: 104, species: { name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon-species/25/' } },
    ],
  })
})

async function answer(user: ReturnType<typeof userEvent.setup>, types: readonly string[], nextLabel: string) {
  for (const type of types) await user.click(await screen.findByRole('button', { name: type }))
  await user.click(screen.getByRole('button', { name: 'Comprobar' }))
  await screen.findByRole('button', { name: nextLabel })
}

describe('Adivina el tipo', () => {
  it('resuelve respuestas correctas, parciales e incorrectas y guarda la sesión', async () => {
    const user = userEvent.setup()
    renderPage()
    expect(await screen.findByText('3 especies disponibles')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Empezar · 10 Pokémon' }))

    await answer(user, ['Eléctrico'], 'Siguiente Pokémon')
    expect(screen.getByText('Correcto')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver ficha completa' })).toHaveAttribute('target', '_blank')
    await user.click(screen.getByRole('button', { name: 'Siguiente Pokémon' }))

    await screen.findByRole('heading', { name: 'Bulbasaur' })
    await user.click(screen.getByRole('button', { name: 'Ver detalles' }))
    expect(screen.getByRole('heading', { name: 'Pistas sobre Bulbasaur' })).toBeInTheDocument()
    expect(screen.getByText('Altura')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Cerrar detalles' }))
    await answer(user, ['Planta'], 'Siguiente Pokémon')
    expect(screen.getByText('Casi')).toBeInTheDocument()
    expect(screen.getByText(/Faltaba Veneno/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Siguiente Pokémon' }))

    await answer(user, ['Fuego'], 'Siguiente Pokémon')
    expect(screen.getByText('No exactamente')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Siguiente Pokémon' }))

    for (let index = 4; index <= 10; index += 1) {
      await answer(user, ['Eléctrico'], index === 10 ? 'Ver resultado' : 'Siguiente Pokémon')
      await user.click(screen.getByRole('button', { name: index === 10 ? 'Ver resultado' : 'Siguiente Pokémon' }))
    }

    expect(await screen.findByRole('heading', { name: 'Partida completada' })).toBeInTheDocument()
    expect(screen.getByText('8 / 10')).toBeInTheDocument()
    expect(screen.getByText('80 %')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Guardar intento' }))
    await user.click(screen.getByRole('button', { name: 'Guardar' }))
    expect(getTypeGuessSessions()[0]).toMatchObject({ score: 8, partialAnswers: 1, withoutDetails: 8 })
    expect(getTypeGuessSessions()[0].rounds).toHaveLength(10)
  })

  it('permite deseleccionar y mantiene Comprobar deshabilitado sin selección', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('3 especies disponibles')
    await user.click(screen.getByRole('button', { name: 'Empezar · 10 Pokémon' }))
    const check = await screen.findByRole('button', { name: 'Comprobar' })
    expect(check).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'Eléctrico' }))
    expect(check).toBeEnabled()
    await user.click(screen.getByRole('button', { name: 'Eléctrico, seleccionado' }))
    expect(check).toBeDisabled()
  })
})
