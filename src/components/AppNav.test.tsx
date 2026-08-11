import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AppNav } from './AppNav'

describe('AppNav', () => {
  it('muestra cinco destinos en móvil sin incluir Ajustes en Herramientas', () => {
    render(
      <MemoryRouter initialEntries={['/settings']}>
        <AppNav variant="mobile" />
      </MemoryRouter>
    )

    expect(screen.getAllByRole('link')).toHaveLength(5)
    expect(screen.getByRole('link', { name: 'Manuales' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Herramientas' })).not.toHaveAttribute('aria-current')
    expect(screen.queryByRole('link', { name: 'Ajustes' })).not.toBeInTheDocument()
  })

  it('mantiene las cinco áreas principales también en escritorio', () => {
    render(
      <MemoryRouter initialEntries={['/compare']}>
        <AppNav variant="desktop" />
      </MemoryRouter>
    )

    expect(screen.getAllByRole('link')).toHaveLength(5)
    expect(screen.getByRole('link', { name: 'Herramientas' })).toHaveAttribute('aria-current', 'page')
    expect(screen.queryByRole('link', { name: 'Ajustes' })).not.toBeInTheDocument()
  })

  it('mantiene Manuales activo en rutas hijas', () => {
    render(
      <MemoryRouter initialEntries={['/manuales/juegos/perla']}>
        <AppNav variant="mobile" />
      </MemoryRouter>
    )

    expect(screen.getByRole('link', { name: 'Manuales' })).toHaveAttribute('aria-current', 'page')
  })
})
