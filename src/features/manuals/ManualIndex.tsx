import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Disclosure } from '@/components/ui/disclosure'
import {
  manualFamilyLabels,
  manualNavigationEntries,
  type ManualFamily,
} from './manualNavigation'

const indexGroups: readonly { title: string; families: readonly ManualFamily[] }[] = [
  { title: 'Contexto general', families: ['start', 'trainer'] },
  { title: 'Juegos principales', families: ['main-games'] },
  { title: 'Biblioteca de spin-offs', families: ['mystery-dungeon', 'pmd-games', 'spin-off-games', 'other'] },
  { title: 'Recursos compartidos', families: ['resources'] },
]

function IndexContent() {
  const location = useLocation()
  return (
    <div className="space-y-6">
      {indexGroups.map((group) => (
        <section key={group.title}>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{group.title}</h2>
          <div className="space-y-4">
            {group.families.map((family) => (
              <div key={family}>
                <h3 className="mb-2 text-xs font-semibold text-foreground">{manualFamilyLabels[family]}</h3>
                <ul className="space-y-1">
                  {manualNavigationEntries.filter((entry) => entry.family === family).map((entry) => {
                    const active = location.pathname === entry.path
                    return (
                      <li key={entry.path}>
                        <Link
                          to={entry.path}
                          aria-current={active ? 'page' : undefined}
                          className={cn(
                            'interactive-clay flex min-h-11 items-center rounded-[var(--radius-sm)] px-3 py-2 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring',
                            active ? 'bg-ui-green text-ui-green-strong shadow-[var(--shadow-xs)]' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                          )}
                        >
                          {entry.shortTitle}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

export function ManualIndex() {
  return (
    <>
      <Disclosure
        label="Índice del manual"
        id="manual-index-content"
        className="mb-5 md:hidden"
        contentClassName="p-3"
      >
        <IndexContent />
      </Disclosure>
      <aside className="hidden md:block" aria-label="Índice del manual">
        <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pr-2">
          <IndexContent />
        </div>
      </aside>
    </>
  )
}
