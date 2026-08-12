import type { ComponentProps, ComponentType, ReactNode } from 'react'
import type { IconProps } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

const HERO_TONES = {
  blue: 'border-ui-blue-strong/15 bg-ui-blue',
  lavender: 'border-ui-lavender-strong/15 bg-ui-lavender',
  green: 'border-ui-green-strong/15 bg-ui-green',
  yellow: 'border-ui-yellow-strong/15 bg-ui-yellow',
} as const

export function PageHero({
  icon: Icon,
  eyebrow,
  title,
  description,
  metadata,
  tone = 'blue',
  className,
  children,
  ...props
}: {
  icon?: ComponentType<IconProps>
  eyebrow?: ReactNode
  title: ReactNode
  description?: ReactNode
  metadata?: ReactNode
  tone?: keyof typeof HERO_TONES
  className?: string
  children?: ReactNode
} & Omit<ComponentProps<'header'>, 'title'>) {
  return (
    <header
      data-slot="page-hero"
      data-semantic="editorial-highlight"
      className={cn(
        'relative overflow-hidden rounded-[var(--radius-xl)] border p-5 shadow-[var(--shadow-xs)] sm:p-7',
        HERO_TONES[tone],
        className,
      )}
      {...props}
    >
      <span className="pointer-events-none absolute -right-16 -top-20 size-52 rounded-full bg-card/35" aria-hidden />
      <div className="relative z-10">
        {Icon && (
          <span className="mb-6 flex size-11 items-center justify-center rounded-[var(--radius-md)] border border-white/40 bg-card/70 text-ui-lavender-strong">
            <Icon className="size-5" aria-hidden />
          </span>
        )}
        {eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ui-blue-strong">{eyebrow}</p>}
        <h1 className={cn('page-title', eyebrow && 'mt-1')}>{title}</h1>
        {description && <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">{description}</p>}
        {metadata && <div className="mt-5">{metadata}</div>}
        {children}
      </div>
    </header>
  )
}
