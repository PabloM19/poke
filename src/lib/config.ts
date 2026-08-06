/**
 * Configuración global de la capa de datos y la app.
 * Solo constantes; sin lógica ni UI.
 */

/** Base URL de PokeAPI (sin trailing slash). */
export const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2'

/** Prefijo para todas las keys de localStorage (evita colisiones). */
export const APP_STORAGE_PREFIX = 'pokeapp:'

/** Versión del esquema de cache; incrementar al cambiar formato. */
export const CACHE_VERSION = 'v1'
