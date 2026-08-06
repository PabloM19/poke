import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSpeciesIndex } from '@/hooks/useSpeciesIndex'
import { usePokemonSummary } from '@/hooks/usePokemonSummary'
import type { SpeciesIndexItem } from '@/lib/pokedex'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const MAX_RESULTS = 20

/** Normaliza para búsqueda: minúsculas y sin tildes. */
function normalizeSearch(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
}

function matchSpecies(query: string, index: SpeciesIndexItem[]): SpeciesIndexItem[] {
  const q = normalizeSearch(query).trim()
  if (q.length === 0) return []

  const startsWith: SpeciesIndexItem[] = []
  const includes: SpeciesIndexItem[] = []

  for (const item of index) {
    const nameNorm = normalizeSearch(item.nameEs)
    const idStr = String(item.speciesId)
    if (nameNorm.startsWith(q) || idStr.startsWith(q)) {
      startsWith.push(item)
    } else if (nameNorm.includes(q) || idStr.includes(q)) {
      includes.push(item)
    }
  }

  return [...startsWith, ...includes].slice(0, MAX_RESULTS)
}

function formatSpeciesId(id: number): string {
  return `#${String(id).padStart(3, '0')}`
}

function SearchResultRow({
  item,
  onSelect,
}: {
  item: SpeciesIndexItem
  onSelect: () => void
}) {
  const { status, data } = usePokemonSummary(
    item.defaultPokemonName,
    item.speciesId
  )
  const spriteUrl = status === 'success' ? data?.spriteUrl ?? null : null

  return (
    <button
      type="button"
      className="flex w-full items-center gap-3 px-3 py-3 text-left hover:bg-accent focus:bg-accent focus:outline-none"
      onClick={onSelect}
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded bg-muted">
        {spriteUrl ? (
          <img
            src={spriteUrl}
            alt=""
            className="h-10 w-10 object-contain"
            loading="lazy"
          />
        ) : (
          <span className="text-xs text-muted-foreground" aria-hidden>
            —
          </span>
        )}
      </span>
      <span className="min-w-0 flex-1 font-medium text-foreground">
        {item.nameEs}
      </span>
      <span className="shrink-0 text-sm text-muted-foreground">
        {formatSpeciesId(item.speciesId)}
      </span>
    </button>
  )
}

export function SearchPage() {
  const { index, status, refresh } = useSpeciesIndex()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  // Releer índice al entrar en la página (por si acabas de construirlo en Ajustes)
  useEffect(() => {
    refresh()
  }, [refresh])

  const results = useMemo(
    () => (status === 'ready' ? matchSpecies(query, index) : []),
    [query, index, status]
  )

  const goToDetail = useCallback(
    (speciesId: number) => {
      navigate(`/pokemon/${speciesId}`)
      setQuery('')
    },
    [navigate]
  )

  if (status === 'missing') {
    return (
      <>
        <h1 className="mb-2 text-2xl font-semibold text-foreground">Buscar</h1>
        <div
          className="rounded-lg border border-border bg-muted/50 p-4 text-sm text-foreground"
          role="status"
        >
          <p className="mb-3">
            Aún no has descargado los datos. Ve a Ajustes → Datos de Pokédex
            para construir el índice.
          </p>
          <Button asChild variant="outline" size="sm">
            <Link to="/settings">Ir a Ajustes</Link>
          </Button>
        </div>
      </>
    )
  }

  return (
    <>
      <h1 className="mb-2 text-2xl font-semibold text-foreground">Buscar</h1>
      <p className="mb-4 text-muted-foreground">
        Busca cualquier Pokémon por nombre o número. Escribe en el cuadro de
        búsqueda y verás resultados al instante.
      </p>

      <div className="relative">
        <Input
          type="search"
          placeholder="Busca un Pokémon (en español)…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-12 text-base"
          autoComplete="off"
          aria-label="Buscar Pokémon"
          aria-autocomplete="list"
          aria-controls="search-suggestions"
          aria-expanded={results.length > 0}
        />

        {results.length > 0 && (
          <ul
            id="search-suggestions"
            className="absolute left-0 right-0 top-full z-10 mt-1 max-h-[min(70vh,400px)] overflow-auto rounded-lg border border-border bg-background shadow-lg"
            role="listbox"
          >
            {results.map((item) => (
              <li key={item.speciesId} role="option">
                <SearchResultRow
                  item={item}
                  onSelect={() => goToDetail(item.speciesId)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}
