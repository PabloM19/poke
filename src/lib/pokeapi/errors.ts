/**
 * Errores tipados del cliente PokeAPI.
 */

export type PokeApiErrorKind =
  | 'http'
  | 'parse'
  | 'network'
  | 'abort'
  | 'timeout'

export class PokeApiError extends Error {
  readonly status?: number
  readonly path: string
  readonly kind: PokeApiErrorKind

  constructor(
    message: string,
    opts: { path: string; kind: PokeApiErrorKind; status?: number }
  ) {
    super(message)
    this.name = 'PokeApiError'
    this.path = opts.path
    this.kind = opts.kind
    this.status = opts.status
    Object.setPrototypeOf(this, PokeApiError.prototype)
  }
}
