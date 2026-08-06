import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { ManualsLandingPage } from '@/pages/ManualsLandingPage'
import { ManualEntryPage } from './ManualEntryPage'
import { ManualNotFoundPage } from './ManualNotFoundPage'
import { ManualsLayout } from './ManualsLayout'

function renderManualRoute(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/manuales" element={<ManualsLayout />}>
          <Route index element={<ManualsLandingPage />} />
          <Route path="empezar/:tema" element={<ManualEntryPage />} />
          <Route path="entrenador/:tema" element={<ManualEntryPage />} />
          <Route path="mundo-misterioso/:tema" element={<ManualEntryPage />} />
          <Route path="otros" element={<ManualEntryPage />} />
          <Route path="*" element={<ManualNotFoundPage />} />
        </Route>
      </Routes>
    </MemoryRouter>
  )
}

describe('rutas de Manuales', () => {
  it('muestra migas, referencia física, índice y avance', () => {
    renderManualRoute('/manuales/entrenador/combate')

    expect(screen.getByRole('heading', { name: 'Comprender el combate' })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Migas de pan' })).toHaveTextContent('ManualesCombate')
    expect(screen.getByText('Páginas 49–54')).toBeInTheDocument()
    expect(screen.getByRole('complementary', { name: 'Índice del manual' })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Lección anterior y siguiente' }))
      .toHaveTextContent('AnteriorExplorar la regiónSiguiente Captura')
    expect(screen.getByText(/Cuando empieza un combate/)).toBeInTheDocument()
  })

  it('ofrece un 404 propio y una salida segura', () => {
    renderManualRoute('/manuales/empezar/no-existe')

    expect(screen.getByRole('heading', { name: 'Lección no encontrada' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Volver a Manuales' })).toHaveAttribute('href', '/manuales')
  })

  it('lee el contenido con PokeAPI bloqueada y sin Species Index', () => {
    const fetchMock = vi.fn(() => Promise.reject(new Error('blocked')))
    vi.stubGlobal('fetch', fetchMock)

    renderManualRoute('/manuales/mundo-misterioso/supervivencia')

    expect(screen.getByRole('heading', { name: 'Sobrevivir a una expedición' }))
      .toBeInTheDocument()
    expect(screen.getByText(/La Tripa disminuye mientras caminas/)).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
    vi.unstubAllGlobals()
  })
})
