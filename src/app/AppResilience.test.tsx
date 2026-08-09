import { act, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AppErrorBoundary } from './AppErrorBoundary'
import { NetworkStatusBanner } from './NetworkStatusBanner'

function Broken(): never {
  throw new Error('boom')
}

describe('resiliencia global', () => {
  afterEach(() => vi.restoreAllMocks())

  it('ofrece recuperación si React falla fuera de una ruta', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    render(<AppErrorBoundary><Broken /></AppErrorBoundary>)
    expect(screen.getByRole('alert')).toHaveTextContent('PokéApp no pudo continuar')
    expect(screen.getByRole('button', { name: 'Recargar la app' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Volver al inicio' })).toHaveAttribute('href', '/search')
  })

  it('avisa al perder red y se retira al recuperarla', () => {
    let online = false
    vi.spyOn(navigator, 'onLine', 'get').mockImplementation(() => online)
    render(<NetworkStatusBanner />)
    expect(screen.getByRole('status')).toHaveTextContent('El manual y los datos locales siguen disponibles')
    online = true
    act(() => window.dispatchEvent(new Event('online')))
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })
})
