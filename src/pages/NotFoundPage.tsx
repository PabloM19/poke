import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { StatusState } from '@/components/ui/status-state'

export function NotFoundPage() {
  return (
    <StatusState title="Página no encontrada" description="Error 404. La dirección que has abierto no existe en PokéApp." tone="empty" headingLevel={1}>
      <Button asChild variant="outline"><Link to="/search">Volver al inicio</Link></Button>
    </StatusState>
  )
}
