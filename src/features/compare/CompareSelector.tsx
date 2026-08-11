import { useEffect, useMemo, useRef, useState } from 'react'
import { Plus, Search, X } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { pokemonSummarySnapshot, type PokemonSummaryItem } from '@/features/pokedex/summary'
import { TypeChip } from '@/features/types'
import {
  addCompareId,
  MAX_COMPARE_POKEMON,
  removeCompareId,
  replaceCompareId,
} from './compareSelection'

function normalize(value: string): string {
  return value.toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function formatId(id: number): string {
  return `#${String(id).padStart(3, '0')}`
}

function rankMatches(items: readonly PokemonSummaryItem[], query: string): PokemonSummaryItem[] {
  const needle = normalize(query.trim())
  if (!needle) return []

  return items
    .filter((item) => normalize(item.nameEs).includes(needle) || String(item.id).startsWith(needle))
    .sort((left, right) => {
      const leftName = normalize(left.nameEs)
      const rightName = normalize(right.nameEs)
      const leftExact = leftName === needle || String(left.id) === needle
      const rightExact = rightName === needle || String(right.id) === needle
      if (leftExact !== rightExact) return leftExact ? -1 : 1
      const leftStarts = leftName.startsWith(needle)
      const rightStarts = rightName.startsWith(needle)
      if (leftStarts !== rightStarts) return leftStarts ? -1 : 1
      return left.id - right.id
    })
}

export function CompareSelector({
  ids,
  onChange,
  replaceIndex,
  onReplaceComplete,
}: {
  ids: readonly number[]
  onChange: (ids: readonly number[]) => void
  replaceIndex: number | null
  onReplaceComplete: () => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [searchOpen, setSearchOpen] = useState(ids.length < 2)
  const byId = useMemo(() => new Map(pokemonSummarySnapshot.items.map((item) => [item.id, item])), [])
  const selected = ids.map((id) => byId.get(id)).filter((item): item is PokemonSummaryItem => item != null)

  useEffect(() => {
    if (replaceIndex == null) return
    requestAnimationFrame(() => inputRef.current?.focus())
  }, [replaceIndex])

  const matches = useMemo(() => rankMatches(
    pokemonSummarySnapshot.items.filter((item) => (
      replaceIndex == null
        ? !ids.includes(item.id)
        : !ids.some((id, index) => id === item.id && index !== replaceIndex)
    )),
    query,
  ).slice(0, 6), [ids, query, replaceIndex])

  const choose = (speciesId: number) => {
    if (replaceIndex != null) {
      const result = replaceCompareId(ids, replaceIndex, speciesId)
      if (result.status === 'replaced') {
        onChange(result.ids)
        onReplaceComplete()
        setQuery('')
        setMessage(null)
        setSearchOpen(false)
      } else if (result.status === 'duplicate') {
        setMessage('Ese Pokémon ya participa en la comparación.')
      } else {
        setMessage('No se ha podido sustituir ese participante.')
      }
      return
    }

    const result = addCompareId(ids, speciesId)
    if (result.status === 'added') {
      onChange(result.ids)
      setQuery('')
      setMessage(null)
      if (result.ids.length >= 2) setSearchOpen(false)
    } else if (result.status === 'duplicate') {
      setMessage('Ese Pokémon ya está seleccionado.')
    } else if (result.status === 'full') {
      setMessage('Puedes comparar un máximo de cuatro Pokémon.')
    } else {
      setMessage('Busca un Pokémon por su nombre o por un número entre 1 y 649.')
    }
  }

  const submit = () => {
    const needle = normalize(query.trim())
    const exact = matches.find((item) => normalize(item.nameEs) === needle || String(item.id) === needle)
    const candidate = exact ?? matches[0]
    if (candidate) choose(candidate.id)
    else setMessage('No encontramos ningún Pokémon con esa búsqueda.')
  }

  const replacement = replaceIndex == null ? null : byId.get(ids[replaceIndex])
  const canAdd = ids.length < MAX_COMPARE_POKEMON
  const isSearchVisible = searchOpen || replaceIndex != null

  return (
    <section className="rounded-[var(--radius-xl)] border border-border bg-card p-4 shadow-[var(--shadow-sm)] sm:p-5" aria-labelledby="compare-selector-title">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 id="compare-selector-title" className="font-semibold">Participantes</h2>
          {replacement && <p className="mt-0.5 text-xs text-muted-foreground">Sustituyendo a {replacement.nameEs}</p>}
        </div>
        <span className="rounded-full bg-secondary px-3 py-1 text-sm font-semibold tabular-nums">{ids.length}/{MAX_COMPARE_POKEMON}</span>
      </div>

      {selected.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2" aria-label="Pokémon seleccionados">
          {selected.map((item) => (
            <li key={item.id} className="flex min-h-11 items-center gap-1 rounded-full border border-border bg-secondary pl-3 pr-1 text-sm font-medium shadow-[var(--shadow-xs)]">
              <span>{item.nameEs}</span>
              <Button type="button" variant="ghost" size="icon" className="size-11 rounded-full" onClick={() => onChange(removeCompareId(ids, item.id))} aria-label={`Quitar ${item.nameEs} de la comparación`}>
                <X className="size-4" aria-hidden />
              </Button>
            </li>
          ))}
        </ul>
      )}

      {!isSearchVisible && (
        <Button
          type="button"
          variant="outline"
          className="mt-4"
          disabled={!canAdd}
          onClick={() => { setSearchOpen(true); setMessage(null) }}
        >
          <Plus className="size-4" aria-hidden />
          {canAdd ? 'Añadir otro Pokémon' : 'Máximo de cuatro'}
        </Button>
      )}

      {isSearchVisible && (
        <div className="mt-4">
          <form className="flex gap-2" onSubmit={(event) => { event.preventDefault(); submit() }}>
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <Input
                ref={inputRef}
                id="compare-pokemon-search"
                type="search"
                value={query}
                onChange={(event) => { setQuery(event.target.value); setMessage(null) }}
                placeholder="Busca un Pokémon"
                aria-label={replaceIndex == null ? 'Añadir Pokémon a la comparación' : `Sustituir a ${replacement?.nameEs ?? 'participante'}`}
                aria-controls="compare-search-results"
                aria-expanded={matches.length > 0}
                className="h-11 pl-11"
              />
            </div>
            <Button type="submit" variant="outline" className="h-11" disabled={!query.trim()}>
              {replaceIndex == null ? 'Añadir' : 'Cambiar'}
            </Button>
          </form>

          {matches.length > 0 && (
            <ul id="compare-search-results" className="mt-2 overflow-hidden rounded-[var(--radius-md)] border border-border bg-card shadow-[var(--shadow-sm)]" aria-label="Resultados de Pokémon">
              {matches.map((item) => (
                <li key={item.id} className="border-b border-border last:border-0">
                  <button type="button" className="interactive-clay flex min-h-16 w-full items-center gap-3 px-3 py-2 text-left hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring" onClick={() => choose(item.id)}>
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-secondary">
                      {item.sprite && <img src={item.sprite} alt="" className="size-10 object-contain [image-rendering:pixelated]" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">{item.nameEs} <span className="font-normal text-muted-foreground">· {formatId(item.id)}</span></span>
                      <span className="mt-1 flex flex-wrap gap-1">
                        {item.types.map((type) => <TypeChip key={type} type={type} size="compact" />)}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {message && <p className="mt-3 text-sm text-destructive" role="alert">{message}</p>}
          {ids.length >= 2 && (
            <Button type="button" variant="ghost" size="sm" className="mt-2" onClick={() => { setSearchOpen(false); setQuery(''); setMessage(null); onReplaceComplete() }}>
              Cancelar
            </Button>
          )}
        </div>
      )}
    </section>
  )
}
