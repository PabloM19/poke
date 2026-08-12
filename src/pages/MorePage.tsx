import { Link } from 'react-router-dom'
import { CircleDot, Dna, GitCompare, Grid3X3, Library, Question, Shapes, Sword, Trophy, type PhosphorIcon } from '@/components/icons'
import { NavigationCard } from '@/components/NavigationCard'
import { PageHeader } from '@/components/PageHeader'
import { SectionHeader } from '@/components/SectionHeader'
import { ContentCard } from '@/components/ui/card'

interface ToolEntry {
  to: string
  title: string
  description: string
  icon: PhosphorIcon
  tone: 'surface' | 'green' | 'lavender' | 'blue' | 'yellow'
}

const starterGames: readonly ToolEntry[] = [
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
  {
    to: '/more/juegos/quien-es-ese-pokemon',
    title: '¿Quién es ese Pokémon?',
    description: 'Reconoce Pokémon por su silueta y descubre pistas.',
    icon: Question,
    tone: 'blue',
  },
  {
    to: '/more/juegos/memoria-tipos',
    title: 'Memoria de tipos',
    description: 'Empareja cada tipo con su símbolo.',
    icon: Grid3X3,
    tone: 'blue',
  },
]

const challengeGames: readonly ToolEntry[] = [
  {
    to: '/more/juegos/duelo-tipos',
    title: 'Duelo de tipos',
    description: 'Compara dos Pokémon y razona su ventaja por tipos.',
    icon: Sword,
    tone: 'lavender',
  },
  {
    to: '/more/juegos/pokemon-intruso',
    title: 'Pokémon intruso',
    description: 'Encuentra el Pokémon que no pertenece al grupo.',
    icon: Question,
    tone: 'yellow',
  },
  {
    to: '/more/juegos/cadena-evolutiva',
    title: 'Cadena evolutiva',
    description: 'Ordena Pokémon desde su primera fase hasta su evolución final.',
    icon: Dna,
    tone: 'lavender',
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

function ToolGrid({ entries, headingLevel = 3 }: { entries: readonly ToolEntry[]; headingLevel?: 3 | 4 }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {entries.map(({ to, title, description, icon: Icon, tone }) => (
        <Link key={to} to={to} className="interactive-clay block h-full rounded-[var(--radius-xl)] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
          <NavigationCard icon={Icon} title={title} description={description} tone={tone} titleAs={headingLevel === 4 ? 'h4' : 'h3'} />
        </Link>
      ))}
    </div>
  )
}

function LevelHeader({
  step,
  title,
  description,
  count,
  titleId,
}: {
  step: 1 | 2 | 3
  title: string
  description: string
  count?: number
  tone: 'starter' | 'challenge' | 'master'
  titleId: string
}) {
  return (
    <SectionHeader
      id={titleId}
      level={3}
      eyebrow={`Nivel ${step}`}
      title={title}
      description={description}
      metadata={count != null ? `${count} juegos` : 'Próximamente'}
      className="mb-4"
    />
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
        <SectionHeader id="juegos-title" title="Juegos" description="Aprende, practica y domina a tu ritmo." />
        <div className="grid gap-8">
          <section aria-labelledby="starter-games-title">
            <LevelHeader step={1} titleId="starter-games-title" title="Para empezar" description="Conoce Pokémon, sus tipos y las reglas básicas jugando." count={starterGames.length} tone="starter" />
            <ToolGrid entries={starterGames} headingLevel={4} />
          </section>
          <section aria-labelledby="challenge-games-title">
            <LevelHeader step={2} titleId="challenge-games-title" title="Pon a prueba lo aprendido" description="Combina lo que ya sabes en retos un poco más completos." count={challengeGames.length} tone="challenge" />
            <ToolGrid entries={challengeGames} headingLevel={4} />
          </section>
          <section aria-labelledby="master-games-title">
            <LevelHeader step={3} titleId="master-games-title" title="Maestro Pokémon" description="El siguiente paso para quienes quieren dominar cada detalle." tone="master" />
            <ContentCard className="border-dashed text-center">
              <span className="mx-auto flex size-12 items-center justify-center rounded-[var(--radius-md)] bg-ui-lavender/55 text-ui-lavender-strong" aria-hidden>
                <Trophy className="size-7" weight="fill" />
              </span>
              <h4 className="mt-4 text-lg leading-tight font-semibold tracking-[-0.015em]">¿Preparado para algo más difícil?</h4>
              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">Estamos preparando nuevos desafíos para entrenadores que quieran llevar sus conocimientos al siguiente nivel.</p>
            </ContentCard>
          </section>
        </div>
      </section>
      <section aria-labelledby="utilidades-title">
        <SectionHeader id="utilidades-title" title="Utilidades" description="Consulta, compara y revisa información." />
        <ToolGrid entries={utilityEntries} />
      </section>
    </div>
  )
}
