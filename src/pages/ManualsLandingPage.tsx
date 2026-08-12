import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  Compass,
  Gamepad2,
  Library,
  Map,
  Search,
  ShieldCheck,
  Sparkles,
  TableProperties,
} from '@/components/icons'
import { NavigationCard } from '@/components/NavigationCard'
import { MetadataList } from '@/components/MetadataList'
import { PageHero } from '@/components/PageHero'
import { ContentCard } from '@/components/ui/card'
import { GameSelector, MAIN_GAME_CONTEXTS, useGameContext } from '@/features/games'
import { ManualIndex } from '@/features/manuals/ManualIndex'
import { ManualSearchBox } from '@/features/manuals/search/ManualSearchBox'
import { ContinueReadingCard } from '@/features/manuals/progress/ContinueReadingCard'
import { SpoilerPreferenceControl } from '@/features/manuals/spoilers/SpoilerPreferenceControl'

const mainGamePages = {
  perla: '87–94',
  platino: '95–102',
  'oro-heartgold': '103–112',
  negro: '113–120',
  'negro-2': '121–128',
} as const

const foundationRoutes = [
  {
    path: '/manuales/empezar/que-es-pokemon',
    title: 'Empieza por lo esencial',
    description: 'Qué es un Pokémon, cómo funciona Nintendo DS y qué camino puedes seguir.',
    pages: '21–40',
    icon: Compass,
    tone: 'yellow' as const,
  },
  {
    path: '/manuales/entrenador/primeros-pasos',
    title: 'Aprende a ser Entrenador',
    description: 'Exploración, combate, captura, crecimiento y construcción de equipo.',
    pages: '41–62',
    icon: Map,
    tone: 'surface' as const,
  },
]

const libraryRoutes = [
  {
    path: '/manuales/mundo-misterioso/equipo-y-ciclo',
    title: 'Mundo Misterioso',
    description: 'Mazmorras, supervivencia, compañeros y misiones.',
    pages: '63–78',
    icon: Sparkles,
    tone: 'lavender' as const,
  },
  {
    path: '/manuales/juegos/equipo-rescate-azul',
    title: 'Juegos de rescate',
    description: 'Equipo de Rescate Azul y Exploradores de la Oscuridad.',
    pages: '129–144',
    icon: ShieldCheck,
    tone: 'green' as const,
  },
  {
    path: '/manuales/otros',
    title: 'Otros juegos Pokémon',
    description: 'Ranger, Dash, Link! y Conquest, separados del juego principal.',
    pages: '79–86 · 145–152',
    icon: Library,
    tone: 'surface' as const,
  },
]

function SectionHeading({
  id,
  eyebrow,
  title,
  description,
}: {
  id?: string
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <header className="mb-4">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-ui-lavender-strong">{eyebrow}</p>
      <h2 id={id} className="mt-1 text-2xl font-bold tracking-[-0.025em]">{title}</h2>
      <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
    </header>
  )
}

function GameGuideLink({
  path,
  title,
  pages,
  subtitle,
  featured = false,
}: {
  path: string
  title: string
  pages: string
  subtitle: string
  featured?: boolean
}) {
  return (
    <Link
      to={path}
      className={featured
        ? 'interactive-clay group block overflow-hidden rounded-[var(--radius-xl)] border border-ui-blue-strong/20 bg-ui-blue/55 p-5 shadow-[var(--shadow-sm)] outline-none hover:-translate-y-0.5 focus-visible:ring-3 focus-visible:ring-ring/35 sm:p-6'
        : 'interactive-clay group flex min-h-32 flex-col rounded-[var(--radius-lg)] border border-border bg-card p-4 shadow-[var(--shadow-xs)] outline-none hover:-translate-y-0.5 hover:bg-accent/45 focus-visible:ring-3 focus-visible:ring-ring/35'}
    >
      <span className="flex items-start justify-between gap-3">
        <span className="flex size-10 items-center justify-center rounded-[var(--radius-sm)] bg-card/75 text-ui-blue-strong shadow-[var(--shadow-xs)]">
          <Gamepad2 className="size-5" aria-hidden />
        </span>
        <ArrowRight className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden />
      </span>
      <span className={featured ? 'mt-5 block' : 'mt-3 block'}>
        {featured && <span className="mb-1 block text-xs font-bold uppercase tracking-[0.13em] text-ui-blue-strong">Guía recomendada para tu juego</span>}
        <span className={featured ? 'block text-2xl font-bold tracking-[-0.02em]' : 'block font-bold'}>{title}</span>
        <span className="mt-1 block text-sm leading-5 text-muted-foreground">{subtitle}</span>
        <span className="mt-3 block text-xs font-semibold text-muted-foreground">Páginas {pages}</span>
        {featured && <span className="mt-4 inline-flex min-h-11 items-center font-semibold text-ui-blue-strong">Abrir guía completa <ArrowRight className="ml-2 size-4" aria-hidden /></span>}
      </span>
    </Link>
  )
}

