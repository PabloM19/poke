import { describe, expect, it } from 'vitest'
import { getSetting, getStored, setSetting, setStored } from './settings'

describe('settings', () => {
  it('guarda preferencias válidas con el prefijo de la app', () => {
    setSetting('theme', 'dark')

    expect(getSetting('theme', 'light')).toBe('dark')
    expect(localStorage.getItem('pokeapp:theme')).toBe('"dark"')
  })

  it('ignora valores no válidos y usa el fallback', () => {
    localStorage.setItem('pokeapp:defaultView', '"tiles"')

    expect(getSetting('defaultView', 'grid')).toBe('grid')
  })

  it('guarda el nivel de spoilers y rechaza valores desconocidos', () => {
    setSetting('spoilerLevel', 'mechanics')
    expect(getSetting('spoilerLevel', 'none')).toBe('mechanics')
    localStorage.setItem('pokeapp:spoilerLevel', '"everything"')
    expect(getSetting('spoilerLevel', 'none')).toBe('none')
  })

  it('guarda si el usuario quiere conservar actividad reciente', () => {
    setSetting('recentActivity', 'disabled')
    expect(getSetting('recentActivity', 'enabled')).toBe('disabled')
    localStorage.setItem('pokeapp:recentActivity', '"unknown"')
    expect(getSetting('recentActivity', 'enabled')).toBe('enabled')
  })

  it('persiste datos genéricos bajo el namespace de la app', () => {
    expect(setStored('test:value', { ok: true })).toBe(true)

    expect(getStored<{ ok: boolean }>('test:value')).toEqual({ ok: true })
  })
})
