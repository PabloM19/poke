import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { StatusState } from '@/components/ui/status-state'

export function ManualNotFoundPage() {
  return (
    <StatusState title="Lección no encontrada" description="Error 404. Esta dirección no corresponde a una lección del manual." tone="empty" headingLevel={1}>
      <Button asChild variant="outline"><Link to="/manuales">Volver a Manuales</Link></Button>
    </StatusState>
  )
}
