import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { GameProvider } from '@/features/games'
import { SpoilerPreferenceProvider } from './spoilers/SpoilerPreferenceProvider'
import { ManualsLandingPage } from '@/pages/ManualsLandingPage'
import { ManualEntryPage } from './ManualEntryPage'
import { ManualNotFoundPage } from './ManualNotFoundPage'
import { ManualsLayout } from './ManualsLayout'
import { MainGameGuidePage } from './mainGames/MainGameGuidePage'
import { PmdGuidePage } from './pmd/PmdGuidePage'
import { ExplorersGuidePage } from './pmd/ExplorersGuidePage'
import { RangerGuidePage } from './spinOffs/RangerGuidePage'
import { DashGuidePage } from './spinOffs/DashGuidePage'
import { LinkGuidePage } from './spinOffs/LinkGuidePage'
import { ConquestGuidePage } from './spinOffs/ConquestGuidePage'
import { IconSymbolsPage } from './resources/IconSymbolsPage'
import { PmdExplorationKitPage } from './resources/PmdExplorationKitPage'
import { RangerCaptureTechniquePage } from './resources/RangerCaptureTechniquePage'
import { ConquestTacticalReminderPage } from './resources/ConquestTacticalReminderPage'
import { ResourcesCenterPage } from './resources/ResourcesCenterPage'

function renderManualRoute(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <GameProvider><SpoilerPreferenceProvider initialLevel="guide"><Routes>
        <Route path="/manuales" element={<ManualsLayout />}>
          <Route index element={<ManualsLandingPage />} />
          <Route path="empezar/:tema" element={<ManualEntryPage />} />
          <Route path="entrenador/:tema" element={<ManualEntryPage />} />
          <Route path="mundo-misterioso/:tema" element={<ManualEntryPage />} />
          <Route path="otros" element={<ManualEntryPage />} />
          <Route path="juegos/:juego" element={<MainGameGuidePage />} />
          <Route path="juegos/equipo-rescate-azul" element={<PmdGuidePage />} />
          <Route path="juegos/exploradores-oscuridad" element={<ExplorersGuidePage />} />
          <Route path="juegos/ranger" element={<RangerGuidePage />} />
          <Route path="juegos/dash" element={<DashGuidePage />} />
          <Route path="juegos/link" element={<LinkGuidePage />} />
          <Route path="juegos/conquest" element={<ConquestGuidePage />} />
          <Route path="recursos/r-03" element={<IconSymbolsPage />} />
          <Route path="recursos/r-04" element={<PmdExplorationKitPage />} />
          <Route path="recursos/r-05" element={<RangerCaptureTechniquePage />} />
          <Route path="recursos/r-06" element={<ConquestTacticalReminderPage />} />
          <Route path="recursos" element={<ResourcesCenterPage />} />
          <Route path="*" element={<ManualNotFoundPage />} />
        </Route>
      </Routes></SpoilerPreferenceProvider></GameProvider>
    </MemoryRouter>
  )
}

