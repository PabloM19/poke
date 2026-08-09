import { Flag, Map, Move, Shield } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LessonCallout, LessonSteps, PhysicalReference } from '../components/LessonBlocks'
import { ReadingProgressControls } from '../progress/ReadingProgressControls'

const turnStages = [
  { value: '1', label: 'Elige unidad' },
  { value: '2', label: 'Mueve al alcance' },
  { value: '3', label: 'Elige acción' },
] as const

export function ConquestGuidePage() {
  return (
    <article className="space-y-8">
      <header className="rounded-2xl border border-border bg-gradient-to-br from-primary/15 via-card to-secondary p-5 sm:p-8">
        <div className="mb-5 flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground"><Map className="size-6" aria-hidden /></div>
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">Otra forma de jugar · Estrategia por turnos</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Pokémon Conquest</h1>
        <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">En Ransei, Guerreros y Pokémon combaten por distintos reinos. Cada batalla combina un objetivo, un límite de turnos y un mapa cuyo terreno modifica tus decisiones.</p>
        <div className="mt-5 flex flex-wrap gap-2"><Badge variant="secondary">Páginas 151–152</Badge><Badge variant="secondary">Táctica local</Badge></div>
      </header>

      <section className="grid gap-3 sm:grid-cols-3">
        <Card><CardHeader><div className="mb-2 flex size-9 items-center justify-center rounded-lg bg-secondary"><Flag className="size-5" aria-hidden /></div><CardTitle>Objetivo</CardTitle></CardHeader><CardContent className="leading-7 text-muted-foreground">Léelo antes de mover: ganar no siempre consiste en perseguir el mayor daño.</CardContent></Card>
        <Card><CardHeader><div className="mb-2 flex size-9 items-center justify-center rounded-lg bg-secondary"><Move className="size-5" aria-hidden /></div><CardTitle>Alcance</CardTitle></CardHeader><CardContent className="leading-7 text-muted-foreground">Comprueba hasta dónde llega la unidad y la forma del ataque antes de elegir casilla.</CardContent></Card>
        <Card><CardHeader><div className="mb-2 flex size-9 items-center justify-center rounded-lg bg-secondary"><Shield className="size-5" aria-hidden /></div><CardTitle>Posición</CardTitle></CardHeader><CardContent className="leading-7 text-muted-foreground">La dirección, la distancia, el terreno y el orden de activación pueden decidir el resultado.</CardContent></Card>
      </section>

      <section aria-label="Secuencia de un turno táctico" className="rounded-xl border border-border bg-card p-4">
        <h2 className="font-semibold">Un turno, de un vistazo</h2>
        <ol className="mt-4 grid grid-cols-3 gap-2 text-center">
          {turnStages.map((stage, index) => (
            <li key={stage.label} className="relative rounded-lg bg-secondary p-3 text-xs sm:text-sm">
              {index > 0 && <span className="absolute -left-2 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden>→</span>}
              <span className="mx-auto mb-2 flex size-8 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground">{stage.value}</span>
              <span className="leading-4">{stage.label}</span>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">Repite la secuencia con cada unidad y decide el orden antes de comprometer una posición.</p>
      </section>

      <LessonSteps title="Cómo empezar" items={[
        'Lee el objetivo antes de mover.',
        'Comprueba el alcance y la forma de cada ataque.',
        'Ocupa posiciones seguras o ventajosas.',
        'Concentra varios ataques cuando necesites asegurar una baja.',
        'Fortalece el vínculo entre Guerrero y Pokémon.',
      ]} />

      <LessonCallout kind="warning" title="No pierdas de vista la misión">El error típico es perseguir daño e ignorar el objetivo del mapa. Comprueba también los turnos que quedan.</LessonCallout>
      <LessonCallout kind="note">La gestión de reinos se amplía gradualmente. Aprende primero objetivo, movimiento y acción.</LessonCallout>
      <Link to="/manuales/recursos/r-06" className="block rounded-xl border border-border bg-card p-4 outline-none transition-colors hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring"><span className="font-semibold">Abrir R-06 · Recordatorio táctico</span><span className="mt-1 block text-sm leading-6 text-muted-foreground">Checklist de objetivo, turnos, alcance, terreno y orden de activación.</span></Link>
      <PhysicalReference reference={{ edition: 'ds-156-v1', pages: [151, 152] }} />
      <ReadingProgressControls articlePath="/manuales/juegos/conquest" />
    </article>
  )
}
