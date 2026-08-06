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
import {
  filterSpeciesByGeneration,
  type GenerationFilter,
} from '@/features/pokedex/filters/generationFilter'
import { pokemonSummarySnapshot } from '@/features/pokedex/summary'

const CHUNK_SIZE = 24

type ViewMode = 'grid' | 'list'

export function PokedexPage() {
  const [viewMode, setViewMode] = useState<ViewMode>(() =>
    getSetting('defaultView', 'grid')
  )
  const [visibleCount, setVisibleCount] = useState(CHUNK_SIZE)
  const [generation, setGeneration] = useState<GenerationFilter>(null)

  const filteredItems = filterSpeciesByGeneration(
    pokemonSummarySnapshot.items,
    generation
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
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Filtros</SheetTitle>
                <SheetDescription>
                  Limita la Pokédex a una generación concreta.
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
