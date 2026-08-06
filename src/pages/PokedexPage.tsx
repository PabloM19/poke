import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { LayoutGrid, List, Filter } from 'lucide-react'
import { useSpeciesIndex } from '@/hooks/useSpeciesIndex'
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

const CHUNK_SIZE = 24

type ViewMode = 'grid' | 'list'

export function PokedexPage() {
  const { index, status, refresh } = useSpeciesIndex()
  const [viewMode, setViewMode] = useState<ViewMode>(() =>
    getSetting('defaultView', 'grid')
  )
  const [visibleCount, setVisibleCount] = useState(CHUNK_SIZE)

  useEffect(() => {
    refresh()
  }, [refresh])

  const visibleItems = status === 'ready' ? index.slice(0, visibleCount) : []
  const hasMore = status === 'ready' && visibleCount < index.length

  const loadMore = useCallback(() => {
    setVisibleCount((n) => Math.min(n + CHUNK_SIZE, index.length))
  }, [index.length])

  const toggleView = useCallback(() => {
    const next: ViewMode = viewMode === 'grid' ? 'list' : 'grid'
    setViewMode(next)
    setSetting('defaultView', next)
  }, [viewMode])

  if (status === 'missing') {
    return (
      <>
        <h1 className="mb-2 text-2xl font-semibold text-foreground">Pokédex</h1>
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
                  Filtros por tipo y estadísticas (próximamente).
                </SheetDescription>
              </SheetHeader>
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
        Aquí verás la lista de Pokémon que has ido descubriendo. Toca uno para
        ver su ficha completa.
      </p>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {visibleItems.map((item) => (
            <PokedexCard key={item.speciesId} item={item} layout="grid" />
          ))}
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {visibleItems.map((item) => (
            <li key={item.speciesId}>
              <PokedexCard item={item} layout="list" />
            </li>
          ))}
        </ul>
      )}

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
