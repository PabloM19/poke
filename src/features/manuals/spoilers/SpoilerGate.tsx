import { useState, type ReactNode } from 'react'
import { ShieldAlert } from '@/components/icons'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import type { SpoilerLevel } from '../content/types'
import { canShowSpoilerLevel, useSpoilerPreference } from './spoilerPreference'

const labels: Record<SpoilerLevel, string> = {
  none: 'sin spoilers',
  mechanics: 'mecánicas',
  guide: 'guía con spoilers',
}

export function SpoilerGate({ level, title, children }: { level: SpoilerLevel; title?: string; children: ReactNode }) {
  const { level: preference } = useSpoilerPreference()
  const location = useLocation()
  const revealKey = `${location.pathname}:${preference}:${level}`
  const [revealedKey, setRevealedKey] = useState<string | null>(null)
  if (canShowSpoilerLevel(preference, level) || revealedKey === revealKey) return children

  return (
    <section className="rounded-[var(--radius-xl)] border border-border bg-ui-lavender/40 p-5 shadow-[var(--shadow-sm)] sm:p-8" aria-labelledby="spoiler-gate-title">
      <div className="mb-4 flex size-12 items-center justify-center rounded-[var(--radius-md)] bg-ui-lavender text-ui-lavender-strong"><ShieldAlert className="size-6 text-primary" aria-hidden /></div>
      <p className="text-sm font-semibold uppercase tracking-widest text-primary">Contenido oculto por tu preferencia</p>
      <h1 id="spoiler-gate-title" className="mt-2 page-title">{title ?? 'Contenido de Manuales'}</h1>
      <p className="mt-3 leading-7 text-muted-foreground">Esta página está etiquetada como <strong className="text-foreground">{labels[level]}</strong>. Tu nivel actual solo muestra contenido {labels[preference]}.</p>
      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <Button type="button" onClick={() => setRevealedKey(revealKey)}>Mostrar solo esta vez</Button>
        <Button asChild variant="outline"><Link to="/settings">Cambiar preferencia</Link></Button>
      </div>
    </section>
  )
}
