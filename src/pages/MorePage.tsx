import { Link } from 'react-router-dom'
import { ChevronRight, GitCompare, Library, Settings } from '@/components/icons'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const entries = [
  {
    to: '/manuales/recursos',
    title: 'Recursos rápidos',
    description: 'Tablas de tipos, estados y recordatorios de juego.',
    icon: Library,
  },
  {
    to: '/compare',
    title: 'Comparar Pokémon',
    description: 'Pon sus estadísticas y tipos frente a frente.',
    icon: GitCompare,
  },
  {
    to: '/settings',
    title: 'Ajustes',
    description: 'Vista, datos locales, spoilers y diagnóstico.',
    icon: Settings,
  },
] as const

export function MorePage() {
  return (
    <>
      <h1 className="page-title">Herramientas</h1>
      <p className="mb-6 text-muted-foreground">
        Prepara comparaciones, consulta referencias y controla los datos de la app.
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
