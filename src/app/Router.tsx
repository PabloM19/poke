import { lazy, Suspense, type ReactNode } from 'react'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { Layout } from './Layout'
import { ShortManualRedirect } from '@/features/manuals/ShortManualRedirect'
import { SpoilerGate } from '@/features/manuals/spoilers/SpoilerGate'

const SearchPage = lazy(async () => ({
  default: (await import('@/pages/SearchPage')).SearchPage,
}))
const FavoritesPage = lazy(async () => ({
  default: (await import('@/pages/FavoritesPage')).FavoritesPage,
}))
const SettingsPage = lazy(async () => ({
  default: (await import('@/pages/SettingsPage')).SettingsPage,
}))
const ComparePage = lazy(async () => ({
  default: (await import('@/pages/ComparePage')).ComparePage,
}))
const PokemonDetailPage = lazy(async () => ({
  default: (await import('@/pages/PokemonDetailPage')).PokemonDetailPage,
}))
const MorePage = lazy(async () => ({
  default: (await import('@/pages/MorePage')).MorePage,
}))
const NotFoundPage = lazy(async () => ({
  default: (await import('@/pages/NotFoundPage')).NotFoundPage,
}))

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
const ResourcesCenterPage = lazy(async () => ({
  default: (await import('@/features/manuals/resources/ResourcesCenterPage')).ResourcesCenterPage,
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

function MechanicsRoute({ children, label }: { children: ReactNode; label: string }) {
  return <DeferredRoute label={label}><SpoilerGate level="mechanics" title={label}>{children}</SpoilerGate></DeferredRoute>
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="/search" replace /> },
      { path: 'search', element: <DeferredRoute label="Buscador"><SearchPage /></DeferredRoute> },
      { path: 'pokemon/:speciesId', element: <DeferredRoute label="Pokémon"><PokemonDetailPage /></DeferredRoute> },
      { path: 'r/:shortCode', element: <ShortManualRedirect /> },
      {
        path: 'manuales',
        element: <DeferredRoute label="Manuales"><ManualsLayout /></DeferredRoute>,
        children: [
          { index: true, element: <DeferredRoute label="Manuales"><ManualsLandingPage /></DeferredRoute> },
          { path: 'empezar/:tema', element: <DeferredRoute label="Manuales"><ManualEntryPage /></DeferredRoute> },
          { path: 'entrenador/:tema', element: <DeferredRoute label="Manuales"><ManualEntryPage /></DeferredRoute> },
          { path: 'mundo-misterioso/:tema', element: <DeferredRoute label="Manuales"><ManualEntryPage /></DeferredRoute> },
          { path: 'otros', element: <DeferredRoute label="Manuales"><ManualEntryPage /></DeferredRoute> },
          { path: 'juegos/:juego', element: <MechanicsRoute label="Guía por juego"><MainGameGuidePage /></MechanicsRoute> },
          { path: 'juegos/equipo-rescate-azul', element: <MechanicsRoute label="Equipo de Rescate Azul"><PmdGuidePage /></MechanicsRoute> },
          { path: 'juegos/exploradores-oscuridad', element: <MechanicsRoute label="Exploradores de la Oscuridad"><ExplorersGuidePage /></MechanicsRoute> },
          { path: 'juegos/ranger', element: <MechanicsRoute label="Pokémon Ranger"><RangerGuidePage /></MechanicsRoute> },
          { path: 'juegos/dash', element: <MechanicsRoute label="Pokémon Dash"><DashGuidePage /></MechanicsRoute> },
          { path: 'juegos/link', element: <MechanicsRoute label="Pokémon Link!"><LinkGuidePage /></MechanicsRoute> },
          { path: 'juegos/conquest', element: <MechanicsRoute label="Pokémon Conquest"><ConquestGuidePage /></MechanicsRoute> },
          { path: 'recursos', element: <DeferredRoute label="Centro de recursos"><ResourcesCenterPage /></DeferredRoute> },
          { path: 'recursos/r-01', element: <DeferredRoute label="R-01"><TypeChartPage /></DeferredRoute> },
          { path: 'recursos/r-02', element: <MechanicsRoute label="R-02 · Estados"><StatusReferencePage /></MechanicsRoute> },
          { path: 'recursos/r-03', element: <DeferredRoute label="R-03"><IconSymbolsPage /></DeferredRoute> },
          { path: 'recursos/r-04', element: <MechanicsRoute label="R-04 · Kit PMD"><PmdExplorationKitPage /></MechanicsRoute> },
          { path: 'recursos/r-05', element: <MechanicsRoute label="R-05 · Captura Ranger"><RangerCaptureTechniquePage /></MechanicsRoute> },
          { path: 'recursos/r-06', element: <MechanicsRoute label="R-06 · Táctica Conquest"><ConquestTacticalReminderPage /></MechanicsRoute> },
          { path: '*', element: <DeferredRoute label="Manuales"><ManualNotFoundPage /></DeferredRoute> },
        ],
      },
      { path: 'pokedex', element: <DeferredRoute label="Pokédex"><PokedexPage /></DeferredRoute> },
      { path: 'favorites', element: <DeferredRoute label="Favoritos"><FavoritesPage /></DeferredRoute> },
      { path: 'settings', element: <DeferredRoute label="Ajustes"><SettingsPage /></DeferredRoute> },
      { path: 'compare', element: <DeferredRoute label="Comparador"><ComparePage /></DeferredRoute> },
      { path: 'more', element: <DeferredRoute label="Más opciones"><MorePage /></DeferredRoute> },
      { path: '*', element: <DeferredRoute label="Página"><NotFoundPage /></DeferredRoute> },
    ],
  },
])

export function Router() {
  return <RouterProvider router={router} />
}
