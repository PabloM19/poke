import { Link } from 'react-router-dom'
import { ChevronRight, CircleDot, GitCompare, Library, Question, Shapes, Sword, type PhosphorIcon } from '@/components/icons'
import { PageHeader } from '@/components/PageHeader'
import { BentoCard, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface ToolEntry {
  to: string
  title: string
  description: string
  icon: PhosphorIcon
  tone: 'surface' | 'green' | 'lavender' | 'blue' | 'yellow'
}

const gameEntries: readonly ToolEntry[] = [
  {
    to: '/more/juegos/duelo-tipos',
    title: 'Duelo de tipos',
    description: 'Practica la efectividad de tipos con Pokémon de tu Pokédex.',
    icon: Sword,
    tone: 'lavender',
  },
  {
    to: '/more/juegos/quien-es-ese-pokemon',
    title: '¿Quién es ese Pokémon?',
    description: 'Pon a prueba cuánto reconoces de cada Pokédex.',
    icon: Question,
    tone: 'yellow',
  },
  {
    to: '/more/juegos/adivina-el-tipo',
    title: 'Adivina el tipo',
    description: 'Observa el Pokémon y descubre su tipo o combinación de tipos.',
    icon: Shapes,
    tone: 'blue',
  },
  {
    to: '/more/juegos/es-eficaz',
    title: '¿Es eficaz?',
    description: 'Aprende cómo interactúan los tipos entre sí.',
    icon: CircleDot,
    tone: 'green',
  },
]

const utilityEntries: readonly ToolEntry[] = [
  {
    to: '/manuales/recursos',
    title: 'Recursos rápidos',
    description: 'Tablas de tipos, estados y recordatorios de juego.',
    icon: Library,
    tone: 'blue',
  },
  {
    to: '/compare',
    title: 'Comparar Pokémon',
    description: 'Pon sus estadísticas y tipos frente a frente.',
    icon: GitCompare,
    tone: 'surface',
  },
]

function ToolGrid({ entries }: { entries: readonly ToolEntry[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {entries.map(({ to, title, description, icon: Icon, tone }) => (
        <Link key={to} to={to} className="interactive-clay block h-full rounded-[var(--radius-xl)] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
          <BentoCard tone={tone} className="h-full p-0 hover:-translate-y-0.5">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-3">
                <span className="flex size-11 items-center justify-center rounded-[var(--radius-sm)] border border-border/70 bg-card/70 shadow-[var(--shadow-xs)]">
                  <Icon className="size-5 text-muted-foreground" aria-hidden />
                </span>
                <ChevronRight className="size-5 text-muted-foreground" aria-hidden />
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="mb-1 text-base">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardContent>
          </BentoCard>
        </Link>
      ))}
    </div>
  )
}

export function MorePage() {
  return (
    <div className="page-stack">
      <PageHeader
        title="Herramientas"
        description="Aprende jugando o abre una utilidad para consultar información del juego activo."
      />
      <section id="juegos" aria-labelledby="juegos-title">
        <div className="mb-3">
          <h2 id="juegos-title" className="text-xl font-semibold">Juegos</h2>
          <p className="mt-1 text-sm text-muted-foreground">Aprende y practica jugando.</p>
        </div>
        <ToolGrid entries={gameEntries} />
      </section>
      <section aria-labelledby="utilidades-title">
        <div className="mb-3">
          <h2 id="utilidades-title" className="text-xl font-semibold">Utilidades</h2>
          <p className="mt-1 text-sm text-muted-foreground">Consulta, compara y revisa información.</p>
        </div>
        <ToolGrid entries={utilityEntries} />
      </section>
    </div>
  )
}
