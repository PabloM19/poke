import { useEffect, useState } from 'react'
import { Check, Circle } from '@/components/icons'
import { Button } from '@/components/ui/button'
import {
  getManualReadingProgress,
  manualLessonCount,
  recordLastRead,
  setArticleCompleted,
} from './readingProgress'

export function ReadingProgressControls({ articlePath }: { articlePath: string }) {
  const initial = getManualReadingProgress()
  const [completed, setCompleted] = useState(() => initial.completedPaths.includes(articlePath))
  const [completedCount, setCompletedCount] = useState(initial.completedPaths.length)

  useEffect(() => {
    recordLastRead(articlePath)
  }, [articlePath])

  const toggle = () => {
    const progress = setArticleCompleted(articlePath, !completed)
    setCompleted(progress.completedPaths.includes(articlePath))
    setCompletedCount(progress.completedPaths.length)
  }

  return (
    <section className="mt-8 flex flex-col gap-3 rounded-[var(--radius-lg)] border border-border bg-card p-4 shadow-[var(--shadow-xs)] sm:flex-row sm:items-center sm:justify-between" aria-label="Progreso de lectura">
      <div>
        <p className="font-medium">{completed ? 'Lección completada' : 'Tu progreso'}</p>
        <p className="mt-1 text-sm text-muted-foreground">{completedCount} de {manualLessonCount} lecciones completadas</p>
      </div>
      <Button type="button" variant={completed ? 'secondary' : 'outline'} size="sm" onClick={toggle} aria-pressed={completed}>
        {completed ? <Check className="size-4" aria-hidden /> : <Circle className="size-4" aria-hidden />}
        {completed ? 'Marcar pendiente' : 'Marcar como leída'}
      </Button>
    </section>
  )
}
