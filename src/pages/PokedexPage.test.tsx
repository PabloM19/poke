import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { PokedexPage } from './PokedexPage'

function LocationProbe() {
  const location = useLocation()
  return <output data-testid="location">{location.pathname}{location.search}</output>
}

function renderPage(path = '/pokedex') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <PokedexPage />
      <LocationProbe />
    </MemoryRouter>
  )
}

describe('PokedexPage', () => {
  it('filtra por generación, actualiza el contador y permite limpiar', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const user = userEvent.setup()
    renderPage()

    expect(screen.getByText('649 especies de las Generaciones I–V. Toca una para ver su ficha completa.')).toBeInTheDocument()
    expect(screen.getByText('Bulbasaur')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Abrir filtros' }))
    await user.click(screen.getByRole('button', { name: 'Gen II' }))

    expect(screen.getByText('100 especies de la Generación II. Toca una para ver su ficha completa.')).toBeInTheDocument()
    expect(screen.queryByText('Bulbasaur')).not.toBeInTheDocument()
    expect(screen.getByText('Chikorita')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Gen II' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByTestId('location')).toHaveTextContent('/pokedex?gen=2')

    await user.click(screen.getByRole('button', { name: 'Limpiar generación' }))
    expect(screen.getByText('649 especies de las Generaciones I–V. Toca una para ver su ficha completa.')).toBeInTheDocument()
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('combina dos tipos, total y orden desde controles móviles compactos', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Abrir filtros' }))
    await user.click(screen.getByRole('button', { name: /^Gen I$/ }))
    await user.selectOptions(screen.getByLabelText('Primer tipo'), 'grass')
    await user.selectOptions(screen.getByLabelText('Segundo tipo'), 'poison')
    await user.selectOptions(screen.getByLabelText('Orden'), 'total-desc')
    fireEvent.change(screen.getByLabelText(/Máximo:/), { target: { value: '400' } })

    expect(screen.getByText('5 especies de la Generación I. Toca una para ver su ficha completa.')).toBeInTheDocument()
    expect(screen.getByText('Máximo: 400')).toBeInTheDocument()
    expect(screen.getAllByText('Gloom')[0]).toBeInTheDocument()
    expect(screen.queryByText('Venusaur')).not.toBeInTheDocument()
    expect(screen.getByTestId('location')).toHaveTextContent('/pokedex?gen=1&type=grass&type2=poison&max=400&sort=total-desc')
  })

  it('muestra chips, un vacío útil y recupera todo al limpiar', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Abrir filtros' }))
    await user.click(screen.getByRole('button', { name: /^Gen I$/ }))
    await user.selectOptions(screen.getByLabelText('Primer tipo'), 'dragon')
    await user.selectOptions(screen.getByLabelText('Segundo tipo'), 'steel')

    expect(screen.getByRole('button', { name: 'Quitar filtro: Generación I' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Quitar filtro: Dragón' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Quitar filtro: Acero' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Cerrar' }))
    expect(screen.getByText('No hay especies con estos filtros.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Limpiar todos los filtros' }))

    expect(screen.getByText('649 especies de las Generaciones I–V. Toca una para ver su ficha completa.')).toBeInTheDocument()
    expect(screen.queryByLabelText('Filtros activos')).not.toBeInTheDocument()
    expect(screen.getByTestId('location')).toHaveTextContent('/pokedex')
  })

  it('restaura y canoniza filtros recibidos por URL', async () => {
    renderPage('/pokedex?sort=total-desc&type2=fire&gen=5&junk=x')

    expect(screen.getByRole('button', { name: 'Quitar filtro: Generación V' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Quitar filtro: Fuego' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Quitar filtro: Orden: Mayor total' })).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent('/pokedex?gen=5&type=fire&sort=total-desc')
    })
  })
})
