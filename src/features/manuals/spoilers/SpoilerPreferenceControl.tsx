import type { SpoilerLevel } from '../content/types'
import { useSpoilerPreference } from './spoilerPreference'

const options: readonly { value: SpoilerLevel; label: string }[] = [
  { value: 'none', label: 'Sin spoilers' },
  { value: 'mechanics', label: 'Mostrar mecánicas' },
  { value: 'guide', label: 'Mostrar guías completas' },
]

export function SpoilerPreferenceControl({ compact = false }: { compact?: boolean }) {
  const { level, setLevel } = useSpoilerPreference()
  return (
    <div className={compact ? 'block text-sm font-medium' : 'block rounded-xl border border-border bg-card p-4 text-sm font-medium'}>
      <label htmlFor="spoiler-level-select">Nivel de spoilers</label>
      <select id="spoiler-level-select" value={level} onChange={(event) => setLevel(event.target.value as SpoilerLevel)} className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 font-normal">
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      {!compact && <span className="mt-2 block font-normal leading-5 text-muted-foreground">Por defecto se ocultan mecánicas y recorridos. Siempre puedes revelar una página una sola vez.</span>}
    </div>
  )
}
