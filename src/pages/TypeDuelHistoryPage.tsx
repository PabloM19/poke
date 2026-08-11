import { Link } from 'react-router-dom'
import { ArrowLeft, History, Sword } from '@/components/icons'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/button'
import { StatusState } from '@/components/ui/status-state'
import { GameHistoryList } from '@/features/gameSessions'
import { useTypeDuelSessions } from '@/features/typeDuel'

export function TypeDuelHistoryPage() {
  const sessions = useTypeDuelSessions()
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Duelo de tipos"
        title="Historial"
        description="Revisa tus intentos guardados y aprende de cada enfrentamiento."
        actions={<Button asChild variant="outline"><Link to="/more/juegos/duelo-tipos"><ArrowLeft aria-hidden />Volver al juego</Link></Button>}
      />
      {sessions.length === 0 ? (
        <StatusState title="Aún no hay intentos guardados" description="Completa una partida de 10 rondas y guárdala para verla aquí.">
          <Button asChild><Link to="/more/juegos/duelo-tipos"><Sword aria-hidden />Jugar ahora</Link></Button>
        </StatusState>
      ) : (
        <GameHistoryList sessions={sessions} basePath="/more/juegos/duelo-tipos/historial" icon={History} />
      )}
    </div>
  )
}
