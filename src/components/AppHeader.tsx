import { AppNav } from './AppNav'
import { GameSelector } from '@/features/games'
import { Link } from 'react-router-dom'
import { Settings } from '@/components/icons'

export function AppHeader() {
  return (
    <header
      className="sticky top-0 z-40 shrink-0 border-b border-border bg-card pt-[env(safe-area-inset-top)] shadow-[var(--shadow-xs)]"
      role="banner"
    >
      <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 md:px-8">
        <Link
          to="/search"
          className="flex min-h-11 min-w-11 shrink-0 items-center justify-center gap-2 rounded-[var(--radius-sm)] text-lg font-bold tracking-[-0.025em] text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-[360px]:justify-start"
          aria-label="PokéApp, ir al inicio"
        >
          <span className="relative size-7 overflow-hidden rounded-full border-2 border-ui-lavender-strong bg-ui-lavender shadow-[var(--shadow-xs)]" aria-hidden>
            <span className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 bg-ui-lavender-strong" />
            <span className="absolute left-1/2 top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-ui-lavender-strong bg-card" />
          </span>
          <span className="hidden min-[360px]:inline">PokéApp</span>
        </Link>
        <div className="flex min-w-0 items-center gap-2">
          <GameSelector />
          <div className="hidden lg:block">
            <AppNav variant="desktop" />
          </div>
          <Link
            to="/settings"
            className="interactive-clay flex size-11 shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Ajustes"
          >
            <Settings className="size-5" aria-hidden />
          </Link>
        </div>
      </div>
    </header>
  )
}
