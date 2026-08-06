import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { getAdjacentManualEntries, getManualEntry } from './manualNavigation'
import { ManualNotFoundPage } from './ManualNotFoundPage'

export function ManualEntryPage() {
  const location = useLocation()
  const entry = getManualEntry(location.pathname)
  if (!entry) return <ManualNotFoundPage />
  const adjacent = getAdjacentManualEntries(location.pathname)

  return (
    <article>
      <Badge variant="secondary" className="mb-3">Páginas {entry.pages[0]}–{entry.pages[1]}</Badge>
      <h1 className="mb-3 text-3xl font-semibold tracking-tight text-foreground">{entry.title}</h1>
      <p className="max-w-prose text-lg leading-8 text-muted-foreground">
        Esta lección agrupa el contenido correspondiente del manual físico. Su contenido
        se incorpora en el siguiente punto de esta fase.
      </p>
      <nav aria-label="Lección anterior y siguiente" className="mt-10 grid gap-3 sm:grid-cols-2">
        {adjacent.previous ? (
          <Link to={adjacent.previous.path} className="rounded-xl border border-border p-4 outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring">
            <span className="mb-1 flex items-center gap-1 text-xs text-muted-foreground"><ArrowLeft className="size-3" /> Anterior</span>
            <span className="font-medium">{adjacent.previous.shortTitle}</span>
          </Link>
        ) : <span />}
        {adjacent.next && (
          <Link to={adjacent.next.path} className="rounded-xl border border-border p-4 text-right outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring">
            <span className="mb-1 flex items-center justify-end gap-1 text-xs text-muted-foreground">Siguiente <ArrowRight className="size-3" /></span>
            <span className="font-medium">{adjacent.next.shortTitle}</span>
          </Link>
        )}
      </nav>
    </article>
  )
}
