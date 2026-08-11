import { Link } from 'react-router-dom'
import { ArrowLeft, History, Question } from '@/components/icons'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/button'
import { StatusState } from '@/components/ui/status-state'
import { GameHistoryList } from '@/features/gameSessions'
import { usePokemonIntruderSessions } from '@/features/pokemonIntruder'

export function PokemonIntruderHistoryPage() {
  const sessions = usePokemonIntruderSessions()
  return (
    <div className="page-stack">
      <PageHeader eyebrow="Pokémon intruso" title="Historial" description="Repasa cada grupo, tu elección y el tipo que compartían los demás." actions={<Button asChild variant="outline"><Link to="/more/juegos/pokemon-intruso"><ArrowLeft aria-hidden />Volver al juego</Link></Button>} />
      {sessions.length === 0 ? (
        <StatusState title="Aún no hay intentos guardados" description="Completa una partida de 10 grupos y guárdala para verla aquí."><Button asChild><Link to="/more/juegos/pokemon-intruso"><Question aria-hidden />Jugar ahora</Link></Button></StatusState>
      ) : (
        <GameHistoryList sessions={sessions} basePath="/more/juegos/pokemon-intruso/historial" icon={History} scoreLabel={(session) => session.gameType === 'pokemon-intruder' ? `${session.score}/${session.totalRounds} · Pokémon intruso` : `${session.score}/${session.totalRounds}`} />
      )}
    </div>
  )
}
