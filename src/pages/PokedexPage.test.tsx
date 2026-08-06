import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { PokedexPage } from './PokedexPage'

describe('PokedexPage', () => {
  it('filtra por generación, actualiza el contador y permite limpiar', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const user = userEvent.setup()
    render(<MemoryRouter><PokedexPage /></MemoryRouter>)

    expect(screen.getByText('649 especies de las Generaciones I–V. Toca una para ver su ficha completa.')).toBeInTheDocument()
    expect(screen.getByText('Bulbasaur')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Abrir filtros' }))
    await user.click(screen.getByRole('button', { name: 'Gen II' }))

    expect(screen.getByText('100 especies de la Generación II. Toca una para ver su ficha completa.')).toBeInTheDocument()
    expect(screen.queryByText('Bulbasaur')).not.toBeInTheDocument()
    expect(screen.getByText('Chikorita')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Gen II' })).toHaveAttribute('aria-pressed', 'true')

    await user.click(screen.getByRole('button', { name: 'Limpiar generación' }))
    expect(screen.getByText('649 especies de las Generaciones I–V. Toca una para ver su ficha completa.')).toBeInTheDocument()
    expect(fetchSpy).not.toHaveBeenCalled()
  })
})
