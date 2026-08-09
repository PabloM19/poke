import { describe, expect, it } from 'vitest'
import documentHtml from '../../index.html?raw'
import manifestText from './manifest.webmanifest?raw'
import registerSource from './registerServiceWorker.ts?raw'
import serviceWorkerSource from './service-worker.js?raw'

describe('PWA local', () => {
  it('publica un manifiesto instalable en español', () => {
    const manifest = JSON.parse(manifestText) as Record<string, unknown>

    expect(documentHtml).toContain('rel="manifest" href="/manifest.webmanifest"')
    expect(manifest.lang).toBe('es')
    expect(manifest.display).toBe('standalone')
    expect(manifest.start_url).toBe('/manuales')
    expect(manifest.icons).toEqual(expect.arrayContaining([
      expect.objectContaining({ src: '/pokeapp-icon.svg', type: 'image/svg+xml' }),
    ]))
  })

  it('registra el worker solo en producción y ofrece shell offline', () => {
    expect(registerSource).toContain('import.meta.env.PROD')
    expect(registerSource).toContain("serviceWorker.register('/sw.js'")
    expect(serviceWorkerSource).toContain("request.mode === 'navigate'")
    expect(serviceWorkerSource).toContain("await caches.match('/', { ignoreVary: true })")
    expect(serviceWorkerSource).toContain('caches.match(request, { ignoreVary: true })')
    expect(serviceWorkerSource).toContain('__PRECACHE_URLS__')
  })
})
