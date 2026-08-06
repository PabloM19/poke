import { fetchJson, getSpeciesIdFromUrl, type ServiceOptions } from '@/lib/pokeapi'
import { getCache, makeKey, setCache } from '@/lib/storage'
import type { MainGameContext } from '@/features/games/gameCatalog'
import type { EncounterArea, EvolutionChain, MoveName, PokemonGameMove, RegionalPokedex } from './gameDataModels'
import { normalizeEncounters, normalizeEvolutionChain, normalizeMoveName, normalizePokemonGameMoves, normalizeRegionalPokedex } from './gameDataNormalizers'

const TTL_MS = 30 * 24 * 60 * 60 * 1000

async function cached<T>(keyParts: readonly string[], path: string, normalize: (raw: unknown, path: string) => T, options?: ServiceOptions): Promise<T> {
  const key = makeKey([...keyParts])
  const stored = getCache<T>(key)
  if (stored) return stored.value
  const data = normalize(await fetchJson<unknown>(path, { signal: options?.signal }), path)
  setCache(key, data, options?.ttlMs ?? TTL_MS)
  return data
}

export function getRegionalPokedex(game: MainGameContext, options?: ServiceOptions): Promise<RegionalPokedex> {
  return cached(['game-pokedex', game.pokedex], `/pokedex/${game.pokedex}`, normalizeRegionalPokedex, options)
}

export function getPokemonGameMoves(pokemonId: number, options?: ServiceOptions): Promise<PokemonGameMove[]> {
  return cached(['game-moves', String(pokemonId)], `/pokemon/${pokemonId}`, normalizePokemonGameMoves, options)
}

export function getPokemonEncounters(pokemonId: number, options?: ServiceOptions): Promise<EncounterArea[]> {
  return cached(['game-encounters', String(pokemonId)], `/pokemon/${pokemonId}/encounters`, normalizeEncounters, options)
}

export function getEvolutionChain(chainUrl: string, options?: ServiceOptions): Promise<EvolutionChain> {
  const match = /\/evolution-chain\/(\d+)\/?$/.exec(chainUrl)
  if (!match) return Promise.reject(new Error('URL de cadena evolutiva no válida'))
  return cached(['evolution-chain', match[1]], `/evolution-chain/${match[1]}`, normalizeEvolutionChain, options)
}

export function getMoveName(move: { name: string; url: string }, options?: ServiceOptions): Promise<MoveName> {
  const id = getSpeciesIdFromUrl(move.url)
  const identifier = id > 0 ? String(id) : move.name
  return cached(['move-name', identifier], `/move/${identifier}`, normalizeMoveName, options)
}

export function selectMovesForGame(moves: readonly PokemonGameMove[], game: MainGameContext): PokemonGameMove[] {
  return moves.flatMap((move) => {
    const details = move.details.filter((detail) => detail.versionGroup.name === game.versionGroup)
    return details.length > 0 ? [{ ...move, details }] : []
  })
}

export function selectEncountersForGame(areas: readonly EncounterArea[], game: MainGameContext): EncounterArea[] {
  return areas.flatMap((area) => {
    const versions = area.versions.filter((entry) => entry.version.name === game.version)
    return versions.length > 0 ? [{ ...area, versions }] : []
  })
}

export function selectEvolutionForGame(chain: EvolutionChain, game: MainGameContext): EvolutionChain {
  const versionOrder: Record<string, number> = {
    'red-blue': 1,
    yellow: 2,
    'gold-silver': 3,
    crystal: 4,
    'ruby-sapphire': 5,
    emerald: 6,
    'firered-leafgreen': 7,
    'diamond-pearl': 8,
    platinum: 9,
    'heartgold-soulsilver': 10,
    'black-white': 11,
    'black-2-white-2': 14,
  }
  const targetOrder = versionOrder[game.versionGroup]
  const visit = (node: EvolutionChain['chain']): EvolutionChain['chain'] => ({
    ...node,
    details: (() => {
      const applicable = node.details.filter((detail) => (
        detail.versionGroup == null
        || (versionOrder[detail.versionGroup.name] ?? Number.POSITIVE_INFINITY) <= targetOrder
      ))
      const latestOrder = Math.max(...applicable.map((detail) => (
        detail.versionGroup == null ? 0 : versionOrder[detail.versionGroup.name] ?? 0
      )), 0)
      return applicable.filter((detail) => (
        (detail.versionGroup == null ? 0 : versionOrder[detail.versionGroup.name] ?? 0) === latestOrder
      ))
    })(),
    evolvesTo: node.evolvesTo.map(visit).filter((child) => child.details.length > 0),
  })
  return { ...chain, chain: visit(chain.chain) }
}

export function speciesId(resource: { url: string }): number {
  return getSpeciesIdFromUrl(resource.url)
}

export function spanishMoveName(move: MoveName): string {
  return move.names.find((entry) => entry.language.name === 'es')?.name ?? move.name
}
