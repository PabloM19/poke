const COMBINING_MARKS = /[\u0300-\u036f]/g
const LETTER_OR_NUMBER = /^[A-Z0-9]$/

function expandSpecialCharacters(value: string): string {
  return value
    .replaceAll('♀', ' FEMALE ')
    .replaceAll('♂', ' MALE ')
    .replaceAll('œ', 'oe')
    .replaceAll('Œ', 'OE')
    .replaceAll('æ', 'ae')
    .replaceAll('Æ', 'AE')
}

export function normalizePokemonName(value: string): string {
  return expandSpecialCharacters(value)
    .normalize('NFD')
    .replace(COMBINING_MARKS, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
}

export function letterKey(character: string): string | null {
  const normalized = character
    .normalize('NFD')
    .replace(COMBINING_MARKS, '')
    .toUpperCase()
  return LETTER_OR_NUMBER.test(normalized) ? normalized : null
}

export function pokemonNameLetters(name: string): readonly string[] {
  return [...new Set([...name].map(letterKey).filter((value): value is string => value != null))]
}

export function isPokemonNameSolved(name: string, revealedLetters: ReadonlySet<string>): boolean {
  return [...name].every((character) => {
    const key = letterKey(character)
    return key == null || revealedLetters.has(key)
  })
}

export function matchesPokemonName(guess: string, answer: string): boolean {
  return normalizePokemonName(guess) === normalizePokemonName(answer)
}

export interface PokemonNameCell {
  character: string
  key: string | null
  visible: boolean
}

export function getPokemonNameCells(name: string, revealedLetters: ReadonlySet<string>, revealAll = false): readonly PokemonNameCell[] {
  return [...name].map((character) => {
    const key = letterKey(character)
    return {
      character,
      key,
      visible: revealAll || key == null || revealedLetters.has(key),
    }
  })
}

