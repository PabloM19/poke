import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { pikachuPokemonFixture } from '@/test/fixtures/pokeapi'
import { PearlDataExplorer } from './PearlDataExplorer'

const mocks = vi.hoisted(() => ({
  getRegionalPokedex: vi.fn(),
  getPokemonGameMoves: vi.fn(),
  getPokemonEncounters: vi.fn(),
  getEvolutionChain: vi.fn(),
  getMoveName: vi.fn(),
  getPokemonSpecies: vi.fn(),
  getPokemon: vi.fn(),
}))

vi.mock('./gameDataServices', async () => ({
  ...(await vi.importActual<typeof import('./gameDataServices')>('./gameDataServices')),
  getRegionalPokedex: mocks.getRegionalPokedex,
  getPokemonGameMoves: mocks.getPokemonGameMoves,
  getPokemonEncounters: mocks.getPokemonEncounters,
  getEvolutionChain: mocks.getEvolutionChain,
  getMoveName: mocks.getMoveName,
}))

vi.mock('@/lib/pokeapi', async () => ({
  ...(await vi.importActual<typeof import('@/lib/pokeapi')>('@/lib/pokeapi')),
  getPokemonSpecies: mocks.getPokemonSpecies,
  getPokemon: mocks.getPokemon,
}))

function renderExplorer() {
  return render(<MemoryRouter><PearlDataExplorer /></MemoryRouter>)
}

describe('explorador de Perla', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getRegionalPokedex.mockResolvedValue({
      id: 5,
      name: 'original-sinnoh',
      entries: [{ entryNumber: 1, species: { name: 'turtwig', url: 'https://pokeapi.co/api/v2/pokemon-species/387/' } }],
    })
    mocks.getPokemonGameMoves.mockResolvedValue([])
    mocks.getPokemonEncounters.mockResolvedValue([])
    mocks.getPokemonSpecies.mockResolvedValue({ evolution_chain: { url: 'https://pokeapi.co/api/v2/evolution-chain/203/' } })
    mocks.getEvolutionChain.mockResolvedValue({ id: 203, chain: { species: { name: 'turtwig', url: 'https://pokeapi.co/api/v2/pokemon-species/387/' }, details: [], evolvesTo: [] } })
    mocks.getPokemon.mockResolvedValue({ ...pikachuPokemonFixture, id: 387, name: 'turtwig', types: [{ slot: 1, type: { name: 'grass', url: 'https://pokeapi.co/api/v2/type/12/' } }] })
  })

  it('no llama a PokeAPI hasta que se pide la Pokédex regional', async () => {
    renderExplorer()

    expect(mocks.getRegionalPokedex).not.toHaveBeenCalled()
    expect(screen.queryByText('Turtwig')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Cargar Pokédex de Sinnoh' }))

    expect(await screen.findAllByText('Turtwig')).toHaveLength(2)
    expect(mocks.getRegionalPokedex).toHaveBeenCalledWith(
      expect.objectContaining({ version: 'pearl', versionGroup: 'diamond-pearl', pokedex: 'original-sinnoh' }),
      { signal: expect.any(AbortSignal) }
    )
    expect(mocks.getPokemonGameMoves).not.toHaveBeenCalled()
    expect(mocks.getPokemonEncounters).not.toHaveBeenCalled()
  })

  it('mantiene cada recurso aislado y con el filtro de Perla', async () => {
    renderExplorer()
    await userEvent.click(screen.getByRole('button', { name: 'Cargar Pokédex de Sinnoh' }))
    await screen.findByText('Especie seleccionada')
    const buttons = screen.getAllByRole('button', { name: 'Consultar' })

    await userEvent.click(buttons[0])
    expect(await screen.findByRole('link', { name: 'Turtwig' })).toHaveAttribute('href', '/pokemon/387')
    expect(mocks.getEvolutionChain).toHaveBeenCalled()
    expect(mocks.getPokemonEncounters).not.toHaveBeenCalled()

    await userEvent.click(buttons[1])
    expect(await screen.findByText('No hay encuentros salvajes registrados para esta especie en Perla.')).toBeInTheDocument()
    expect(mocks.getPokemonEncounters).toHaveBeenCalledWith(387, { signal: expect.any(AbortSignal) })

    await userEvent.click(buttons[2])
    expect(await screen.findByText('No hay movimientos por nivel registrados para este grupo.')).toBeInTheDocument()
    expect(mocks.getPokemonGameMoves).toHaveBeenCalledWith(387, { signal: expect.any(AbortSignal) })
  })

  it('conserva un fallback editorial cuando falla la red', async () => {
    mocks.getRegionalPokedex.mockRejectedValueOnce(new Error('offline'))
    renderExplorer()

    await userEvent.click(screen.getByRole('button', { name: 'Cargar Pokédex de Sinnoh' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Puedes seguir leyendo toda la guía')
    expect(screen.getByRole('button', { name: 'Reintentar Pokédex' })).toBeInTheDocument()
  })
})
