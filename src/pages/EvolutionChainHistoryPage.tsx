import { Link } from 'react-router-dom'
import { ArrowLeft, Dna, History } from '@/components/icons'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/button'
import { StatusState } from '@/components/ui/status-state'
import { useEvolutionChainSessions } from '@/features/evolutionChain'
import { GameHistoryList } from '@/features/gameSessions'

export function EvolutionChainHistoryPage() {
  const sessions = useEvolutionChainSessions()
  return (
    <div className="page-stack">
      <PageHeader eyebrow="Cadena evolutiva" title="Historial" description="Repasa el orden correcto de cada familia y los métodos de evolución." actions={<Button asChild variant="outline"><Link to="/more/juegos/cadena-evolutiva"><ArrowLeft aria-hidden />Volver al juego</Link></Button>} />
      {sessions.length === 0 ? (
        <StatusState title="Aún no hay intentos guardados" description="Completa una partida de 10 familias y guárdala para verla aquí."><Button asChild><Link to="/more/juegos/cadena-evolutiva"><Dna aria-hidden />Jugar ahora</Link></Button></StatusState>
      ) : (
        <GameHistoryList sessions={sessions} basePath="/more/juegos/cadena-evolutiva/historial" icon={History} scoreLabel={(session) => session.gameType === 'evolution-chain' ? `${session.score}/${session.totalRounds} · Cadena evolutiva` : `${session.score}/${session.totalRounds}`} />
      )}
    </div>
  )
}
