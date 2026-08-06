import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { ManualsLandingPage } from '@/pages/ManualsLandingPage'
import { ManualEntryPage } from './ManualEntryPage'
import { ManualNotFoundPage } from './ManualNotFoundPage'
import { ManualsLayout } from './ManualsLayout'
import { MainGameGuidePage } from './mainGames/MainGameGuidePage'
import { PmdGuidePage } from './pmd/PmdGuidePage'

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
          <Route path="juegos/:juego" element={<MainGameGuidePage />} />
          <Route path="juegos/equipo-rescate-azul" element={<PmdGuidePage />} />
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

  it('publica la ficha editorial completa de Perla sin pedir red de entrada', () => {
    const fetchMock = vi.fn(() => Promise.reject(new Error('blocked')))
    vi.stubGlobal('fetch', fetchMock)

    renderManualRoute('/manuales/juegos/perla')

    expect(screen.getByRole('heading', { name: 'Pokémon Edición Perla' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Las ocho Medallas' })).toBeInTheDocument()
    expect(screen.getByText('Medalla Faro')).toBeInTheDocument()
    expect(screen.getByText(/Columna Lanza/)).toBeInTheDocument()
    expect(screen.getByText('En el manual físico: páginas 87–94')).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
    vi.unstubAllGlobals()
  })

  it('publica Platino con su orden propio de Gimnasios y aviso', () => {
    renderManualRoute('/manuales/juegos/platino')

    expect(screen.getByRole('heading', { name: 'Pokémon Edición Platino' })).toBeInTheDocument()
    expect(screen.getByText('Handsome')).toBeInTheDocument()
    const badges = screen.getAllByText(/Medalla (Lignito|Bosque|Reliquia|Adoquín)/)
    expect(badges.map((badge) => badge.textContent)).toEqual([
      'Medalla Lignito', 'Medalla Bosque', 'Medalla Reliquia', 'Medalla Adoquín',
    ])
    expect(screen.getByText(/Evita consultar el Mundo Distorsión/)).toBeInTheDocument()
    expect(screen.getByText('En el manual físico: páginas 95–102')).toBeInTheDocument()
  })

  it('separa las ocho Medallas de Johto y las ocho de Kanto en HeartGold', () => {
    renderManualRoute('/manuales/juegos/oro-heartgold')

    expect(screen.getByRole('heading', { name: 'Pokémon Edición Oro HeartGold' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Las ocho Medallas de Johto' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Las ocho Medallas de Kanto' })).toBeInTheDocument()
    expect(screen.getByText('Medalla Dragón')).toBeInTheDocument()
    expect(screen.getByText('Medalla Tierra')).toBeInTheDocument()
    expect(screen.getByText(/R4 convencional/)).toBeInTheDocument()
    expect(screen.getByText('En el manual físico: páginas 103–112')).toBeInTheDocument()
  })

  it('publica Negro con sus tres rivales y contexto de Generación V', () => {
    renderManualRoute('/manuales/juegos/negro')

    expect(screen.getByRole('heading', { name: 'Pokémon Edición Negra' })).toBeInTheDocument()
    expect(screen.getByText('Cheren')).toBeInTheDocument()
    expect(screen.getByText('Bel')).toBeInTheDocument()
    expect(screen.getByText('N')).toBeInTheDocument()
    expect(screen.getByText('Medalla Leyenda')).toBeInTheDocument()
    expect(screen.getByText(/historia de N y la Liga/)).toBeInTheDocument()
    expect(screen.getByText('En el manual físico: páginas 113–120')).toBeInTheDocument()
  })

  it('publica Negro 2 con Matís y su nueva ruta de Gimnasios', () => {
    renderManualRoute('/manuales/juegos/negro-2')

    expect(screen.getByRole('heading', { name: 'Pokémon Edición Negra 2' })).toBeInTheDocument()
    expect(screen.getByText('Matís, una búsqueda personal')).toBeInTheDocument()
    expect(screen.getByText('Medalla Ponzoña')).toBeInTheDocument()
    expect(screen.getByText('Medalla Ola')).toBeInTheDocument()
    expect(screen.getByText(/Lista de Hábitats permite explorar/)).toBeInTheDocument()
    expect(screen.getByText(/Equipo Plasma pueden revelar conexiones/)).toBeInTheDocument()
    expect(screen.getByText('En el manual físico: páginas 121–128')).toBeInTheDocument()
  })

  it('publica Equipo de Rescate Azul sin pedir datos de saga principal', () => {
    const fetchMock = vi.fn(() => Promise.reject(new Error('blocked')))
    vi.stubGlobal('fetch', fetchMock)
    renderManualRoute('/manuales/juegos/equipo-rescate-azul')

    expect(screen.getByRole('heading', { name: 'Equipo de Rescate Azul' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Los dieciséis protagonistas' })).toBeInTheDocument()
    expect(screen.getByText('Equipo Bellaco')).toBeInTheDocument()
    expect(screen.getByText('Lucario')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Tu primera misión' })).toBeInTheDocument()
    expect(screen.getByText('En el manual físico: páginas 129–136')).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
    vi.unstubAllGlobals()
  })
})
