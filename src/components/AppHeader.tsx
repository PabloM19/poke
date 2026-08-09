import { AppNav } from './AppNav'
import { GameSelector } from '@/features/games'
import { Link } from 'react-router-dom'

export function AppHeader() {
  return (
    <header
      className="sticky top-0 z-40 shrink-0 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
      role="banner"
    >
      <div className="flex h-14 items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          to="/search"
          className="rounded-md text-lg font-semibold tracking-tight text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label="PokéApp, ir al inicio"
        >
          PokéApp
        </Link>
        <div className="flex min-w-0 items-center gap-3">
          <GameSelector />
          <div className="hidden md:block">
            <AppNav variant="desktop" />
          </div>
        </div>
      </div>
    </header>
  )
}
