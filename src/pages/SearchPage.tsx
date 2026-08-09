import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSpeciesIndex } from '@/hooks/useSpeciesIndex'
import { usePokemonSummary } from '@/hooks/usePokemonSummary'
import type { SpeciesIndexItem } from '@/lib/pokedex'
import { SearchField } from '@/components/ui/search-field'
import { Button } from '@/components/ui/button'
import { BentoCard } from '@/components/ui/card'
import { Search } from '@/components/icons'
import { HomeActivity } from '@/features/activity'

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
      className="interactive-clay flex min-h-16 w-full items-center gap-3 rounded-[var(--radius-md)] border border-border bg-card px-3 py-2.5 text-left shadow-[var(--shadow-xs)] hover:bg-accent focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/35"
      onClick={onSelect}
    >
      <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-sm)] bg-secondary">
        {spriteUrl ? (
          <img
            src={spriteUrl}
            alt=""
            className="size-12 object-contain [image-rendering:pixelated]"
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
      <div className="page-stack">
        <div className="page-heading" data-tour="home-overview">
          <h1 className="page-title">Buscar</h1>
          <p className="page-lead">Encuentra una especie por nombre o número y abre su ficha histórica.</p>
        </div>
        <HomeActivity />
        <BentoCard tone="yellow" role="status" data-tour="search-field">
          <Search className="size-8 text-ui-yellow-strong" aria-hidden />
          <h2 className="mt-4 text-lg font-bold">Prepara el buscador sin conexión</h2>
          <p className="mb-3">
            Aún no has descargado los datos. Ve a Ajustes → Datos de Pokédex
            para construir el índice.
          </p>
          <Button asChild variant="outline" size="sm">
            <Link to="/settings">Ir a Ajustes</Link>
          </Button>
        </BentoCard>
      </div>
    )
  }

  return (
    <div className="page-stack">
      <div className="page-heading" data-tour="home-overview">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ui-lavender-strong">Consulta rápida</p>
        <h1 className="page-title mt-1">Buscar</h1>
        <p className="page-lead">Encuentra cualquier Pokémon de las generaciones I–V por nombre o número.</p>
      </div>

      <HomeActivity />

      <BentoCard tone="lavender" className="relative z-20" data-tour="search-field">
        <SearchField
          type="search"
          placeholder="Busca un Pokémon (en español)…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoComplete="off"
          aria-label="Buscar Pokémon"
        />

        {results.length > 0 && (
          <ul
            id="search-suggestions"
            className="mt-3 grid max-h-[min(62vh,32rem)] gap-2 overflow-auto pr-1"
            aria-label="Resultados de búsqueda"
          >
            {results.map((item) => (
              <li key={item.speciesId}>
                <SearchResultRow
                  item={item}
                  onSelect={() => goToDetail(item.speciesId)}
                />
              </li>
            ))}
          </ul>
        )}
        {query.trim().length > 0 && results.length === 0 && (
          <p className="mt-4 rounded-[var(--radius-md)] bg-card/70 p-4 text-sm text-muted-foreground" role="status">
            No hay coincidencias. Prueba con otro nombre o con el número de Pokédex.
          </p>
        )}
      </BentoCard>

      <div className="grid grid-cols-2 gap-3">
        <BentoCard tone="green" className="p-4">
          <p className="text-xs font-semibold text-ui-green-strong">Nombres</p>
          <p className="mt-1 text-sm font-medium">Busca en español, con o sin tildes.</p>
        </BentoCard>
        <BentoCard tone="blue" className="p-4">
          <p className="text-xs font-semibold text-ui-blue-strong">Números</p>
          <p className="mt-1 text-sm font-medium">Escribe 25 para llegar a #025.</p>
        </BentoCard>
      </div>
    </div>
  )
}
