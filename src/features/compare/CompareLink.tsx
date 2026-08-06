import { Link } from 'react-router-dom'
import { GitCompare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function CompareLink({
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
  return (
    <Button
      asChild
      variant="outline"
      size={showLabel ? 'sm' : 'icon'}
      className={cn(!showLabel && 'size-11 rounded-full', className)}
    >
      <Link to={`/compare?ids=${speciesId}`} aria-label={`Comparar ${speciesName}`}>
        <GitCompare className="size-4" aria-hidden />
        {showLabel && 'Comparar'}
      </Link>
    </Button>
  )
}
