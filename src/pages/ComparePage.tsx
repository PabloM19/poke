import { useEffect } from 'react'
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
    setSearchParams(compareSearchParams(nextIds), { replace: true })
  }

  return (
    <div className="page-stack">
      <div data-tour="combat-tools">
        <PageHeader
          eyebrow="Herramienta de combate"
          title="Comparar"
          description="Elige entre dos y cuatro Pokémon. La selección queda guardada en la URL para compartirla."
          context={<><span className="font-semibold text-foreground">Contexto: {isAll ? 'Todos los juegos principales' : game.title}</span><span> · {isAll ? 'Se usa la referencia histórica común de Nintendo DS.' : `Generación ${game.generation === 4 ? 'IV' : 'V'}. Tipos y stats se comparan tal como funcionan en este juego.`}</span></>}
        />
      </div>
      <CompareSelector ids={ids} onChange={updateIds} />
      <CompareResults ids={ids} />
    </div>
  )
}
