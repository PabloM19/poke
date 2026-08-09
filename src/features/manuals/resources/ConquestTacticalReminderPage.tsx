import { useState } from 'react'
import { Flag, Map, Move, Shield, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LessonCallout, PhysicalReference } from '../components/LessonBlocks'

const tacticalChecks = [
  { id: 'objective', label: 'He leído el objetivo del mapa.', hint: 'Derrotar unidades no siempre es la condición de victoria.' },
  { id: 'turns', label: 'Sé cuántos turnos quedan.', hint: 'El límite decide cuándo puedes preparar y cuándo debes actuar.' },
  { id: 'reach', label: 'He comprobado alcance y forma del ataque.', hint: 'La casilla más cercana no siempre permite golpear.' },
  { id: 'position', label: 'He valorado terreno, dirección y distancia.', hint: 'Busca una posición segura o ventajosa para esta unidad.' },
  { id: 'order', label: 'He decidido el orden de activación.', hint: 'Coordina varias unidades antes de comprometer la primera.' },
] as const

export function ConquestTacticalReminderPage() {
  const [checked, setChecked] = useState<readonly string[]>([])
  const toggle = (id: string) => setChecked((current) => current.includes(id)
    ? current.filter((item) => item !== id)
    : [...current, id])

  return (
    <article className="space-y-8">
      <header className="rounded-2xl border border-border bg-gradient-to-br from-primary/15 via-card to-secondary p-5 sm:p-8">
        <div className="mb-5 flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground"><Map className="size-6" aria-hidden /></div>
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">R-06 · Mecánica de Pokémon Conquest</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Recordatorio táctico Conquest</h1>
        <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">Una pausa breve antes de mover evita los errores caros: comprueba primero la misión y los turnos; después decide alcance, posición y orden.</p>
        <div className="mt-5 flex flex-wrap gap-2"><Badge variant="secondary">Páginas 151–154</Badge><Badge variant="secondary">Consulta durante la batalla</Badge></div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[
          [Flag, 'Objetivo', 'Qué exige el mapa.'],
          [Shield, 'Turnos', 'Cuánto margen queda.'],
          [Move, 'Alcance', 'Dónde llega el ataque.'],
          [Map, 'Terreno', 'Qué posición conviene.'],
          [Users, 'Vínculo', 'Qué pareja fortalecer.'],
        ].map(([Icon, title, text]) => <Card key={String(title)} className="gap-2 py-4"><CardHeader className="px-4"><Icon className="mb-2 size-5 text-primary" aria-hidden /><CardTitle className="text-base">{String(title)}</CardTitle></CardHeader><CardContent className="px-4 text-sm leading-5 text-muted-foreground">{String(text)}</CardContent></Card>)}
      </section>

      <section aria-labelledby="tactical-check-title" className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-end justify-between gap-3">
          <div><p className="text-sm font-medium text-primary">Checklist de un turno</p><h2 id="tactical-check-title" className="mt-1 text-xl font-semibold">Antes de confirmar</h2></div>
          <p className="shrink-0 text-sm font-medium" role="status">{checked.length} de {tacticalChecks.length}</p>
        </div>
        <div className="mt-4 space-y-2">
          {tacticalChecks.map((item) => (
            <label key={item.id} className="flex cursor-pointer gap-3 rounded-lg border border-border p-3 has-[:checked]:border-primary/50 has-[:checked]:bg-primary/5">
              <input type="checkbox" checked={checked.includes(item.id)} onChange={() => toggle(item.id)} className="mt-1 size-4 accent-primary" />
              <span className="min-w-0"><span className="block font-medium">{item.label}</span><span className="mt-1 block text-sm leading-5 text-muted-foreground">{item.hint}</span></span>
            </label>
          ))}
        </div>
      </section>

      <section aria-label="Orden de decisión" className="rounded-xl border border-border bg-card p-4">
        <h2 className="font-semibold">Orden de decisión</h2>
        <ol className="mt-4 grid grid-cols-4 gap-1.5 text-center text-[0.7rem] sm:gap-3 sm:text-sm">
          {['Misión', 'Posición', 'Acción', 'Revisar'].map((label, index) => <li key={label} className="relative rounded-lg bg-secondary p-2 sm:p-3">{index > 0 && <span className="absolute -left-2 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden>→</span>}<span className="mx-auto mb-2 flex size-7 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground">{index + 1}</span>{label}</li>)}
        </ol>
      </section>

      <LessonCallout kind="warning" title="El daño no es siempre el objetivo">Perseguir una unidad puede hacerte perder por tiempo o posición. Si el mapa pide otra cosa, esa condición tiene prioridad.</LessonCallout>
      <LessonCallout kind="tip">Cuando necesites asegurar una baja, concentra varios ataques y elige su orden antes de activar la primera unidad.</LessonCallout>
      <LessonCallout kind="note">Fortalecer el vínculo entre Guerrero y Pokémon es una decisión de progreso. La gestión de reinos se amplía gradualmente: no necesitas dominarla toda en la primera batalla.</LessonCallout>
      <PhysicalReference reference={{ edition: 'ds-156-v1', pages: [151, 152] }} />
      <nav className="flex flex-wrap gap-3" aria-label="Recursos relacionados">
        <Link className="text-sm font-medium text-primary hover:underline" to="/manuales/juegos/conquest">Volver a Pokémon Conquest</Link>
        <Link className="text-sm font-medium text-primary hover:underline" to="/manuales/recursos/r-05">Anterior: R-05</Link>
      </nav>
    </article>
  )
}
