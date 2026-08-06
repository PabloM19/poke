import rawSnapshot from '@/data/pokemon-summary.v1.json'
import {
  normalizePokemonSummarySnapshot,
  type PokemonSummarySnapshot,
} from './summarySnapshot'

function loadBundledSnapshot(): PokemonSummarySnapshot {
  const snapshot = normalizePokemonSummarySnapshot(rawSnapshot)
  if (snapshot == null) {
    throw new Error('El snapshot Pokédex incluido no supera la validación v1')
  }
  return snapshot
}

export const pokemonSummarySnapshot = loadBundledSnapshot()
