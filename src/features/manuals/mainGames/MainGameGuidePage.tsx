import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { BookOpen, ChevronRight, Gamepad2, Map, Sparkles } from '@/components/icons'
import { Badge } from '@/components/ui/badge'
import { TypeChip, pokemonTypeFromLabel } from '@/features/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PokemonReferenceGrid } from '../components/PokemonReferenceCard'
import { LessonCallout, LessonSteps, PhysicalReference } from '../components/LessonBlocks'
import { ReadingProgressControls } from '../progress/ReadingProgressControls'
import { ManualNotFoundPage } from '../ManualNotFoundPage'
import { getMainGameContext, isMainGameSlug } from '@/features/games/gameCatalog'
import { useGameContext } from '@/features/games'
import { publishedMainGameGuides, type MainGameGuide } from './gameGuideData'
import { GameDataExplorer } from './PearlDataExplorer'

function StarterSection({ guide }: { guide: MainGameGuide }) {
  const [enrich, setEnrich] = useState(false)

  return (
    <section className="scroll-mt-20" id="iniciales">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-primary">Tu primera elección</p>
          <h2 className="text-2xl font-semibold">{guide.starterTitle}</h2>
        </div>
        {!enrich && <Button type="button" variant="outline" onClick={() => setEnrich(true)}>Cargar imágenes y tipos</Button>}
      </div>
      {enrich ? (
        <PokemonReferenceGrid references={guide.starters} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-3">
          {guide.starters.map((starter) => (
            <Card key={starter.speciesId} className="gap-3 py-5">
              <CardHeader className="gap-2 px-5">
                {pokemonTypeFromLabel(starter.type) ? <TypeChip type={pokemonTypeFromLabel(starter.type)!} size="compact" /> : <Badge className="w-fit" variant="secondary">{starter.type}</Badge>}
                <CardTitle>{starter.name}</CardTitle>
              </CardHeader>
              <CardContent className="px-5 text-sm leading-6 text-muted-foreground">{starter.description}</CardContent>
            </Card>
          ))}
        </div>
      )}
      <LessonCallout kind="tip">{guide.starterTip}</LessonCallout>
    </section>
  )
}

