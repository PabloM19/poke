/**
 * Índice de especies (Gen I–V): tipos, store y builder.
 */

export * from './indexTypes'
export * from './indexStore'
export {
  buildSpeciesIndex,
  SpeciesIndexBuildError,
  type BuildSpeciesIndexOptions,
  type SpeciesIndexBuildErrorKind,
} from './indexBuilder'
