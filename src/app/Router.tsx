import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { Layout } from './Layout'
import { SearchPage } from '../pages/SearchPage'
import { PokedexPage } from '../pages/PokedexPage'
import { FavoritesPage } from '../pages/FavoritesPage'
import { SettingsPage } from '../pages/SettingsPage'
import { ComparePage } from '../pages/ComparePage'
import { PokemonDetailPage } from '../pages/PokemonDetailPage'
import { ManualsLandingPage } from '../pages/ManualsLandingPage'
import { MorePage } from '../pages/MorePage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { ManualsLayout } from '@/features/manuals/ManualsLayout'
import { ManualEntryPage } from '@/features/manuals/ManualEntryPage'
import { ManualNotFoundPage } from '@/features/manuals/ManualNotFoundPage'
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
        element: <ManualsLayout />,
        children: [
          { index: true, element: <ManualsLandingPage /> },
          { path: 'empezar/:tema', element: <ManualEntryPage /> },
          { path: 'entrenador/:tema', element: <ManualEntryPage /> },
          { path: 'mundo-misterioso/:tema', element: <ManualEntryPage /> },
          { path: 'otros', element: <ManualEntryPage /> },
          { path: '*', element: <ManualNotFoundPage /> },
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
