import { useCallback, useState } from 'react'
import { LayoutGrid, List, Filter } from 'lucide-react'
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
} from '@/features/pokedex/filters/pokedexFilters'

const CHUNK_SIZE = 24
const TOTAL_BOUNDS = getTotalBounds(pokemonSummarySnapshot.items)
const TYPE_LABELS: Record<PokemonTypeName, string> = {
  normal: 'Normal', fire: 'Fuego', water: 'Agua', electric: 'Eléctrico',
  grass: 'Planta', ice: 'Hielo', fighting: 'Lucha', poison: 'Veneno',
  ground: 'Tierra', flying: 'Volador', psychic: 'Psíquico', bug: 'Bicho',
  rock: 'Roca', ghost: 'Fantasma', dragon: 'Dragón', dark: 'Siniestro',
  steel: 'Acero', fairy: 'Hada',
}

type ViewMode = 'grid' | 'list'

export function PokedexPage() {
  const [viewMode, setViewMode] = useState<ViewMode>(() =>
    getSetting('defaultView', 'grid')
  )
  const [visibleCount, setVisibleCount] = useState(CHUNK_SIZE)
  const [generation, setGeneration] = useState<GenerationFilter>(null)
  const [primaryType, setPrimaryType] = useState<PokemonTypeName | null>(null)
  const [secondaryType, setSecondaryType] = useState<PokemonTypeName | null>(null)
  const [minTotal, setMinTotal] = useState(TOTAL_BOUNDS.min)
  const [maxTotal, setMaxTotal] = useState(TOTAL_BOUNDS.max)
  const [sort, setSort] = useState<PokedexSort>('number-asc')

  const selectedTypes = [primaryType, secondaryType].filter(
    (type): type is PokemonTypeName => type != null
  )
  const filteredItems = filterAndSortPokemon(
    pokemonSummarySnapshot.items,
    { generation, types: selectedTypes, minTotal, maxTotal, sort }
  )
  const visibleItems = filteredItems.slice(0, visibleCount)
  const hasMore = visibleCount < filteredItems.length

  const loadMore = () => {
    setVisibleCount((n) => Math.min(n + CHUNK_SIZE, filteredItems.length))
  }

  const selectGeneration = useCallback((next: GenerationFilter) => {
    setGeneration(next)
    setVisibleCount(CHUNK_SIZE)
  }, [])

  const selectPrimaryType = (value: string) => {
    const next = value === '' ? null : value as PokemonTypeName
    setPrimaryType(next)
    if (next == null || next === secondaryType) setSecondaryType(null)
    setVisibleCount(CHUNK_SIZE)
  }

  const selectSecondaryType = (value: string) => {
    setSecondaryType(value === '' ? null : value as PokemonTypeName)
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
                    setMinTotal(Math.min(Number(event.target.value), maxTotal))
                    setVisibleCount(CHUNK_SIZE)
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
                    setMaxTotal(Math.max(Number(event.target.value), minTotal))
                    setVisibleCount(CHUNK_SIZE)
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
                    setSort(event.target.value as PokedexSort)
                    setVisibleCount(CHUNK_SIZE)
                  }}
                  className="mt-2 h-10 w-full rounded-md border border-input bg-background px-2 text-sm"
                >
                  <option value="number-asc">Número Pokédex</option>
                  <option value="name-asc">Nombre A–Z</option>
                  <option value="total-desc">Mayor total</option>
                  <option value="total-asc">Menor total</option>
                </select>
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

      <p className="mb-4 text-muted-foreground">
        {filteredItems.length} especies{generation != null
          ? ` de la Generación ${['I', 'II', 'III', 'IV', 'V'][generation - 1]}`
          : ' de las Generaciones I–V'}. Toca una para ver su ficha completa.
      </p>

      {filteredItems.length === 0 && (
        <div className="rounded-xl border border-dashed border-border p-8 text-center" role="status">
          <p className="font-medium">No hay especies con este filtro.</p>
          <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => selectGeneration(null)}>Limpiar filtro</Button>
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
