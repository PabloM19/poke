import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AppNav } from './AppNav'

describe('AppNav', () => {
  it('muestra cinco destinos en móvil y agrupa Comparar/Ajustes bajo Más', () => {
    render(
      <MemoryRouter initialEntries={['/settings']}>
        <AppNav variant="mobile" />
      </MemoryRouter>
    )

    expect(screen.getAllByRole('link')).toHaveLength(5)
    expect(screen.getByRole('link', { name: 'Manuales' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Más' })).toHaveAttribute('aria-current', 'page')
    expect(screen.queryByRole('link', { name: 'Ajustes' })).not.toBeInTheDocument()
  })

  it('expone Comparar y Ajustes directamente en escritorio', () => {
    render(
      <MemoryRouter initialEntries={['/compare']}>
        <AppNav variant="desktop" />
      </MemoryRouter>
    )

    expect(screen.getByRole('link', { name: 'Comparar' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Ajustes' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Más' })).not.toBeInTheDocument()
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
