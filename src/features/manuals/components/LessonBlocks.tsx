import type { ReactNode } from 'react'
import { AlertTriangle, BookMarked, Info, Lightbulb } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import type { PrintReference } from '../content/types'

export function LessonSteps({ title, items }: { title?: string; items: readonly string[] }) {
  return (
    <section className="my-6">
      {title && <h2 className="mb-3 text-xl font-semibold">{title}</h2>}
      <ol className="space-y-3">
        {items.map((item, index) => (
          <li key={item} className="flex gap-3 rounded-xl border border-border bg-card p-4">
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
  tip: { label: 'Consejo', icon: Lightbulb, className: 'border-emerald-500/40 bg-emerald-500/8' },
  note: { label: 'Nota', icon: Info, className: 'border-sky-500/40 bg-sky-500/8' },
  warning: { label: 'Atención', icon: AlertTriangle, className: 'border-amber-500/50 bg-amber-500/10' },
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
    <aside className={cn('my-6 rounded-xl border p-4', config.className)} aria-label={title ?? config.label}>
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
    <section className="my-6 rounded-xl border border-border bg-secondary/40 p-4">
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
          <dl key={`${rowIndex}-${row.join('-')}`} className="rounded-xl border border-border bg-card p-4">
            {headers.map((header, cellIndex) => (
              <div key={header} className="grid grid-cols-[minmax(6rem,0.8fr)_1.2fr] gap-3 border-b border-border py-2 last:border-0">
                <dt className="text-sm font-medium text-muted-foreground">{header}</dt>
                <dd className="text-sm break-words">{row[cellIndex] ?? '—'}</dd>
              </div>
            ))}
          </dl>
        ))}
      </div>
      <div className="hidden overflow-hidden rounded-xl border border-border sm:block">
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
  const first = reference.pages[0]
  const last = reference.pages.at(-1)
  const pages = first === last ? String(first) : `${first}–${last}`
  return (
    <aside className="my-8 flex items-start gap-3 rounded-xl border border-border bg-muted p-4 text-sm">
      <BookMarked className="mt-0.5 size-5 shrink-0" aria-hidden />
      <div>
        <p className="font-medium">En el manual físico: páginas {pages}</p>
        <p className="mt-1 text-muted-foreground">Edición {reference.edition}</p>
      </div>
    </aside>
  )
}
