import { describe, expect, it } from 'vitest'
import { pointsForSilhouetteRound, progressiveHint } from './hints'
import type { PokemonSilhouetteHint, PokemonSilhouetteSnapshot } from './model'

const dual: PokemonSilhouetteSnapshot = {
  id: 1, name: 'Bulbasaur', sprite: null, types: ['grass', 'poison'], regionalNumber: 1, generationId: 1,
}

describe('pistas progresivas', () => {
  it('alterna letras y tipos en los cinco primeros fallos', () => {
    const revealed = new Set<string>()
    const hints: PokemonSilhouetteHint[] = []
    const first = progressiveHint({ pokemon: dual, errorNumber: 1, revealedLetters: revealed, hints, random: () => 0 })
    expect(first.hint.kind).toBe('letter')
    revealed.add(first.revealedLetter ?? '')
    expect(progressiveHint({ pokemon: dual, errorNumber: 2, revealedLetters: revealed, hints }).hint).toMatchObject({ kind: 'type', type: 'grass' })
    expect(progressiveHint({ pokemon: dual, errorNumber: 4, revealedLetters: revealed, hints }).hint).toMatchObject({ kind: 'type', type: 'poison' })
  })

  it('usa el rango regional como fallback para un Pokémon de un tipo', () => {
    const mono = { ...dual, name: 'Mew', types: ['psychic'], regionalNumber: 151 }
    expect(progressiveHint({ pokemon: mono, errorNumber: 4, revealedLetters: new Set(), hints: [] }).hint)
      .toMatchObject({ kind: 'number-range', value: '#151–#200' })
  })

  it('puntúa de forma sencilla según errores', () => {
    expect([0, 1, 2, 3, 5].map((errors) => pointsForSilhouetteRound('solved', errors))).toEqual([3, 2, 2, 1, 1])
    expect(pointsForSilhouetteRound('failed', 6)).toBe(0)
  })
})
