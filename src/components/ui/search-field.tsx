import type { ComponentProps } from 'react'
import { Search } from '@/components/icons'
import { cn } from '@/lib/utils'
import { Input } from './input'

export function SearchField({ className, ...props }: ComponentProps<typeof Input>) {
  return (
    <div className="relative">
      <Search
        className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        type="search"
        className={cn('h-12 rounded-[var(--radius-lg)] pl-12 pr-4 text-base', className)}
        {...props}
      />
    </div>
  )
}
