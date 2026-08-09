import { CircleDot, PenTool, Shield } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LessonCallout, LessonSteps, PhysicalReference } from '../components/LessonBlocks'
import { ReadingProgressControls } from '../progress/ReadingProgressControls'

export function RangerGuidePage() {
  return (
    <article className="space-y-8">
      <header className="rounded-2xl border border-border bg-gradient-to-br from-primary/15 via-card to-secondary p-5 sm:p-8">
        <div className="mb-5 flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground"><Shield className="size-6" aria-hidden /></div>
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">Otra forma de jugar · Acción táctil</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Pokémon Ranger</h1>
        <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">Un Ranger protege la naturaleza y ayuda a personas y Pokémon. En lugar de Poké Balls, utiliza el Capturador para establecer un vínculo temporal.</p>
        <div className="mt-5 flex gap-2"><Badge variant="secondary">Páginas 145–146</Badge><Badge variant="secondary">Sesiones medias</Badge></div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2">
        <Card><CardHeader><div className="mb-2 flex size-9 items-center justify-center rounded-lg bg-secondary"><PenTool className="size-5" aria-hidden /></div><CardTitle>Mecánica principal</CardTitle></CardHeader><CardContent className="leading-7 text-muted-foreground">Dibuja círculos continuos alrededor del objetivo. Si un ataque toca la línea, el trazo se rompe: observa, espera una apertura y prioriza la precisión.</CardContent></Card>
        <Card><CardHeader><div className="mb-2 flex size-9 items-center justify-center rounded-lg bg-secondary"><CircleDot className="size-5" aria-hidden /></div><CardTitle>Sistemas clave</CardTitle></CardHeader><CardContent className="leading-7 text-muted-foreground">Poké-Ayudas · movimientos de campo · misiones · compañero Minun o Plusle según el personaje elegido.</CardContent></Card>
      </section>

      <LessonSteps title="Cómo empezar" items={[
        'Practica con Pokémon tranquilos.',
        'No dibujes más rápido de lo que puedes controlar.',
        'Retira el lápiz para esquivar antes de perder energía; en el Ranger original también se reinicia el progreso de los círculos actuales.',
        'Comprueba el tipo de Poké-Ayuda disponible.',
        'Busca Pokémon con el movimiento de campo necesario.',
      ]} />

      <LessonCallout kind="tip" title="Error típico">Intentar encerrar al objetivo sin observar sus ataques.</LessonCallout>
      <LessonCallout kind="warning" title="Aviso de spoilers">Las guías de misiones pueden revelar la identidad de personajes y jefes.</LessonCallout>
      <Link to="/manuales/recursos/r-05" className="block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"><Card className="gap-2 py-5 transition-colors hover:bg-accent/50"><CardHeader className="px-5"><CardTitle>Recurso relacionado</CardTitle></CardHeader><CardContent className="px-5 text-sm text-muted-foreground">Abrir R-05 · Técnica de captura: patrón, pausa segura, Poké-Ayudas y movimientos de campo.</CardContent></Card></Link>
      <PhysicalReference reference={{ edition: 'ds-156-v1', pages: [145, 146] }} />
      <ReadingProgressControls articlePath="/manuales/juegos/ranger" />
    </article>
  )
}
