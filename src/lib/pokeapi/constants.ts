/**
 * Constantes de dominio PokeAPI usadas en la app.
 */

/** Generaciones soportadas (ids) para filtros y listados. */
export const GEN_RANGE = [1, 2, 3, 4, 5] as const

export type GenId = (typeof GEN_RANGE)[number]
