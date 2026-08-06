import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CompareResults } from '@/features/compare/CompareResults'
import { CompareSelector } from '@/features/compare/CompareSelector'
import { compareSearchParams, parseCompareIds } from '@/features/compare/compareSelection'

export function ComparePage() {
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
      <CompareSelector ids={ids} onChange={updateIds} />
      <CompareResults ids={ids} />
    </>
  )
}
