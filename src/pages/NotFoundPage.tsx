import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <div className="py-12 text-center">
      <p className="mb-2 text-sm font-medium text-muted-foreground">Error 404</p>
      <h1 className="mb-2 text-2xl font-semibold">Página no encontrada</h1>
      <p className="mb-5 text-muted-foreground">La dirección que has abierto no existe en PokéApp.</p>
      <Button asChild variant="outline"><Link to="/search">Volver al inicio</Link></Button>
    </div>
  )
}
