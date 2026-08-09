import { Eye, Grid3X3, Move, Sparkles } from '@/components/icons'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LessonCallout, LessonSteps, PhysicalReference } from '../components/LessonBlocks'
import { ReadingProgressControls } from '../progress/ReadingProgressControls'

const chainStages = [
  { value: '4', label: 'iguales', active: false },
  { value: '★', label: 'Link Chance', active: true },
  { value: '3', label: 'iguales', active: false },
  { value: '2', label: 'iguales', active: false },
] as const

export function LinkGuidePage() {
  return (
    <article className="space-y-8">
      <header className="rounded-[var(--radius-xl)] border border-border bg-ui-blue/40 p-5 shadow-[var(--shadow-sm)] sm:p-8">
        <div className="mb-5 flex size-12 items-center justify-center rounded-[var(--radius-md)] bg-ui-blue text-ui-blue-strong shadow-[var(--shadow-xs)]"><Grid3X3 className="size-6" aria-hidden /></div>
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">Otra forma de jugar · Puzle táctico</p>
        <h1 className="mt-2 page-title">Pokémon Link!</h1>
        <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">Desplaza filas y columnas para reunir fichas Pokémon iguales. Cada hueco cambia el tablero: mira el movimiento inmediato y también qué piezas caerán después.</p>
        <div className="mt-5 flex flex-wrap gap-2"><Badge variant="secondary">Páginas 149–150</Badge><Badge variant="secondary">Cadenas y puntuación</Badge></div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2">
        <Card><CardHeader><div className="mb-2 flex size-9 items-center justify-center rounded-lg bg-secondary"><Move className="size-5" aria-hidden /></div><CardTitle>Mueve con intención</CardTitle></CardHeader><CardContent className="leading-7 text-muted-foreground">Localiza grupos casi completos y comprueba tanto la fila como la columna antes de desplazarla.</CardContent></Card>
        <Card><CardHeader><div className="mb-2 flex size-9 items-center justify-center rounded-lg bg-secondary"><Eye className="size-5" aria-hidden /></div><CardTitle>Observa la caída</CardTitle></CardHeader><CardContent className="leading-7 text-muted-foreground">Al desaparecer un enlace, las fichas restantes caen. Un hueco bien preparado puede iniciar la siguiente combinación.</CardContent></Card>
      </section>

      <section aria-label="Secuencia Link Chance" className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-2">
          <Sparkles className="size-5 text-primary" aria-hidden />
          <h2 className="font-semibold">Cómo prolongar una cadena</h2>
        </div>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">Empieza enlazando cuatro fichas. Durante Link Chance podrás continuar con tres y, después, con dos.</p>
        <ol className="mt-4 grid grid-cols-4 gap-1.5 text-center sm:gap-3">
          {chainStages.map((stage, index) => (
            <li key={stage.label + stage.value} className={`relative rounded-lg border p-2 sm:p-3 ${stage.active ? 'border-primary bg-primary/10' : 'border-border bg-secondary/60'}`}>
              {index > 0 && <span className="absolute -left-2 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden>→</span>}
              <span className={`mx-auto flex size-8 items-center justify-center rounded-full text-sm font-semibold sm:size-10 ${stage.active ? 'bg-primary text-primary-foreground' : 'bg-card text-foreground'}`}>{stage.value}</span>
              <span className="mt-2 block break-words text-[0.65rem] leading-4 sm:text-sm">{stage.label}</span>
            </li>
          ))}
        </ol>
      </section>

      <LessonSteps title="Cómo empezar" items={[
        'Localiza grupos casi completos.',
        'Comprueba filas y columnas antes de mover.',
        'Crea huecos que acerquen fichas iguales.',
        'Mantén un ritmo estable cuando aumente la velocidad.',
        'Usa una combinación pequeña cuando ayude a preparar otra mayor.',
      ]} />

      <LessonCallout kind="warning" title="Mira el tablero completo">El error típico es mover por impulso. Detente un instante para comprobar qué enlace formas y qué fichas ocuparán los huecos.</LessonCallout>
      <LessonCallout kind="tip">Una cadena larga se prepara: prioriza movimientos que acerquen fichas iguales y dejen una segunda combinación lista tras la caída.</LessonCallout>
      <PhysicalReference reference={{ edition: 'ds-156-v1', pages: [149, 150] }} />
      <ReadingProgressControls articlePath="/manuales/juegos/link" />
    </article>
  )
}
