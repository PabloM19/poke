import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { GameProvider } from '@/features/games'
import { Layout } from './Layout'

describe('accesibilidad estructural', () => {
  it('permite saltar al contenido principal con el teclado', async () => {
    const router = createMemoryRouter([
      {
        path: '/',
        element: <Layout />,
        children: [{ index: true, element: <h1>Contenido de prueba</h1> }],
      },
    ])

    render(
      <GameProvider>
        <RouterProvider router={router} />
      </GameProvider>
    )

    await userEvent.tab()
    const skipLink = screen.getByRole('link', { name: 'Saltar al contenido' })
    expect(skipLink).toHaveFocus()
    expect(skipLink).toHaveAttribute('href', '#main-content')
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content')
  })

})
