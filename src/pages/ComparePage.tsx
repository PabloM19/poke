import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CompareResults } from '@/features/compare/CompareResults'
import { CompareSelector } from '@/features/compare/CompareSelector'
import { compareSearchParams, parseCompareIds } from '@/features/compare/compareSelection'
import { useGameContext } from '@/features/games'

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

  const updateIds = (nextIds: readonly number[]) => {
    setSearchParams(compareSearchParams(nextIds), { replace: true })
  }

  return (
    <>
      <h1 className="text-2xl font-semibold text-foreground">Comparar</h1>
      <p className="mb-6 mt-2 text-muted-foreground">
        Elige entre dos y cuatro Pokémon. La selección queda guardada en la URL para compartirla.
      </p>
      <div className="mb-6 rounded-xl border border-border bg-muted/40 p-3 text-sm">
        <span className="font-medium">Contexto: {game.title}</span>
        <span className="text-muted-foreground"> · Generación {game.generation === 4 ? 'IV' : 'V'}</span>
        <p className="mt-1 text-muted-foreground">Tipos y stats se comparan tal como funcionan en este juego.</p>
      </div>
      <CompareSelector ids={ids} onChange={updateIds} />
      <CompareResults ids={ids} />
    </>
  )
}
