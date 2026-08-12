import type { ReactNode } from 'react'
import { Trophy } from '@/components/icons'
import { BentoCard } from '@/components/ui/card'

export interface GameResultMetric {
  label: string
  value: ReactNode
}

export function GameResultCard({
  result,
  subtitle,
  metrics,
}: {
  result: ReactNode
  subtitle: ReactNode
  metrics: readonly GameResultMetric[]
}) {
  return (
    <BentoCard tone="green" data-semantic="result-highlight" className="p-6 text-center">
      <Trophy className="mx-auto size-10 text-ui-green-strong" weight="fill" aria-hidden />
      <p className="mt-3 text-4xl font-bold tabular-nums">{result}</p>
      <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      <div className={`mt-6 grid gap-3 border-t border-border/70 pt-5 ${metrics.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
        {metrics.map((metric) => (
          <div key={metric.label}>
            <strong className="block text-xl tabular-nums sm:text-2xl">{metric.value}</strong>
            <span className="text-xs text-muted-foreground">{metric.label}</span>
          </div>
        ))}
      </div>
    </BentoCard>
  )
}
