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

    expect(screen.getByRole('heading', { name: 'PokéApp' })).toBeVisible()
    expect(
      screen.getByRole('navigation', { name: 'Navegación principal' })
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Juego activo')).toHaveValue('perla')
  })
})
