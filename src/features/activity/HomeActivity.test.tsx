import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { HomeActivity } from './HomeActivity'
import { clearRecentActivity, recordRecentActivity } from './recentActivity'

describe('actividad de Inicio', () => {
  beforeEach(() => {
    localStorage.clear()
    clearRecentActivity()
  })

  it('no muestra secciones vacías', () => {
    render(<MemoryRouter><HomeActivity /></MemoryRouter>)
    expect(screen.queryByText('Pokémon recientes')).not.toBeInTheDocument()
    expect(screen.queryByText('Continuar leyendo')).not.toBeInTheDocument()
  })

  it('muestra Pokémon reales y una lectura reanudable', () => {
    recordRecentActivity({
      kind: 'pokemon', id: '25', speciesId: 25, route: '/pokemon/25', title: 'Pikachu',
      subtitle: '#025', spriteUrl: null, types: ['electric'],
    })
    recordRecentActivity({
      kind: 'manual', id: '/manuales/entrenador/combate', route: '/manuales/entrenador/combate#seccion-2',
      title: 'Comprender el combate', subtitle: 'Afinidad de tipos', sectionId: 'seccion-2',
      sectionTitle: 'Afinidad de tipos', progress: 0.5,
    })
    render(<MemoryRouter><HomeActivity /></MemoryRouter>)

    expect(screen.getByText('Pokémon recientes')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Abrir ficha de Pikachu' })).toHaveAttribute('href', '/pokemon/25')
    expect(screen.getByText('Continúa donde lo dejaste')).toBeInTheDocument()
    expect(screen.getAllByText('50%').length).toBeGreaterThan(0)
  })
})
