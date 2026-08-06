import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { ManualSearchBox } from './ManualSearchBox'

describe('ManualSearchBox', () => {
  it('busca y ofrece un enlace táctil al resultado', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><ManualSearchBox /></MemoryRouter>)

    await user.type(screen.getByRole('searchbox', { name: 'Buscar en Manuales' }), 'R-01')

    const result = await screen.findByRole('link', { name: /R-01 · Tabla de tipos/ })
    expect(result).toHaveAttribute('href', '/manuales/recursos/r-01')
    expect(screen.getByRole('region', { name: 'Resultados del manual' })).toBeInTheDocument()
  })

  it('muestra un estado sin resultados', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><ManualSearchBox /></MemoryRouter>)
    await user.type(screen.getByRole('searchbox'), 'concepto inexistente xyz')
    expect(await screen.findByText(/No hay resultados/)).toBeInTheDocument()
  })
})
