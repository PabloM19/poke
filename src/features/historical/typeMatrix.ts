import type { TypeRelations } from '@/lib/pokeapi'

export type DamageMultiplier = 0 | 0.25 | 0.5 | 1 | 2 | 4

export interface DefensiveMatchup {
  attackingType: string
  multiplier: DamageMultiplier
}

function relationNames(resources: TypeRelations[keyof TypeRelations]): Set<string> {
  return new Set(resources.map((resource) => resource.name))
}

function multiplierAgainstType(
  attackingType: string,
  relations: TypeRelations
): 0 | 0.5 | 1 | 2 {
  if (relationNames(relations.no_damage_from).has(attackingType)) return 0
  if (relationNames(relations.double_damage_from).has(attackingType)) return 2
  if (relationNames(relations.half_damage_from).has(attackingType)) return 0.5
  return 1
}

function asDamageMultiplier(value: number): DamageMultiplier {
  if ([0, 0.25, 0.5, 1, 2, 4].includes(value)) return value as DamageMultiplier
  throw new Error(`Multiplicador defensivo fuera de dominio: ${value}`)
}

export function buildDefensiveTypeMatrix(
  defendingTypes: readonly string[],
  relationsByType: ReadonlyMap<string, TypeRelations>,
  attackingTypes: readonly string[]
): DefensiveMatchup[] {
  const uniqueDefendingTypes = [...new Set(defendingTypes)]
  if (uniqueDefendingTypes.length < 1 || uniqueDefendingTypes.length > 2) {
    throw new Error('La matriz defensiva requiere uno o dos tipos distintos')
  }

  const defendingRelations = uniqueDefendingTypes.map((type) => {
    const relations = relationsByType.get(type)
    if (relations == null) throw new Error(`Faltan relaciones para el tipo ${type}`)
    return relations
  })

  return [...new Set(attackingTypes)].map((attackingType) => {
    const multiplier = defendingRelations.reduce(
      (result, relations) => result * multiplierAgainstType(attackingType, relations),
      1
    )
    return { attackingType, multiplier: asDamageMultiplier(multiplier) }
  })
}
