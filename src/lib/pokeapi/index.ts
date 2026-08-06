/**
 * Capa de acceso a PokeAPI.
 * Convención: todas las funciones de API viven aquí.
 */

export { buildUrl, fetchJson, type FetchJsonOptions } from './http'
export { PokeApiError, type PokeApiErrorKind } from './errors'
export * from './models'
export * from './constants'
export {
  normalizeGeneration,
  normalizePokemon,
  normalizePokemonSpecies,
  normalizeType,
} from './normalizers'
export {
  getGeneration,
  getType,
  getPokemon,
  getPokemonSpecies,
  getSpanishName,
  getSpeciesIdFromUrl,
  type ServiceOptions,
} from './services'
