import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Pokemon, PokemonSpecies } from '@/lib/pokeapi'

const mocks = vi.hoisted(() => ({ getPokemon: vi.fn(), getPokemonSpecies: vi.fn() }))
vi.mock('@/lib/pokeapi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/pokeapi')>()
  return { ...actual, getPokemon: mocks.getPokemon, getPokemonSpecies: mocks.getPokemonSpecies }
})

import { ComparePage } from './ComparePage'

function species(id: number, name: string, nameEs: string): PokemonSpecies {
  return {
    id,
    name,
    generation: { name: 'generation-i', url: '' },
    names: [{ name: nameEs, language: { name: 'es', url: '' } }],
    varieties: [{ is_default: true, pokemon: { name, url: '' } }],
    evolution_chain: null,
  }
}

function pokemon(id: number, name: string, hp: number): Pokemon {
  const statNames = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed']
  return {
    id,
    name,
    sprites: { front_default: `https://example.test/${id}.png` },
    types: [{ slot: 1, type: { name: id === 25 ? 'electric' : 'psychic', url: '' } }],
    stats: statNames.map((statName, index) => ({
      base_stat: hp + index * 5,
      stat: { name: statName, url: '' },
    })),
    past_types: [],
  }
}

function LocationProbe() {
  const location = useLocation()
  return <output aria-label="URL actual">{location.pathname}{location.search}</output>
}

function renderPage(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <ComparePage />
      <LocationProbe />
    </MemoryRouter>
  )
}

beforeEach(() => {
  mocks.getPokemonSpecies.mockReset().mockImplementation((id: number) =>
    Promise.resolve(id === 25 ? species(25, 'pikachu', 'Pikachu') : species(150, 'mewtwo', 'Mewtwo'))
  )
  mocks.getPokemon.mockReset().mockImplementation((name: string) =>
    Promise.resolve(name === 'pikachu' ? pokemon(25, 'pikachu', 35) : pokemon(150, 'mewtwo', 106))
  )
})

describe('ComparePage', () => {
  it('recupera 2 Pokémon desde URL y muestra stats sin tabla horizontal', async () => {
    renderPage('/compare?ids=25,150')

    expect(await screen.findByRole('heading', { name: 'Pikachu' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Mewtwo' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Estadísticas base' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'PS' })).toBeInTheDocument()
    expect(screen.getByLabelText('URL actual')).toHaveTextContent('/compare?ids=25,150')
  })

  it('añade por número sin Species Index y sincroniza la URL', async () => {
    const user = userEvent.setup()
    renderPage('/compare?ids=25')
    const input = screen.getByRole('searchbox', { name: 'Añadir Pokémon a la comparación' })
    await user.type(input, '150')
    await user.click(screen.getByRole('button', { name: /Añadir/ }))

    expect(await screen.findByRole('heading', { name: 'Mewtwo' })).toBeInTheDocument()
    expect(screen.getByLabelText('URL actual')).toHaveTextContent('/compare?ids=25%2C150')
  })

  it('permite quitar y vuelve al estado de selección incompleta', async () => {
    const user = userEvent.setup()
    renderPage('/compare?ids=25,150')
    await screen.findByRole('heading', { name: 'Pikachu' })

    await user.click(screen.getByRole('button', { name: 'Quitar #25 de la comparación' }))
    expect(screen.getByText('Elige 1 Pokémon más')).toBeInTheDocument()
    expect(screen.getByLabelText('URL actual')).toHaveTextContent('/compare?ids=150')
  })

  it('muestra fallos parciales y reintenta sin perder la selección', async () => {
    const user = userEvent.setup()
    mocks.getPokemonSpecies.mockImplementationOnce((id: number) =>
      Promise.resolve(species(id, 'pikachu', 'Pikachu'))
    ).mockRejectedValueOnce(new Error('offline'))
    renderPage('/compare?ids=25,150')

    expect(await screen.findByText(/No se pudieron cargar: #150/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Reintentar/ }))
    expect(await screen.findByRole('heading', { name: 'Mewtwo' })).toBeInTheDocument()
    expect(screen.getByLabelText('URL actual')).toHaveTextContent('/compare?ids=25,150')
  })
})
