import type { ComponentType } from 'react'
import type { IconProps } from '@phosphor-icons/react'
import { Link } from 'react-router-dom'
import { ChevronRight } from '@/components/icons'
import { BentoCard } from '@/components/ui/card'
import type { StoredGameSession } from './sessionStore'

const dateFormatter = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })

export function GameHistoryList({
  sessions,
  basePath,
  icon: Icon,
  scoreLabel,
}: {
  sessions: readonly StoredGameSession[]
  basePath: string
  icon: ComponentType<IconProps>
  scoreLabel?: (session: StoredGameSession) => string
}) {
  return (
    <section aria-label="Intentos guardados" className="grid gap-3">
      {sessions.map((session) => (
        <Link key={session.id} to={`${basePath}/${session.id}`} className="interactive-clay rounded-[var(--radius-xl)] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
          <BentoCard className="flex items-center gap-3 p-4 hover:bg-accent/35">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-ui-lavender/60 text-ui-lavender-strong" aria-hidden><Icon className="size-5" /></span>
            <div className="min-w-0 flex-1">
              <h2 className="truncate font-semibold">{session.name}</h2>
              <p className="mt-0.5 truncate text-sm text-muted-foreground">{session.gameTitle}</p>
              <p className="mt-1 text-xs text-muted-foreground">{scoreLabel?.(session) ?? `${session.score}/${session.totalRounds}`} · {dateFormatter.format(session.finishedAt)}</p>
            </div>
            <ChevronRight className="size-5 shrink-0 text-muted-foreground" aria-hidden />
          </BentoCard>
        </Link>
      ))}
    </section>
  )
}

