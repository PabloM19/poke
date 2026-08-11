import { ArrowRight, BookOpen, BookMarked, GitCompare, Library, TableProperties } from '@/components/icons'
import { BentoCard } from '@/components/ui/card'
import { TypeChip } from '@/features/types'
import { Link } from 'react-router-dom'
import type { RecentActivity, RecentManualActivity, RecentPokemonActivity } from './recentActivity'
import { useRecentActivity } from './useRecentActivity'

function formatSpeciesId(id: number): string {
  return `#${String(id).padStart(3, '0')}`
}

function LatestActivityCard({ activity }: { activity: RecentActivity }) {
  const isManual = activity.kind === 'manual'
  const isPokemon = activity.kind === 'pokemon'
  const percentage = isManual ? Math.round(activity.progress * 100) : null
  const eyebrow = isManual ? 'Continúa donde lo dejaste' : isPokemon ? 'Último Pokémon visitado' : 'Última herramienta utilizada'

  return (
    <Link
      to={activity.route}
      state={isManual ? { restoreReading: true } : undefined}
      className="interactive-clay block rounded-[var(--radius-xl)] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <BentoCard tone="green" className="interactive-clay relative overflow-hidden hover:-translate-y-0.5">
        <span className="pointer-events-none absolute -right-8 -top-12 size-32 rounded-full bg-card/35" aria-hidden />
        <div className="relative flex items-start gap-4">
          <span className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-md)] bg-card/75 text-ui-green-strong shadow-[var(--shadow-xs)]">
            {isPokemon && activity.spriteUrl
              ? <img src={activity.spriteUrl} alt="" className="size-14 object-contain [image-rendering:pixelated]" />
              : isManual ? <BookOpen className="size-6" aria-hidden /> : <GitCompare className="size-6" aria-hidden />}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-semibold uppercase tracking-[0.12em] text-ui-green-strong">{eyebrow}</span>
            <span className="mt-1 block text-xl font-bold">{activity.title}</span>
            <span className="mt-1 block text-sm leading-6 text-foreground/70">{activity.subtitle}</span>
            {isPokemon && <span className="mt-3 flex flex-wrap gap-1.5">{activity.types.slice(0, 2).map((type) => <TypeChip key={type} type={type} size="compact" variant="soft" />)}</span>}
            {percentage != null && (
              <span className="mt-3 block">
                <span className="mb-1 flex justify-between text-xs font-medium text-foreground/70"><span>Progreso aproximado</span><span>{percentage}%</span></span>
                <span className="block h-2 overflow-hidden rounded-full bg-card/70"><span className="block h-full rounded-full bg-ui-green-strong" style={{ width: `${percentage}%` }} /></span>
              </span>
            )}
          </span>
          <ArrowRight className="mt-1 size-5 shrink-0" aria-hidden />
        </div>
      </BentoCard>
    </Link>
  )
}

function RecentPokemonCard({ activity }: { activity: RecentPokemonActivity }) {
  return (
    <Link to={activity.route} className="interactive-clay flex min-h-36 min-w-40 flex-col rounded-[var(--radius-lg)] border border-border bg-card p-3 shadow-[var(--shadow-xs)] outline-none hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ring" aria-label={`Abrir ficha de ${activity.title}`}>
      <span className="flex items-start justify-between gap-2">
        <span className="flex size-14 items-center justify-center rounded-[var(--radius-sm)] bg-secondary">{activity.spriteUrl ? <img src={activity.spriteUrl} alt="" className="size-14 object-contain [image-rendering:pixelated]" /> : <span aria-hidden>—</span>}</span>
        <span className="text-xs font-semibold text-muted-foreground">{formatSpeciesId(activity.speciesId)}</span>
      </span>
      <span className="mt-2 font-bold">{activity.title}</span>
      <span className="mt-2 flex flex-wrap gap-1">{activity.types.slice(0, 2).map((type) => <TypeChip key={type} type={type} size="compact" variant="soft" />)}</span>
    </Link>
  )
}

