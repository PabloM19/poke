import { describe, expect, it } from 'vitest'
import { getPokemonNameCells, isPokemonNameSolved, matchesPokemonName, normalizePokemonName, pokemonNameLetters } from './nameLogic'

describe('nombres de ¿Quién es ese Pokémon?', () => {
  it.each([
    ['Mr Mime', 'Mr. Mime'],
    ['farfetchd', 'Farfetch’d'],
    ['ho oh', 'Ho-Oh'],
    ['porygon z', 'Porygon-Z'],
    ['Flabebe', 'Flabébé'],
    ['nidoran female', 'Nidoran♀'],
    ['nidoran male', 'Nidoran♂'],
  ])('acepta %s como respuesta de %s', (guess, answer) => {
    expect(matchesPokemonName(guess, answer)).toBe(true)
  })

  it('mantiene distintos los símbolos de género', () => {
    expect(normalizePokemonName('Nidoran♀')).not.toBe(normalizePokemonName('Nidoran♂'))
  })

  it('revela todas las apariciones y conserva signos visibles', () => {
    const cells = getPokemonNameCells('Ho-Oh', new Set(['H']))
    expect(cells.map((cell) => cell.visible ? cell.character : '_').join('')).toBe('H_-_h')
    expect(pokemonNameLetters('Ho-Oh')).toEqual(['H', 'O'])
    expect(isPokemonNameSolved('Ho-Oh', new Set(['H', 'O']))).toBe(true)
  })

  it.each(['Mew', 'Fletchinder', 'Mime Jr.', 'Nidoran♀'])('enmascara nombres cortos, largos y con símbolos: %s', (name) => {
    const cells = getPokemonNameCells(name, new Set())
    expect(cells.filter((cell) => cell.key != null).every((cell) => !cell.visible)).toBe(true)
    expect(cells.filter((cell) => cell.key == null).every((cell) => cell.visible)).toBe(true)
  })
})
