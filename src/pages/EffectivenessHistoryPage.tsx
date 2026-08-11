import { Link } from 'react-router-dom'
import { ArrowLeft, CircleDot, History } from '@/components/icons'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/button'
import { StatusState } from '@/components/ui/status-state'
import { useEffectivenessSessions } from '@/features/effectivenessQuiz'
import { GameHistoryList } from '@/features/gameSessions'

export function EffectivenessHistoryPage() {
  const sessions = useEffectivenessSessions()
  return (
    <div className="page-stack">
      <PageHeader eyebrow="¿Es eficaz?" title="Historial" description="Repasa las relaciones de tipos de cada intento guardado." actions={<Button asChild variant="outline"><Link to="/more/juegos/es-eficaz"><ArrowLeft aria-hidden />Volver al juego</Link></Button>} />
      {sessions.length === 0 ? <StatusState title="Aún no hay intentos guardados" description="Completa una partida de 10 preguntas y guárdala para verla aquí."><Button asChild><Link to="/more/juegos/es-eficaz"><CircleDot aria-hidden />Jugar ahora</Link></Button></StatusState> : <GameHistoryList sessions={sessions} basePath="/more/juegos/es-eficaz/historial" icon={History} scoreLabel={(session) => session.gameType === 'type-effectiveness' ? `${session.score}/${session.totalRounds} · ¿Es eficaz?` : `${session.score}/${session.totalRounds}`} />}
    </div>
  )
}
