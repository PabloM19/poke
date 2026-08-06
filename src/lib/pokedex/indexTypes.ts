/**
 * Tipos mínimos para el índice de especies (Gen I–V).
 */

export interface SpeciesIndexItem {
  speciesId: number
  speciesName: string
  nameEs: string
  generationId: number
  defaultPokemonName: string
  speciesUrl: string
}

export interface SpeciesIndexMeta {
  timestamp: number
  maxGen: number
  counts: { species: number }
  version: string
}

export interface SpeciesIndexPartial {
  items: SpeciesIndexItem[]
  maxGen: number
}
