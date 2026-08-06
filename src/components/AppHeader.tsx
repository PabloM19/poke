import { AppNav } from './AppNav'

export function AppHeader() {
  return (
    <header
      className="sticky top-0 z-40 shrink-0 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
      role="banner"
    >
      <div className="flex h-14 items-center justify-between gap-4 px-4 sm:px-6">
        <h1 className="text-lg font-semibold tracking-tight text-foreground">
          PokéApp
        </h1>
        <div className="hidden md:block">
          <AppNav variant="desktop" />
        </div>
      </div>
    </header>
  )
}
