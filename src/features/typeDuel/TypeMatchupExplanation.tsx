import { ArrowRight } from '@/components/icons'
import { TypeChip } from '@/features/types'
import type { TypeDuelAttackResult, TypeDuelPokemonSnapshot } from './model'
import { multiplierLabel } from './typeMatchup'

function AttackLine({
  attack,
  defender,
}: {
  attack: TypeDuelAttackResult
  defender: TypeDuelPokemonSnapshot
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 text-sm">
      <TypeChip type={attack.attackingType} size="compact" />
      <ArrowRight className="size-4 text-muted-foreground" aria-hidden />
      <span className="flex flex-wrap gap-1">
        {defender.types.map((type) => <TypeChip key={type} type={type} size="compact" />)}
      </span>
      <strong className="ml-auto tabular-nums">×{multiplierLabel(attack.multiplier)}</strong>
    </div>
  )
}

export function TypeMatchupExplanation({
  left,
  right,
  leftBest,
  rightBest,
}: {
  left: TypeDuelPokemonSnapshot
  right: TypeDuelPokemonSnapshot
  leftBest: TypeDuelAttackResult
  rightBest: TypeDuelAttackResult
}) {
  return (
    <div className="grid gap-2" aria-label="Explicación de efectividad">
      <AttackLine attack={leftBest} defender={right} />
      <AttackLine attack={rightBest} defender={left} />
    </div>
  )
}

