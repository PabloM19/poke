import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GameProvider } from '@/features/games'

const mocks = vi.hoisted(() => ({ getRegionalPokedex: vi.fn() }))

vi.mock('@/features/manuals/mainGames/gameDataServices', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/features/manuals/mainGames/gameDataServices')>()
  return { ...actual, getRegionalPokedex: mocks.getRegionalPokedex }
})

import { PokedexPage } from './PokedexPage'

function regional(name: string, entries: Array<[number, number]>) {
  return {
    id: 1,
    name,
    entries: entries.map(([entryNumber, id]) => ({
      entryNumber,
      species: {
        name: `species-${id}`,
        url: `https://pokeapi.co/api/v2/pokemon-species/${id}/`,
      },
    })),
  }
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/pokedex']}>
      <GameProvider>
        <PokedexPage />
      </GameProvider>
    </MemoryRouter>
  )
}

describe('PokedexPage con juego activo', () => {
  beforeEach(() => {
    window.localStorage.clear()
    mocks.getRegionalPokedex.mockReset().mockImplementation((game: { pokedex: string }) => (
      Promise.resolve(game.pokedex === 'original-sinnoh'
        ? regional('original-sinnoh', [[1, 1], [2, 4]])
        : regional('updated-unova', [[1, 25], [2, 150], [3, 151]]))
    ))
  })

  it('muestra la lista regional y cambia el contenido al cambiar de juego', async () => {
    const user = userEvent.setup()
    renderPage()

    expect(await screen.findByText('2 especies de la Pokédex regional de Sinnoh para Perla. Toca una para ver su ficha completa.')).toBeInTheDocument()
    expect(screen.getByText('Bulbasaur')).toBeInTheDocument()
    expect(screen.getByText('Charmander')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Cambiar juego activo/ }))
    await user.click(screen.getByRole('button', { name: 'Pokémon Negro 2' }))

    expect(await screen.findByText('3 especies de la Pokédex regional de Teselia para Negro 2. Toca una para ver su ficha completa.')).toBeInTheDocument()
    expect(screen.getByText('Pikachu')).toBeInTheDocument()
    expect(screen.getByText('Mewtwo')).toBeInTheDocument()
    expect(screen.queryByText('Bulbasaur')).not.toBeInTheDocument()
    expect(mocks.getRegionalPokedex).toHaveBeenLastCalledWith(
      expect.objectContaining({ slug: 'negro-2', pokedex: 'updated-unova' }),
      { signal: expect.any(AbortSignal) },
    )
  })
})