export function ManualsLandingPage() {
  const { game, isAll } = useGameContext()

  return (
    <div className="space-y-8 sm:space-y-10" data-tour="manuals-home">
      <PageHero
        icon={BookOpen}
        eyebrow="Biblioteca Pokémon para Nintendo DS"
        title="Manuales"
        description="Aprende desde cero, sigue la guía de tu juego o consulta una respuesta concreta. Tú eliges por dónde empezar."
        tone="lavender"
        metadata={<MetadataList items={['156 páginas', '5 juegos principales', 'Guías para principiantes']} />}
      />

      <ContentCard aria-labelledby="manual-game-context-title" className="p-0 sm:p-0">
        <div className="p-5 pb-4 sm:p-6 sm:pb-4">
          <div className="flex items-start gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-ui-blue/60 text-ui-blue-strong">
              <Gamepad2 className="size-5" aria-hidden />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-ui-blue-strong">Paso 1 · Personaliza la biblioteca</p>
              <h2 id="manual-game-context-title" className="mt-1 text-xl font-bold">¿Qué juego estás jugando?</h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Tu elección coloca primero la guía adecuada y también se comparte con la Pokédex.
              </p>
            </div>
          </div>
        </div>
        <div className="border-t border-border p-4 sm:flex sm:items-center sm:justify-between sm:gap-5 sm:p-5">
          <div className="mb-3 sm:mb-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Juego activo</p>
            <p className="mt-1 font-semibold">{isAll ? 'Todos los juegos principales' : `${game.title} · Generación ${game.generation === 4 ? 'IV' : 'V'}`}</p>
          </div>
          <GameSelector className="w-full sm:w-auto" />
        </div>
      </ContentCard>

      <ContinueReadingCard />

      <section aria-labelledby="manual-start-title">
        <SectionHeading
          id="manual-start-title"
          eyebrow="Paso 2 · Empieza a leer"
          title={isAll ? 'Elige una guía principal' : 'Tu mejor punto de partida'}
          description={isAll
            ? 'Abre directamente la aventura que te interesa o empieza por las bases comunes.'
            : `Hemos colocado primero la guía de ${game.title}. Debajo tienes las lecciones que sirven para cualquier juego.`}
        />

        {isAll ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-label="Guías de juegos principales">
            {MAIN_GAME_CONTEXTS.map((entry) => (
              <GameGuideLink
                key={entry.slug}
                path={`/manuales/juegos/${entry.slug}`}
                title={entry.title}
                pages={mainGamePages[entry.slug]}
                subtitle={`${entry.region} · Generación ${entry.generation === 4 ? 'IV' : 'V'}`}
              />
            ))}
          </div>
        ) : (
          <GameGuideLink
            featured
            path={`/manuales/juegos/${game.slug}`}
            title={game.title}
            pages={mainGamePages[game.slug]}
            subtitle={`${game.region} · Generación ${game.generation === 4 ? 'IV' : 'V'}`}
          />
        )}

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {foundationRoutes.map(({ path, title, description, pages, icon, tone }) => (
            <Link key={path} to={path} className="interactive-clay block h-full rounded-[var(--radius-xl)] outline-none focus-visible:ring-3 focus-visible:ring-ring/35">
              <NavigationCard icon={icon} title={title} meta={`Páginas ${pages}`} description={description} tone={tone} />
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="manual-library-title">
        <SectionHeading
          id="manual-library-title"
          eyebrow="Explora la biblioteca"
          title="Más formas de jugar"
          description="Estas guías son independientes del selector principal: siempre estarán disponibles, elijas el juego que elijas."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {libraryRoutes.map(({ path, title, description, pages, icon, tone }) => (
            <Link key={path} to={path} className="interactive-clay block h-full rounded-[var(--radius-xl)] outline-none focus-visible:ring-3 focus-visible:ring-ring/35">
              <NavigationCard icon={icon} title={title} meta={`Páginas ${pages}`} description={description} tone={tone} />
            </Link>
          ))}
        </div>

        <Link to="/manuales/recursos" className="interactive-clay group mt-4 flex min-h-24 items-center gap-4 rounded-[var(--radius-xl)] border border-ui-green-strong/20 bg-ui-green/45 p-4 shadow-[var(--shadow-xs)] outline-none hover:-translate-y-0.5 focus-visible:ring-3 focus-visible:ring-ring/35 sm:p-5">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-card/70 text-ui-green-strong shadow-[var(--shadow-xs)]">
            <TableProperties className="size-5" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-bold">Recursos rápidos</span>
            <span className="mt-1 block text-sm leading-5 text-muted-foreground">Tablas de tipos, estados, símbolos y ayudas para consultar mientras juegas.</span>
          </span>
          <ArrowRight className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden />
        </Link>
      </section>

      <section aria-labelledby="manual-index-heading">
        <SectionHeading
          id="manual-index-heading"
          eyebrow="Todos los contenidos"
          title="¿Buscas una sección concreta?"
          description="El índice está ordenado en cuatro bloques reconocibles y muestra las páginas de cada contenido."
        />
        <ManualIndex mode="landing" />
      </section>

      <ContentCard aria-labelledby="manual-search-area-title">
        <div className="mb-5 flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-ui-yellow/55 text-ui-yellow-strong shadow-[var(--shadow-xs)]">
            <Search className="size-5" aria-hidden />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-ui-yellow-strong">Búsqueda directa</p>
            <h2 id="manual-search-area-title" className="mt-1 text-xl font-bold">Ve directamente a una respuesta</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">Busca un concepto, una mecánica, un juego o el código de un recurso.</p>
          </div>
        </div>
        <ManualSearchBox embedded />
      </ContentCard>

      <section className="grid gap-4 rounded-[var(--radius-xl)] border border-border bg-card p-5 shadow-[var(--shadow-xs)] sm:grid-cols-[minmax(0,1fr)_minmax(14rem,20rem)] sm:items-end sm:p-6" aria-labelledby="reading-preferences-title">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Preferencias de lectura</p>
          <h2 id="reading-preferences-title" className="mt-1 text-lg font-bold">Controla cuánto quieres descubrir</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">Puedes cambiar el nivel de spoilers ahora o más tarde desde Ajustes.</p>
        </div>
        <SpoilerPreferenceControl compact />
      </section>
    </div>
  )
}
