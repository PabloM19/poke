import { Link } from 'react-router-dom'
import { ArrowLeft, History, Shapes } from '@/components/icons'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/button'
import { StatusState } from '@/components/ui/status-state'
import { GameHistoryList } from '@/features/gameSessions'
import { useTypeGuessSessions } from '@/features/typeGuess'

export function TypeGuessHistoryPage() {
  const sessions = useTypeGuessSessions()
  return (
    <div className="page-stack">
      <PageHeader eyebrow="Adivina el tipo" title="Historial" description="Repasa tus respuestas, las combinaciones reales y los detalles que consultaste." actions={<Button asChild variant="outline"><Link to="/more/juegos/adivina-el-tipo"><ArrowLeft aria-hidden />Volver al juego</Link></Button>} />
      {sessions.length === 0 ? (
        <StatusState title="Aún no hay intentos guardados" description="Completa una partida de 10 Pokémon y guárdala para verla aquí."><Button asChild><Link to="/more/juegos/adivina-el-tipo"><Shapes aria-hidden />Jugar ahora</Link></Button></StatusState>
      ) : (
        <GameHistoryList sessions={sessions} basePath="/more/juegos/adivina-el-tipo/historial" icon={History} scoreLabel={(session) => session.gameType === 'type-guess' ? `${session.score}/${session.totalRounds} · Adivina el tipo` : `${session.score}/${session.totalRounds}`} />
      )}
    </div>
  )
}

