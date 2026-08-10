import { CalendarDays, ShieldCheck } from '@/components/icons'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/PageHeader'
import { useGameContext } from '@/features/games'
import { gameDefinitions, resourceDefinitions } from '../content/definitions'
import { manualContentRevision, manualEdition, manualSourceSha256 } from '../content/manualSource'
import { LessonCallout, LessonSteps, PhysicalReference } from '../components/LessonBlocks'
import { ReadingProgressControls } from '../progress/ReadingProgressControls'

const resourceDescriptions: Record<(typeof resourceDefinitions)[number]['code'], string> = {
  'R-01': 'Ventajas, resistencias e inmunidades según el juego activo.',
  'R-02': 'Estados principales, efectos temporales y curación.',
  'R-03': 'Controles, guardado, avisos y etiquetas editoriales.',
  'R-04': 'Alimento, PP, semillas, orbes y preparación PMD.',
  'R-05': 'Trazos, pausas, Poké-Ayudas y movimientos de campo.',
  'R-06': 'Objetivos, turnos, alcance, terreno, vínculos y orden.',
}

const spoilerLabels = { none: 'Sin spoilers', mechanics: 'Mecánicas', guide: 'Guía' } as const

export function ResourcesCenterPage() {
  const { game } = useGameContext()
  const gameTitles = new Map(gameDefinitions.map((game) => [game.slug, game.title]))
  const orderedResources = [...resourceDefinitions].sort((left, right) => (
    Number(right.relatedGames.includes(game.slug)) - Number(left.relatedGames.includes(game.slug))
  ))
  const revised = new Intl.DateTimeFormat('es-ES', { dateStyle: 'long', timeZone: 'UTC' })
    .format(new Date(`${manualContentRevision}T12:00:00Z`))

  return (
    <article className="space-y-8">
      <PageHeader
        eyebrow="Consulta rápida · R-01…R-06"
        title="Centro de recursos"
        description="El punto estable para consultar y actualizar los complementos del manual sin depender de la paginación ni reimprimir enlaces."
        context={<><span className="font-semibold text-foreground">Contexto: {game.title}</span><span> · Los recursos relacionados aparecen primero.</span></>}
        actions={<div className="flex flex-wrap gap-2"><Badge variant="secondary">Páginas 153–156</Badge><Badge variant="secondary">Edición {manualEdition}</Badge></div>}
      />

      <section aria-label="Estado de revisión" className="grid gap-3 sm:grid-cols-2">
        <Card><CardHeader><div className="mb-2 flex size-9 items-center justify-center rounded-lg bg-secondary"><CalendarDays className="size-5" aria-hidden /></div><CardTitle>Última revisión</CardTitle></CardHeader><CardContent><p className="font-medium">{revised}</p><p className="mt-1 text-xs text-muted-foreground">Fuente {manualSourceSha256.slice(0, 12)}…</p></CardContent></Card>
        <Card><CardHeader><div className="mb-2 flex size-9 items-center justify-center rounded-lg bg-secondary"><ShieldCheck className="size-5" aria-hidden /></div><CardTitle>Niveles visibles</CardTitle></CardHeader><CardContent className="text-sm leading-6 text-muted-foreground">Cada acceso indica si es una referencia sin spoilers o una explicación de mecánicas. La preferencia global decide si se abre directamente.</CardContent></Card>
      </section>

      <section aria-labelledby="resources-title">
        <h2 id="resources-title" className="mb-3 text-xl font-semibold">Los seis recursos</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {orderedResources.map((resource) => {
            const related = resource.relatedGames.map((slug) => gameTitles.get(slug)).filter(Boolean)
            const shortPath = `/r/${resource.code.toLowerCase()}`
            return (
              <Link key={resource.code} to={resource.path} className="rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <Card className="h-full gap-3 py-5 transition-colors hover:bg-accent/50">
                  <CardHeader className="px-5"><div className="mb-1 flex flex-wrap gap-2"><Badge>{resource.code}</Badge><Badge variant="secondary">{spoilerLabels[resource.spoilerLevel]}</Badge></div><CardTitle className="text-lg">{resource.title}</CardTitle></CardHeader>
                  <CardContent className="space-y-3 px-5 text-sm leading-6 text-muted-foreground"><p>{resourceDescriptions[resource.code]}</p>{related.length > 0 && <p><strong className="text-foreground">Relacionado:</strong> {related.join(' · ')}</p>}<p className="font-mono text-xs">Ruta corta: {shortPath}</p></CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </section>

      <LessonSteps title="Si no sabes qué hacer" items={[
        '¿He leído el último diálogo o la última misión?',
        '¿Mi equipo está curado y preparado?',
        '¿Conozco el tipo o el alcance del rival?',
        '¿Llevo los objetos necesarios?',
        '¿Puedo volver al último pueblo, base o gremio?',
      ]} />
      <LessonCallout kind="tip">No existe una forma perfecta de jugar. Explorar, probar y equivocarse también forman parte de la aventura.</LessonCallout>
      <section className="rounded-xl border border-border bg-card p-5 text-center"><p className="text-lg font-semibold">Once juegos. Dos grandes formas de vivir Pokémon.</p><p className="mt-2 text-sm leading-6 text-muted-foreground">Manual personal · Nintendo DS · Edición 1.0</p></section>
      <PhysicalReference reference={{ edition: 'ds-156-v1', pages: [153, 154, 155, 156] }} />
      <ReadingProgressControls articlePath="/manuales/recursos" />
    </article>
  )
}
