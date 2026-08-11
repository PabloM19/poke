import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { MorePage } from './MorePage'

describe('Herramientas', () => {
  it('separa Juegos y Utilidades sin incluir Ajustes', () => {
    render(<MemoryRouter><MorePage /></MemoryRouter>)

    const games = screen.getByRole('region', { name: 'Juegos' })
    expect(within(games).getByRole('link', { name: /Duelo de tipos/ })).toHaveAttribute('href', '/more/juegos/duelo-tipos')
    expect(within(games).getByRole('link', { name: /¿Quién es ese Pokémon?/ })).toHaveAttribute('href', '/more/juegos/quien-es-ese-pokemon')
    expect(within(games).getByRole('link', { name: /Adivina el tipo/ })).toHaveAttribute('href', '/more/juegos/adivina-el-tipo')
    expect(within(games).getByRole('link', { name: /¿Es eficaz?/ })).toHaveAttribute('href', '/more/juegos/es-eficaz')
    expect(within(games).getByRole('link', { name: /Cadena evolutiva/ })).toHaveAttribute('href', '/more/juegos/cadena-evolutiva')

    const utilities = screen.getByRole('region', { name: 'Utilidades' })
    expect(within(utilities).getByRole('link', { name: /Comparar Pokémon/ })).toHaveAttribute('href', '/compare')
    expect(within(utilities).getByRole('link', { name: /Recursos rápidos/ })).toHaveAttribute('href', '/manuales/recursos')
    expect(screen.queryByText('Ajustes')).not.toBeInTheDocument()
  })
})
