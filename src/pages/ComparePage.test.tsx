import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Pokemon, PokemonSpecies } from '@/lib/pokeapi'
import { GameProvider } from '@/features/games'

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

function pokemon(id: number, name: string, hp: number, types: readonly string[]): Pokemon {
  const statNames = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed']
  return {
    id,
    name,
    sprites: { front_default: `https://example.test/${id}.png`, official_artwork: `https://example.test/artwork-${id}.png` },
    types: types.map((type, index) => ({ slot: index + 1, type: { name: type, url: '' } })),
    stats: statNames.map((statName, index) => ({
      base_stat: hp + index * 5,
      stat: { name: statName, url: '' },
    })),
    past_types: [],
    past_stats: [],
  }
}

function LocationProbe() {
  const location = useLocation()
  return <output aria-label="URL actual">{location.pathname}{location.search}</output>
}

function renderPage(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <GameProvider>
        <ComparePage />
        <LocationProbe />
      </GameProvider>
    </MemoryRouter>
  )
}

beforeEach(() => {
  const definitions = [
    { id: 25, name: 'pikachu', nameEs: 'Pikachu', hp: 35, types: ['electric'] },
    { id: 150, name: 'mewtwo', nameEs: 'Mewtwo', hp: 106, types: ['psychic'] },
    { id: 388, name: 'grotle', nameEs: 'Grotle', hp: 75, types: ['grass'] },
    { id: 8, name: 'wartortle', nameEs: 'Wartortle', hp: 59, types: ['water'] },
  ]
  mocks.getPokemonSpecies.mockReset().mockImplementation((id: number) => {
    const entry = definitions.find((definition) => definition.id === id) ?? definitions[1]
    return Promise.resolve(species(entry.id, entry.name, entry.nameEs))
  })
  mocks.getPokemon.mockReset().mockImplementation((name: string) => {
    const entry = definitions.find((definition) => definition.name === name) ?? definitions[1]
    return Promise.resolve(pokemon(entry.id, entry.name, entry.hp, entry.types))
  })
})

describe('ComparePage', () => {
  it('recupera 2 Pokémon desde URL y muestra stats sin tabla horizontal', async () => {
    renderPage('/compare?ids=25,150')

    expect(await screen.findByRole('heading', { name: 'Pikachu' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Mewtwo' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Estadísticas base' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'PS' })).toBeInTheDocument()
    expect(screen.getByLabelText('URL actual')).toHaveTextContent('/compare?ids=25,150')
    expect(screen.getByText('Pokémon Perla · Gen IV')).toBeInTheDocument()
    expect(screen.getByLabelText('Pikachu frente a Mewtwo')).toBeInTheDocument()
    expect(screen.getByText('De un vistazo')).toBeInTheDocument()
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

    await user.click(screen.getByRole('button', { name: 'Quitar Pikachu de la comparación' }))
    expect(screen.getByText('Selecciona 1 Pokémon más para compararlos')).toBeInTheDocument()
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

  it('busca por nombre y permite sustituir solo un lado del VS', async () => {
    const user = userEvent.setup()
    renderPage('/compare?ids=25,150')
    await screen.findByLabelText('Pikachu frente a Mewtwo')

    await user.click(screen.getAllByRole('button', { name: /Cambiar/ })[0])
    const input = screen.getByRole('searchbox', { name: 'Sustituir a Pikachu' })
    await user.type(input, 'Grotle')
    await user.click(screen.getByRole('button', { name: /Grotle · #388/ }))

    expect(await screen.findByLabelText('Grotle frente a Mewtwo')).toBeInTheDocument()
    expect(screen.getByLabelText('URL actual')).toHaveTextContent('/compare?ids=388%2C150')
  })

  it('utiliza un modo analítico para tres y cuatro participantes', async () => {
    renderPage('/compare?ids=25,150,388,8')

    expect(await screen.findByRole('heading', { name: '4 Pokémon seleccionados' })).toBeInTheDocument()
    expect(screen.queryByText('VS')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Estadísticas base' })).toBeInTheDocument()
    expect(screen.getByLabelText('URL actual')).toHaveTextContent('/compare?ids=25,150,388,8')
  })
})
