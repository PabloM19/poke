import { Link } from 'react-router-dom'
import { ArrowRight, Compass, Gamepad2, Library, Map, ShieldCheck, Sparkles, TableProperties } from '@/components/icons'
import { PageHeader } from '@/components/PageHeader'
import { BentoCard, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MAIN_GAME_CONTEXTS, useGameContext } from '@/features/games'
import { ManualSearchBox } from '@/features/manuals/search/ManualSearchBox'
import { ContinueReadingCard } from '@/features/manuals/progress/ContinueReadingCard'
import { SpoilerPreferenceControl } from '@/features/manuals/spoilers/SpoilerPreferenceControl'

type ManualLandingCategory = 'core' | 'spin-off' | 'resources'

interface ManualLandingRoute {
  path: string
  title: string
  description: string
  pages: string
  icon: typeof Gamepad2
  tone: 'surface' | 'green' | 'lavender' | 'blue' | 'yellow'
  category: ManualLandingCategory
  activeGame?: boolean
}

const routes: readonly ManualLandingRoute[] = [
  {
    path: '/manuales/juegos/perla',
    title: 'Guías por juego',
    description: 'Las cinco aventuras principales, de Perla a Negro 2.',
    pages: '87–128',
    icon: Gamepad2,
    tone: 'blue',
    activeGame: true,
    category: 'core',
  },
  {
    path: '/manuales/empezar/que-es-pokemon',
    title: 'Empieza aquí',
    description: 'Conceptos generales, Nintendo DS y cómo elegir tu camino.',
    pages: '21–40',
    icon: Compass,
    tone: 'yellow',
    category: 'core',
  },
  {
    path: '/manuales/entrenador/primeros-pasos',
    title: 'Ser Entrenador',
    description: 'Explora, combate, captura y forma un equipo.',
    pages: '41–62',
    icon: Map,
    tone: 'surface',
    category: 'core',
  },
  {
    path: '/manuales/mundo-misterioso/equipo-y-ciclo',
    title: 'Mundo Misterioso',
    description: 'Mazmorras, supervivencia, compañeros y misiones.',
    pages: '63–78',
    icon: Sparkles,
    tone: 'lavender',
    category: 'spin-off',
  },
  {
    path: '/manuales/juegos/equipo-rescate-azul',
    title: 'Equipo de Rescate Azul',
    description: 'Rescate Azul y Exploradores: equipos, rangos y primeras expediciones.',
    pages: '129–144',
    icon: ShieldCheck,
    tone: 'green',
    category: 'spin-off',
  },
  {
    path: '/manuales/otros',
    title: 'Otras formas de jugar',
    description: 'Ranger, Dash, Link! y Conquest en una vista rápida.',
    pages: '79–86',
    icon: Library,
    tone: 'surface',
    category: 'spin-off',
  },
  {
    path: '/manuales/recursos',
    title: 'Recursos rápidos',
    description: 'R-01…R-06, revisión editorial y niveles de spoilers.',
    pages: '153–156',
    icon: TableProperties,
    tone: 'blue',
    category: 'resources',
  },
]

const mainGamePages = {
  perla: '87–94',
  platino: '95–102',
  'oro-heartgold': '103–112',
  negro: '113–120',
  'negro-2': '121–128',
}

export function ManualsLandingPage() {
  const { game, isAll } = useGameContext()
  const contextualRoutes = isAll
    ? routes.flatMap((route) => 'activeGame' in route && route.activeGame
      ? MAIN_GAME_CONTEXTS.map((entry) => ({
          ...route,
          path: `/manuales/juegos/${entry.slug}`,
          title: entry.title,
          description: `Guía específica de ${entry.title}: recorrido, sistemas y recursos.`,
          pages: mainGamePages[entry.slug],
        }))
      : [route])
    : routes.map((route) => 'activeGame' in route && route.activeGame
      ? {
          ...route,
          path: `/manuales/juegos/${game.slug}`,
          title: game.title,
          description: `La guía específica de ${game.title}: recorrido, sistemas y recursos del juego activo.`,
        }
      : route)

  const sections = [
    { id: 'manuales-principales', title: 'Contexto principal', description: 'Bases compartidas y la guía del juego que tienes activo.', category: 'core' },
    { id: 'manuales-spin-offs', title: 'Biblioteca de spin-offs', description: 'Aventuras independientes, separadas del selector de juegos principales.', category: 'spin-off' },
    { id: 'manuales-recursos', title: 'Recursos compartidos', description: 'Tablas, referencias y ayudas rápidas para consultar mientras lees.', category: 'resources' },
  ] as const

  return (
    <div className="page-stack">
      <div data-tour="manuals-home">
        <PageHeader
          eyebrow="Manual Nintendo DS · 156 páginas"
          title="Manuales"
          description={isAll
            ? 'Consulta todos los juegos principales, las ideas generales, Mundo Misterioso y el resto de la biblioteca.'
            : 'Empieza por las ideas generales y elige después tu recorrido: Entrenador Pokémon, Mundo Misterioso o la guía de tu juego activo.'}
        />
      </div>
      <div className="space-y-8">
        {sections.map((section) => (
          <section key={section.id} aria-labelledby={`${section.id}-title`}>
            <div className="mb-3">
              <h2 id={`${section.id}-title`} className="text-xl font-semibold">{section.title}</h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{section.description}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {contextualRoutes.filter((route) => route.category === section.category).map(({ path, title, description, pages, icon: Icon, tone }) => (
                <Link key={path} to={path} className="interactive-clay block h-full rounded-[var(--radius-xl)] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                  <BentoCard tone={tone} className="h-full p-0 hover:-translate-y-0.5">
                    <CardHeader>
                      <div className="mb-3 flex items-center justify-between">
                        <Icon className="size-5 text-muted-foreground" aria-hidden />
                        <ArrowRight className="size-5 text-muted-foreground" aria-hidden />
                      </div>
                      <CardTitle className="text-lg">{title}</CardTitle>
                      <CardDescription>Páginas {pages}</CardDescription>
                    </CardHeader>
                    <CardContent><p className="text-sm leading-6 text-muted-foreground">{description}</p></CardContent>
                  </BentoCard>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
      <ContinueReadingCard />
      <BentoCard className="p-4"><SpoilerPreferenceControl /></BentoCard>
      <ManualSearchBox />
    </div>
  )
}
