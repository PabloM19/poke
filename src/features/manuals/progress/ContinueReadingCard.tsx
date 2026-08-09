import { ArrowRight, BookOpen } from '@/components/icons'
import { Link } from 'react-router-dom'
import { getPublishedManualArticle } from '../content/articles'
import { getManualReadingProgress, manualLessonCount } from './readingProgress'

export function ContinueReadingCard() {
  const progress = getManualReadingProgress()
  const article = progress.lastPath ? getPublishedManualArticle(progress.lastPath) : null
  if (!article) return null

  return (
    <Link to={article.path} className="interactive-clay flex min-h-20 items-center gap-3 rounded-[var(--radius-lg)] border border-ui-green-strong/20 bg-ui-green/45 p-4 shadow-[var(--shadow-xs)] outline-none hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ring">
      <BookOpen className="size-5 shrink-0 text-muted-foreground" aria-hidden />
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">Continuar leyendo</span>
        <span className="mt-1 block font-medium">{article.title}</span>
        <span className="mt-1 block text-sm text-muted-foreground">{progress.completedPaths.length} de {manualLessonCount} completadas</span>
      </span>
      <ArrowRight className="size-5 shrink-0 text-muted-foreground" aria-hidden />
    </Link>
  )
}
