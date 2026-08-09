import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { ShortManualRedirect } from './ShortManualRedirect'
import { getShortManualDestination, shortManualDestinations } from './shortRoutes'

function renderShortRoute(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/r/:shortCode" element={<ShortManualRedirect />} />
        <Route path="/manuales/recursos/:resource" element={<p>Recurso correcto</p>} />
        <Route path="/manuales/juegos/:game" element={<p>Juego correcto</p>} />
        <Route path="/manuales/enlace-no-encontrado" element={<p>Enlace no encontrado</p>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('rutas cortas del manual', () => {
  it('mantiene los seis recursos y once juegos en destinos estables', () => {
    expect(Object.keys(shortManualDestinations)).toHaveLength(17)
    expect(getShortManualDestination('r-01')).toBe('/manuales/recursos/r-01')
    expect(getShortManualDestination('r-06')).toBe('/manuales/recursos/r-06')
    expect(getShortManualDestination('heartgold')).toBe('/manuales/juegos/oro-heartgold')
    expect(getShortManualDestination('conquest')).toBe('/manuales/juegos/conquest')
    expect(Object.values(shortManualDestinations).every((path) => !/\d{3}/.test(path))).toBe(true)
  })

  it('redirige un recurso y un juego', () => {
    const resource = renderShortRoute('/r/r-04')
    expect(screen.getByText('Recurso correcto')).toBeInTheDocument()
    resource.unmount()
    renderShortRoute('/r/rescate-azul')
    expect(screen.getByText('Juego correcto')).toBeInTheDocument()
  })

  it('envía los códigos desconocidos al 404 del manual', () => {
    renderShortRoute('/r/no-existe')
    expect(screen.getByText('Enlace no encontrado')).toBeInTheDocument()
  })
})
