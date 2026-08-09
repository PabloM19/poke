import { describe, expect, it } from 'vitest'
import routerSource from './Router.tsx?raw'

describe('router de producción', () => {
  it('no publica la ruta interna de demostración', () => {
    expect(routerSource).not.toContain("path: 'demo'")
    expect(routerSource).not.toContain('UiDemo')
  })
})
