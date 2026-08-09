import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useGameContext } from '@/features/games'
import type { ManualContentFamily } from './content/types'

interface JourneyLink {
  path: string
  title: string
  description: string
}

export function ManualJourneyLinks({ family }: { family: ManualContentFamily }) {
  const { game } = useGameContext()
  const mainGame: JourneyLink = { path: `/manuales/juegos/${game.slug}`, title: game.title, description: 'Continúa con la guía del juego seleccionado.' }
  const links: readonly JourneyLink[] = family === 'trainer'
    ? [mainGame]
    : family === 'mystery-dungeon'
      ? [
          { path: '/manuales/juegos/equipo-rescate-azul', title: 'Equipo de Rescate Azul', description: 'Aplica la lección al equipo de rescate.' },
          { path: '/manuales/juegos/exploradores-oscuridad', title: 'Exploradores de la Oscuridad', description: 'Aplica la lección en el Pokégremio.' },
        ]
      : family === 'other'
        ? [
            { path: '/manuales/juegos/ranger', title: 'Pokémon Ranger', description: 'Captura mediante trazos.' },
            { path: '/manuales/juegos/dash', title: 'Pokémon Dash', description: 'Compite en carreras táctiles.' },
            { path: '/manuales/juegos/link', title: 'Pokémon Link!', description: 'Prepara enlaces y cadenas.' },
            { path: '/manuales/juegos/conquest', title: 'Pokémon Conquest', description: 'Planifica batallas por turnos.' },
          ]
        : family === 'start'
          ? [mainGame, { path: '/manuales/juegos/equipo-rescate-azul', title: 'Equipo de Rescate Azul', description: 'Prueba el recorrido de Mundo Misterioso.' }]
          : []

  if (links.length === 0) return null
  return (
    <section className="mt-8" aria-label="Guías relacionadas">
      <h2 className="mb-3 text-xl font-semibold">Continúa en una guía</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {links.map((item) => (
          <Link key={item.path} to={item.path} className="rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Card className="h-full gap-2 py-4 transition-colors hover:bg-accent/50">
              <CardHeader className="flex-row items-center justify-between px-4"><CardTitle className="text-base">{item.title}</CardTitle><ArrowRight className="size-4 text-muted-foreground" aria-hidden /></CardHeader>
              <CardContent className="px-4 text-sm leading-5 text-muted-foreground">{item.description}</CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}
