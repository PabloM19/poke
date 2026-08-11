import { bundledTypesByName } from './typeRelationsData'
import { getTypeNamesForGeneration } from './pokemonDefense'
import { selectTypeRelationsForGeneration } from './historicalSelectors'
import { buildDefensiveTypeMatrix, type DamageMultiplier } from './typeMatrix'
import type { GenId, TypeRelations } from '@/lib/pokeapi'

const relationsCache = new Map<GenId, ReadonlyMap<string, TypeRelations>>()

export function relationsForGeneration(generation: GenId): ReadonlyMap<string, TypeRelations> {
  const cached = relationsCache.get(generation)
  if (cached) return cached

  const relations = new Map(getTypeNamesForGeneration(generation).map((typeName) => {
    const type = bundledTypesByName.get(typeName)
    if (type == null) throw new Error(`Faltan relaciones para el tipo ${typeName}`)
    return [typeName, selectTypeRelationsForGeneration(type, generation)] as const
  }))
  relationsCache.set(generation, relations)
  return relations
}

export function attackMultiplier(
  attackingType: string,
  defendingTypes: readonly string[],
  generation: GenId,
): DamageMultiplier {
  const allRelations = relationsForGeneration(generation)
  const defendingRelations = new Map(defendingTypes.map((typeName) => {
    const relations = allRelations.get(typeName)
    if (relations == null) throw new Error(`El tipo ${typeName} no existe en la generación seleccionada`)
    return [typeName, relations] as const
  }))
  return buildDefensiveTypeMatrix(defendingTypes, defendingRelations, [attackingType])[0].multiplier
}
