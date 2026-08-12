import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function MetadataList({
  items,
  className,
  label = 'Información',
}: {
  items: readonly ReactNode[]
  className?: string
  label?: string
}) {
  return (
    <div
      data-slot="metadata"
      className={cn('flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-medium text-muted-foreground', className)}
      aria-label={label}
    >
      {items.map((item, index) => (
        <span key={index} className="inline-flex items-center gap-2">
          {index > 0 && <span className="text-border-strong" aria-hidden>·</span>}
          <span>{item}</span>
        </span>
      ))}
    </div>
  )
}
