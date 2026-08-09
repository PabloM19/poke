import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { ManualSearchBox } from './ManualSearchBox'
import { SpoilerPreferenceProvider } from '../spoilers/SpoilerPreferenceProvider'

function renderSearch(level: 'none' | 'mechanics' | 'guide' = 'none') {
  return render(<MemoryRouter><SpoilerPreferenceProvider initialLevel={level}><ManualSearchBox /></SpoilerPreferenceProvider></MemoryRouter>)
}

describe('ManualSearchBox', () => {
  it('busca y ofrece un enlace táctil al resultado', async () => {
    const user = userEvent.setup()
    renderSearch()

    await user.type(screen.getByRole('searchbox', { name: 'Buscar en Manuales' }), 'R-01')

    const result = await screen.findByRole('link', { name: /R-01 · Tabla de tipos/ })
    expect(result).toHaveAttribute('href', '/manuales/recursos/r-01')
    expect(screen.getByRole('region', { name: 'Resultados del manual' })).toBeInTheDocument()
  })

  it('muestra un estado sin resultados', async () => {
    const user = userEvent.setup()
    renderSearch()
    await user.type(screen.getByRole('searchbox'), 'concepto inexistente xyz')
    expect(await screen.findByText(/No hay resultados/)).toBeInTheDocument()
  })

  it('oculta resultados superiores al nivel elegido', async () => {
    const user = userEvent.setup()
    renderSearch('none')
    await user.type(screen.getByRole('searchbox'), 'Conquest')
    expect(await screen.findByRole('region', { name: 'Resultados del manual' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Pokémon Conquest/ })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Otras formas de jugar/ })).toBeInTheDocument()
  })
})