function ReadingCard({ activity }: { activity: RecentManualActivity }) {
  const percentage = Math.round(activity.progress * 100)
  return (
    <Link to={activity.route} state={{ restoreReading: true }} className="interactive-clay flex min-h-20 min-w-0 items-center gap-3 rounded-[var(--radius-lg)] border border-border bg-card p-4 shadow-[var(--shadow-xs)] outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring">
      <BookOpen className="size-5 shrink-0 text-ui-lavender-strong" aria-hidden />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-semibold">{activity.title}</span>
        <span className="mt-1 block truncate text-sm text-muted-foreground">{activity.sectionTitle ?? 'Continúa la lectura'}</span>
        <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-secondary"><span className="block h-full rounded-full bg-ui-lavender-strong" style={{ width: `${percentage}%` }} /></span>
      </span>
      <span className="text-xs font-semibold tabular-nums text-muted-foreground">{percentage}%</span>
    </Link>
  )
}

const recommendations = [
  { path: '/pokemon/25', title: 'Conoce a Pikachu', description: 'Abre una ficha completa y descubre tipos, stats y defensas.', icon: BookMarked, tone: 'yellow' as const },
  { path: '/manuales/empezar/que-es-pokemon', title: 'Empieza por lo esencial', description: 'Una introducción breve al mundo Pokémon y sus reglas.', icon: Library, tone: 'lavender' as const },
  { path: '/manuales/recursos/r-01', title: 'Domina los tipos', description: 'Consulta fortalezas y resistencias según la generación.', icon: TableProperties, tone: 'blue' as const },
  { path: '/compare?ids=25,150', title: 'Prueba el comparador', description: 'Compara a Pikachu y Mewtwo en el juego seleccionado.', icon: GitCompare, tone: 'surface' as const },
]

function Recommendations() {
  return (
    <section aria-labelledby="recommendations-title" data-tour="recent-activity">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ui-lavender-strong">Para empezar</p>
      <h2 id="recommendations-title" className="mb-3 mt-1 text-xl font-bold">Te recomendamos</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {recommendations.map(({ path, title, description, icon: Icon, tone }) => (
          <Link key={path} to={path} className="interactive-clay block h-full rounded-[var(--radius-xl)] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            <BentoCard tone={tone} className="interactive-clay h-full p-4 hover:-translate-y-0.5">
              <div className="flex items-start justify-between gap-3"><Icon className="size-5 text-muted-foreground" aria-hidden /><ArrowRight className="size-4 text-muted-foreground" aria-hidden /></div>
              <h3 className="mt-4 font-bold">{title}</h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
            </BentoCard>
          </Link>
        ))}
      </div>
    </section>
  )
}

export function HomeActivity() {
  const activities = useRecentActivity()
  const pokemon = activities.filter((item): item is RecentPokemonActivity => item.kind === 'pokemon').slice(0, 6)
  const manuals = activities.filter((item): item is RecentManualActivity => item.kind === 'manual').slice(0, 3)
  const latest = activities[0]

  if (!latest) return <Recommendations />

  return (
    <section className="min-w-0 space-y-6" aria-labelledby="recent-title" data-tour="recent-activity">
      <h2 id="recent-title" className="sr-only">Actividad reciente</h2>
      <LatestActivityCard activity={latest} />
      {pokemon.length > 0 && (
        <div className="min-w-0">
          <div className="mb-3 flex items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-ui-blue-strong">Tu historial reciente</p><h2 className="mt-1 text-xl font-bold">Pokémon visitados</h2></div><span className="text-xs text-muted-foreground">Hasta 6</span></div>
          <div className="grid min-w-0 max-w-full auto-cols-[minmax(10rem,11rem)] grid-flow-col gap-3 overflow-x-auto pb-2 snap-x snap-mandatory sm:auto-cols-auto sm:grid-flow-row sm:grid-cols-3 lg:grid-cols-6">{pokemon.map((item) => <span key={item.id} className="snap-start"><RecentPokemonCard activity={item} /></span>)}</div>
        </div>
      )}
      {manuals.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ui-lavender-strong">Tu biblioteca</p>
          <h2 className="mb-3 mt-1 text-xl font-bold">Continuar leyendo</h2>
          <div className="grid min-w-0 gap-3 md:grid-cols-2">{manuals.map((item) => <ReadingCard key={item.id} activity={item} />)}</div>
        </div>
      )}
    </section>
  )
}
