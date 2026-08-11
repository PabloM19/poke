import type { PokemonSilhouetteHint, PokemonSilhouetteSnapshot } from './model'
import { pokemonNameLetters } from './nameLogic'

export interface ProgressiveHintResult {
  hint: PokemonSilhouetteHint
  revealedLetter: string | null
}

interface HintOptions {
  pokemon: PokemonSilhouetteSnapshot
  errorNumber: number
  revealedLetters: ReadonlySet<string>
  hints: readonly PokemonSilhouetteHint[]
  random?: () => number
}

function numberRange(number: number): string {
  const start = Math.floor((Math.max(1, number) - 1) / 50) * 50 + 1
  return `#${String(start).padStart(3, '0')}–#${String(start + 49).padStart(3, '0')}`
}

function letterHint(pokemon: PokemonSilhouetteSnapshot, revealed: ReadonlySet<string>, random: () => number): ProgressiveHintResult | null {
  const available = pokemonNameLetters(pokemon.name).filter((letter) => !revealed.has(letter))
  if (available.length === 0) return null
  const letter = available[Math.min(available.length - 1, Math.floor(random() * available.length))]
  return {
    hint: { kind: 'letter', label: 'Letra revelada', value: letter, letter },
    revealedLetter: letter,
  }
}

function firstUnusedFallback(pokemon: PokemonSilhouetteSnapshot, hints: readonly PokemonSilhouetteHint[]): ProgressiveHintResult {
  const usedKinds = new Set(hints.map((hint) => `${hint.kind}:${hint.value}`))
  const candidates: PokemonSilhouetteHint[] = [
    { kind: 'number-range', label: 'Número regional', value: numberRange(pokemon.regionalNumber) },
    { kind: 'generation', label: 'Generación', value: `Generación ${pokemon.generationId}` },
  ]
  return {
    hint: candidates.find((hint) => !usedKinds.has(`${hint.kind}:${hint.value}`)) ?? candidates[0],
    revealedLetter: null,
  }
}

export function progressiveHint({ pokemon, errorNumber, revealedLetters, hints, random = Math.random }: HintOptions): ProgressiveHintResult {
  if (errorNumber === 1 || errorNumber === 3 || errorNumber === 5) {
    return letterHint(pokemon, revealedLetters, random) ?? firstUnusedFallback(pokemon, hints)
  }
  if (errorNumber === 2) {
    return {
      hint: { kind: 'type', label: 'Tipo primario', value: pokemon.types[0], type: pokemon.types[0] },
      revealedLetter: null,
    }
  }
  if (errorNumber === 4 && pokemon.types[1]) {
    return {
      hint: { kind: 'type', label: 'Tipo secundario', value: pokemon.types[1], type: pokemon.types[1] },
      revealedLetter: null,
    }
  }
  return firstUnusedFallback(pokemon, hints)
}

export function pointsForSilhouetteRound(result: 'solved' | 'failed', errors: number): number {
  if (result === 'failed') return 0
  if (errors === 0) return 3
  if (errors <= 2) return 2
  return 1
}

