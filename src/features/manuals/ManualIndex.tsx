import { Link, useLocation } from 'react-router-dom'
import { BookOpen } from '@/components/icons'
import { cn } from '@/lib/utils'
import {
  manualFamilyLabels,
  manualNavigationEntries,
  type ManualFamily,
} from './manualNavigation'

const familyOrder: readonly ManualFamily[] = ['start', 'trainer', 'main-games', 'mystery-dungeon', 'pmd-games', 'spin-off-games', 'other', 'resources']

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
                      'flex min-h-11 items-center rounded-[var(--radius-sm)] px-3 py-2 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring',
                      active ? 'bg-ui-green text-ui-green-strong shadow-[var(--shadow-xs)]' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
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
      <details className="mb-5 rounded-[var(--radius-lg)] border border-border bg-card shadow-[var(--shadow-xs)] md:hidden">
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
