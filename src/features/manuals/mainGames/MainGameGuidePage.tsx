import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, ChevronRight, Gamepad2, Map, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PokemonReferenceGrid } from '../components/PokemonReferenceCard'
import { LessonCallout, LessonSteps, PhysicalReference } from '../components/LessonBlocks'
import { ReadingProgressControls } from '../progress/ReadingProgressControls'
import { pearlGuide } from './gameGuideData'

function StarterSection() {
  const [enrich, setEnrich] = useState(false)

  return (
    <section className="scroll-mt-20" id="iniciales">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-primary">Tu primera elección</p>
          <h2 className="text-2xl font-semibold">Tres compañeros para comenzar</h2>
        </div>
        {!enrich && <Button type="button" variant="outline" onClick={() => setEnrich(true)}>Cargar imágenes y tipos</Button>}
      </div>
      {enrich ? (
        <PokemonReferenceGrid references={pearlGuide.starters} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-3">
          {pearlGuide.starters.map((starter) => (
            <Card key={starter.speciesId} className="gap-3 py-5">
              <CardHeader className="gap-2 px-5">
                <Badge className="w-fit" variant="secondary">{starter.type}</Badge>
                <CardTitle>{starter.name}</CardTitle>
              </CardHeader>
              <CardContent className="px-5 text-sm leading-6 text-muted-foreground">{starter.description}</CardContent>
            </Card>
          ))}
        </div>
      )}
      <LessonCallout kind="tip">Elige por afinidad. Los tres pueden completar la aventura y tendrás oportunidades de cubrir los tipos restantes.</LessonCallout>
    </section>
  )
}

export function MainGameGuidePage() {
  const guide = pearlGuide
  return (
    <article className="space-y-10">
      <header className="overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/15 via-card to-secondary p-5 sm:p-8">
        <div className="mb-5 flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground"><Gamepad2 className="size-6" aria-hidden /></div>
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">{guide.eyebrow}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{guide.title}</h1>
        <p className="mt-3 text-lg font-medium">{guide.summary}</p>
        <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">{guide.lead}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Badge variant="secondary">Sin spoilers de historia</Badge>
          <Badge variant="secondary">Páginas {guide.pages[0]}–{guide.pages[1]}</Badge>
          <Badge variant="secondary">Contexto: Perla</Badge>
        </div>
      </header>

      <nav aria-label="En esta guía" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          ['#iniciales', 'Iniciales'], ['#rival', 'Rival'], ['#medallas', 'Medallas'], ['#recursos-perla', 'Recursos'],
        ].map(([href, label]) => (
          <a key={href} href={href} className="flex min-h-11 items-center justify-between rounded-lg border border-border bg-card px-3 text-sm font-medium outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring">
            {label}<ChevronRight className="size-4 text-muted-foreground" aria-hidden />
          </a>
        ))}
      </nav>

      <StarterSection />

      <section className="scroll-mt-20" id="rival">
        <p className="text-sm font-medium text-primary">Tu rival y tus guías</p>
        <h2 className="mb-4 text-2xl font-semibold">Crecer al mismo tiempo</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Card className="bg-secondary/40 sm:row-span-2">
            <CardHeader><CardTitle>{guide.rival.title}</CardTitle></CardHeader>
            <CardContent className="leading-7 text-foreground/85">{guide.rival.description}</CardContent>
          </Card>
          <Card className="gap-3 py-5"><CardHeader className="px-5"><CardTitle>Profesor Serbal</CardTitle></CardHeader><CardContent className="px-5 text-sm leading-6 text-muted-foreground">{guide.rival.professor}</CardContent></Card>
          <Card className="gap-3 py-5"><CardHeader className="px-5"><CardTitle>Ayudante del profesor</CardTitle></CardHeader><CardContent className="px-5 text-sm leading-6 text-muted-foreground">{guide.rival.assistant}</CardContent></Card>
        </div>
      </section>

      <section className="scroll-mt-20" id="medallas">
        <p className="text-sm font-medium text-primary">El recorrido de Sinnoh</p>
        <h2 className="mb-4 text-2xl font-semibold">Las ocho Medallas</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {guide.gyms.map((gym, index) => (
            <Card key={gym.badge} className="gap-3 py-5">
              <CardHeader className="grid-cols-[auto_1fr] items-center gap-x-3 px-5">
                <span className="row-span-2 flex size-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">{index + 1}</span>
                <CardTitle>{gym.badge}</CardTitle>
                <p className="text-sm text-muted-foreground">{gym.leader} · {gym.type} · {gym.city}</p>
              </CardHeader>
              <CardContent className="px-5 text-sm leading-6 text-foreground/85">{gym.lesson}</CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center gap-3"><Sparkles className="size-5 text-primary" aria-hidden /><h2 className="text-2xl font-semibold">Una región para explorar con calma</h2></div>
        <div className="grid gap-3 sm:grid-cols-2">
          {guide.systems.map((system) => <Card key={system.title} className="gap-2 py-4"><CardHeader className="px-5"><CardTitle className="text-base">{system.title}</CardTitle></CardHeader><CardContent className="px-5 text-sm text-muted-foreground">{system.description}</CardContent></Card>)}
        </div>
        <LessonCallout kind="note">Utiliza las Máquinas Ocultas para superar obstáculos y revisa el equipo antes de una cueva o ruta larga.</LessonCallout>
      </section>

      <section>
        <LessonSteps title="Tu primera hora" items={guide.firstHour} />
        <LessonCallout kind="tip">{guide.firstHourTip}</LessonCallout>
      </section>

      <section className="scroll-mt-20" id="recursos-perla">
        <div className="mb-4 flex items-center gap-3"><Map className="size-5 text-primary" aria-hidden /><h2 className="text-2xl font-semibold">Antes de continuar</h2></div>
        <ul className="ml-5 list-disc space-y-2 leading-7">{guide.reminders.map((item) => <li key={item}>{item}</li>)}</ul>
        <LessonCallout kind="warning" title="Aviso de spoilers">{guide.spoilerWarning}</LessonCallout>
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="font-semibold">Recursos de Perla</h3>
          <p className="mt-1 text-sm text-muted-foreground">{guide.resources.join(' · ')}</p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Button asChild><Link to="/pokedex?gen=4"><BookOpen aria-hidden />Abrir Pokédex Gen IV</Link></Button>
            <Button asChild variant="outline"><Link to="/manuales/recursos/r-01">Consultar tabla de tipos</Link></Button>
          </div>
        </div>
      </section>

      <PhysicalReference reference={{ edition: 'ds-156-v1', pages: Array.from({ length: 8 }, (_, index) => 87 + index) }} />
      <ReadingProgressControls articlePath="/manuales/juegos/perla" />
    </article>
  )
}
