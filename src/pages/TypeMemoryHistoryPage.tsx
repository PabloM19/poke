import { Link } from 'react-router-dom'
import { ArrowLeft, Grid3X3, History } from '@/components/icons'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/button'
import { StatusState } from '@/components/ui/status-state'
import { GameHistoryList } from '@/features/gameSessions'
import { formatMemoryDuration, TYPE_MEMORY_DIFFICULTIES, useTypeMemorySessions } from '@/features/typeMemory'

export function TypeMemoryHistoryPage() {
  const sessions = useTypeMemorySessions()
  return (
    <div className="page-stack">
      <PageHeader eyebrow="Memoria de tipos" title="Historial" description="Revisa las dificultades, tipos, intentos y tiempos de tus tableros." actions={<Button asChild variant="outline"><Link to="/more/juegos/memoria-tipos"><ArrowLeft aria-hidden />Volver al juego</Link></Button>} />
      {sessions.length === 0 ? (
        <StatusState title="Aún no hay intentos guardados" description="Completa un tablero y guárdalo para verlo aquí."><Button asChild><Link to="/more/juegos/memoria-tipos"><Grid3X3 aria-hidden />Jugar ahora</Link></Button></StatusState>
      ) : (
        <GameHistoryList
          sessions={sessions}
          basePath="/more/juegos/memoria-tipos/historial"
          icon={History}
          scoreLabel={(session) => session.gameType === 'type-memory'
            ? `${TYPE_MEMORY_DIFFICULTIES[session.difficulty].label} · ${session.pairCount} parejas · ${session.attempts} intentos · ${formatMemoryDuration(session.durationMs)}`
            : `${session.score}/${session.totalRounds}`}
        />
      )}
    </div>
  )
}
