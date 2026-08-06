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
import { UiDemo } from '../components/ui-demo'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="/search" replace /> },
      { path: 'search', element: <SearchPage /> },
      { path: 'pokemon/:speciesId', element: <PokemonDetailPage /> },
      { path: 'manuales', element: <ManualsLandingPage /> },
      { path: 'pokedex', element: <PokedexPage /> },
      { path: 'favorites', element: <FavoritesPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'compare', element: <ComparePage /> },
      { path: 'more', element: <MorePage /> },
      { path: 'demo', element: <UiDemo /> },
    ],
  },
])

export function Router() {
  return <RouterProvider router={router} />
}