describe('rutas de Manuales', () => {
  it('presenta la landing como un recorrido claro y deja el índice como consulta secundaria', async () => {
    const user = userEvent.setup()
    renderManualRoute('/manuales')

    expect(screen.getAllByRole('heading')[0]).toHaveTextContent('Manuales')
    expect(screen.getByRole('heading', { name: '¿Qué juego estás jugando?' })).toBeInTheDocument()
    expect(screen.getByText('Paso 1 · Personaliza la biblioteca')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Tu mejor punto de partida' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Guía recomendada para tu juego/ }))
      .toHaveAttribute('href', '/manuales/juegos/perla')

    const indexTrigger = screen.getByRole('button', { name: /Índice completo/ })
    expect(indexTrigger).toHaveAttribute('aria-expanded', 'false')
    await user.click(indexTrigger)

    expect(screen.getByRole('heading', { name: 'Aprender las bases' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Juegos principales' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Spin-offs' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Consulta rápida' })).toBeInTheDocument()
  })

  it('muestra migas, referencia física, índice y avance', () => {
    renderManualRoute('/manuales/entrenador/combate')

    expect(screen.getByRole('heading', { name: 'Comprender el combate' })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Migas de pan' })).toHaveTextContent('ManualesCombate')
    expect(screen.getByText('Páginas 49–54')).toBeInTheDocument()
    expect(screen.getByRole('complementary', { name: 'Índice del manual' })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Lección anterior y siguiente' }))
      .toHaveTextContent('AnteriorExplorar la regiónSiguiente Captura')
    expect(screen.getByText(/Cuando empieza un combate/)).toBeInTheDocument()
    expect(within(screen.getByRole('region', { name: 'Guías relacionadas' })).getByRole('link', { name: /Pokémon Perla/ })).toHaveAttribute('href', '/manuales/juegos/perla')
  })

  it('muestra todas las guías principales cuando el alcance es Todos', async () => {
    const user = userEvent.setup()
    renderManualRoute('/manuales')

    await user.click(screen.getByRole('button', { name: /Cambiar juego activo/ }))
    await user.click(screen.getByRole('button', { name: 'Todos' }))

    const expected = [
      ['perla', 'Pokémon Perla'],
      ['platino', 'Pokémon Platino'],
      ['oro-heartgold', 'Pokémon Oro HeartGold'],
      ['negro', 'Pokémon Negro'],
      ['negro-2', 'Pokémon Negro 2'],
    ] as const
    for (const [slug, title] of expected) {
      const link = screen.getAllByRole('link').find((candidate) => (
        candidate.getAttribute('href') === `/manuales/juegos/${slug}`
        && candidate.textContent?.includes('Páginas')
      ))
      expect(link).toHaveTextContent(title)
      expect(link).toHaveTextContent(/Páginas/)
    }
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
    const related = within(screen.getByRole('region', { name: 'Guías relacionadas' }))
    expect(related.getByRole('link', { name: /Equipo de Rescate Azul/ })).toHaveAttribute('href', '/manuales/juegos/equipo-rescate-azul')
    expect(related.getByRole('link', { name: /Exploradores de la Oscuridad/ })).toHaveAttribute('href', '/manuales/juegos/exploradores-oscuridad')
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

  it('publica Exploradores con Equipo Calavera, gremio y expedición', () => {
    renderManualRoute('/manuales/juegos/exploradores-oscuridad')

    expect(screen.getByRole('heading', { name: 'Exploradores de la Oscuridad' })).toBeInTheDocument()
    expect(screen.getByText('Equipo Calavera')).toBeInTheDocument()
    expect(screen.getByText('Wigglytuff y Chatot')).toBeInTheDocument()
    expect(screen.getByText('Maestro')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Tu primera expedición' })).toBeInTheDocument()
    expect(screen.getByText(/Engranajes del Tiempo/)).toBeInTheDocument()
    expect(screen.getByText('En el manual físico: páginas 137–144')).toBeInTheDocument()
  })

  it('publica la minificha táctil de Ranger', () => {
    renderManualRoute('/manuales/juegos/ranger')

    expect(screen.getByRole('heading', { name: 'Pokémon Ranger' })).toBeInTheDocument()
    expect(screen.getByText(/Dibuja círculos continuos/)).toBeInTheDocument()
    expect(screen.getByText(/reinicia el progreso de los círculos/)).toBeInTheDocument()
    expect(screen.getByText(/R-05 · Técnica de captura/)).toBeInTheDocument()
    expect(screen.getByText('En el manual físico: páginas 145–146')).toBeInTheDocument()
  })

  it('publica la minificha móvil de Pokémon Dash', () => {
    renderManualRoute('/manuales/juegos/dash')

    expect(screen.getByRole('heading', { name: 'Pokémon Dash' })).toBeInTheDocument()
    expect(screen.getByText(/movimientos pequeños y regulares/)).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Secuencia de carrera' }))
      .toHaveTextContent(/Punto de control.*Cambio de terreno.*Meta/)
    expect(screen.getByText(/frotar la pantalla con demasiada fuerza/)).toBeInTheDocument()
    expect(screen.getByText('En el manual físico: páginas 147–148')).toBeInTheDocument()
  })

  it('publica la cadena completa de Pokémon Link!', () => {
    renderManualRoute('/manuales/juegos/link')

    expect(screen.getByRole('heading', { name: 'Pokémon Link!' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Secuencia Link Chance' }))
      .toHaveTextContent(/4iguales→★Link Chance→3iguales→2iguales/)
    expect(screen.getByText(/fichas restantes caen/)).toBeInTheDocument()
    expect(screen.getByText(/mover por impulso/)).toBeInTheDocument()
    expect(screen.getByText('En el manual físico: páginas 149–150')).toBeInTheDocument()
  })

  it('publica el ciclo táctico de Pokémon Conquest', () => {
    renderManualRoute('/manuales/juegos/conquest')

    expect(screen.getByRole('heading', { name: 'Pokémon Conquest' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Secuencia de un turno táctico' }))
      .toHaveTextContent(/Elige unidad.*Mueve al alcance.*Elige acción/)
    expect(screen.getByText(/dirección, la distancia, el terreno/)).toBeInTheDocument()
    expect(screen.getByText(/perseguir daño e ignorar el objetivo/)).toBeInTheDocument()
    expect(screen.getByText('En el manual físico: páginas 151–152')).toBeInTheDocument()
  })

  it('publica R-03 con controles, símbolos y etiquetas', () => {
    renderManualRoute('/manuales/recursos/r-03')

    expect(screen.getByRole('heading', { name: 'Iconos y símbolos' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Botones de Nintendo DS' })).toBeInTheDocument()
    expect(screen.getByText('START / SELECT')).toBeInTheDocument()
    expect(screen.getByText('Guía · spoilers')).toBeInTheDocument()
    expect(screen.getByText(/indicación que aparece en la pantalla del juego/)).toBeInTheDocument()
    expect(screen.getByText('En el manual físico: páginas 153–154')).toBeInTheDocument()
  })

  it('publica R-04 con un kit PMD interactivo', () => {
    renderManualRoute('/manuales/recursos/r-04')

    expect(screen.getByRole('heading', { name: 'Kit de exploración PMD' })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('0 de 6')
    fireEvent.click(screen.getByRole('checkbox', { name: /Alimento/ }))
    expect(screen.getByRole('status')).toHaveTextContent('1 de 6')
    expect(screen.getByText(/Usar, entregar o lanzar/)).toBeInTheDocument()
    expect(screen.getByText(/conserva los orbes/)).toBeInTheDocument()
    expect(screen.getByText('En el manual físico: páginas 70–74')).toBeInTheDocument()
  })

  it('publica R-05 con el ritmo interactivo de captura Ranger', () => {
    renderManualRoute('/manuales/recursos/r-05')

    expect(screen.getByRole('heading', { name: 'Técnica de captura Ranger' })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent(/Identifica el recorrido/)
    fireEvent.click(screen.getByRole('button', { name: '2 · Esquivar' }))
    expect(screen.getByRole('status')).toHaveTextContent(/Retira el lápiz/)
    expect(screen.getByText(/se reinicia el progreso de los círculos actuales/)).toBeInTheDocument()
    expect(screen.getByText(/No presiones ni traces con fuerza/)).toBeInTheDocument()
    expect(screen.getByText('En el manual físico: páginas 145–146')).toBeInTheDocument()
  })

  it('publica R-06 con la revisión táctica de Conquest', () => {
    renderManualRoute('/manuales/recursos/r-06')

    expect(screen.getByRole('heading', { name: 'Recordatorio táctico Conquest' })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('0 de 5')
    fireEvent.click(screen.getByRole('checkbox', { name: /objetivo del mapa/ }))
    fireEvent.click(screen.getByRole('checkbox', { name: /turnos quedan/ }))
    expect(screen.getByRole('status')).toHaveTextContent('2 de 5')
    expect(screen.getByRole('region', { name: 'Orden de decisión' })).toHaveTextContent(/Misión.*Posición.*Acción.*Revisar/)
    expect(screen.getByText(/Fortalecer el vínculo/)).toBeInTheDocument()
    expect(screen.getByText('En el manual físico: páginas 151–152')).toBeInTheDocument()
  })

  it('publica el centro actualizable de R-01 a R-06', () => {
    renderManualRoute('/manuales/recursos')

    expect(screen.getByRole('heading', { name: 'Centro de recursos' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Estado de revisión' })).toHaveTextContent('6 de agosto de 2026')
    expect(screen.getAllByText(/Ruta corta: \/r\/r-0[1-6]/)).toHaveLength(6)
    expect(screen.getByRole('link', { name: /R-01.*Tabla de tipos/ })).toHaveAttribute('href', '/manuales/recursos/r-01')
    expect(screen.getByRole('link', { name: /R-06.*Recordatorio táctico Conquest/ })).toHaveAttribute('href', '/manuales/recursos/r-06')
    expect(screen.getByText(/Once juegos. Dos grandes formas/)).toBeInTheDocument()
    expect(screen.getByText('En el manual físico: páginas 153–156')).toBeInTheDocument()
  })
})