export function MainGameGuidePage() {
  const { juego } = useParams()
  const { game: activeGame } = useGameContext()
  const guide = isMainGameSlug(juego) ? publishedMainGameGuides.get(juego) : null
  if (!guide) return <ManualNotFoundPage />
  const game = getMainGameContext(guide.slug)
  const gymGroups = guide.gymGroups ?? [{ title: 'Las ocho Medallas', start: 0, end: guide.gyms.length }]
  return (
    <article className="space-y-10">
      {activeGame.slug !== game.slug && (
        <aside className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-ui-yellow-strong/25 bg-ui-yellow/35 p-4 text-sm sm:flex-row sm:items-center sm:justify-between" aria-label="Contexto de juego">
          <p><strong>Guía de {game.shortTitle}.</strong> El juego activo es {activeGame.shortTitle}; las consultas enlazadas desde aquí mantienen el contexto de esta guía.</p>
          <Button asChild size="sm" variant="outline" className="shrink-0"><Link to={`/manuales/juegos/${activeGame.slug}`}>Abrir guía activa</Link></Button>
        </aside>
      )}
      <header className="overflow-hidden rounded-[var(--radius-xl)] border border-border bg-ui-blue/40 p-5 shadow-[var(--shadow-sm)] sm:p-8">
        <div className="mb-5 flex size-12 items-center justify-center rounded-[var(--radius-md)] bg-ui-blue text-ui-blue-strong shadow-[var(--shadow-xs)]"><Gamepad2 className="size-6" aria-hidden /></div>
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">{guide.eyebrow}</p>
        <h1 className="mt-2 page-title">{guide.title}</h1>
        <p className="mt-3 text-lg font-medium">{guide.summary}</p>
        <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">{guide.lead}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Badge variant="secondary">Sin spoilers de historia</Badge>
          <Badge variant="secondary">Páginas {guide.pages[0]}–{guide.pages[1]}</Badge>
          <Badge variant="secondary">Contexto: {game.shortTitle}</Badge>
        </div>
      </header>

      <nav aria-label="En esta guía" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          ['#iniciales', 'Iniciales'], ['#rival', 'Rival'], ['#medallas', 'Medallas'], [`#recursos-${guide.slug}`, 'Recursos'],
        ].map(([href, label]) => (
          <a key={href} href={href} className="flex min-h-11 items-center justify-between rounded-lg border border-border bg-card px-3 text-sm font-medium outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring">
            {label}<ChevronRight className="size-4 text-muted-foreground" aria-hidden />
          </a>
        ))}
      </nav>

      <StarterSection guide={guide} />

      <section className="scroll-mt-20" id="rival">
        <p className="text-sm font-medium text-primary">Tu rival y tus guías</p>
        <h2 className="mb-4 text-2xl font-semibold">Crecer al mismo tiempo</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Card className="bg-secondary/40 sm:row-span-2">
            <CardHeader><CardTitle>{guide.rival.title}</CardTitle></CardHeader>
            <CardContent className="leading-7 text-foreground/85">{guide.rival.description}</CardContent>
          </Card>
          {guide.rival.supporters.map((supporter) => <Card key={supporter.title} className="gap-3 py-5"><CardHeader className="px-5"><CardTitle>{supporter.title}</CardTitle></CardHeader><CardContent className="px-5 text-sm leading-6 text-muted-foreground">{supporter.description}</CardContent></Card>)}
        </div>
      </section>

      <section className="scroll-mt-20" id="medallas">
        <p className="text-sm font-medium text-primary">El recorrido de {guide.region}</p>
        {gymGroups.map((group) => (
          <div key={group.title} className="mb-8 last:mb-0">
            <h2 className="mb-4 text-2xl font-semibold">{group.title}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {guide.gyms.slice(group.start, group.end).map((gym, index) => (
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
          </div>
        ))}
        {guide.gymNote && <LessonCallout kind="note">{guide.gymNote}</LessonCallout>}
      </section>

      <section>
        <div className="mb-4 flex items-center gap-3"><Sparkles className="size-5 text-primary" aria-hidden /><h2 className="text-2xl font-semibold">{guide.systemsTitle}</h2></div>
        <div className="grid gap-3 sm:grid-cols-2">
          {guide.systems.map((system) => <Card key={system.title} className="gap-2 py-4"><CardHeader className="px-5"><CardTitle className="text-base">{system.title}</CardTitle></CardHeader><CardContent className="px-5 text-sm text-muted-foreground">{system.description}</CardContent></Card>)}
        </div>
        <LessonCallout kind="note">{guide.systemsNote}</LessonCallout>
      </section>

      <section>
        <LessonSteps title="Tu primera hora" items={guide.firstHour} />
        <LessonCallout kind="tip">{guide.firstHourTip}</LessonCallout>
      </section>

      <GameDataExplorer gameSlug={guide.slug} region={guide.region} />

      <section className="scroll-mt-20" id={`recursos-${guide.slug}`}>
        <div className="mb-4 flex items-center gap-3"><Map className="size-5 text-primary" aria-hidden /><h2 className="text-2xl font-semibold">Antes de continuar</h2></div>
        <ul className="ml-5 list-disc space-y-2 leading-7">{guide.reminders.map((item) => <li key={item}>{item}</li>)}</ul>
        <LessonCallout kind="warning" title="Aviso de spoilers">{guide.spoilerWarning}</LessonCallout>
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="font-semibold">Recursos de {game.shortTitle}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{guide.resources.join(' · ')}</p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Button asChild><Link to="/pokedex"><BookOpen aria-hidden />Abrir Pokédex de {game.shortTitle}</Link></Button>
            <Button asChild variant="outline"><Link to="/manuales/recursos/r-01">Consultar tabla de tipos</Link></Button>
          </div>
        </div>
      </section>

      <PhysicalReference reference={{ edition: 'ds-156-v1', pages: Array.from({ length: guide.pages[1] - guide.pages[0] + 1 }, (_, index) => guide.pages[0] + index) }} />
      <ReadingProgressControls articlePath={`/manuales/juegos/${guide.slug}`} />
    </article>
  )
}
