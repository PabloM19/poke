import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import type { SpeciesIndexItem } from '@/lib/pokedex'

const mocks = vi.hoisted(() => ({ refresh: vi.fn() }))

const item = (speciesId: number, generationId: number): SpeciesIndexItem => ({
  speciesId,
  speciesName: `pokemon-${speciesId}`,
  nameEs: `Pokémon ${speciesId}`,
  generationId,
  defaultPokemonName: `pokemon-${speciesId}`,
  speciesUrl: `https://pokeapi.co/api/v2/pokemon-species/${speciesId}/`,
})

const index = [item(1, 1), item(152, 2), item(252, 3)]

vi.mock('@/hooks/useSpeciesIndex', () => ({
  useSpeciesIndex: () => ({
    index,
    status: 'ready' as const,
    refresh: mocks.refresh,
  }),
}))

vi.mock('@/components/PokedexCard', () => ({
  PokedexCard: ({ item: species }: { item: SpeciesIndexItem }) => (
    <article>{species.nameEs}</article>
  ),
}))

import { PokedexPage } from './PokedexPage'

describe('PokedexPage', () => {
  it('filtra por generación, actualiza el contador y permite limpiar', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><PokedexPage /></MemoryRouter>)

    expect(screen.getByText('3 especies de las Generaciones I–V. Toca una para ver su ficha completa.')).toBeInTheDocument()
    expect(screen.getByText('Pokémon 1')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Abrir filtros' }))
    await user.click(screen.getByRole('button', { name: 'Gen II' }))

    expect(screen.getByText('1 especies de la Generación II. Toca una para ver su ficha completa.')).toBeInTheDocument()
    expect(screen.queryByText('Pokémon 1')).not.toBeInTheDocument()
    expect(screen.getByText('Pokémon 152')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Gen II' })).toHaveAttribute('aria-pressed', 'true')

    await user.click(screen.getByRole('button', { name: 'Limpiar generación' }))
    expect(screen.getByText('3 especies de las Generaciones I–V. Toca una para ver su ficha completa.')).toBeInTheDocument()
  })
})
