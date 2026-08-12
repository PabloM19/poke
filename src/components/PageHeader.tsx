import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface PageHeaderProps {
  eyebrow?: ReactNode
  title: string
  description?: ReactNode
  actions?: ReactNode
  context?: ReactNode
  className?: string
}

/**
 * Encabezado común para las pantallas funcionales.
 *
 * Home y las piezas editoriales pueden seguir usando un hero propio; todas
 * las listas y herramientas comparten esta jerarquía libre de superficies.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  context,
  className,
}: PageHeaderProps) {
  return (
    <header data-slot="page-header" className={cn('page-heading flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ui-blue-strong">
            {eyebrow}
          </p>
        )}
        <h1 className={cn('page-title', eyebrow && 'mt-1')}>{title}</h1>
        {description && <p className="page-lead">{description}</p>}
        {context && <div className="mt-3 text-sm text-muted-foreground">{context}</div>}
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
          {actions}
        </div>
      )}
    </header>
  )
}
