import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function SectionHeader({
  eyebrow,
  title,
  description,
  metadata,
  id,
  level = 2,
  className,
}: {
  eyebrow?: ReactNode
  title: ReactNode
  description?: ReactNode
  metadata?: ReactNode
  id?: string
  level?: 2 | 3 | 4
  className?: string
}) {
  const Heading = `h${level}` as const

  return (
    <header data-slot="section-header" className={cn('mb-5', className)}>
      {eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ui-blue-strong">{eyebrow}</p>}
      <div className={cn('flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1', eyebrow && 'mt-1')}>
        <Heading id={id} className={cn('font-semibold tracking-[-0.02em]', level === 2 ? 'text-xl' : 'text-lg')}>{title}</Heading>
        {metadata && <div className="text-sm font-medium text-muted-foreground">{metadata}</div>}
      </div>
      {description && <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>}
    </header>
  )
}
