import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { pikachuPokemonFixture, pikachuSpeciesFixture } from '@/test/fixtures/pokeapi'

const mocks = vi.hoisted(() => ({
  getPokemon: vi.fn(),
  getPokemonSpecies: vi.fn(),
}))

vi.mock('@/lib/pokeapi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/pokeapi')>()
  return {
    ...actual,
    getPokemon: mocks.getPokemon,
    getPokemonSpecies: mocks.getPokemonSpecies,
  }
})

import { PokemonDetailPage } from './PokemonDetailPage'

function renderPath(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/pokemon/:speciesId" element={<PokemonDetailPage />} />
      </Routes>
    </MemoryRouter>
  )
}

beforeEach(() => {
  mocks.getPokemon.mockReset().mockResolvedValue(pikachuPokemonFixture)
  mocks.getPokemonSpecies.mockReset().mockResolvedValue(pikachuSpeciesFixture)
})

describe('PokemonDetailPage', () => {
  it('abre una ficha directa sin depender del Species Index', async () => {
    renderPath('/pokemon/25')

    expect(await screen.findByRole('heading', { name: 'Pikachu' })).toBeInTheDocument()
    expect(screen.getByText('#025')).toBeInTheDocument()
    expect(mocks.getPokemonSpecies).toHaveBeenCalledWith(25, {
      signal: expect.any(AbortSignal),
    })
    expect(mocks.getPokemon).toHaveBeenCalledWith('pikachu', {
      signal: expect.any(AbortSignal),
    })
    expect(screen.getByRole('link', { name: 'Comparar Pikachu' }))
      .toHaveAttribute('href', '/compare?ids=25')
  })

  it('rechaza ids parciales sin llamar a PokeAPI', () => {
    renderPath('/pokemon/25abc')

    expect(screen.getByText('Identificador no válido.')).toBeInTheDocument()
    expect(mocks.getPokemonSpecies).not.toHaveBeenCalled()
    expect(mocks.getPokemon).not.toHaveBeenCalled()
  })

  it('aborta la petición al abandonar la ficha', async () => {
    let observedSignal: AbortSignal | undefined
    mocks.getPokemonSpecies.mockImplementation(
      (_: number, options: { signal?: AbortSignal }) => {
        observedSignal = options.signal
        return new Promise(() => undefined)
      }
    )
    const view = renderPath('/pokemon/25')

    await waitFor(() => expect(observedSignal).toBeDefined())
    view.unmount()
    expect(observedSignal?.aborted).toBe(true)
  })
})
