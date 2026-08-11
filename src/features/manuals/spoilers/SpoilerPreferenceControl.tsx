import type { SpoilerLevel } from '../content/types'
import { useSpoilerPreference } from './spoilerPreference'
import { SelectField } from '@/components/ui/select-field'

const options: readonly { value: SpoilerLevel; label: string }[] = [
  { value: 'none', label: 'Sin spoilers' },
  { value: 'mechanics', label: 'Mostrar mecánicas' },
  { value: 'guide', label: 'Mostrar guías completas' },
]

export function SpoilerPreferenceControl({ compact = false }: { compact?: boolean }) {
  const { level, setLevel } = useSpoilerPreference()
  return (
    <div className={compact ? 'block text-sm font-medium' : 'block rounded-[var(--radius-lg)] text-sm font-medium'}>
      <label htmlFor="spoiler-level-select">Nivel de spoilers</label>
      <SelectField id="spoiler-level-select" value={level} onChange={(event) => setLevel(event.target.value as SpoilerLevel)} className="mt-3 font-normal">
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </SelectField>
      {!compact && <span className="mt-3 block font-normal leading-6 text-muted-foreground">Por defecto se ocultan mecánicas y recorridos. Siempre puedes revelar una página una sola vez.</span>}
    </div>
  )
}
