import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { LayoutGrid, List, Filter, X } from 'lucide-react'
import { getSetting, setSetting } from '@/lib/storage'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { PokedexCard } from '@/components/PokedexCard'
import { pokemonSummarySnapshot } from '@/features/pokedex/summary'
import type { GenerationFilter } from '@/features/pokedex/filters/generationFilter'
import {
  filterAndSortPokemon,
  getTotalBounds,
  POKEMON_TYPES,
  type PokedexSort,
  type PokemonTypeName,
  type PokedexFilters,
} from '@/features/pokedex/filters/pokedexFilters'
import {
  parsePokedexFilterParams,
  serializePokedexFilterParams,
} from '@/features/pokedex/filters/pokedexFilterParams'

const CHUNK_SIZE = 24
const TOTAL_BOUNDS = getTotalBounds(pokemonSummarySnapshot.items)
const TYPE_LABELS: Record<PokemonTypeName, string> = {
  normal: 'Normal', fire: 'Fuego', water: 'Agua', electric: 'Eléctrico',
  grass: 'Planta', ice: 'Hielo', fighting: 'Lucha', poison: 'Veneno',
  ground: 'Tierra', flying: 'Volador', psychic: 'Psíquico', bug: 'Bicho',
  rock: 'Roca', ghost: 'Fantasma', dragon: 'Dragón', dark: 'Siniestro',
  steel: 'Acero', fairy: 'Hada',
}
const SORT_LABELS: Record<PokedexSort, string> = {
  'number-asc': 'Número Pokédex',
  'name-asc': 'Nombre A–Z',
  'total-desc': 'Mayor total',
  'total-asc': 'Menor total',
}

type ViewMode = 'grid' | 'list'

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <Button
      type="button"
      variant="outline"
      size="xs"
      className="rounded-full"
      aria-label={`Quitar filtro: ${label}`}
      onClick={onRemove}
    >
      {label}
      <X aria-hidden />
    </Button>
  )
}

