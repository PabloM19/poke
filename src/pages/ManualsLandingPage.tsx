import { Link } from 'react-router-dom'
import { ArrowRight, Compass, Gamepad2, Library, Map, ShieldCheck, Sparkles, TableProperties } from '@/components/icons'
import { PageHeader } from '@/components/PageHeader'
import { BentoCard, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useGameContext } from '@/features/games'
import { ManualSearchBox } from '@/features/manuals/search/ManualSearchBox'
import { ContinueReadingCard } from '@/features/manuals/progress/ContinueReadingCard'
import { SpoilerPreferenceControl } from '@/features/manuals/spoilers/SpoilerPreferenceControl'

const routes = [
  {
    path: '/manuales/juegos/equipo-rescate-azul',
    title: 'Equipo de Rescate Azul',
    description: 'Rescate Azul y Exploradores: equipos, rangos y primeras expediciones.',
    pages: '129–144',
    icon: ShieldCheck,
    tone: 'green',
  },
  {
    path: '/manuales/juegos/perla',
    title: 'Guías por juego',
    description: 'Las cinco aventuras principales, de Perla a Negro 2.',
    pages: '87–128',
    icon: Gamepad2,
    tone: 'blue',
    activeGame: true,
  },
  {
    path: '/manuales/empezar/que-es-pokemon',
    title: 'Empieza aquí',
    description: 'Conceptos generales, Nintendo DS y cómo elegir tu camino.',
    pages: '21–40',
    icon: Compass,
    tone: 'yellow',
  },
  {
    path: '/manuales/entrenador/primeros-pasos',
    title: 'Ser Entrenador',
    description: 'Explora, combate, captura y forma un equipo.',
    pages: '41–62',
    icon: Map,
    tone: 'surface',
  },
  {
    path: '/manuales/mundo-misterioso/equipo-y-ciclo',
    title: 'Mundo Misterioso',
    description: 'Mazmorras, supervivencia, compañeros y misiones.',
    pages: '63–78',
    icon: Sparkles,
    tone: 'lavender',
  },
  {
    path: '/manuales/otros',
    title: 'Otras formas de jugar',
    description: 'Ranger, Dash, Link! y Conquest en una vista rápida.',
    pages: '79–86',
    icon: Library,
    tone: 'surface',
  },
  {
    path: '/manuales/recursos',
    title: 'Recursos rápidos',
    description: 'R-01…R-06, revisión editorial y niveles de spoilers.',
    pages: '153–156',
    icon: TableProperties,
    tone: 'blue',
  },
] as const

export function ManualsLandingPage() {
  const { game } = useGameContext()
  const contextualRoutes = routes.map((route) => 'activeGame' in route && route.activeGame
    ? {
        ...route,
        path: `/manuales/juegos/${game.slug}`,
        description: `La guía específica de ${game.title}: recorrido, sistemas y recursos del juego activo.`,
      }
    : route)

  return (
    <div className="page-stack">
      <div data-tour="manuals-home">
        <PageHeader
          eyebrow="Manual Nintendo DS · 156 páginas"
          title="Manuales"
          description="Empieza por las ideas generales y elige después tu recorrido: Entrenador Pokémon, Mundo Misterioso o la guía de tu juego activo."
        />
      </div>
      <ContinueReadingCard />
      <BentoCard className="p-4"><SpoilerPreferenceControl /></BentoCard>
      <ManualSearchBox />
      <div className="grid gap-4 sm:grid-cols-2">
        {contextualRoutes.map(({ path, title, description, pages, icon: Icon, tone }) => (
          <Link key={path} to={path} className="rounded-[var(--radius-xl)] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            <BentoCard tone={tone} className="interactive-clay h-full p-0 hover:-translate-y-0.5">
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
    </div>
  )
}
