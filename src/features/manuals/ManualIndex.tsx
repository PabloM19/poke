import { Link, useLocation } from 'react-router-dom'
import {
  ChevronRight,
  Compass,
  Gamepad2,
  Library,
  TableProperties,
  type PhosphorIcon,
} from '@/components/icons'
import { cn } from '@/lib/utils'
import { Disclosure } from '@/components/ui/disclosure'
import {
  manualFamilyLabels,
  manualNavigationEntries,
  type ManualFamily,
} from './manualNavigation'

const indexGroups: readonly {
  title: string
  description: string
  families: readonly ManualFamily[]
  icon: PhosphorIcon
  tone: string
}[] = [
  {
    title: 'Aprender las bases',
    description: 'Conceptos iniciales y vida de Entrenador.',
    families: ['start', 'trainer'],
    icon: Compass,
    tone: 'bg-ui-yellow/45 text-ui-yellow-strong',
  },
  {
    title: 'Juegos principales',
    description: 'Una guía específica para cada aventura.',
    families: ['main-games'],
    icon: Gamepad2,
    tone: 'bg-ui-blue/45 text-ui-blue-strong',
  },
  {
    title: 'Spin-offs',
    description: 'Mundo Misterioso, Ranger, Dash y más.',
    families: ['mystery-dungeon', 'pmd-games', 'spin-off-games', 'other'],
    icon: Library,
    tone: 'bg-ui-lavender/45 text-ui-lavender-strong',
  },
  {
    title: 'Consulta rápida',
    description: 'Tipos, estados, iconos y recordatorios.',
    families: ['resources'],
    icon: TableProperties,
    tone: 'bg-ui-green/50 text-ui-green-strong',
  },
]

function IndexContent({ landing = false }: { landing?: boolean }) {
  const location = useLocation()

  return (
    <div className={cn('grid gap-3', landing && 'md:grid-cols-2')}>
      {indexGroups.map((group) => {
        const entries = manualNavigationEntries.filter((entry) => group.families.includes(entry.family))
        const Icon = group.icon
        return (
          <section key={group.title} className="border-b border-border/80 py-4 last:border-b-0 md:px-3">
            <header className="flex items-start gap-3 px-2 pb-2">
              <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)]', group.tone)}>
                <Icon className="size-[1.125rem]" aria-hidden />
              </span>
              <span className="min-w-0">
                <h2 className="font-semibold leading-5 text-foreground">{group.title}</h2>
                <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">{group.description}</span>
                <span className="mt-1 block text-[0.6875rem] font-semibold uppercase tracking-wide opacity-75">{entries.length} contenidos</span>
              </span>
            </header>
            <div className="divide-y divide-border/70 px-2">
              {group.families.map((family) => {
                const familyEntries = entries.filter((entry) => entry.family === family)
                if (familyEntries.length === 0) return null
                return (
                  <section key={family} className="py-2">
                    <h3 className="px-2 pb-1 text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                      {manualFamilyLabels[family]}
                    </h3>
                    <ul>
                      {familyEntries.map((entry) => {
                        const active = location.pathname === entry.path
                        return (
                          <li key={entry.path}>
                            <Link
                              to={entry.path}
                              aria-current={active ? 'page' : undefined}
                              className={cn(
                                'interactive-clay flex min-h-11 items-center gap-2 rounded-[var(--radius-sm)] px-2 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring',
                                active ? 'bg-ui-green text-ui-green-strong shadow-[var(--shadow-xs)]' : 'hover:bg-accent'
                              )}
                            >
                              <span className="min-w-0 flex-1 font-medium">{entry.shortTitle}</span>
                              <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{entry.pages[0]}–{entry.pages[1]}</span>
                              <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                            </Link>
                          </li>
                        )
                      })}
                    </ul>
                  </section>
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}

export function ManualIndex({ mode = 'layout' }: { mode?: 'layout' | 'landing' }) {
  if (mode === 'landing') {
    return (
      <Disclosure
        label={(
          <span>
            <span className="block font-semibold text-foreground">Índice completo</span>
            <span className="mt-0.5 block text-xs font-normal text-muted-foreground">Todas las guías, lecciones y recursos por sección</span>
          </span>
        )}
        id="manual-landing-index"
        className="rounded-[var(--radius-xl)] shadow-[var(--shadow-sm)]"
        contentClassName="px-3 pb-2 sm:px-4"
      >
        <IndexContent landing />
      </Disclosure>
    )
  }

  return (
    <>
      <Disclosure
        label="Índice del manual"
        id="manual-index-content"
        className="mb-5 md:hidden"
        contentClassName="px-3 pb-2"
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
