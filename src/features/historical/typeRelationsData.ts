import rawSnapshot from '@/data/type-relations.v1.json'
import { normalizeType, type Type } from '@/lib/pokeapi'

function loadTypeRelations(): Type[] {
  if (
    rawSnapshot.version !== 'v1'
    || rawSnapshot.source !== 'pokeapi.co'
    || rawSnapshot.count !== 18
    || rawSnapshot.items.length !== 18
  ) {
    throw new Error('El snapshot de relaciones de tipos es incompatible')
  }
  return rawSnapshot.items.map((item, index) =>
    normalizeType(item, `/snapshot/type/${index + 1}`)
  )
}

export const bundledTypeRelations = loadTypeRelations()
export const bundledTypesByName: ReadonlyMap<string, Type> = new Map(
  bundledTypeRelations.map((type) => [type.name, type])
)
