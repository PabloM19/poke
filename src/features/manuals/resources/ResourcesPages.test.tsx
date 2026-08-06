import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'
import { GameProvider } from '@/features/games'
import { TypeChartPage } from './TypeChartPage'
import { StatusReferencePage } from './StatusReferencePage'

function renderPage(page: ReactNode) {
  return render(<MemoryRouter><GameProvider>{page}</GameProvider></MemoryRouter>)
}

describe('manual resource pages', () => {
  it('R-01 funciona desde snapshot, cambia atacante y no usa red', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const user = userEvent.setup()
    renderPage(<TypeChartPage />)

    expect(screen.getByRole('heading', { name: 'Tabla de tipos' })).toBeInTheDocument()
    expect(screen.getByText('Pokémon Perla · Generación IV')).toBeInTheDocument()
    expect(screen.getByRole('row', { name: /Fantasma ×0/ })).toBeInTheDocument()
    await user.selectOptions(screen.getByLabelText('Tipo del movimiento atacante'), 'fire')
    expect(screen.getByRole('row', { name: /Acero ×2/ })).toBeInTheDocument()
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('R-02 ofrece estados, efectos, curación y enlaces locales', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    renderPage(<StatusReferencePage />)

    expect(screen.getByRole('heading', { name: 'Estados y efectos' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Parálisis' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Efectos temporales' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Cambios de características' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Abrir R-01 · Tipos' })).toHaveAttribute('href', '/manuales/recursos/r-01')
    expect(fetchSpy).not.toHaveBeenCalled()
  })
})
