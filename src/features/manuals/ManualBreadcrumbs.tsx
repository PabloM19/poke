import { ChevronRight } from '@/components/icons'
import { Link, useLocation } from 'react-router-dom'
import { getManualEntry } from './manualNavigation'

export function ManualBreadcrumbs() {
  const location = useLocation()
  if (location.pathname === '/manuales') return null
  const entry = getManualEntry(location.pathname)

  return (
    <nav aria-label="Migas de pan" className="mb-5">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        <li><Link to="/manuales" className="inline-flex min-h-11 items-center rounded-[var(--radius-sm)] px-2 hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Manuales</Link></li>
        <li aria-hidden><ChevronRight className="size-4" /></li>
        <li className="py-3 text-foreground" aria-current="page">{entry?.shortTitle ?? 'No encontrado'}</li>
      </ol>
    </nav>
  )
}
