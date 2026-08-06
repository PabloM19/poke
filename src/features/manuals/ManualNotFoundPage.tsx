import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function ManualNotFoundPage() {
  return (
    <div className="py-8 text-center">
      <p className="mb-2 text-sm font-medium text-muted-foreground">Error 404</p>
      <h1 className="mb-2 text-2xl font-semibold">Lección no encontrada</h1>
      <p className="mb-5 text-muted-foreground">Esta dirección no corresponde a una lección del manual.</p>
      <Button asChild variant="outline"><Link to="/manuales">Volver a Manuales</Link></Button>
    </div>
  )
}
