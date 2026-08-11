import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GameProvider } from '@/features/games'
import { getPokemonSilhouetteSessions, type PokemonSilhouetteSnapshot } from '@/features/pokemonSilhouette'

const mocks = vi.hoisted(() => ({
  generatePokemonSilhouette: vi.fn(),
  getRegionalPokedex: vi.fn(),
}))

vi.mock('@/features/manuals/mainGames/gameDataServices', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/features/manuals/mainGames/gameDataServices')>()
  return { ...actual, getRegionalPokedex: mocks.getRegionalPokedex }
})

vi.mock('@/features/pokemonSilhouette', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/features/pokemonSilhouette')>()
  return { ...actual, generatePokemonSilhouette: mocks.generatePokemonSilhouette }
})

import { GuessPokemonPage } from './GuessPokemonPage'

const pikachu: PokemonSilhouetteSnapshot = {
  id: 25, name: 'Pikachu', sprite: 'pikachu.png', types: ['electric'], regionalNumber: 104, generationId: 1,
}

function renderPage() {
  return render(<MemoryRouter><GameProvider><GuessPokemonPage /></GameProvider></MemoryRouter>)
}

beforeEach(() => {
  mocks.generatePokemonSilhouette.mockReset().mockResolvedValue(pikachu)
  mocks.getRegionalPokedex.mockReset().mockResolvedValue({
    id: 1, name: 'original-sinnoh',
    entries: [{ entryNumber: 104, species: { name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon-species/25/' } }],
  })
})

describe('¿Quién es ese Pokémon?', () => {
  it('aplica pistas, completa diez rondas y guarda el historial compartido', async () => {
    const user = userEvent.setup()
    renderPage()
    expect(await screen.findByText('1 especies disponibles')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Empezar · 10 Pokémon' }))

    expect(await screen.findByAltText('Silueta de un Pokémon por descubrir')).toHaveClass('brightness-0')
    await user.click(screen.getByRole('button', { name: 'Z' }))
    expect(await screen.findByText(/Letra revelada:/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Z, incorrecta' })).toBeDisabled()

    for (let index = 0; index < 10; index += 1) {
      await user.click(screen.getByRole('button', { name: 'Escribir nombre' }))
      await user.type(screen.getByRole('textbox', { name: 'Nombre del Pokémon' }), 'pikachu')
      await user.click(screen.getByRole('button', { name: 'Comprobar' }))
      expect(await screen.findByText('¡Correcto!')).toBeInTheDocument()
      expect(screen.getByAltText('Pikachu')).not.toHaveClass('brightness-0')
      await user.click(screen.getByRole('button', { name: index === 9 ? 'Ver resultado' : 'Siguiente Pokémon' }))
    }

    expect(await screen.findByRole('heading', { name: 'Resultado' })).toBeInTheDocument()
    expect(screen.getByText('10 / 10')).toBeInTheDocument()
    expect(screen.getByText(/Pokémon reconocidos · 29 puntos/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Guardar intento' }))
    await user.click(screen.getByRole('button', { name: 'Guardar' }))
    expect(screen.getByRole('link', { name: 'Ver intento guardado' })).toBeInTheDocument()
    expect(getPokemonSilhouetteSessions()[0]).toMatchObject({ score: 10, points: 29, perfectRounds: 9 })
    expect(getPokemonSilhouetteSessions()[0].rounds).toHaveLength(10)
  })

  it('termina la ronda tras seis letras incorrectas y revela el Pokémon sin castigo', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('1 especies disponibles')
    await user.click(screen.getByRole('button', { name: 'Empezar · 10 Pokémon' }))
    await screen.findByAltText('Silueta de un Pokémon por descubrir')

    for (const letter of ['B', 'D', 'E', 'F', 'G', 'J']) {
      await user.click(screen.getByRole('button', { name: letter }))
    }

    expect(await screen.findByRole('heading', { name: 'Era Pikachu' })).toBeInTheDocument()
    expect(screen.getByText('Ahora ya conoces su silueta. La próxima será más fácil.')).toBeInTheDocument()
    expect(screen.getByAltText('Pikachu')).not.toHaveClass('brightness-0')
  })
})
