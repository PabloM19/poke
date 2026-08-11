import { ArrowRight, BookOpen } from '@/components/icons'
import { Link } from 'react-router-dom'
import { getPublishedManualArticle } from '../content/articles'
import { getManualReadingProgress, manualLessonCount } from './readingProgress'

export function ContinueReadingCard() {
  const progress = getManualReadingProgress()
  const article = progress.lastPath ? getPublishedManualArticle(progress.lastPath) : null
  if (!article) return null
  const entry = progress.entries.find((item) => item.path === article.path)
  const route = entry?.sectionId ? `${article.path}#${entry.sectionId}` : article.path
  const percentage = Math.round((entry?.progress ?? 0) * 100)

  return (
    <Link to={route} state={{ restoreReading: true }} className="interactive-clay flex items-center gap-4 rounded-[var(--radius-lg)] border border-ui-green-strong/20 bg-ui-green/45 p-5 shadow-[var(--shadow-xs)] outline-none hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ring sm:p-6">
      <span className="flex size-11 shrink-0 items-center justify-start" aria-hidden><BookOpen className="size-5 text-muted-foreground" /></span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">Continuar leyendo</span>
        <span className="mt-1 block font-medium">{article.title}</span>
        <span className="mt-1 block text-sm text-muted-foreground">{entry?.sectionTitle ?? `${progress.completedPaths.length} de ${manualLessonCount} completadas`}</span>
        {entry && <span className="mt-3 block h-1.5 overflow-hidden rounded-full bg-card/70" aria-label={`${percentage}% leído`}><span className="block h-full rounded-full bg-ui-green-strong" style={{ width: `${percentage}%` }} /></span>}
      </span>
      <span className="flex size-11 shrink-0 items-center justify-end" aria-hidden><ArrowRight className="size-5 text-muted-foreground" /></span>
    </Link>
  )
}
