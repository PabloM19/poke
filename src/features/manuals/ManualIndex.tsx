import { Link, useLocation } from 'react-router-dom'
import { BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  manualFamilyLabels,
  manualNavigationEntries,
  type ManualFamily,
} from './manualNavigation'

const familyOrder: readonly ManualFamily[] = ['start', 'trainer', 'main-games', 'mystery-dungeon', 'other', 'resources']

function IndexContent() {
  const location = useLocation()
  return (
    <div className="space-y-5">
      {familyOrder.map((family) => (
        <section key={family}>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {manualFamilyLabels[family]}
          </h2>
          <ul className="space-y-1">
            {manualNavigationEntries.filter((entry) => entry.family === family).map((entry) => {
              const active = location.pathname === entry.path
              return (
                <li key={entry.path}>
                  <Link
                    to={entry.path}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'block rounded-md px-3 py-2 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring',
                      active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    {entry.shortTitle}
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}

export function ManualIndex() {
  return (
    <>
      <details className="mb-5 rounded-xl border border-border bg-card md:hidden">
        <summary className="flex min-h-12 cursor-pointer list-none items-center gap-2 px-4 py-3 font-medium">
          <BookOpen className="size-5" aria-hidden />
          Índice del manual
        </summary>
        <div className="border-t border-border p-3"><IndexContent /></div>
      </details>
      <aside className="hidden md:block" aria-label="Índice del manual">
        <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pr-2">
          <IndexContent />
        </div>
      </aside>
    </>
  )
}
