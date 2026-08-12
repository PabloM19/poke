import * as React from 'react'
import { BookOpen, ChevronDownIcon, ChevronUpIcon } from '@/components/icons'
import { cn } from '@/lib/utils'

interface DisclosureProps {
  label: React.ReactNode
  children: React.ReactNode
  icon?: React.ReactNode
  defaultOpen?: boolean
  className?: string
  contentClassName?: string
  id?: string
}

/**
 * Product-wide disclosure primitive. The whole row is the control, so the
 * affordance is discoverable on touch, while aria-expanded/controls keep the
 * relationship explicit for assistive technology and keyboard users.
 */
export function Disclosure({
  label,
  children,
  icon = <BookOpen className="size-5" aria-hidden />,
  defaultOpen = false,
  className,
  contentClassName,
  id,
}: DisclosureProps) {
  const [open, setOpen] = React.useState(defaultOpen)
  const generatedId = React.useId()
  const contentId = id ?? `disclosure-${generatedId.replace(/:/g, '')}`
  const triggerId = `${contentId}-trigger`

  return (
    <section data-slot="disclosure" className={cn('overflow-hidden rounded-[var(--radius-lg)] border border-border bg-card shadow-[var(--shadow-xs)]', className)}>
      <button
        type="button"
        id={triggerId}
        className="interactive-clay group flex min-h-12 w-full items-center justify-between gap-3 px-4 py-3 text-left font-medium outline-none hover:bg-accent/60 focus-visible:ring-3 focus-visible:ring-ring/35"
        aria-expanded={open}
        aria-controls={contentId}
        data-state={open ? 'open' : 'closed'}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="flex min-w-0 items-center gap-2">{icon}<span className="truncate">{label}</span></span>
        {open ? (
          <ChevronUpIcon className="size-5 shrink-0 text-muted-foreground transition-transform duration-200" aria-hidden />
        ) : (
          <ChevronDownIcon className="size-5 shrink-0 text-muted-foreground transition-transform duration-200" aria-hidden />
        )}
      </button>
      <div
        id={contentId}
        role="region"
        aria-labelledby={triggerId}
        hidden={!open}
        data-state={open ? 'open' : 'closed'}
        className={cn('border-t border-border transition-[opacity,transform] duration-200 data-[state=closed]:-translate-y-1 data-[state=closed]:opacity-0 data-[state=open]:translate-y-0 data-[state=open]:opacity-100', contentClassName)}
      >
        {children}
      </div>
    </section>
  )
}
