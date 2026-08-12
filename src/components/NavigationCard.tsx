import type { ComponentType, ReactNode } from 'react'
import type { IconProps } from '@phosphor-icons/react'
import { ArrowRight } from '@/components/icons'
import { BentoCard } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type NavigationCardTone = 'surface' | 'green' | 'lavender' | 'blue' | 'yellow'

export function NavigationCard({
  icon: Icon,
  title,
  meta,
  description,
  tone = 'surface',
  titleAs: Heading = 'h3',
  className,
}: {
  icon: ComponentType<IconProps>
  title: ReactNode
  meta?: ReactNode
  description: ReactNode
  tone?: NavigationCardTone
  titleAs?: 'h2' | 'h3' | 'h4'
  className?: string
}) {
  return (
    <BentoCard
      tone={tone}
      data-semantic="navigation-card"
      className={cn('h-full p-5 shadow-[var(--shadow-sm)] hover:-translate-y-0.5 sm:p-6', className)}
    >
      <div className="flex min-h-11 items-center justify-between gap-4" aria-hidden>
        <span className="flex size-11 shrink-0 items-center justify-start">
          <Icon className="size-5 text-muted-foreground" />
        </span>
        <span className="flex size-11 shrink-0 items-center justify-end">
          <ArrowRight className="size-5 text-muted-foreground" />
        </span>
      </div>
      <div className="mt-5 min-w-0">
        <Heading className="text-lg leading-tight font-semibold tracking-[-0.015em]">{title}</Heading>
        {meta && <p className="mt-3 text-sm text-muted-foreground">{meta}</p>}
        <p className={cn('text-sm leading-6 text-muted-foreground', meta ? 'mt-1' : 'mt-2')}>{description}</p>
      </div>
    </BentoCard>
  )
}
