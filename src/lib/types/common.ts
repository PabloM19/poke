/**
 * Tipos utilitarios para la capa de datos y dominio.
 * Mínimos; sin dependencias de UI.
 */

/** T permite null explícito. */
export type Nullable<T> = T | null

/** Resultado de una operación: éxito con dato o error con mensaje. */
export type Result<T, E = string> =
  | { ok: true; data: T }
  | { ok: false; error: E }

/** Extrae el tipo del dato de un Result exitoso. */
export type ResultData<R> = R extends Result<infer T, unknown> ? T : never

/** Extrae el tipo del error de un Result fallido. */
export type ResultError<R> = R extends Result<unknown, infer E> ? E : never
