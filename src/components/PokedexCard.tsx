import { Link } from 'react-router-dom'
import type { SpeciesIndexItem } from '@/lib/pokedex'
import { usePokemonSummary } from '@/hooks/usePokemonSummary'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { FavoriteButton } from '@/features/favorites/FavoriteButton'
import { CompareLink } from '@/features/compare/CompareLink'

function formatSpeciesId(id: number): string {
  return `#${String(id).padStart(3, '0')}`
}

interface PokedexCardProps {
  item: SpeciesIndexItem
  layout?: 'grid' | 'list'
  className?: string
}

export function PokedexCard({ item, layout = 'grid', className }: PokedexCardProps) {
  const { status, data } = usePokemonSummary(item.defaultPokemonName, item.speciesId)

  const content = (
    <>
      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded bg-muted">
        {status === 'loading' && (
          <span className="text-xs text-muted-foreground">…</span>
        )}
        {status === 'success' && data?.spriteUrl && (
          <img
            src={data.spriteUrl}
            alt=""
            className="h-12 w-12 object-contain"
            loading="lazy"
          />
        )}
        {(status === 'error' || (status === 'success' && !data?.spriteUrl)) && (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs text-muted-foreground">
          {formatSpeciesId(item.speciesId)}
        </p>
        <p className="truncate font-medium text-foreground">{item.nameEs}</p>
        <div className="mt-1 flex flex-wrap gap-1">
          {status === 'loading' && (
            <span className="h-5 w-12 rounded bg-muted" aria-hidden />
          )}
          {status === 'success' && data?.types && data.types.length > 0 && (
            data.types.map((t) => (
              <Badge key={t} variant="secondary" className="text-[10px]">
                {t}
              </Badge>
            ))
          )}
          {status === 'success' && (!data?.types || data.types.length === 0) && (
            <span className="text-xs text-muted-foreground">—</span>
          )}
          {status === 'error' && (
            <span className="text-xs text-muted-foreground">—</span>
          )}
        </div>
        {status === 'success' && data?.totalBaseStats != null && (
          <p className="mt-0.5 text-[10px] text-muted-foreground">
            Total: {data.totalBaseStats}
          </p>
        )}
      </div>
    </>
  )

  return (
    <Card
      className={cn(
        'relative transition-colors hover:bg-accent/50',
        layout === 'list' && 'flex flex-row items-center gap-3',
        className
      )}
    >
      <CardContent
        className={cn(
          'p-3',
          layout === 'grid' && 'flex flex-col items-center gap-2 text-center',
          layout === 'list' && 'flex w-full flex-row items-center gap-3 p-3'
        )}
      >
        <Link
          to={`/pokemon/${item.speciesId}`}
          className={cn(
            'block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            layout === 'grid' && 'flex flex-col items-center gap-2',
            layout === 'list' && 'flex flex-1 flex-row items-center gap-3'
          )}
        >
          {content}
        </Link>
        <CompareLink
          speciesId={item.speciesId}
          speciesName={item.nameEs}
          className={layout === 'grid' ? 'absolute left-2 top-2' : undefined}
        />
        <FavoriteButton
          speciesId={item.speciesId}
          speciesName={item.nameEs}
          className={layout === 'grid' ? 'absolute right-2 top-2' : undefined}
        />
      </CardContent>
    </Card>
  )
}
