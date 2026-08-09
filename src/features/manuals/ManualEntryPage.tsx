import { ArrowLeft, ArrowRight } from '@/components/icons'
import { Link, useLocation } from 'react-router-dom'
import { getAdjacentManualEntries, getManualEntry } from './manualNavigation'
import { ManualNotFoundPage } from './ManualNotFoundPage'
import { getPublishedManualArticle } from './content/articles'
import { ManualArticleContent } from './components/ManualArticleContent'
import { ReadingProgressControls } from './progress/ReadingProgressControls'
import { ManualJourneyLinks } from './ManualJourneyLinks'
import { SpoilerGate } from './spoilers/SpoilerGate'

export function ManualEntryPage() {
  const location = useLocation()
  const entry = getManualEntry(location.pathname)
  const article = getPublishedManualArticle(location.pathname)
  if (!entry || !article) return <ManualNotFoundPage />
  const adjacent = getAdjacentManualEntries(location.pathname)

  return (
    <SpoilerGate level={article.spoilerLevel} title={article.title}>
      <ManualArticleContent article={article} />
      <ManualJourneyLinks family={article.family} />
      <ReadingProgressControls key={article.path} articlePath={article.path} />
      <nav aria-label="Lección anterior y siguiente" className="mt-10 grid gap-3 sm:grid-cols-2">
        {adjacent.previous ? (
          <Link to={adjacent.previous.path} className="interactive-clay rounded-[var(--radius-lg)] border border-border bg-card p-4 shadow-[var(--shadow-xs)] outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring">
            <span className="mb-1 flex items-center gap-1 text-xs text-muted-foreground"><ArrowLeft className="size-3" /> Anterior</span>
            <span className="font-medium">{adjacent.previous.shortTitle}</span>
          </Link>
        ) : <span />}
        {adjacent.next && (
          <Link to={adjacent.next.path} className="interactive-clay rounded-[var(--radius-lg)] border border-border bg-card p-4 text-right shadow-[var(--shadow-xs)] outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring">
            <span className="mb-1 flex items-center justify-end gap-1 text-xs text-muted-foreground">Siguiente <ArrowRight className="size-3" /></span>
            <span className="font-medium">{adjacent.next.shortTitle}</span>
          </Link>
        )}
      </nav>
    </SpoilerGate>
  )
}
