import { Link } from 'react-router-dom'
import { ArrowLeft, History, Question } from '@/components/icons'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/button'
import { StatusState } from '@/components/ui/status-state'
import { GameHistoryList } from '@/features/gameSessions'
import { usePokemonSilhouetteSessions } from '@/features/pokemonSilhouette'

export function GuessPokemonHistoryPage() {
  const sessions = usePokemonSilhouetteSessions()
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="¿Quién es ese Pokémon?"
        title="Historial"
        description="Repasa siluetas, letras falladas y las pistas que utilizaste."
        actions={<Button asChild variant="outline"><Link to="/more/juegos/quien-es-ese-pokemon"><ArrowLeft aria-hidden />Volver al juego</Link></Button>}
      />
      {sessions.length === 0 ? (
        <StatusState title="Aún no hay intentos guardados" description="Completa una partida de 10 Pokémon y guárdala para verla aquí.">
          <Button asChild><Link to="/more/juegos/quien-es-ese-pokemon"><Question aria-hidden />Jugar ahora</Link></Button>
        </StatusState>
      ) : (
        <GameHistoryList
          sessions={sessions}
          basePath="/more/juegos/quien-es-ese-pokemon/historial"
          icon={History}
          scoreLabel={(session) => session.gameType === 'pokemon-silhouette' ? `${session.score}/${session.totalRounds} · ${session.points} puntos` : `${session.score}/${session.totalRounds}`}
        />
      )}
    </div>
  )
}
