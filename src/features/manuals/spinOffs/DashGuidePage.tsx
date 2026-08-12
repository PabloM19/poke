import { Flag, Gauge, MoveUpRight } from '@/components/icons'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LessonCallout, LessonSteps, PhysicalReference } from '../components/LessonBlocks'
import { ReadingProgressControls } from '../progress/ReadingProgressControls'
import { ManualFigureCarousel } from '../components/ManualFigure'
import { manualVisualCatalog } from '../content/manualVisuals'

export function DashGuidePage() {
  return (
    <article className="space-y-8">
      <header className="rounded-[var(--radius-xl)] border border-border bg-ui-blue/40 p-5 shadow-[var(--shadow-xs)] sm:p-8">
        <div className="mb-5 flex size-12 items-center justify-center rounded-[var(--radius-md)] bg-ui-blue text-ui-blue-strong shadow-[var(--shadow-xs)]"><Flag className="size-6" aria-hidden /></div>
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">Otra forma de jugar · Carreras táctiles</p>
        <h1 className="mt-2 page-title">Pokémon Dash</h1>
        <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">Pikachu compite en carreras divididas en puntos de control. Para avanzar, desliza repetidamente el lápiz en la dirección deseada; el terreno cambia la velocidad y algunos tramos usan globos u otros medios.</p>
        <div className="mt-5 flex gap-2"><Badge variant="metadata">Páginas 147–148</Badge><Badge variant="metadata">· Sesiones cortas</Badge></div>
      </header>

      <ManualFigureCarousel id="dash-controls-and-race" label="Del gesto táctil a la carrera" figures={[manualVisualCatalog.dashTouchControl, manualVisualCatalog.dashRace, manualVisualCatalog.dashAir]} />

      <section className="grid gap-3 sm:grid-cols-2">
        <Card><CardHeader><div className="mb-2 flex size-9 items-center justify-center rounded-lg bg-secondary"><MoveUpRight className="size-5" aria-hidden /></div><CardTitle>Ritmo y dirección</CardTitle></CardHeader><CardContent className="leading-7 text-muted-foreground">Los movimientos pequeños y regulares ofrecen más control que los trazos largos y bruscos. Mantén un ritmo que puedas sostener.</CardContent></Card>
        <Card><CardHeader><div className="mb-2 flex size-9 items-center justify-center rounded-lg bg-secondary"><Gauge className="size-5" aria-hidden /></div><CardTitle>Lee el circuito</CardTitle></CardHeader><CardContent className="leading-7 text-muted-foreground">Sigue los puntos de control en orden, anticipa el siguiente giro y adapta el gesto cuando cambie la superficie.</CardContent></Card>
      </section>

      <section aria-label="Secuencia de carrera" className="rounded-xl border border-border bg-card p-4">
        <h2 className="font-semibold">La vuelta, de un vistazo</h2>
        <ol className="mt-4 grid grid-cols-3 gap-2 text-center text-xs sm:text-sm">
          {['Punto de control', 'Cambio de terreno', 'Meta'].map((label, index) => <li key={label} className="rounded-lg bg-secondary p-3"><span className="mx-auto mb-2 flex size-7 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground">{index + 1}</span>{label}</li>)}
        </ol>
      </section>

      <LessonSteps title="Cómo empezar" items={[
        'Sigue el orden de los puntos de control.',
        'Anticipa el siguiente giro antes de llegar.',
        'Adapta la dirección al cambiar de superficie.',
        'Prioriza una trayectoria limpia sobre la velocidad máxima.',
        'Repite un circuito para aprender sus rutas.',
      ]} />

      <LessonCallout kind="warning" title="Cuida la pantalla">El error típico es frotar la pantalla con demasiada fuerza. Usa movimientos controlados y sin presión excesiva.</LessonCallout>
      <LessonCallout kind="note">Está pensado para sesiones cortas y mejora mediante repetición. Usa el carrusel anterior para reconocer el gesto, la carrera terrestre y los tramos aéreos.</LessonCallout>
      <PhysicalReference reference={{ edition: 'ds-156-v1', pages: [147, 148] }} />
      <ReadingProgressControls articlePath="/manuales/juegos/dash" />
    </article>
  )
}
