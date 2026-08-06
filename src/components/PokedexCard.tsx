import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { FavoriteButton } from '@/features/favorites/FavoriteButton'
import { CompareLink } from '@/features/compare/CompareLink'
import type { PokemonSummaryItem } from '@/features/pokedex/summary'
import { translatePokemonType } from '@/features/localization'

function formatSpeciesId(id: number): string {
  return `#${String(id).padStart(3, '0')}`
}

interface PokedexCardProps {
  item: PokemonSummaryItem
  layout?: 'grid' | 'list'
  className?: string
}

export function PokedexCard({ item, layout = 'grid', className }: PokedexCardProps) {
  const content = (
    <>
      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded bg-muted">
        {item.sprite && (
          <img
            src={item.sprite}
            alt=""
            className="h-12 w-12 object-contain"
            loading="lazy"
          />
        )}
        {!item.sprite && (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs text-muted-foreground">
          {formatSpeciesId(item.id)}
        </p>
        <p className="truncate font-medium text-foreground">{item.nameEs}</p>
        <div className="mt-1 flex flex-wrap gap-1">
          {item.types.map((t) => (
              <Badge key={t} variant="secondary" className="text-[10px]">
                {translatePokemonType(t)}
              </Badge>
            ))}
        </div>
        <p className="mt-0.5 text-[10px] text-muted-foreground">
          Total: {item.total}
        </p>
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
          to={`/pokemon/${item.id}`}
          className={cn(
            'block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            layout === 'grid' && 'flex flex-col items-center gap-2',
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
