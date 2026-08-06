import { describe, expect, it } from 'vitest'
import { initializeStorage } from './migrations'

describe('initializeStorage', () => {
  it('borra cachés e índices antiguos y conserva datos actuales', () => {
    localStorage.setItem('pokeapp:v1:pokemon:pikachu', '{}')
    localStorage.setItem('pokeapp:v2:pokemon:raichu', '{}')
    localStorage.setItem('pokeapp:theme', '"dark"')
    localStorage.setItem('pokeapp:index:species:v1', '[]')

    expect(initializeStorage()).toBe(2)
    expect(localStorage.getItem('pokeapp:v1:pokemon:pikachu')).toBeNull()
    expect(localStorage.getItem('pokeapp:v2:pokemon:raichu')).toBe('{}')
    expect(localStorage.getItem('pokeapp:theme')).toBe('"dark"')
    expect(localStorage.getItem('pokeapp:index:species:v1')).toBeNull()
  })
})
