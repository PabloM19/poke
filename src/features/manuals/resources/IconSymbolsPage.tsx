import { AlertTriangle, BookOpen, Gamepad2, Save, Tags } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LessonCallout, PhysicalReference } from '../components/LessonBlocks'

const controlLabels = [
  ['Cruceta', 'Moverte o cambiar la selección'],
  ['A', 'Confirmar, hablar o interactuar'],
  ['B', 'Cancelar, volver o acelerar texto'],
  ['X / Y', 'Acciones que cambian según el juego'],
  ['L / R', 'Cambiar pestaña, objetivo o vista'],
  ['START / SELECT', 'Menú o función indicada en pantalla'],
] as const

const symbols = [
  { icon: Save, title: 'Guardado', text: 'Espera a que termine la confirmación. No apagues la consola ni retires la tarjeta durante el proceso.' },
  { icon: AlertTriangle, title: 'Aviso', text: 'Detente y lee antes de confirmar: puede indicar pérdida de progreso, un peligro o contenido con spoilers.' },
  { icon: Gamepad2, title: 'Control', text: 'La ayuda muestra el botón disponible en ese momento. La indicación de la pantalla del juego tiene prioridad.' },
  { icon: Tags, title: 'Etiqueta', text: 'Las etiquetas de esta app distinguen una referencia segura, una mecánica y una guía con recorrido.' },
] as const

export function IconSymbolsPage() {
  return (
    <article className="space-y-8">
      <header className="rounded-2xl border border-border bg-gradient-to-br from-primary/15 via-card to-secondary p-5 sm:p-8">
        <div className="mb-5 flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground"><BookOpen className="size-6" aria-hidden /></div>
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">R-03 · Referencia sin spoilers</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Iconos y símbolos</h1>
        <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">Una leyenda compacta para reconocer controles, guardado, avisos y las etiquetas editoriales que aparecen en el manual y en esta app.</p>
        <div className="mt-5 flex flex-wrap gap-2"><Badge variant="secondary">Páginas 153–154</Badge><Badge variant="secondary">Consulta rápida</Badge></div>
      </header>

      <section aria-labelledby="symbols-title">
        <h2 id="symbols-title" className="mb-3 text-xl font-semibold">Símbolos que conviene reconocer</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {symbols.map(({ icon: Icon, title, text }) => (
            <Card key={title}>
              <CardHeader><div className="mb-2 flex size-9 items-center justify-center rounded-lg bg-secondary"><Icon className="size-5" aria-hidden /></div><CardTitle>{title}</CardTitle></CardHeader>
              <CardContent className="text-sm leading-6 text-muted-foreground">{text}</CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section aria-labelledby="controls-title">
        <h2 id="controls-title" className="mb-3 text-xl font-semibold">Botones de Nintendo DS</h2>
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <dl className="divide-y divide-border">
            {controlLabels.map(([control, meaning]) => (
              <div key={control} className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-3 p-3 sm:grid-cols-[9rem_minmax(0,1fr)] sm:p-4">
                <dt><kbd className="inline-flex min-h-8 items-center rounded-md border border-border bg-secondary px-2 text-xs font-semibold shadow-sm">{control}</kbd></dt>
                <dd className="self-center text-sm leading-5 text-muted-foreground">{meaning}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section aria-labelledby="labels-title" className="rounded-xl border border-border bg-card p-4">
        <h2 id="labels-title" className="font-semibold">Etiquetas del manual</h2>
        <dl className="mt-4 space-y-4">
          <div><dt><Badge variant="secondary">Sin spoilers</Badge></dt><dd className="mt-2 text-sm leading-6 text-muted-foreground">Pokédex, tipos, objetos, controles y otras consultas que no adelantan la historia.</dd></div>
          <div><dt><Badge variant="secondary">Mecánicas</Badge></dt><dd className="mt-2 text-sm leading-6 text-muted-foreground">Explicación detallada de cómo funciona un sistema del juego.</dd></div>
          <div><dt><Badge variant="destructive">Guía · spoilers</Badge></dt><dd className="mt-2 text-sm leading-6 text-muted-foreground">Recorrido completo o información que puede revelar personajes, lugares o acontecimientos.</dd></div>
        </dl>
      </section>

      <LessonCallout kind="note">Los usos de X, Y, L, R, START y SELECT cambian entre juegos. Sigue siempre la indicación que aparece en la pantalla del juego.</LessonCallout>
      <PhysicalReference reference={{ edition: 'ds-156-v1', pages: [153, 154] }} />
      <nav className="flex flex-wrap gap-3" aria-label="Recursos relacionados">
        <Link className="text-sm font-medium text-primary hover:underline" to="/manuales/recursos/r-02">Anterior: R-02 · Estados</Link>
        <Link className="text-sm font-medium text-primary hover:underline" to="/manuales/empezar/nintendo-ds">Ampliar controles de Nintendo DS</Link>
        <Link className="text-sm font-medium text-primary hover:underline" to="/manuales/recursos/r-04">Siguiente: R-04 · Kit PMD</Link>
      </nav>
    </article>
  )
}
