import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CompareResults } from '@/features/compare/CompareResults'
import { CompareSelector } from '@/features/compare/CompareSelector'
import { compareSearchParams, parseCompareIds } from '@/features/compare/compareSelection'
import { useGameContext } from '@/features/games'
import { PageHeader } from '@/components/PageHeader'
import { recordRecentActivity } from '@/features/activity'
import { isOnboardingInProgress } from '@/features/onboarding'

export function ComparePage() {
  const { game, isAll } = useGameContext()
  const [searchParams, setSearchParams] = useSearchParams()
  const ids = parseCompareIds(searchParams)
  const canonical = compareSearchParams(ids)
  const [replaceIndex, setReplaceIndex] = useState<number | null>(null)

  useEffect(() => {
    if (searchParams.toString() !== canonical.toString()) {
      setSearchParams(canonical, { replace: true })
    }
  }, [canonical, searchParams, setSearchParams])

  useEffect(() => {
    if (ids.length < 2 || isOnboardingInProgress()) return
    const query = canonical.toString()
    recordRecentActivity({
      kind: 'comparison',
      id: ids.join('-'),
      route: `/compare${query ? `?${query}` : ''}`,
      title: `Comparación de ${ids.length} Pokémon`,
      subtitle: isAll ? 'Todos los juegos principales' : `${game.title} · Generación ${game.generation === 4 ? 'IV' : 'V'}`,
      pokemonIds: ids,
    })
  }, [canonical, game.generation, game.title, ids, isAll])

  const updateIds = (nextIds: readonly number[]) => {
    setReplaceIndex(null)
    setSearchParams(compareSearchParams(nextIds), { replace: true })
  }

  return (
    <div className="page-stack">
      <div data-tour="combat-tools">
        <PageHeader
          eyebrow="Herramienta de combate"
          title="Comparar"
          description="Pon frente a frente sus tipos y estadísticas, o compara hasta cuatro especies."
          context={(
            <span className="inline-flex min-h-8 items-center rounded-full border border-border bg-card px-3 py-1 font-semibold text-foreground shadow-[var(--shadow-xs)]">
              {isAll ? 'Todos los juegos · referencia DS' : `${game.title} · Gen ${game.generation === 4 ? 'IV' : 'V'}`}
            </span>
          )}
        />
      </div>
      <CompareSelector
        ids={ids}
        onChange={updateIds}
        replaceIndex={replaceIndex}
        onReplaceComplete={() => setReplaceIndex(null)}
      />
      <CompareResults ids={ids} onReplace={setReplaceIndex} />
    </div>
  )
}
