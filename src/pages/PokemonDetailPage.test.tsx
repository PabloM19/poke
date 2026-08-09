import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { pikachuPokemonFixture, pikachuSpeciesFixture } from '@/test/fixtures/pokeapi'
import type { Type } from '@/lib/pokeapi'
import { GameProvider } from '@/features/games'
import { createManualReturnState } from '@/features/manuals/manualReturn'

const mocks = vi.hoisted(() => ({
  getPokemon: vi.fn(),
  getPokemonSpecies: vi.fn(),
  getType: vi.fn(),
}))

vi.mock('@/lib/pokeapi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/pokeapi')>()
  return {
    ...actual,
    getPokemon: mocks.getPokemon,
    getPokemonSpecies: mocks.getPokemonSpecies,
    getType: mocks.getType,
  }
})

import { PokemonDetailPage } from './PokemonDetailPage'

function renderPath(path: string | { pathname: string; state: unknown }) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <GameProvider>
        <Routes>
          <Route path="/pokemon/:speciesId" element={<PokemonDetailPage />} />
        </Routes>
      </GameProvider>
    </MemoryRouter>
  )
}

beforeEach(() => {
  mocks.getPokemon.mockReset().mockResolvedValue(pikachuPokemonFixture)
  mocks.getPokemonSpecies.mockReset().mockResolvedValue(pikachuSpeciesFixture)
  mocks.getType.mockReset().mockResolvedValue({
    id: 13,
    name: 'electric',
    damage_relations: {
      double_damage_to: [], half_damage_to: [], no_damage_to: [],
      double_damage_from: [{ name: 'ground', url: '' }],
      half_damage_from: [
        { name: 'electric', url: '' },
        { name: 'flying', url: '' },
        { name: 'steel', url: '' },
      ],
      no_damage_from: [],
    },
    past_damage_relations: [],
  } satisfies Type)
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
    expect(screen.getByText('Pokémon Perla · Generación IV')).toBeInTheDocument()
    expect(screen.getByText('Tierra ×2')).toBeInTheDocument()
    expect(screen.getByText('Eléctrico ×½')).toBeInTheDocument()
  })

  it('ofrece retorno seguro cuando se abre desde una guía', async () => {
    renderPath({ pathname: '/pokemon/25', state: createManualReturnState('/manuales/juegos/perla', 'Volver a Pokémon Perla') })

    expect(await screen.findByRole('heading', { name: 'Pikachu' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Volver a Pokémon Perla' })).toHaveAttribute('href', '/manuales/juegos/perla')
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

  it('mantiene la ficha y reintenta si falla la defensa', async () => {
    const user = userEvent.setup()
    mocks.getType.mockRejectedValueOnce(new Error('offline'))
    renderPath('/pokemon/25')

    expect(await screen.findByRole('heading', { name: 'Pikachu' })).toBeInTheDocument()
    expect(screen.getByText(/La ficha básica sigue disponible/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Reintentar defensa' }))
    expect(await screen.findByText('Tierra ×2')).toBeInTheDocument()
  })
})
