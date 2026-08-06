import { lazy, Suspense, type ReactNode } from 'react'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { Layout } from './Layout'
import { SearchPage } from '../pages/SearchPage'
import { PokedexPage } from '../pages/PokedexPage'
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

function DeferredRoute({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground" role="status">Cargando Manuales…</p>}>
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
        element: <DeferredRoute><ManualsLayout /></DeferredRoute>,
        children: [
          { index: true, element: <DeferredRoute><ManualsLandingPage /></DeferredRoute> },
          { path: 'empezar/:tema', element: <DeferredRoute><ManualEntryPage /></DeferredRoute> },
          { path: 'entrenador/:tema', element: <DeferredRoute><ManualEntryPage /></DeferredRoute> },
          { path: 'mundo-misterioso/:tema', element: <DeferredRoute><ManualEntryPage /></DeferredRoute> },
          { path: 'otros', element: <DeferredRoute><ManualEntryPage /></DeferredRoute> },
          { path: '*', element: <DeferredRoute><ManualNotFoundPage /></DeferredRoute> },
        ],
      },
      { path: 'pokedex', element: <PokedexPage /> },
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
