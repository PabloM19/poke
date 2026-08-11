export interface MainGameContext {
  slug: MainGameSlug
  title: string
  shortTitle: string
  generation: 4 | 5
  region: 'Sinnoh' | 'Johto' | 'Teselia'
  version: string
  versionGroup: string
  pokedex: string
}

export type MainGameSlug = 'perla' | 'platino' | 'oro-heartgold' | 'negro' | 'negro-2'
export const ALL_GAMES_SLUG = 'all' as const
export type GameSelection = MainGameSlug | typeof ALL_GAMES_SLUG

export const MAIN_GAME_CONTEXTS: readonly MainGameContext[] = [
  { slug: 'perla', title: 'Pokémon Perla', shortTitle: 'Perla', generation: 4, region: 'Sinnoh', version: 'pearl', versionGroup: 'diamond-pearl', pokedex: 'original-sinnoh' },
  { slug: 'platino', title: 'Pokémon Platino', shortTitle: 'Platino', generation: 4, region: 'Sinnoh', version: 'platinum', versionGroup: 'platinum', pokedex: 'extended-sinnoh' },
  { slug: 'oro-heartgold', title: 'Pokémon Oro HeartGold', shortTitle: 'HeartGold', generation: 4, region: 'Johto', version: 'heartgold', versionGroup: 'heartgold-soulsilver', pokedex: 'updated-johto' },
  { slug: 'negro', title: 'Pokémon Negro', shortTitle: 'Negro', generation: 5, region: 'Teselia', version: 'black', versionGroup: 'black-white', pokedex: 'original-unova' },
  { slug: 'negro-2', title: 'Pokémon Negro 2', shortTitle: 'Negro 2', generation: 5, region: 'Teselia', version: 'black-2', versionGroup: 'black-2-white-2', pokedex: 'updated-unova' },
]

export const DEFAULT_MAIN_GAME_SLUG: MainGameSlug = 'perla'

export function isGameSelection(value: unknown): value is GameSelection {
  return value === ALL_GAMES_SLUG || isMainGameSlug(value)
}

export function isMainGameSlug(value: unknown): value is MainGameSlug {
  return typeof value === 'string'
    && MAIN_GAME_CONTEXTS.some((game) => game.slug === value)
}

export function getMainGameContext(slug: MainGameSlug): MainGameContext {
  return MAIN_GAME_CONTEXTS.find((game) => game.slug === slug)
    ?? MAIN_GAME_CONTEXTS[0]
}
