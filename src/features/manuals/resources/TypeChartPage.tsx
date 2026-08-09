import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useGameContext } from '@/features/games'
import {
  buildDefensiveTypeMatrix,
  getTypeNamesForGeneration,
  selectTypeRelationsForGeneration,
  type DamageMultiplier,
} from '@/features/historical'
import { bundledTypesByName } from '@/features/historical/typeRelationsData'
import { translatePokemonType } from '@/features/localization'
import { cn } from '@/lib/utils'
import { PhysicalReference } from '../components/LessonBlocks'
import { TypeChip } from '@/features/types'
import { BentoCard } from '@/components/ui/card'

function multiplierLabel(multiplier: DamageMultiplier): string {
  if (multiplier === 0.25) return '¼'
  if (multiplier === 0.5) return '½'
  return String(multiplier)
}

function multiplierClass(multiplier: DamageMultiplier): string {
  if (multiplier === 0) return 'bg-secondary text-muted-foreground'
  if (multiplier < 1) return 'bg-ui-green/65 text-ui-green-strong'
  if (multiplier > 1) return 'bg-ui-yellow/70 text-ui-yellow-strong'
  return 'text-muted-foreground'
}

export function TypeChartPage() {
  const { game } = useGameContext()
  const typeNames = getTypeNamesForGeneration(game.generation)
  const [selectedAttacker, setSelectedAttacker] = useState('normal')
  const attacker = typeNames.includes(selectedAttacker) ? selectedAttacker : typeNames[0]
  const relationsByType = new Map(typeNames.map((typeName) => {
    const type = bundledTypesByName.get(typeName)
    if (type == null) throw new Error(`Falta el tipo ${typeName} en el snapshot`)
    return [typeName, selectTypeRelationsForGeneration(type, game.generation)]
  }))
  const matrix = new Map(typeNames.map((attackingType) => [
    attackingType,
    new Map(typeNames.map((defendingType) => [
      defendingType,
      buildDefensiveTypeMatrix(
        [defendingType],
        new Map([[defendingType, relationsByType.get(defendingType)!]]),
        [attackingType]
      )[0].multiplier,
    ])),
  ]))

  return (
    <article>
      <BentoCard tone="blue">
        <p className="text-sm font-semibold text-ui-blue-strong">R-01 · REFERENCIA SIN SPOILERS</p>
        <h1 className="mt-1 page-title">Tabla de tipos</h1>
        <p className="mt-3 leading-7 text-foreground/75">Elige el tipo del movimiento atacante y busca el tipo del Pokémon defensor. Si tiene dos tipos, multiplica ambos valores: por ejemplo, 2 × 2 = 4.</p>
      </BentoCard>
      <div className="my-5 rounded-[var(--radius-lg)] border border-border bg-card p-4 text-sm shadow-[var(--shadow-xs)]">
        <p className="font-medium">{game.title} · Generación {game.generation === 4 ? 'IV' : 'V'}</p>
        <p className="mt-1 text-muted-foreground">La tabla usa las relaciones históricas del juego activo y no incluye Hada.</p>
      </div>
      <PhysicalReference reference={{ edition: 'ds-156-v1', pages: [153, 154] }} />

      <section className="md:hidden" aria-labelledby="mobile-chart-title">
        <h2 id="mobile-chart-title" className="mb-3 text-xl font-semibold">Consulta compacta</h2>
        <label className="block text-sm font-medium" htmlFor="attacking-type">
          Tipo del movimiento atacante
          <select
            id="attacking-type"
            value={attacker}
            onChange={(event) => setSelectedAttacker(event.target.value)}
            className="mt-2 h-11 w-full rounded-[var(--radius-md)] border border-input bg-card px-3 shadow-[var(--shadow-xs)]"
          >
            {typeNames.map((type) => <option key={type} value={type}>{translatePokemonType(type)}</option>)}
          </select>
        </label>
        <div className="mt-4 overflow-hidden rounded-[var(--radius-lg)] border border-border bg-card shadow-[var(--shadow-xs)]">
          <table className="w-full text-sm">
            <caption className="sr-only">Eficacia de {translatePokemonType(attacker)} contra cada tipo defensor</caption>
            <thead className="bg-muted/60 text-left"><tr><th className="p-3">Tipo defensor</th><th className="p-3 text-right">Daño</th></tr></thead>
            <tbody>
              {typeNames.map((defender) => {
                const multiplier = matrix.get(attacker)!.get(defender)!
                return (
                  <tr key={defender} className="border-t border-border">
                    <th scope="row" className="p-3 font-medium"><TypeChip type={defender} size="compact" /></th>
                    <td className="p-2 text-right"><span className={cn('inline-flex min-w-10 justify-center rounded-md px-2 py-1 font-semibold', multiplierClass(multiplier))}>×{multiplierLabel(multiplier)}</span></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="hidden md:block" aria-labelledby="desktop-chart-title">
        <h2 id="desktop-chart-title" className="mb-3 text-xl font-semibold">Matriz completa</h2>
        <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-border bg-card shadow-[var(--shadow-xs)]">
          <table className="min-w-[72rem] border-collapse text-center text-xs">
            <caption className="sr-only">Filas de tipo atacante y columnas de tipo defensor</caption>
            <thead><tr className="bg-muted/60"><th className="sticky left-0 z-10 bg-muted p-2 text-left">Ataca ↓ / Defiende →</th>{typeNames.map((type) => <th key={type} className="p-2"><TypeChip type={type} size="compact" /></th>)}</tr></thead>
            <tbody>{typeNames.map((attackingType) => <tr key={attackingType} className="border-t border-border"><th scope="row" className="sticky left-0 bg-card p-2 text-left"><TypeChip type={attackingType} size="compact" /></th>{typeNames.map((defendingType) => { const multiplier = matrix.get(attackingType)!.get(defendingType)!; return <td key={defendingType} className={cn('p-2 font-semibold', multiplierClass(multiplier))}>{multiplierLabel(multiplier)}</td> })}</tr>)}</tbody>
          </table>
        </div>
      </section>

      <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
        <span><strong className="text-foreground">×4 / ×2</strong> supereficaz</span>
        <span><strong className="text-foreground">×½ / ×¼</strong> poco eficaz</span>
        <span><strong className="text-foreground">×0</strong> sin efecto</span>
      </div>
      <nav className="mt-8 flex flex-wrap gap-3" aria-label="Recursos relacionados">
        <Link className="inline-flex min-h-11 items-center rounded-[var(--radius-sm)] px-3 text-sm font-semibold text-primary hover:bg-accent" to="/manuales/entrenador/combate">Volver a Comprender el combate</Link>
        <Link className="inline-flex min-h-11 items-center rounded-[var(--radius-sm)] px-3 text-sm font-semibold text-primary hover:bg-accent" to="/manuales/recursos/r-02">Abrir R-02 · Estados</Link>
      </nav>
    </article>
  )
}
