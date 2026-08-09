import { Outlet } from 'react-router-dom'
import { AppHeader } from '@/components/AppHeader'
import { AppNav } from '@/components/AppNav'
import { NetworkStatusBanner } from './NetworkStatusBanner'
import { GuidedTour } from '@/features/onboarding'

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main-content"
        className="fixed left-3 top-3 z-[60] -translate-y-24 rounded-[var(--radius-md)] bg-primary px-4 py-3 font-semibold text-primary-foreground shadow-[var(--shadow-md)] transition-transform focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        Saltar al contenido
      </a>
      <AppHeader />
      <NetworkStatusBanner />
      <main
        id="main-content"
        tabIndex={-1}
        className="min-h-0 w-full flex-1 px-4 py-5 pb-24 outline-none sm:px-6 sm:py-7 sm:pb-24 md:mx-auto md:max-w-6xl md:px-8 md:py-8 lg:pb-8"
      >
        <Outlet />
      </main>
      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card pt-1.5 pb-[max(0.45rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgb(69_57_42_/_0.08)] lg:hidden"
        role="navigation"
        aria-label="Navegación inferior"
      >
        <div className="mx-auto max-w-lg px-1.5">
          <AppNav variant="mobile" />
        </div>
      </div>
      <GuidedTour />
    </div>
  )
}
