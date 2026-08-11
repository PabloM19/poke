import { Outlet } from 'react-router-dom'
import { GameSelector } from '@/features/games'
import { ManualBreadcrumbs } from './ManualBreadcrumbs'
import { ManualIndex } from './ManualIndex'
import { ManualReadingTracker } from './progress/ManualReadingTracker'

export function ManualsLayout() {
  return (
    <div className="manual-shell md:grid md:grid-cols-[14rem_minmax(0,1fr)] md:gap-8 lg:gap-10">
      <ManualReadingTracker />
      <ManualIndex />
      <div className="min-w-0">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Contexto principal</span>
          <GameSelector className="w-full sm:w-auto" />
        </div>
        <ManualBreadcrumbs />
        <Outlet />
      </div>
    </div>
  )
}
