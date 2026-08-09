import type { ReactNode } from 'react'
import { AlertTriangle, BookMarked, Info, Lightbulb } from '@/components/icons'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import type { PrintReference } from '../content/types'

export function LessonSteps({ title, items }: { title?: string; items: readonly string[] }) {
  return (
    <section className="my-6">
      {title && <h2 className="mb-3 text-xl font-semibold">{title}</h2>}
      <ol className="space-y-3">
        {items.map((item, index) => (
          <li key={item} className="flex gap-3 rounded-[var(--radius-lg)] border border-border bg-card p-4 shadow-[var(--shadow-xs)]">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              {index + 1}
            </span>
            <span className="pt-0.5 leading-6">{item}</span>
          </li>
        ))}
      </ol>
    </section>
  )
}

type CalloutKind = 'tip' | 'note' | 'warning'

const calloutConfig: Record<CalloutKind, { label: string; icon: typeof Lightbulb; className: string }> = {
  tip: { label: 'Consejo', icon: Lightbulb, className: 'border-ui-green-strong/25 bg-ui-green/55' },
  note: { label: 'Nota', icon: Info, className: 'border-ui-blue-strong/25 bg-ui-blue/45' },
  warning: { label: 'Atención', icon: AlertTriangle, className: 'border-ui-yellow-strong/25 bg-ui-yellow/50' },
}

export function LessonCallout({
  kind,
  title,
  children,
}: {
  kind: CalloutKind
  title?: string
  children: ReactNode
}) {
  const config = calloutConfig[kind]
  const Icon = config.icon
  return (
    <aside className={cn('my-6 rounded-[var(--radius-lg)] border p-4 shadow-[var(--shadow-xs)]', config.className)} aria-label={title ?? config.label}>
      <div className="mb-2 flex items-center gap-2 font-semibold">
        <Icon className="size-5" aria-hidden />
        {title ?? config.label}
      </div>
      <div className="text-sm leading-6 text-foreground/85">{children}</div>
    </aside>
  )
}

export function TypeExample({
  title = 'Ejemplo de tipos',
  matchups,
}: {
  title?: string
  matchups: readonly string[]
}) {
  return (
    <section className="my-6 rounded-[var(--radius-lg)] border border-border bg-secondary/60 p-4 shadow-[var(--shadow-xs)]">
      <h2 className="mb-3 text-base font-semibold">{title}</h2>
      <div className="flex flex-wrap gap-2">
        {matchups.map((matchup) => <Badge key={matchup} variant="secondary">{matchup}</Badge>)}
      </div>
    </section>
  )
}

export function LessonTable({
  caption,
  headers,
  rows,
}: {
  caption: string
  headers: readonly string[]
  rows: readonly (readonly string[])[]
}) {
  return (
    <section className="my-6">
      <h2 className="mb-3 text-lg font-semibold">{caption}</h2>
      <div className="space-y-3 sm:hidden">
        {rows.map((row, rowIndex) => (
          <dl key={`${rowIndex}-${row.join('-')}`} className="rounded-[var(--radius-lg)] border border-border bg-card p-4 shadow-[var(--shadow-xs)]">
            {headers.map((header, cellIndex) => (
              <div key={header} className="grid grid-cols-[minmax(6rem,0.8fr)_1.2fr] gap-3 border-b border-border py-2 last:border-0">
                <dt className="text-sm font-medium text-muted-foreground">{header}</dt>
                <dd className="text-sm break-words">{row[cellIndex] ?? '—'}</dd>
              </div>
            ))}
          </dl>
        ))}
      </div>
      <div className="hidden overflow-hidden rounded-[var(--radius-lg)] border border-border bg-card shadow-[var(--shadow-xs)] sm:block">
        <table className="w-full table-fixed border-collapse text-left text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead className="bg-secondary">
            <tr>{headers.map((header) => <th key={header} scope="col" className="px-4 py-3 font-semibold">{header}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={`${rowIndex}-${row.join('-')}`} className="border-t border-border">
                {row.map((cell, cellIndex) => (
                  <td key={`${cellIndex}-${cell}`} className="break-words px-4 py-3 align-top">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export function PhysicalReference({ reference }: { reference: PrintReference }) {
  const pageNumbers = [...new Set(reference.pages)].sort((left, right) => left - right)
  const ranges: Array<readonly [number, number]> = []
  for (const page of pageNumbers) {
    const last = ranges.at(-1)
    if (last != null && page === last[1] + 1) ranges[ranges.length - 1] = [last[0], page]
    else ranges.push([page, page])
  }
  const labels = ranges.map(([first, last]) => first === last ? String(first) : `${first}–${last}`)
  const pages = labels.length > 1
    ? `${labels.slice(0, -1).join(', ')} y ${labels.at(-1)}`
    : labels[0] ?? '—'
  return (
    <aside className="my-8 flex items-start gap-3 rounded-[var(--radius-lg)] border border-ui-lavender-strong/20 bg-ui-lavender/35 p-4 text-sm shadow-[var(--shadow-xs)]">
      <BookMarked className="mt-0.5 size-5 shrink-0" aria-hidden />
      <div>
        <p className="font-medium">En el manual físico: páginas {pages}</p>
        <p className="mt-1 text-muted-foreground">Edición {reference.edition}</p>
      </div>
    </aside>
  )
}
