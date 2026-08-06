import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const OUTPUT_URL = new URL('../src/data/type-relations.v1.json', import.meta.url)
const EXPECTED_COUNT = 18
const RELATION_KEYS = [
  'double_damage_to', 'half_damage_to', 'no_damage_to',
  'double_damage_from', 'half_damage_from', 'no_damage_from',
]

async function fetchJson(path, attempt = 1) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15_000)
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/${path}`, { signal: controller.signal })
    if (!response.ok) throw new Error(`HTTP ${response.status} en ${path}`)
    return await response.json()
  } catch (error) {
    if (attempt >= 3) throw error
    await new Promise((resolve) => setTimeout(resolve, 250 * 2 ** (attempt - 1)))
    return fetchJson(path, attempt + 1)
  } finally {
    clearTimeout(timeout)
  }
}

function namedResource(resource) {
  if (typeof resource?.name !== 'string' || typeof resource?.url !== 'string') {
    throw new Error('Recurso de tipo inválido')
  }
  return { name: resource.name, url: resource.url }
}

function normalizeRelations(raw) {
  return Object.fromEntries(RELATION_KEYS.map((key) => {
    if (!Array.isArray(raw?.[key])) throw new Error(`Relación ausente: ${key}`)
    return [key, raw[key].map(namedResource)]
  }))
}

function normalizeType(raw, id) {
  if (raw?.id !== id || typeof raw?.name !== 'string') throw new Error(`Tipo #${id} inválido`)
  return {
    id,
    name: raw.name,
    damage_relations: normalizeRelations(raw.damage_relations),
    past_damage_relations: (raw.past_damage_relations ?? []).map((past) => ({
      generation: namedResource(past.generation),
      damage_relations: normalizeRelations(past.damage_relations),
    })),
  }
}

function assertSnapshot(snapshot) {
  if (snapshot?.version !== 'v1' || snapshot?.source !== 'pokeapi.co') throw new Error('Snapshot de tipos incompatible')
  if (snapshot?.count !== EXPECTED_COUNT || snapshot?.items?.length !== EXPECTED_COUNT) throw new Error('El snapshot debe contener 18 tipos')
  snapshot.items.forEach((item, index) => {
    if (item.id !== index + 1) throw new Error(`Tipo desordenado en posición ${index}`)
    normalizeType(item, item.id)
  })
}

async function check() {
  const contents = await readFile(OUTPUT_URL, 'utf8')
  const snapshot = JSON.parse(contents)
  assertSnapshot(snapshot)
  const hash = createHash('sha256').update(contents).digest('hex')
  console.log(`Snapshot de tipos v1 válido: ${snapshot.count} entradas, sha256 ${hash}`)
}

async function generate() {
  console.log('Descargando relaciones de los 18 tipos…')
  const items = []
  for (let firstId = 1; firstId <= EXPECTED_COUNT; firstId += 6) {
    const batch = Array.from(
      { length: Math.min(6, EXPECTED_COUNT - firstId + 1) },
      (_, index) => firstId + index
    )
    items.push(...await Promise.all(
      batch.map(async (id) => normalizeType(await fetchJson(`type/${id}`), id))
    ))
  }
  const snapshot = {
    version: 'v1',
    generatedAt: new Date().toISOString(),
    source: 'pokeapi.co',
    count: EXPECTED_COUNT,
    items,
  }
  assertSnapshot(snapshot)
  await writeFile(OUTPUT_URL, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8')
  console.log(`Snapshot escrito en ${fileURLToPath(OUTPUT_URL)}`)
  await check()
}

if (process.argv.includes('--check')) await check()
else await generate()
