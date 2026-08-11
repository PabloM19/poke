import * as React from 'react'
import { ChevronDownIcon } from '@/components/icons'
import { cn } from '@/lib/utils'

/**
 * Native select with the same surface, focus and chevron language used by
 * contextual controls throughout the app. Keeping the native element gives
 * us the best mobile keyboard/assistive technology behaviour.
 */
export function SelectField({ className, ...props }: React.ComponentProps<'select'>) {
  return (
    <span className="relative block">
      <select
        {...props}
        className={cn(
          'h-11 w-full appearance-none rounded-[var(--radius-md)] border border-input bg-card px-3 pr-10 text-sm shadow-[var(--shadow-xs)] outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:opacity-50',
          className
        )}
      />
      <ChevronDownIcon
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
    </span>
  )
}
