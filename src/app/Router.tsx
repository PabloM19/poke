import { lazy, Suspense, type ReactNode } from 'react'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { Layout } from './Layout'
import { SearchPage } from '../pages/SearchPage'
import { FavoritesPage } from '../pages/FavoritesPage'
import { SettingsPage } from '../pages/SettingsPage'
import { ComparePage } from '../pages/ComparePage'
import { PokemonDetailPage } from '../pages/PokemonDetailPage'
import { MorePage } from '../pages/MorePage'
import { NotFoundPage } from '../pages/NotFoundPage'

const ManualsLayout = lazy(async () => ({
  default: (await import('@/features/manuals/ManualsLayout')).ManualsLayout,
}))
const ManualsLandingPage = lazy(async () => ({
  default: (await import('@/pages/ManualsLandingPage')).ManualsLandingPage,
}))
const ManualEntryPage = lazy(async () => ({
  default: (await import('@/features/manuals/ManualEntryPage')).ManualEntryPage,
}))
const ManualNotFoundPage = lazy(async () => ({
  default: (await import('@/features/manuals/ManualNotFoundPage')).ManualNotFoundPage,
}))
const TypeChartPage = lazy(async () => ({
  default: (await import('@/features/manuals/resources/TypeChartPage')).TypeChartPage,
}))
const StatusReferencePage = lazy(async () => ({
  default: (await import('@/features/manuals/resources/StatusReferencePage')).StatusReferencePage,
}))
const IconSymbolsPage = lazy(async () => ({
  default: (await import('@/features/manuals/resources/IconSymbolsPage')).IconSymbolsPage,
}))
const PmdExplorationKitPage = lazy(async () => ({
  default: (await import('@/features/manuals/resources/PmdExplorationKitPage')).PmdExplorationKitPage,
}))
const RangerCaptureTechniquePage = lazy(async () => ({
  default: (await import('@/features/manuals/resources/RangerCaptureTechniquePage')).RangerCaptureTechniquePage,
}))
const ConquestTacticalReminderPage = lazy(async () => ({
  default: (await import('@/features/manuals/resources/ConquestTacticalReminderPage')).ConquestTacticalReminderPage,
}))
const MainGameGuidePage = lazy(async () => ({
  default: (await import('@/features/manuals/mainGames/MainGameGuidePage')).MainGameGuidePage,
}))
const PmdGuidePage = lazy(async () => ({
  default: (await import('@/features/manuals/pmd/PmdGuidePage')).PmdGuidePage,
}))
const ExplorersGuidePage = lazy(async () => ({
  default: (await import('@/features/manuals/pmd/ExplorersGuidePage')).ExplorersGuidePage,
}))
const RangerGuidePage = lazy(async () => ({
  default: (await import('@/features/manuals/spinOffs/RangerGuidePage')).RangerGuidePage,
}))
const DashGuidePage = lazy(async () => ({
  default: (await import('@/features/manuals/spinOffs/DashGuidePage')).DashGuidePage,
}))
const LinkGuidePage = lazy(async () => ({
  default: (await import('@/features/manuals/spinOffs/LinkGuidePage')).LinkGuidePage,
}))
const ConquestGuidePage = lazy(async () => ({
  default: (await import('@/features/manuals/spinOffs/ConquestGuidePage')).ConquestGuidePage,
}))
const PokedexPage = lazy(async () => ({
  default: (await import('@/pages/PokedexPage')).PokedexPage,
}))

function DeferredRoute({ children, label = 'contenido' }: { children: ReactNode; label?: string }) {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground" role="status">Cargando {label}…</p>}>
      {children}
    </Suspense>
  )
}
import { UiDemo } from '../components/ui-demo'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="/search" replace /> },
      { path: 'search', element: <SearchPage /> },
      { path: 'pokemon/:speciesId', element: <PokemonDetailPage /> },
      {
        path: 'manuales',
        element: <DeferredRoute label="Manuales"><ManualsLayout /></DeferredRoute>,
        children: [
          { index: true, element: <DeferredRoute label="Manuales"><ManualsLandingPage /></DeferredRoute> },
          { path: 'empezar/:tema', element: <DeferredRoute label="Manuales"><ManualEntryPage /></DeferredRoute> },
          { path: 'entrenador/:tema', element: <DeferredRoute label="Manuales"><ManualEntryPage /></DeferredRoute> },
          { path: 'mundo-misterioso/:tema', element: <DeferredRoute label="Manuales"><ManualEntryPage /></DeferredRoute> },
          { path: 'otros', element: <DeferredRoute label="Manuales"><ManualEntryPage /></DeferredRoute> },
          { path: 'juegos/:juego', element: <DeferredRoute label="Guía por juego"><MainGameGuidePage /></DeferredRoute> },
          { path: 'juegos/equipo-rescate-azul', element: <DeferredRoute label="Equipo de Rescate Azul"><PmdGuidePage /></DeferredRoute> },
          { path: 'juegos/exploradores-oscuridad', element: <DeferredRoute label="Exploradores de la Oscuridad"><ExplorersGuidePage /></DeferredRoute> },
          { path: 'juegos/ranger', element: <DeferredRoute label="Pokémon Ranger"><RangerGuidePage /></DeferredRoute> },
          { path: 'juegos/dash', element: <DeferredRoute label="Pokémon Dash"><DashGuidePage /></DeferredRoute> },
          { path: 'juegos/link', element: <DeferredRoute label="Pokémon Link!"><LinkGuidePage /></DeferredRoute> },
          { path: 'juegos/conquest', element: <DeferredRoute label="Pokémon Conquest"><ConquestGuidePage /></DeferredRoute> },
          { path: 'recursos/r-01', element: <DeferredRoute label="R-01"><TypeChartPage /></DeferredRoute> },
          { path: 'recursos/r-02', element: <DeferredRoute label="R-02"><StatusReferencePage /></DeferredRoute> },
          { path: 'recursos/r-03', element: <DeferredRoute label="R-03"><IconSymbolsPage /></DeferredRoute> },
          { path: 'recursos/r-04', element: <DeferredRoute label="R-04"><PmdExplorationKitPage /></DeferredRoute> },
          { path: 'recursos/r-05', element: <DeferredRoute label="R-05"><RangerCaptureTechniquePage /></DeferredRoute> },
          { path: 'recursos/r-06', element: <DeferredRoute label="R-06"><ConquestTacticalReminderPage /></DeferredRoute> },
          { path: '*', element: <DeferredRoute label="Manuales"><ManualNotFoundPage /></DeferredRoute> },
        ],
      },
      { path: 'pokedex', element: <DeferredRoute label="Pokédex"><PokedexPage /></DeferredRoute> },
      { path: 'favorites', element: <FavoritesPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'compare', element: <ComparePage /> },
      { path: 'more', element: <MorePage /> },
      { path: 'demo', element: <UiDemo /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

export function Router() {
  return <RouterProvider router={router} />
}
