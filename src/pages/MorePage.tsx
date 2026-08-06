import { Link } from 'react-router-dom'
import { ChevronRight, GitCompare, Settings } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const entries = [
  {
    to: '/compare',
    title: 'Comparar Pokémon',
    description: 'Pon sus estadísticas y tipos frente a frente.',
    icon: GitCompare,
  },
  {
    to: '/settings',
    title: 'Ajustes',
    description: 'Tema, vista, datos locales y diagnóstico.',
    icon: Settings,
  },
] as const

export function MorePage() {
  return (
    <>
      <h1 className="mb-2 text-2xl font-semibold text-foreground">Más</h1>
      <p className="mb-6 text-muted-foreground">
        Herramientas y opciones que no necesitas tener siempre a la vista.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {entries.map(({ to, title, description, icon: Icon }) => (
          <Link key={to} to={to} className="rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            <Card className="h-full transition-colors hover:bg-accent/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-3">
                  <Icon className="size-5 text-muted-foreground" aria-hidden />
                  <ChevronRight className="size-5 text-muted-foreground" aria-hidden />
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="mb-1 text-base">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </>
  )
}
