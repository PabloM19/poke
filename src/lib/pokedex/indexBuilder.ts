/**
 * Construcción del índice de especies (Gen I–V) con progreso, reanudación y concurrencia limitada.
 */

import { getStored, removeStored, setStored } from '../storage'
import {
  getGeneration,
  getPokemonSpecies,
  getSpanishName,
  getSpeciesIdFromUrl,
  PokeApiError,
} from '../pokeapi'
import { KEY_INDEX, KEY_META, KEY_PARTIAL, SPECIES_INDEX_VERSION } from './indexStore'
import type { SpeciesIndexItem, SpeciesIndexPartial } from './indexTypes'

const SAVE_PARTIAL_EVERY = 20

export type SpeciesIndexBuildErrorKind = 'abort' | 'incomplete' | 'storage'

export class SpeciesIndexBuildError extends Error {
  readonly kind: SpeciesIndexBuildErrorKind
  readonly failedSpeciesIds: number[]

  constructor(
    message: string,
    kind: SpeciesIndexBuildErrorKind,
    failedSpeciesIds: number[] = []
  ) {
    super(message)
    this.name = 'SpeciesIndexBuildError'
    this.kind = kind
    this.failedSpeciesIds = failedSpeciesIds
    Object.setPrototypeOf(this, SpeciesIndexBuildError.prototype)
  }
}

export interface BuildSpeciesIndexOptions {
  maxGen?: number
  concurrency?: number
  onProgress?: (state: {
    done: number
    total: number
    phase: 'generations' | 'species' | 'done'
    currentSpecies?: number
    currentSpeciesName?: string
  }) => void
  signal?: AbortSignal
}

interface SpeciesRef {
  id: number
  url: string
  generationId: number
}

/** Obtiene la lista única de especies desde generaciones 1..maxGen (id, url, generationId). */
async function loadSpeciesRefs(
  maxGen: number,
  signal?: AbortSignal
): Promise<SpeciesRef[]> {
  const byId = new Map<number, SpeciesRef>()
  for (let g = 1; g <= maxGen; g++) {
    if (signal?.aborted) {
      throw new SpeciesIndexBuildError('Construcción cancelada', 'abort')
    }
    const gen = await getGeneration(g, { signal })
    for (const ref of gen.pokemon_species) {
      const id = getSpeciesIdFromUrl(ref.url)
      if (id && !byId.has(id)) {
        byId.set(id, { id, url: ref.url, generationId: g })
      }
    }
  }
  return Array.from(byId.values()).sort((a, b) => a.id - b.id)
}

function buildItemFromSpecies(
  ref: SpeciesRef,
  species: Awaited<ReturnType<typeof getPokemonSpecies>>
): SpeciesIndexItem {
  const nameEs = getSpanishName(species) ?? species.name
  const variety = species.varieties.find((v) => v.is_default) ?? species.varieties[0]
  const defaultPokemonName = variety?.pokemon.name ?? species.name
  return {
    speciesId: ref.id,
    speciesName: species.name,
    nameEs,
    generationId: ref.generationId,
    defaultPokemonName,
    speciesUrl: ref.url,
  }
}

/**
 * Construye el índice de especies. Reanuda desde partial si existe.
 * Guarda partial cada SAVE_PARTIAL_EVERY ítems. Al final guarda índice completo y meta y borra partial.
 */
export async function buildSpeciesIndex(
  options: BuildSpeciesIndexOptions = {}
): Promise<SpeciesIndexItem[]> {
  const {
    maxGen = 5,
    concurrency = 6,
    onProgress,
    signal,
  } = options

  onProgress?.({ done: 0, total: 0, phase: 'generations' })
  const allRefs = await loadSpeciesRefs(maxGen, signal)
  const expectedIds = new Set(allRefs.map((ref) => ref.id))
  const partial = getStored<SpeciesIndexPartial>(KEY_PARTIAL)
  const resumedItems = partial?.maxGen === maxGen && Array.isArray(partial.items)
    ? partial.items.filter((item, index, source) =>
        expectedIds.has(item.speciesId) &&
        source.findIndex((candidate) => candidate.speciesId === item.speciesId) === index
      )
    : []
  const items: SpeciesIndexItem[] = [...resumedItems]
  const doneIds = new Set(items.map((item) => item.speciesId))
  const refs = allRefs.filter((ref) => !doneIds.has(ref.id))
  const total = allRefs.length
  let doneCount = items.length
  const failedSpeciesIds: number[] = []

  onProgress?.({ done: doneCount, total, phase: 'species' })

  const savePartial = () => {
    if (!setStored(KEY_PARTIAL, { items: [...items], maxGen })) {
      throw new SpeciesIndexBuildError(
        'No hay espacio para guardar el progreso del índice',
        'storage'
      )
    }
  }

  if (refs.length > 0) {
    const workers = Math.min(concurrency, refs.length)
    await Promise.all(
      Array.from({ length: workers }, async (_, w) => {
        for (let i = w; i < refs.length; i += workers) {
          if (signal?.aborted) break
          const ref = refs[i]
          try {
            const species = await getPokemonSpecies(ref.id, { signal })
            const item = buildItemFromSpecies(ref, species)
            items.push(item)
            doneCount++
            if (doneCount % SAVE_PARTIAL_EVERY === 0) savePartial()
            onProgress?.({
              done: doneCount,
              total,
              phase: 'species',
              currentSpecies: ref.id,
              currentSpeciesName: item.nameEs,
            })
          } catch (error) {
            if (error instanceof PokeApiError && error.kind === 'abort') continue
            if (error instanceof SpeciesIndexBuildError) throw error
            failedSpeciesIds.push(ref.id)
          }
        }
      })
    )
  }

  if (signal?.aborted) {
    savePartial()
    throw new SpeciesIndexBuildError(
      'Construcción cancelada; el progreso se ha guardado',
      'abort'
    )
  }

  if (failedSpeciesIds.length > 0) {
    savePartial()
    throw new SpeciesIndexBuildError(
      `No se pudieron descargar ${failedSpeciesIds.length} especies; vuelve a intentarlo para reanudar`,
      'incomplete',
      failedSpeciesIds.sort((a, b) => a - b)
    )
  }

  items.sort((a, b) => a.speciesId - b.speciesId)
  const finalIds = new Set(items.map((item) => item.speciesId))
  if (
    items.length !== total ||
    finalIds.size !== total ||
    allRefs.some((ref) => !finalIds.has(ref.id))
  ) {
    savePartial()
    throw new SpeciesIndexBuildError(
      `El índice está incompleto (${items.length}/${total})`,
      'incomplete'
    )
  }

  if (!setStored(KEY_INDEX, items)) {
    savePartial()
    throw new SpeciesIndexBuildError('No hay espacio para guardar el índice', 'storage')
  }
  const metaSaved = setStored(KEY_META, {
    timestamp: Date.now(),
    maxGen,
    counts: { species: items.length },
    version: SPECIES_INDEX_VERSION,
  })
  if (!metaSaved) {
    removeStored(KEY_INDEX)
    savePartial()
    throw new SpeciesIndexBuildError(
      'No hay espacio para guardar los metadatos del índice',
      'storage'
    )
  }
  removeStored(KEY_PARTIAL)
  onProgress?.({ done: items.length, total: items.length, phase: 'done' })
  return items
}
