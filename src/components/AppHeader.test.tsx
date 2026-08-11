import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { GameProvider } from '@/features/games'
import { AppHeader } from './AppHeader'

describe('AppHeader', () => {
  it('muestra la identidad y la navegación principal', () => {
    render(
      <MemoryRouter initialEntries={['/search']}>
        <GameProvider>
          <AppHeader />
        </GameProvider>
      </MemoryRouter>
    )

    expect(screen.getByRole('link', { name: 'PokéApp, ir al inicio' })).toHaveAttribute(
      'href',
      '/search'
    )
    expect(
      screen.getByRole('navigation', { name: 'Navegación principal' })
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ajustes' })).toHaveAttribute('href', '/settings')
    expect(screen.queryByLabelText('Juego activo')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Cambiar juego activo/ })).not.toBeInTheDocument()
  })
})
