import type { ComponentType } from 'react'
import type { IconProps } from '@phosphor-icons/react'
import { ContentCard } from '@/components/ui/card'
import { GameSelector } from '@/features/games'

export function GamePreparationCard({
  icon: Icon,
  gameTitle,
  pokedexLabel,
  entryCount,
  tone = 'lavender',
}: {
  icon: ComponentType<IconProps>
  gameTitle: string
  pokedexLabel: string
  entryCount?: number
  tone?: 'lavender' | 'yellow' | 'blue' | 'green'
}) {
  return (
    <ContentCard data-tone={tone}>
      <div className="flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-ui-lavender/60" aria-hidden>
          <Icon className="size-6 text-ui-lavender-strong" />
        </span>
        <div className="min-w-0">
          <p className="font-bold">{gameTitle}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">{pokedexLabel}</p>
          {entryCount != null && <p className="mt-1 text-xs text-muted-foreground">{entryCount} especies disponibles</p>}
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <GameSelector triggerLabel="Cambiar juego" className="w-full sm:w-auto" />
      </div>
    </ContentCard>
  )
}
