import { useEffect, useMemo, useState } from 'react'
import { Plus, X } from 'lucide-react'
import { useSpeciesIndex } from '@/hooks/useSpeciesIndex'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { addCompareId, MAX_COMPARE_POKEMON, removeCompareId } from './compareSelection'

function normalize(value: string): string {
  return value.toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

export function CompareSelector({
  ids,
  onChange,
}: {
  ids: readonly number[]
  onChange: (ids: readonly number[]) => void
}) {
  const { index, status, refresh } = useSpeciesIndex()
  const [query, setQuery] = useState('')
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => refresh(), [refresh])

  const matches = useMemo(() => {
    const needle = normalize(query.trim())
    if (!needle || status !== 'ready') return []
    return index.filter((item) =>
      !ids.includes(item.speciesId) &&
      (normalize(item.nameEs).includes(needle) || String(item.speciesId).startsWith(needle))
    ).slice(0, 6)
  }, [ids, index, query, status])

  const add = (speciesId: number) => {
    const result = addCompareId(ids, speciesId)
    if (result.status === 'added') {
      onChange(result.ids)
      setQuery('')
      setMessage(null)
    } else if (result.status === 'duplicate') setMessage('Ese Pokémon ya está seleccionado.')
    else if (result.status === 'full') setMessage('Puedes comparar un máximo de cuatro Pokémon.')
    else setMessage('Escribe un número de especie entre 1 y 649.')
  }

  const numericCandidate = /^\d+$/.test(query.trim()) ? Number(query.trim()) : null

  return (
    <section className="mb-7 rounded-xl border border-border bg-card p-4" aria-labelledby="compare-selector-title">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 id="compare-selector-title" className="font-semibold">Selección</h2>
        <span className="text-sm text-muted-foreground">{ids.length}/{MAX_COMPARE_POKEMON}</span>
      </div>
      {ids.length > 0 && (
        <ul className="mb-4 flex flex-wrap gap-2" aria-label="Pokémon seleccionados">
          {ids.map((id) => (
            <li key={id} className="flex min-h-11 items-center gap-1 rounded-full bg-secondary pl-3 pr-1 text-sm font-medium">
              #{String(id).padStart(3, '0')}
              <Button type="button" variant="ghost" size="icon" className="size-9 rounded-full" onClick={() => onChange(removeCompareId(ids, id))} aria-label={`Quitar #${id} de la comparación`}>
                <X className="size-4" aria-hidden />
              </Button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <Input
          type="search"
          value={query}
          onChange={(event) => { setQuery(event.target.value); setMessage(null) }}
          placeholder={status === 'ready' ? 'Nombre o número' : 'Número del 1 al 649'}
          aria-label="Añadir Pokémon a la comparación"
          disabled={ids.length >= MAX_COMPARE_POKEMON}
          className="h-11"
        />
        <Button
          type="button"
          variant="outline"
          className="h-11"
          disabled={ids.length >= MAX_COMPARE_POKEMON || numericCandidate == null}
          onClick={() => numericCandidate != null && add(numericCandidate)}
        >
          <Plus className="size-4" aria-hidden /> Añadir
        </Button>
      </div>
      {matches.length > 0 && (
        <ul className="mt-2 overflow-hidden rounded-lg border border-border" aria-label="Sugerencias de Pokémon">
          {matches.map((item) => (
            <li key={item.speciesId} className="border-b border-border last:border-0">
              <button type="button" className="flex min-h-11 w-full items-center justify-between gap-3 px-3 py-2 text-left hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring" onClick={() => add(item.speciesId)}>
                <span className="font-medium">{item.nameEs}</span>
                <span className="text-sm text-muted-foreground">#{String(item.speciesId).padStart(3, '0')}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {message && <p className="mt-3 text-sm text-destructive" role="alert">{message}</p>}
      {status === 'missing' && <p className="mt-3 text-sm text-muted-foreground">El índice no está instalado: puedes añadir cualquier especie por número.</p>}
    </section>
  )
}
