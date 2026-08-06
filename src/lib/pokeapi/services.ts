/**
 * Servicios de alto nivel: fetchJson + cache en localStorage.
 */

import { getCache, makeKey, setCache } from '../storage'
import { fetchJson } from './http'
import type { Generation, Pokemon, PokemonSpecies, Type } from './models'

const TTL_7_DAYS_MS = 7 * 24 * 60 * 60 * 1000
const TTL_30_DAYS_MS = 30 * 24 * 60 * 60 * 1000

export interface ServiceOptions {
  ttlMs?: number
  signal?: AbortSignal
}

function cacheKey(prefix: string, idOrName: string | number): string {
  return makeKey([prefix, String(idOrName).toLowerCase()])
}

export async function getGeneration(
  idOrName: string | number,
  opts?: ServiceOptions
): Promise<Generation> {
  const key = cacheKey('generation', idOrName)
  const cached = getCache<Generation>(key)
  if (cached) return cached.value

  const data = await fetchJson<Generation>(`/generation/${idOrName}`, {
    signal: opts?.signal,
  })
  setCache(key, data, opts?.ttlMs ?? TTL_7_DAYS_MS)
  return data
}

export async function getType(
  idOrName: string | number,
  opts?: ServiceOptions
): Promise<Type> {
  const key = cacheKey('type', idOrName)
  const cached = getCache<Type>(key)
  if (cached) return cached.value

  const data = await fetchJson<Type>(`/type/${idOrName}`, {
    signal: opts?.signal,
  })
  setCache(key, data, opts?.ttlMs ?? TTL_7_DAYS_MS)
  return data
}

export async function getPokemon(
  idOrName: string | number,
  opts?: ServiceOptions
): Promise<Pokemon> {
  const key = cacheKey('pokemon', idOrName)
  const cached = getCache<Pokemon>(key)
  if (cached) return cached.value

  const data = await fetchJson<Pokemon>(`/pokemon/${idOrName}`, {
    signal: opts?.signal,
  })
  setCache(key, data, opts?.ttlMs ?? TTL_30_DAYS_MS)
  return data
}

export async function getPokemonSpecies(
  idOrName: string | number,
  opts?: ServiceOptions
): Promise<PokemonSpecies> {
  const key = cacheKey('pokemon-species', idOrName)
  const cached = getCache<PokemonSpecies>(key)
  if (cached) return cached.value

  const data = await fetchJson<PokemonSpecies>(`/pokemon-species/${idOrName}`, {
    signal: opts?.signal,
  })
  setCache(key, data, opts?.ttlMs ?? TTL_30_DAYS_MS)
  return data
}

const SPANISH_LANGUAGE_URL = 'https://pokeapi.co/api/v2/language/7/'

/** Devuelve el nombre en español de la especie, o null si no existe. */
export function getSpanishName(species: PokemonSpecies): string | null {
  const entry = species.names.find(
    (n) => n.language.url === SPANISH_LANGUAGE_URL || n.language.name === 'es'
  )
  return entry?.name ?? null
}

/** Extrae el id numérico de una URL de recurso (ej. .../pokemon-species/25/). */
export function getSpeciesIdFromUrl(url: string): number {
  const match = /\/pokemon-species\/(\d+)\/?/.exec(url)
  if (match) return parseInt(match[1], 10)
  const fallback = /\/(\d+)\/?$/.exec(url)
  return fallback ? parseInt(fallback[1], 10) : 0
}
