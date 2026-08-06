import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const BASE_URL = 'https://pokeapi.co/api/v2'
const OUTPUT_URL = new URL('../src/data/pokemon-summary.v1.json', import.meta.url)
const OUTPUT_PATH = fileURLToPath(OUTPUT_URL)
const EXPECTED_COUNT = 649
const CONCURRENCY = 6
const MAX_ATTEMPTS = 3
const STAT_NAMES = [
  ['hp', 'hp'],
  ['attack', 'attack'],
  ['defense', 'defense'],
  ['special-attack', 'specialAttack'],
  ['special-defense', 'specialDefense'],
  ['speed', 'speed'],
]

const DISPLAY_NAME_OVERRIDES = new Map([
  ['farfetchd', 'Farfetch’d'],
  ['ho-oh', 'Ho-Oh'],
  ['mime-jr', 'Mime Jr.'],
  ['mr-mime', 'Mr. Mime'],
  ['nidoran-f', 'Nidoran♀'],
  ['nidoran-m', 'Nidoran♂'],
  ['porygon-z', 'Porygon-Z'],
])

function displayName(name) {
  return DISPLAY_NAME_OVERRIDES.get(name)
    ?? name.split('-').map((part) => part[0].toUpperCase() + part.slice(1)).join('-')
}

function speciesIdFromUrl(url) {
  const match = /\/pokemon-species\/(\d+)\/?$/.exec(url)
  return match ? Number(match[1]) : null
}

async function fetchJson(path, attempt = 1) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15_000)
  try {
    const response = await fetch(`${BASE_URL}/${path}`, { signal: controller.signal })
    if (!response.ok) throw new Error(`HTTP ${response.status} en ${path}`)
    return await response.json()
  } catch (error) {
    if (attempt >= MAX_ATTEMPTS) throw error
    await new Promise((resolve) => setTimeout(resolve, 250 * 2 ** (attempt - 1)))
    return fetchJson(path, attempt + 1)
  } finally {
    clearTimeout(timeout)
  }
}

async function mapWithConcurrency(values, mapper) {
  const results = new Array(values.length)
  let cursor = 0
  const workers = Array.from({ length: CONCURRENCY }, async () => {
    while (cursor < values.length) {
      const index = cursor
      cursor += 1
      results[index] = await mapper(values[index], index)
    }
  })
  await Promise.all(workers)
  return results
}

function normalizePokemon(raw, species) {
  if (raw?.id !== species.id || !Array.isArray(raw.types) || !Array.isArray(raw.stats)) {
    throw new Error(`Pokémon inválido para #${species.id}`)
  }

  const statsByName = new Map(raw.stats.map((entry) => [entry?.stat?.name, entry?.base_stat]))
  const stats = Object.fromEntries(STAT_NAMES.map(([apiName, dtoName]) => {
    const value = statsByName.get(apiName)
    if (!Number.isInteger(value) || value < 0) {
      throw new Error(`Stat ${apiName} inválida para #${species.id}`)
    }
    return [dtoName, value]
  }))
  const types = [...raw.types]
    .sort((left, right) => left.slot - right.slot)
    .map((entry) => entry?.type?.name)
  if (types.length < 1 || types.length > 2 || types.some((type) => typeof type !== 'string')) {
    throw new Error(`Tipos inválidos para #${species.id}`)
  }

  return {
    id: species.id,
    name: species.name,
    nameEs: displayName(species.name),
    generationId: species.generationId,
    types,
    stats,
    total: Object.values(stats).reduce((sum, value) => sum + value, 0),
    sprite: raw.sprites?.front_default ?? null,
  }
}

function assertSnapshot(snapshot) {
  if (snapshot?.version !== 'v1' || snapshot?.source !== 'pokeapi.co') {
    throw new Error('Versión o fuente de snapshot inválida')
  }
  if (!Array.isArray(snapshot.items) || snapshot.count !== EXPECTED_COUNT || snapshot.items.length !== EXPECTED_COUNT) {
    throw new Error(`El snapshot debe contener ${EXPECTED_COUNT} entradas`)
  }
  snapshot.items.forEach((entry, index) => {
    if (entry.id !== index + 1) throw new Error(`ID ausente o desordenado en posición ${index}`)
    const expectedGeneration = entry.id <= 151 ? 1 : entry.id <= 251 ? 2 : entry.id <= 386 ? 3 : entry.id <= 493 ? 4 : 5
    if (entry.generationId !== expectedGeneration) throw new Error(`Generación incorrecta para #${entry.id}`)
    if (!Array.isArray(entry.types) || entry.types.length < 1 || entry.types.length > 2) throw new Error(`Tipos incorrectos para #${entry.id}`)
    const total = Object.values(entry.stats ?? {}).reduce((sum, value) => sum + value, 0)
    if (Object.keys(entry.stats ?? {}).length !== 6 || entry.total !== total) throw new Error(`Stats incorrectas para #${entry.id}`)
  })
}

async function checkExistingSnapshot() {
  const contents = await readFile(OUTPUT_URL, 'utf8')
  const snapshot = JSON.parse(contents)
  assertSnapshot(snapshot)
  const hash = createHash('sha256').update(contents).digest('hex')
  console.log(`Snapshot Pokédex v1 válido: ${snapshot.count} entradas, sha256 ${hash}`)
}

async function generateSnapshot() {
  console.log('Descargando metadatos de Generaciones I–V…')
  const generations = await Promise.all([1, 2, 3, 4, 5].map((id) => fetchJson(`generation/${id}`)))
  const speciesById = new Map()
  generations.forEach((generation, index) => {
    for (const resource of generation.pokemon_species ?? []) {
      const id = speciesIdFromUrl(resource.url)
      if (id != null && id <= EXPECTED_COUNT) {
        speciesById.set(id, { id, name: resource.name, generationId: index + 1 })
      }
    }
  })
  if (speciesById.size !== EXPECTED_COUNT) {
    throw new Error(`Se esperaban ${EXPECTED_COUNT} especies y se recibieron ${speciesById.size}`)
  }

  const species = Array.from({ length: EXPECTED_COUNT }, (_, index) => speciesById.get(index + 1))
  console.log('Descargando tipos, stats y sprites con concurrencia máxima 6…')
  let completed = 0
  const items = await mapWithConcurrency(species, async (entry) => {
    const pokemon = await fetchJson(`pokemon/${entry.id}`)
    completed += 1
    if (completed % 50 === 0 || completed === EXPECTED_COUNT) {
      console.log(`${completed} / ${EXPECTED_COUNT}`)
    }
    return normalizePokemon(pokemon, entry)
  })

  const snapshot = {
    version: 'v1',
    generatedAt: new Date().toISOString(),
    source: 'pokeapi.co',
    count: EXPECTED_COUNT,
    items,
  }
  assertSnapshot(snapshot)
  await writeFile(OUTPUT_URL, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8')
  console.log(`Snapshot escrito en ${OUTPUT_PATH}`)
  await checkExistingSnapshot()
}

if (process.argv.includes('--check')) await checkExistingSnapshot()
else await generateSnapshot()
