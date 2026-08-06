import { ArrowRight, BookOpen } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getPublishedManualArticle } from '../content/articles'
import { getManualReadingProgress, manualLessonCount } from './readingProgress'

export function ContinueReadingCard() {
  const progress = getManualReadingProgress()
  const article = progress.lastPath ? getPublishedManualArticle(progress.lastPath) : null
  if (!article) return null

  return (
    <Link to={article.path} className="mb-8 flex min-h-16 items-center gap-3 rounded-xl border border-border bg-secondary/50 p-4 outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring">
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
