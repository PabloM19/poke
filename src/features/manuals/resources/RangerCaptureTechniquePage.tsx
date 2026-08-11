import { useState } from 'react'
import { CircleDot, Eye, PenTool, Shield } from '@/components/icons'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LessonCallout, LessonSteps, PhysicalReference } from '../components/LessonBlocks'
import { ManualFigureCarousel } from '../components/ManualFigure'
import { manualVisualCatalog } from '../content/manualVisuals'

const capturePhases = [
  { id: 'observe', label: '1 · Observar', instruction: 'No traces todavía. Identifica el recorrido y el ritmo de los ataques.' },
  { id: 'evade', label: '2 · Esquivar', instruction: 'Retira el lápiz antes de que el ataque alcance la línea del Capturador.' },
  { id: 'link', label: '3 · Enlazar', instruction: 'Durante la apertura, dibuja círculos continuos, precisos y a una velocidad controlable.' },
] as const

export function RangerCaptureTechniquePage() {
  const [phase, setPhase] = useState<(typeof capturePhases)[number]['id']>('observe')
  const active = capturePhases.find((item) => item.id === phase) ?? capturePhases[0]

  return (
    <article className="space-y-8">
      <header className="rounded-[var(--radius-xl)] border border-border bg-ui-blue/40 p-5 shadow-[var(--shadow-sm)] sm:p-8">
        <div className="mb-5 flex size-12 items-center justify-center rounded-[var(--radius-md)] bg-ui-blue text-ui-blue-strong shadow-[var(--shadow-xs)]"><PenTool className="size-6" aria-hidden /></div>
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">R-05 · Mecánica de Pokémon Ranger</p>
        <h1 className="mt-2 page-title">Técnica de captura Ranger</h1>
        <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">La captura no premia dibujar sin pausa: observa el ataque, retira el lápiz a tiempo y aprovecha una apertura con círculos continuos y controlados.</p>
        <div className="mt-5 flex flex-wrap gap-2"><Badge variant="secondary">Páginas 145–146 y 153–154</Badge><Badge variant="secondary">Precisión táctil</Badge></div>
      </header>

      <ManualFigureCarousel id="ranger-technique-examples" label="Observa el trazo real" figures={[manualVisualCatalog.rangerCapture, manualVisualCatalog.rangerCaptureSecond]} />

      <section className="grid gap-3 sm:grid-cols-3">
        <Card><CardHeader><div className="mb-2 flex size-9 items-center justify-center rounded-lg bg-secondary"><Eye className="size-5" aria-hidden /></div><CardTitle>Lee el patrón</CardTitle></CardHeader><CardContent className="text-sm leading-6 text-muted-foreground">Mira por dónde se mueve y cuándo ataca antes de iniciar el trazo.</CardContent></Card>
        <Card><CardHeader><div className="mb-2 flex size-9 items-center justify-center rounded-lg bg-secondary"><CircleDot className="size-5" aria-hidden /></div><CardTitle>Trazo continuo</CardTitle></CardHeader><CardContent className="text-sm leading-6 text-muted-foreground">Si un ataque toca la línea, el trazo se rompe. Control importa más que velocidad.</CardContent></Card>
        <Card><CardHeader><div className="mb-2 flex size-9 items-center justify-center rounded-lg bg-secondary"><Shield className="size-5" aria-hidden /></div><CardTitle>Salida segura</CardTitle></CardHeader><CardContent className="text-sm leading-6 text-muted-foreground">Levanta el lápiz para esquivar antes de perder energía del Capturador.</CardContent></Card>
      </section>

      <section aria-labelledby="rhythm-title" className="rounded-xl border border-border bg-card p-4">
        <p className="text-sm font-medium text-primary">Recordatorio interactivo</p>
        <h2 id="rhythm-title" className="mt-1 text-xl font-semibold">El ritmo de una captura</h2>
        <div className="mt-4 grid grid-cols-3 gap-2" role="group" aria-label="Fase de captura">
          {capturePhases.map((item) => <button key={item.id} type="button" aria-pressed={phase === item.id} onClick={() => setPhase(item.id)} className="interactive-clay min-h-12 rounded-lg border border-border bg-secondary px-2 py-2 text-xs font-medium transition-colors aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground sm:text-sm">{item.label}</button>)}
        </div>
        <p className="mt-4 rounded-lg bg-muted p-4 text-sm leading-6" role="status"><strong>{active.label}:</strong> {active.instruction}</p>
      </section>

      <LessonSteps title="Técnica base" items={[
        'Practica primero con Pokémon tranquilos.',
        'Observa el patrón y espera una apertura.',
        'Dibuja solo tan rápido como puedas controlar.',
        'Retira el lápiz antes de que un ataque toque la línea.',
        'Comprueba la Poké-Ayuda y los movimientos de campo disponibles.',
      ]} />

      <LessonCallout kind="warning" title="Particularidad del Ranger original">Al retirar el lápiz evitas el golpe, pero también se reinicia el progreso de los círculos actuales. Elige entre continuar y salir según el ataque que se aproxima.</LessonCallout>
      <LessonCallout kind="tip">Las Poké-Ayudas cambian tus opciones durante la captura; los movimientos de campo sirven fuera de ella para resolver obstáculos. Comprueba qué tienes antes de actuar.</LessonCallout>
      <LessonCallout kind="note" title="Cuida la pantalla">No presiones ni traces con fuerza. Un movimiento ligero y preciso protege la pantalla y ofrece más control.</LessonCallout>
      <PhysicalReference reference={{ edition: 'ds-156-v1', pages: [145, 146] }} />
      <nav className="flex flex-wrap gap-3" aria-label="Recursos relacionados">
        <Link className="manual-nav-link" to="/manuales/juegos/ranger">Volver a Pokémon Ranger</Link>
        <Link className="manual-nav-link" to="/manuales/recursos/r-04">Anterior: R-04</Link>
        <Link className="manual-nav-link" to="/manuales/recursos/r-06">Siguiente: R-06 · Conquest</Link>
      </nav>
    </article>
  )
}
