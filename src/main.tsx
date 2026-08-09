import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Providers } from './app/providers'
import { Router } from './app/Router'
import { initializeStorage } from './lib/storage'
import './styles/globals.css'
import { AppErrorBoundary } from './app/AppErrorBoundary'

initializeStorage()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppErrorBoundary><Providers><Router /></Providers></AppErrorBoundary>
  </StrictMode>,
)
