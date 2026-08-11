import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { MorePage } from './MorePage'

describe('Herramientas', () => {
  it('organiza los siete juegos implementados en una progresión pedagógica', () => {
    render(<MemoryRouter><MorePage /></MemoryRouter>)

    const games = screen.getByRole('region', { name: 'Juegos' })
    const starter = within(games).getByRole('region', { name: 'Para empezar' })
    const starterLinks = within(starter).getAllByRole('link')
    expect(starterLinks).toHaveLength(4)
    expect(starterLinks.map((link) => link.getAttribute('href'))).toEqual([
      '/more/juegos/adivina-el-tipo',
      '/more/juegos/es-eficaz',
      '/more/juegos/quien-es-ese-pokemon',
      '/more/juegos/memoria-tipos',
    ])

    const challenge = within(games).getByRole('region', { name: 'Pon a prueba lo aprendido' })
    const challengeLinks = within(challenge).getAllByRole('link')
    expect(challengeLinks).toHaveLength(3)
    expect(challengeLinks.map((link) => link.getAttribute('href'))).toEqual([
      '/more/juegos/duelo-tipos',
      '/more/juegos/pokemon-intruso',
      '/more/juegos/cadena-evolutiva',
    ])

    const master = within(games).getByRole('region', { name: 'Maestro Pokémon' })
    expect(within(master).getByText('Próximamente')).toBeInTheDocument()
    expect(within(master).getByText('¿Preparado para algo más difícil?')).toBeInTheDocument()
    expect(within(master).queryByRole('link')).not.toBeInTheDocument()
    expect(within(games).getAllByRole('link')).toHaveLength(7)

    const utilities = screen.getByRole('region', { name: 'Utilidades' })
    expect(within(utilities).getByRole('link', { name: /Comparar Pokémon/ })).toHaveAttribute('href', '/compare')
    expect(within(utilities).getByRole('link', { name: /Recursos rápidos/ })).toHaveAttribute('href', '/manuales/recursos')
    expect(screen.queryByText('Ajustes')).not.toBeInTheDocument()
  })
})
