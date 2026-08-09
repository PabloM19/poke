import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CompareResults } from '@/features/compare/CompareResults'
import { CompareSelector } from '@/features/compare/CompareSelector'
import { compareSearchParams, parseCompareIds } from '@/features/compare/compareSelection'
import { useGameContext } from '@/features/games'
import { BentoCard } from '@/components/ui/card'
import { recordRecentActivity } from '@/features/activity'
import { isOnboardingInProgress } from '@/features/onboarding'

export function ComparePage() {
  const { game } = useGameContext()
  const [searchParams, setSearchParams] = useSearchParams()
  const ids = parseCompareIds(searchParams)
  const canonical = compareSearchParams(ids)

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
      subtitle: `${game.title} · Generación ${game.generation === 4 ? 'IV' : 'V'}`,
      pokemonIds: ids,
    })
  }, [canonical, game.generation, game.title, ids])

  const updateIds = (nextIds: readonly number[]) => {
    setSearchParams(compareSearchParams(nextIds), { replace: true })
  }

  return (
    <div className="page-stack">
      <BentoCard tone="green" data-tour="combat-tools">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ui-green-strong">Herramienta de combate</p>
        <h1 className="page-title mt-1">Comparar</h1>
        <p className="mt-3 max-w-2xl leading-7 text-foreground/75">Elige entre dos y cuatro Pokémon. La selección queda guardada en la URL para compartirla.</p>
        <div className="mt-4 rounded-[var(--radius-md)] bg-card/65 p-3 text-sm">
          <span className="font-semibold">Contexto: {game.title}</span>
          <span className="text-muted-foreground"> · Generación {game.generation === 4 ? 'IV' : 'V'}</span>
          <p className="mt-1 text-muted-foreground">Tipos y stats se comparan tal como funcionan en este juego.</p>
        </div>
      </BentoCard>
      <CompareSelector ids={ids} onChange={updateIds} />
      <CompareResults ids={ids} />
    </div>
  )
}
