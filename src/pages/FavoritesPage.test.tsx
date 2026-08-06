import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { pikachuPokemonFixture, pikachuSpeciesFixture } from '@/test/fixtures/pokeapi'
import { addFavoriteSpecies } from '@/features/favorites/favoritesStore'

const mocks = vi.hoisted(() => ({ getPokemon: vi.fn(), getPokemonSpecies: vi.fn() }))
vi.mock('@/lib/pokeapi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/pokeapi')>()
  return { ...actual, getPokemon: mocks.getPokemon, getPokemonSpecies: mocks.getPokemonSpecies }
})

import { FavoritesPage } from './FavoritesPage'

function renderPage() {
  return render(<MemoryRouter><FavoritesPage /></MemoryRouter>)
}

beforeEach(() => {
  mocks.getPokemon.mockReset().mockResolvedValue(pikachuPokemonFixture)
  mocks.getPokemonSpecies.mockReset().mockResolvedValue(pikachuSpeciesFixture)
})

describe('FavoritesPage', () => {
  it('muestra un vacío útil', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: 'Aún no tienes favoritos' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Buscar Pokémon' })).toHaveAttribute('href', '/search')
  })

  it('carga por id, enlaza y permite quitar', async () => {
    const user = userEvent.setup()
    addFavoriteSpecies(25)
    renderPage()

    expect(await screen.findByRole('link', { name: 'Ver ficha de Pikachu' })).toHaveAttribute('href', '/pokemon/25')
    expect(screen.getByRole('link', { name: 'Comparar Pikachu' })).toHaveAttribute('href', '/compare?ids=25')
    await user.click(screen.getByRole('button', { name: 'Quitar de favoritos: Pikachu' }))
    expect(screen.getByRole('heading', { name: 'Aún no tienes favoritos' })).toBeInTheDocument()
  })

  it('muestra error y reintenta la carga', async () => {
    const user = userEvent.setup()
    addFavoriteSpecies(25)
    mocks.getPokemonSpecies.mockRejectedValueOnce(new Error('offline'))
    renderPage()

    expect(await screen.findByText('No se pudieron cargar los datos.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Reintentar/ }))
    expect(await screen.findByRole('link', { name: 'Ver ficha de Pikachu' })).toBeInTheDocument()
  })
})
