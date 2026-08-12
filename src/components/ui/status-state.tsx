import type { ReactNode } from 'react'
import { Warning } from '@/components/icons'
import { cn } from '@/lib/utils'

type StatusTone = 'loading' | 'empty' | 'error'

export function StatusState({
  title,
  description,
  tone = 'empty',
  children,
  compact = false,
  headingLevel = 2,
}: {
  title: string
  description?: string
  tone?: StatusTone
  children?: ReactNode
  compact?: boolean
  headingLevel?: 1 | 2
}) {
  const Heading = headingLevel === 1 ? 'h1' : 'h2'
  return (
    <section
      data-slot="status-state"
      className={cn(
        'rounded-[var(--radius-xl)] border border-border bg-card text-center shadow-[var(--shadow-xs)]',
        compact ? 'p-5' : 'px-5 py-10'
      )}
      role={tone === 'error' ? 'alert' : 'status'}
      aria-live={tone === 'loading' ? 'polite' : undefined}
    >
      {tone === 'loading' ? (
        <span className="mx-auto mb-4 block size-10 animate-[spin_1.1s_linear_infinite] rounded-full border-[5px] border-ui-lavender border-t-ui-lavender-strong motion-reduce:animate-none" aria-hidden />
      ) : tone === 'error' ? (
        <span className="mx-auto mb-4 flex size-12 items-center justify-center rounded-[var(--radius-md)] bg-ui-yellow/55 text-ui-yellow-strong" aria-hidden><Warning className="size-6" /></span>
      ) : (
        <span className="mx-auto mb-4 block size-11 rounded-full border-[5px] border-ui-blue bg-card shadow-[inset_0_0_0_4px_var(--surface)]" aria-hidden />
      )}
      <Heading className={cn('font-bold tracking-[-0.02em]', compact ? 'text-lg' : 'text-xl')}>{title}</Heading>
      {description && <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>}
      {children && <div className="mt-5 flex flex-wrap justify-center gap-2">{children}</div>}
    </section>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return <span className={cn('block animate-pulse rounded-[var(--radius-sm)] bg-secondary motion-reduce:animate-none', className)} aria-hidden />
}
