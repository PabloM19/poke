import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { FavoriteButton } from '@/features/favorites/FavoriteButton'
import { CompareLink } from '@/features/compare/CompareLink'
import type { PokemonSummaryItem } from '@/features/pokedex/summary'
import { TypeChip } from '@/features/types'

function formatSpeciesId(id: number): string {
  return `#${String(id).padStart(3, '0')}`
}

interface PokedexCardProps {
  item: PokemonSummaryItem
  layout?: 'grid' | 'list'
  /** Número mostrado; en una Pokédex regional no coincide necesariamente con el nacional. */
  dexNumber?: number
  className?: string
}

export function PokedexCard({ item, layout = 'grid', dexNumber, className }: PokedexCardProps) {
  const content = (
    <>
      <div className={cn(
        'flex shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-md)] bg-secondary transition-transform duration-200 group-hover:-translate-y-0.5',
        layout === 'grid' ? 'size-24' : 'size-16'
      )}>
        {item.sprite && (
          <img
            src={item.sprite}
            alt=""
            className={cn('object-contain [image-rendering:pixelated]', layout === 'grid' ? 'size-24' : 'size-16')}
            loading="lazy"
          />
        )}
        {!item.sprite && (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold tracking-wide text-muted-foreground">
          {formatSpeciesId(dexNumber ?? item.id)}
        </p>
        <p className="truncate text-base font-bold text-foreground">{item.nameEs}</p>
        <div className="mt-1 flex flex-wrap gap-1">
          {item.types.map((t) => (
              <TypeChip key={t} type={t} size="compact" />
            ))}
        </div>
        <p className="mt-1 text-xs font-medium text-muted-foreground">
          Total base <span className="font-bold tabular-nums text-foreground">{item.total}</span>
        </p>
      </div>
    </>
  )

  return (
    <Card
      className={cn(
        'group relative h-full overflow-hidden py-0 transition-colors hover:bg-accent/60',
        layout === 'list' && 'flex flex-row items-center gap-3',
        className
      )}
    >
      <CardContent
        className={cn(
          'p-3 sm:p-4',
          layout === 'grid' && 'flex h-full flex-col items-center gap-2 text-center',
          layout === 'list' && 'flex w-full flex-row items-center gap-3'
        )}
      >
        <Link
          to={`/pokemon/${item.id}`}
          className={cn(
            'block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            layout === 'grid' && 'flex h-full w-full flex-col items-center gap-2 pt-10',
            layout === 'list' && 'flex flex-1 flex-row items-center gap-3'
          )}
        >
          {content}
        </Link>
        <CompareLink
          speciesId={item.id}
          speciesName={item.nameEs}
          className={layout === 'grid' ? 'absolute left-2 top-2' : undefined}
        />
        <FavoriteButton
          speciesId={item.id}
          speciesName={item.nameEs}
          className={layout === 'grid' ? 'absolute right-2 top-2' : undefined}
        />
      </CardContent>
    </Card>
  )
}
