import { Outlet } from 'react-router-dom'
import { AppHeader } from '@/components/AppHeader'
import { AppNav } from '@/components/AppNav'

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="min-h-0 flex-1 px-4 py-5 pb-20 sm:px-6 sm:py-6 sm:pb-6 md:mx-auto md:max-w-3xl md:px-8 md:py-8 lg:max-w-4xl">
        <Outlet />
      </main>
      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] supports-[backdrop-filter]:bg-background/80 md:hidden"
        role="navigation"
        aria-label="Navegación inferior"
      >
        <div className="mx-auto max-w-lg px-2">
          <AppNav variant="mobile" />
        </div>
      </div>
    </div>
  )
}
