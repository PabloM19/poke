import { useState } from 'react'
import { ArrowLeft, ArrowRight, ImageSquare } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ManualFigureAspectRatio, ManualFigureData } from '../content/types'

const aspectClasses: Record<ManualFigureAspectRatio, string> = {
  '16:9': 'aspect-video',
  '4:3': 'aspect-[4/3]',
  '3:2': 'aspect-[3/2]',
  portrait: 'mx-auto aspect-[2/3] max-w-44 sm:max-w-56',
}

export function ManualFigure({
  id,
  src,
  alt,
  caption,
  credit,
  aspectRatio = '16:9',
  objectFit,
  kind = 'screenshot',
  placeholderDescription,
  className,
}: ManualFigureData & { className?: string }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const failed = Boolean(src) && failedSrc === src
  const showImage = Boolean(src) && !failed
  const fit = objectFit ?? (kind === 'artwork' ? 'cover' : 'contain')

  return (
    <figure id={id} className={cn('my-8 min-w-0', className)}>
      <div className={cn(
        'relative w-full overflow-hidden rounded-[var(--radius-lg)] border border-border bg-secondary/55 shadow-[var(--shadow-xs)]',
        aspectClasses[aspectRatio],
      )}>
        {showImage ? (
          <img
            src={src}
            alt={alt}
            loading="lazy"
            decoding="async"
            onError={() => setFailedSrc(src ?? null)}
            className={cn('size-full', fit === 'contain' ? 'object-contain' : 'object-cover')}
          />
        ) : (
          <div
            className="flex size-full min-h-44 flex-col items-center justify-center px-6 py-7 text-center"
            role="img"
            aria-label={alt}
          >
            <span className="flex size-12 items-center justify-center rounded-[var(--radius-md)] border border-border/75 bg-card/75 text-muted-foreground shadow-[var(--shadow-xs)]" aria-hidden>
              <ImageSquare className="size-6" />
            </span>
            <span className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {failed ? 'Imagen no disponible' : 'Imagen pendiente'}
            </span>
            <span className="mt-2 max-w-md text-sm leading-6 text-foreground/75">{placeholderDescription}</span>
          </div>
        )}
      </div>
      <figcaption className="mt-3 px-1 text-sm leading-5 text-muted-foreground">
        <span>{caption}</span>
        {credit && <span className="mt-1 block text-xs">Fuente: {credit}</span>}
      </figcaption>
    </figure>
  )
}

export function ManualFigureCarousel({
  id,
  label,
  figures,
}: {
  id: string
  label: string
  figures: readonly ManualFigureData[]
}) {
  const [activeIndex, setActiveIndex] = useState(0)
  const current = figures[activeIndex]
  if (!current) return null

  const select = (index: number) => {
    const length = figures.length
    setActiveIndex((index + length) % length)
  }

  return (
    <section id={id} className="my-8" aria-roledescription="carrusel" aria-label={label}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold">{label}</h3>
        <span className="text-xs tabular-nums text-muted-foreground">{activeIndex + 1} / {figures.length}</span>
      </div>
      <div aria-live="polite">
        <ManualFigure {...current} className="my-0" />
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <Button type="button" variant="outline" size="icon" onClick={() => select(activeIndex - 1)} aria-label="Imagen anterior">
          <ArrowLeft aria-hidden />
        </Button>
        <div className="flex flex-wrap justify-center gap-2" aria-label="Elegir imagen">
          {figures.map((figure, index) => (
            <button
              key={figure.id}
              type="button"
              className="interactive-clay flex size-11 items-center justify-center rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/35"
              aria-label={`Mostrar imagen ${index + 1}: ${figure.caption}`}
              aria-current={index === activeIndex ? 'true' : undefined}
              onClick={() => select(index)}
            >
              <span className={cn('size-2.5 rounded-full bg-border', index === activeIndex && 'bg-primary')} aria-hidden />
            </button>
          ))}
        </div>
        <Button type="button" variant="outline" size="icon" onClick={() => select(activeIndex + 1)} aria-label="Imagen siguiente">
          <ArrowRight aria-hidden />
        </Button>
      </div>
    </section>
  )
}
