import type { ReactNode } from 'react'

export function InlineManualText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean)
  return parts.map((part, index): ReactNode =>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={`${index}-${part}`}>{part.slice(2, -2)}</strong>
      : part
  )
}
