import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { pikachuPokemonFixture, pikachuSpeciesFixture } from '@/test/fixtures/pokeapi'

const mocks = vi.hoisted(() => ({
  getPokemon: vi.fn(),
  getPokemonSpecies: vi.fn(),
}))

vi.mock('@/lib/pokeapi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/pokeapi')>()
  return { ...actual, getPokemon: mocks.getPokemon, getPokemonSpecies: mocks.getPokemonSpecies }
})

import { PokemonReferenceCard } from './PokemonReferenceCard'

beforeEach(() => {
  mocks.getPokemon.mockReset().mockResolvedValue(pikachuPokemonFixture)
  mocks.getPokemonSpecies.mockReset().mockResolvedValue(pikachuSpeciesFixture)
})

function renderCard() {
  return render(
    <MemoryRouter>
      <PokemonReferenceCard reference={{ speciesId: 25, name: 'Pikachu', description: 'Compañero eléctrico.' }} />
    </MemoryRouter>
  )
}

describe('PokemonReferenceCard', () => {
  it('carga por id sin Species Index y enlaza la ficha directa', async () => {
    renderCard()
    expect(await screen.findByText('electric')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver ficha de Pikachu' })).toHaveAttribute('href', '/pokemon/25')
    expect(mocks.getPokemonSpecies).toHaveBeenCalledWith(25, { signal: expect.any(AbortSignal) })
  })

  it('conserva el fallback editorial cuando PokeAPI falla', async () => {
    mocks.getPokemonSpecies.mockRejectedValue(new Error('offline'))
    renderCard()

    expect(screen.getByText('Pikachu')).toBeInTheDocument()
    expect(await screen.findByText('Datos dinámicos no disponibles')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver ficha de Pikachu' })).toBeInTheDocument()
  })
})