export function PokedexPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [viewMode, setViewMode] = useState<ViewMode>(() =>
    getSetting('defaultView', 'grid')
  )
  const [visibleCount, setVisibleCount] = useState(CHUNK_SIZE)
  const filters = parsePokedexFilterParams(searchParams, TOTAL_BOUNDS)
  const { generation, minTotal, maxTotal, sort } = filters
  const primaryType = filters.types[0] ?? null
  const secondaryType = filters.types[1] ?? null
  const selectedTypes = filters.types
  const filteredItems = filterAndSortPokemon(
    pokemonSummarySnapshot.items,
    { generation, types: selectedTypes, minTotal, maxTotal, sort }
  )
  const visibleItems = filteredItems.slice(0, visibleCount)
  const hasMore = visibleCount < filteredItems.length
  const hasCustomTotal = minTotal !== TOTAL_BOUNDS.min || maxTotal !== TOTAL_BOUNDS.max
  const activeFilterCount = Number(generation != null)
    + selectedTypes.length
    + Number(hasCustomTotal)
    + Number(sort !== 'number-asc')

  const canonicalSearch = serializePokedexFilterParams(filters, TOTAL_BOUNDS).toString()
  const currentSearch = searchParams.toString()

  useEffect(() => {
    if (currentSearch !== canonicalSearch) {
      setSearchParams(canonicalSearch, { replace: true })
    }
  }, [canonicalSearch, currentSearch, setSearchParams])

  const loadMore = () => {
    setVisibleCount((n) => Math.min(n + CHUNK_SIZE, filteredItems.length))
  }

  const updateFilters = (next: Partial<PokedexFilters>) => {
    setSearchParams(
      serializePokedexFilterParams({ ...filters, ...next }, TOTAL_BOUNDS),
      { replace: true }
    )
    setVisibleCount(CHUNK_SIZE)
  }

  const selectGeneration = (next: GenerationFilter) => {
    updateFilters({ generation: next })
  }

  const selectPrimaryType = (value: string) => {
    const next = value === '' ? null : value as PokemonTypeName
    updateFilters({ types: next == null ? [] : [next] })
  }

  const selectSecondaryType = (value: string) => {
    const next = value === '' ? null : value as PokemonTypeName
    const types = primaryType == null
      ? []
      : next == null ? [primaryType] : [primaryType, next]
    updateFilters({ types })
  }

  const removePrimaryType = () => {
    updateFilters({ types: secondaryType == null ? [] : [secondaryType] })
  }

  const resetAllFilters = () => {
    setSearchParams('', { replace: true })
    setVisibleCount(CHUNK_SIZE)
  }

  const toggleView = useCallback(() => {
    const next: ViewMode = viewMode === 'grid' ? 'list' : 'grid'
    setViewMode(next)
    setSetting('defaultView', next)
  }, [viewMode])

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold text-foreground">Pokédex</h1>
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" aria-label="Abrir filtros">
                <Filter className="size-4" />
                Filtros
                {activeFilterCount > 0 && (
                  <span className="flex size-5 items-center justify-center rounded-full bg-foreground text-[11px] text-background" aria-label={`${activeFilterCount} filtros activos`}>
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Filtros</SheetTitle>
                <SheetDescription>
                  Combina generación, tipos, total de stats y orden.
                </SheetDescription>
              </SheetHeader>
              <section className="mt-6 px-4" aria-labelledby="generation-filter-title">
                <h2 id="generation-filter-title" className="mb-3 text-sm font-semibold">Generación</h2>
                <div className="grid grid-cols-2 gap-2">
                  {([1, 2, 3, 4, 5] as const).map((value) => (
                    <Button
                      key={value}
                      type="button"
                      variant={generation === value ? 'default' : 'outline'}
                      aria-pressed={generation === value}
                      onClick={() => selectGeneration(value)}
                    >
                      Gen {['I', 'II', 'III', 'IV', 'V'][value - 1]}
                    </Button>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  className="mt-3 w-full"
                  disabled={generation == null}
                  onClick={() => selectGeneration(null)}
                >
                  Limpiar generación
                </Button>
              </section>
              <section className="mt-6 border-t border-border px-4 pt-5" aria-labelledby="type-filter-title">
                <h2 id="type-filter-title" className="mb-3 text-sm font-semibold">Tipos</h2>
                <div className="grid grid-cols-2 gap-3">
                  <label className="text-xs font-medium" htmlFor="primary-type">
                    Primer tipo
                    <select
                      id="primary-type"
                      value={primaryType ?? ''}
                      onChange={(event) => selectPrimaryType(event.target.value)}
                      className="mt-1 h-10 w-full rounded-md border border-input bg-background px-2 text-sm"
                    >
                      <option value="">Cualquiera</option>
                      {POKEMON_TYPES.map((type) => <option key={type} value={type}>{TYPE_LABELS[type]}</option>)}
                    </select>
                  </label>
                  <label className="text-xs font-medium" htmlFor="secondary-type">
                    Segundo tipo
                    <select
                      id="secondary-type"
                      value={secondaryType ?? ''}
                      disabled={primaryType == null}
                      onChange={(event) => selectSecondaryType(event.target.value)}
                      className="mt-1 h-10 w-full rounded-md border border-input bg-background px-2 text-sm disabled:opacity-50"
                    >
                      <option value="">Cualquiera</option>
                      {POKEMON_TYPES.filter((type) => type !== primaryType).map((type) => (
                        <option key={type} value={type}>{TYPE_LABELS[type]}</option>
                      ))}
                    </select>
                  </label>
                </div>
              </section>
              <section className="mt-6 border-t border-border px-4 pt-5" aria-labelledby="total-filter-title">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h2 id="total-filter-title" className="text-sm font-semibold">Total de stats</h2>
                  <output className="text-sm tabular-nums">{minTotal}–{maxTotal}</output>
                </div>
                <label className="block text-xs font-medium" htmlFor="minimum-total">Mínimo: {minTotal}</label>
                <input
                  id="minimum-total"
                  type="range"
                  min={TOTAL_BOUNDS.min}
                  max={TOTAL_BOUNDS.max}
                  value={minTotal}
                  onChange={(event) => {
                    updateFilters({ minTotal: Math.min(Number(event.target.value), maxTotal) })
                  }}
                  className="h-10 w-full accent-foreground"
                />
                <label className="block text-xs font-medium" htmlFor="maximum-total">Máximo: {maxTotal}</label>
                <input
                  id="maximum-total"
                  type="range"
                  min={TOTAL_BOUNDS.min}
                  max={TOTAL_BOUNDS.max}
                  value={maxTotal}
                  onChange={(event) => {
                    updateFilters({ maxTotal: Math.max(Number(event.target.value), minTotal) })
                  }}
                  className="h-10 w-full accent-foreground"
                />
              </section>
              <section className="mt-6 border-t border-border px-4 pb-6 pt-5">
                <label className="text-sm font-semibold" htmlFor="pokedex-sort">Orden</label>
                <select
                  id="pokedex-sort"
                  value={sort}
                  onChange={(event) => {
                    updateFilters({ sort: event.target.value as PokedexSort })
                  }}
                  className="mt-2 h-10 w-full rounded-md border border-input bg-background px-2 text-sm"
                >
                  <option value="number-asc">Número Pokédex</option>
                  <option value="name-asc">Nombre A–Z</option>
                  <option value="total-desc">Mayor total</option>
                  <option value="total-asc">Menor total</option>
                </select>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-5 w-full"
                  disabled={activeFilterCount === 0}
                  onClick={resetAllFilters}
                >
                  Limpiar todos los filtros
                </Button>
              </section>
            </SheetContent>
          </Sheet>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleView}
            aria-label={viewMode === 'grid' ? 'Ver como lista' : 'Ver como cuadrícula'}
          >
            {viewMode === 'grid' ? (
              <List className="size-4" />
            ) : (
              <LayoutGrid className="size-4" />
            )}
          </Button>
        </div>
      </div>

      <p className="text-muted-foreground" aria-live="polite">
        {filteredItems.length} {filteredItems.length === 1 ? 'especie' : 'especies'}{generation != null
          ? ` de la Generación ${['I', 'II', 'III', 'IV', 'V'][generation - 1]}`
          : ' de las Generaciones I–V'}. Toca una para ver su ficha completa.
      </p>

      {activeFilterCount > 0 && (
        <div className="my-3 flex flex-wrap items-center gap-2" aria-label="Filtros activos">
          {generation != null && (
            <FilterChip label={`Generación ${['I', 'II', 'III', 'IV', 'V'][generation - 1]}`} onRemove={() => selectGeneration(null)} />
          )}
          {primaryType != null && (
            <FilterChip label={TYPE_LABELS[primaryType]} onRemove={removePrimaryType} />
          )}
          {secondaryType != null && (
            <FilterChip label={TYPE_LABELS[secondaryType]} onRemove={() => {
              updateFilters({ types: primaryType == null ? [] : [primaryType] })
            }} />
          )}
          {hasCustomTotal && (
            <FilterChip label={`Total ${minTotal}–${maxTotal}`} onRemove={() => {
              updateFilters({ minTotal: TOTAL_BOUNDS.min, maxTotal: TOTAL_BOUNDS.max })
            }} />
          )}
          {sort !== 'number-asc' && (
            <FilterChip label={`Orden: ${SORT_LABELS[sort]}`} onRemove={() => {
              updateFilters({ sort: 'number-asc' })
            }} />
          )}
          <Button type="button" variant="ghost" size="xs" onClick={resetAllFilters}>
            Limpiar todo
          </Button>
        </div>
      )}

      {activeFilterCount === 0 && <div className="mb-4" />}

      {filteredItems.length === 0 && (
        <div className="rounded-xl border border-dashed border-border p-8 text-center" role="status">
          <p className="font-medium">No hay especies con estos filtros.</p>
          <p className="mt-1 text-sm text-muted-foreground">Prueba a quitar un tipo o ampliar el rango de stats.</p>
          <Button type="button" variant="outline" size="sm" className="mt-3" onClick={resetAllFilters}>Limpiar todos los filtros</Button>
        </div>
      )}

      {filteredItems.length > 0 && viewMode === 'grid' ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {visibleItems.map((item) => (
            <PokedexCard key={item.id} item={item} layout="grid" />
          ))}
        </div>
      ) : filteredItems.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {visibleItems.map((item) => (
            <li key={item.id}>
              <PokedexCard item={item} layout="list" />
            </li>
          ))}
        </ul>
      ) : null}

      {hasMore && (
        <div className="mt-6 flex justify-center">
          <Button variant="outline" size="sm" onClick={loadMore}>
            Cargar más
          </Button>
        </div>
      )}
    </>
  )
}
