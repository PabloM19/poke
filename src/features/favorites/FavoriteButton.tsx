import type { MouseEvent } from 'react'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useFavoriteSpecies } from './useFavoriteSpecies'

export function FavoriteButton({
  speciesId,
  speciesName,
  showLabel = false,
  className,
}: {
  speciesId: number
  speciesName: string
  showLabel?: boolean
  className?: string
}) {
  const { isFavorite, toggle, error } = useFavoriteSpecies(speciesId)
  const action = isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    toggle()
  }

  return (
    <>
      <Button
        type="button"
        variant={isFavorite ? 'secondary' : 'outline'}
        size={showLabel ? 'sm' : 'icon'}
        onClick={handleClick}
        aria-label={`${action}: ${speciesName}`}
        aria-pressed={isFavorite}
        className={cn(!showLabel && 'size-11 rounded-full', className)}
      >
        <Heart className={cn('size-4', isFavorite && 'fill-current')} aria-hidden />
        {showLabel && action}
      </Button>
      {error && <span className="sr-only" role="alert">{error}</span>}
    </>
  )
}
