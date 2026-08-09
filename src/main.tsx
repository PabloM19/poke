import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Providers } from './app/providers'
import { Router } from './app/Router'
import { initializeStorage } from './lib/storage'
import './styles/globals.css'
import { AppErrorBoundary } from './app/AppErrorBoundary'
import { registerServiceWorker } from './pwa/registerServiceWorker'

initializeStorage()
registerServiceWorker()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppErrorBoundary><Providers><Router /></Providers></AppErrorBoundary>
  </StrictMode>,
)
