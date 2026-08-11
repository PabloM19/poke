import {
  buildDefensiveTypeMatrix,
  getTypeNamesForGeneration,
  selectTypeRelationsForGeneration,
  type DamageMultiplier,
} from '@/features/historical'
import { bundledTypesByName } from '@/features/historical/typeRelationsData'
import type { GenId, TypeRelations } from '@/lib/pokeapi'
import type {
  GeneratedTypeDuelRound,
  TypeDuelAnswer,
  TypeDuelAttackResult,
  TypeDuelPokemonSnapshot,
} from './model'

const relationsCache = new Map<GenId, ReadonlyMap<string, TypeRelations>>()

function relationsForGeneration(generation: GenId): ReadonlyMap<string, TypeRelations> {
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

export function bestStabAttack(
  attackingTypes: readonly string[],
  defendingTypes: readonly string[],
  generation: GenId,
): TypeDuelAttackResult {
  if (attackingTypes.length === 0) throw new Error('El Pokémon atacante no tiene tipos')
  return attackingTypes
    .map((attackingType) => ({
      attackingType,
      multiplier: attackMultiplier(attackingType, defendingTypes, generation),
    }))
    .reduce((best, candidate) => candidate.multiplier > best.multiplier ? candidate : best)
}

export function evaluateTypeMatchup(
  left: TypeDuelPokemonSnapshot,
  right: TypeDuelPokemonSnapshot,
  generation: GenId,
): GeneratedTypeDuelRound {
  // Cada lado usa exclusivamente su mejor multiplicador STAB contra los tipos
  // defensivos rivales. La igualdad siempre es equilibrio: no se desempata por
  // stats, velocidad ni por una suposición sobre quién ganaría el combate real.
  const leftBest = bestStabAttack(left.types, right.types, generation)
  const rightBest = bestStabAttack(right.types, left.types, generation)
  const correctAnswer: TypeDuelAnswer = leftBest.multiplier === rightBest.multiplier
    ? 'neutral'
    : leftBest.multiplier > rightBest.multiplier ? 'left' : 'right'

  return { left, right, leftBest, rightBest, correctAnswer }
}

export function multiplierLabel(multiplier: DamageMultiplier): string {
  if (multiplier === 0.25) return '0,25'
  if (multiplier === 0.5) return '0,5'
  return String(multiplier)
}
