/**
 * Construcción del índice de especies (Gen I–V) con progreso, reanudación y concurrencia limitada.
 */

import { APP_STORAGE_PREFIX } from '../config'
import { getStored, setStored } from '../storage'
import { getGeneration, getPokemonSpecies, getSpanishName, getSpeciesIdFromUrl } from '../pokeapi'
import { KEY_INDEX, KEY_META, KEY_PARTIAL } from './indexStore'
import type { SpeciesIndexItem, SpeciesIndexPartial } from './indexTypes'

const SAVE_PARTIAL_EVERY = 20

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
    if (signal?.aborted) return []
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

  let items: SpeciesIndexItem[] = []
  let refs: SpeciesRef[]

  const partial = getStored<SpeciesIndexPartial>(KEY_PARTIAL)
  if (partial?.items?.length && partial.maxGen === maxGen) {
    items = [...partial.items]
    onProgress?.({ done: items.length, total: 0, phase: 'generations' })
    refs = await loadSpeciesRefs(maxGen, signal)
    const doneIds = new Set(items.map((i) => i.speciesId))
    refs = refs.filter((r) => !doneIds.has(r.id))
    onProgress?.({
      done: items.length,
      total: items.length + refs.length,
      phase: 'species',
    })
  } else {
    onProgress?.({ done: 0, total: 0, phase: 'generations' })
    refs = await loadSpeciesRefs(maxGen, signal)
    onProgress?.({ done: 0, total: refs.length, phase: 'species' })
  }

  const total = items.length + refs.length
  let doneCount = items.length

  const savePartial = () => {
    setStored(KEY_PARTIAL, { items: [...items], maxGen })
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
          } catch {
            // skip
          }
        }
      })
    )
  }

  if (signal?.aborted) {
    savePartial()
    return items
  }

  items.sort((a, b) => a.speciesId - b.speciesId)
  setStored(KEY_INDEX, items)
  setStored(KEY_META, {
    timestamp: Date.now(),
    maxGen,
    counts: { species: items.length },
    version: 'v1',
  })
  try {
    localStorage.removeItem(APP_STORAGE_PREFIX + KEY_PARTIAL)
  } catch {
    setStored(KEY_PARTIAL, null as unknown as SpeciesIndexPartial)
  }
  onProgress?.({ done: items.length, total: items.length, phase: 'done' })
  return items
}
