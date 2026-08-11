import { Outlet, useLocation } from 'react-router-dom'
import { GameSelector } from '@/features/games'
import { ManualBreadcrumbs } from './ManualBreadcrumbs'
import { ManualIndex } from './ManualIndex'
import { ManualReadingTracker } from './progress/ManualReadingTracker'
import { cn } from '@/lib/utils'

export function ManualsLayout() {
  const location = useLocation()
  const isLanding = location.pathname === '/manuales' || location.pathname === '/manuales/'

  return (
    <div className={cn(
      'manual-shell',
      !isLanding && 'md:grid md:grid-cols-[14rem_minmax(0,1fr)] md:gap-8 lg:gap-10'
    )}>
      <ManualReadingTracker />
      {!isLanding && <ManualIndex />}
      <div className="min-w-0">
        {!isLanding && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Juego activo</span>
            <GameSelector className="w-full sm:w-auto" />
          </div>
        )}
        {!isLanding && <ManualBreadcrumbs />}
        <Outlet />
      </div>
    </div>
  )
}
