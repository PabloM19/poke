import { Link } from 'react-router-dom'
import { ArrowRight, Compass, Gamepad2, Library, Map, ShieldCheck, Sparkles, TableProperties } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ManualSearchBox } from '@/features/manuals/search/ManualSearchBox'
import { ContinueReadingCard } from '@/features/manuals/progress/ContinueReadingCard'

const routes = [
  {
    path: '/manuales/juegos/equipo-rescate-azul',
    title: 'Equipo de Rescate Azul',
    description: 'Rescate Azul y Exploradores: equipos, rangos y primeras expediciones.',
    pages: '129–144',
    icon: ShieldCheck,
  },
  {
    path: '/manuales/juegos/perla',
    title: 'Guías por juego',
    description: 'Las cinco aventuras principales, de Perla a Negro 2.',
    pages: '87–128',
    icon: Gamepad2,
  },
  {
    path: '/manuales/empezar/que-es-pokemon',
    title: 'Empieza aquí',
    description: 'Conceptos generales, Nintendo DS y cómo elegir tu camino.',
    pages: '21–40',
    icon: Compass,
  },
  {
    path: '/manuales/entrenador/primeros-pasos',
    title: 'Ser Entrenador',
    description: 'Explora, combate, captura y forma un equipo.',
    pages: '41–62',
    icon: Map,
  },
  {
    path: '/manuales/mundo-misterioso/equipo-y-ciclo',
    title: 'Mundo Misterioso',
    description: 'Mazmorras, supervivencia, compañeros y misiones.',
    pages: '63–78',
    icon: Sparkles,
  },
  {
    path: '/manuales/otros',
    title: 'Otras formas de jugar',
    description: 'Ranger, Dash, Link! y Conquest en una vista rápida.',
    pages: '79–86',
    icon: Library,
  },
  {
    path: '/manuales/recursos/r-01',
    title: 'Recursos rápidos',
    description: 'Tabla de tipos histórica y referencia de estados, siempre a mano.',
    pages: '153–154',
    icon: TableProperties,
  },
] as const

export function ManualsLandingPage() {
  return (
    <div>
      <div className="mb-5 flex size-12 items-center justify-center rounded-xl bg-secondary">
        <Library className="size-6" aria-hidden />
      </div>
      <h1 className="mb-2 text-3xl font-semibold tracking-tight text-foreground">Manuales</h1>
      <p className="mb-7 max-w-2xl text-lg leading-8 text-muted-foreground">
        Empieza por las ideas generales y elige después tu recorrido: Entrenador
        Pokémon o Mundo Misterioso. Todo este contenido funciona sin PokeAPI.
      </p>
      <ContinueReadingCard />
      <ManualSearchBox />
      <div className="grid gap-4 sm:grid-cols-2">
        {routes.map(({ path, title, description, pages, icon: Icon }) => (
          <Link key={path} to={path} className="rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            <Card className="h-full transition-colors hover:bg-accent/50">
              <CardHeader>
                <div className="mb-3 flex items-center justify-between">
                  <Icon className="size-5 text-muted-foreground" aria-hidden />
                  <ArrowRight className="size-5 text-muted-foreground" aria-hidden />
                </div>
                <CardTitle className="text-lg">{title}</CardTitle>
                <CardDescription>Páginas {pages}</CardDescription>
              </CardHeader>
              <CardContent><p className="text-sm leading-6 text-muted-foreground">{description}</p></CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
