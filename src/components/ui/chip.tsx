import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export function Chip({ className, ...props }: ComponentProps<'span'>) {
  return (
    <span
      data-slot="chip"
      className={cn(
        'inline-flex min-h-8 w-fit items-center gap-1.5 rounded-full border border-border bg-secondary px-3 text-xs font-semibold text-secondary-foreground',
        className
      )}
      {...props}
    />
  )
}
