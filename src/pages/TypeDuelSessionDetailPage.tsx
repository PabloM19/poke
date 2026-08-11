import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle, Pencil, XCircle } from '@/components/icons'
import { PageHeader } from '@/components/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BentoCard } from '@/components/ui/card'
import { StatusState } from '@/components/ui/status-state'
import { RenameAttemptDialog } from '@/features/gameSessions'
import { TypeMatchupExplanation } from '@/features/typeDuel/TypeMatchupExplanation'
import { getTypeDuelSession, renameTypeDuelSession, type TypeDuelAnswer, type TypeDuelRound } from '@/features/typeDuel'

const dateTimeFormatter = new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium', timeStyle: 'short' })

function answerLabel(answer: TypeDuelAnswer, round: TypeDuelRound): string {
  if (answer === 'left') return round.left.name
  if (answer === 'right') return round.right.name
  return 'Neutral'
}

export function TypeDuelSessionDetailPage() {
  const { sessionId = '' } = useParams()
  const [session, setSession] = useState(() => getTypeDuelSession(sessionId))
  const [renameOpen, setRenameOpen] = useState(false)
  const [name, setName] = useState(session?.name ?? '')

  if (!session) {
    return (
      <StatusState title="Intento no encontrado" description="Puede que se haya borrado del almacenamiento de este dispositivo." tone="error" headingLevel={1}>
        <Button asChild><Link to="/more/juegos/duelo-tipos/historial"><ArrowLeft aria-hidden />Volver al historial</Link></Button>
      </StatusState>
    )
  }

  const accuracy = Math.round((session.score / session.totalRounds) * 100)
  const rename = () => {
    const updated = renameTypeDuelSession(session.id, name)
    if (!updated) return
    setSession(updated)
    setRenameOpen(false)
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow={`${session.gameTitle} · ${dateTimeFormatter.format(session.finishedAt)}`}
        title={session.name}
        description={`${session.pokedexLabel} · Modo ${session.mode === 'learn' ? 'Aprender' : 'Normal'}`}
        actions={<Button variant="outline" onClick={() => {
          setName(session.name)
          setRenameOpen(true)
        }}><Pencil aria-hidden />Editar nombre</Button>}
      />

      <BentoCard tone="green" className="grid grid-cols-3 gap-3 p-4 text-center">
        <div><strong className="block text-xl tabular-nums">{session.score}/{session.totalRounds}</strong><span className="text-xs text-muted-foreground">Resultado</span></div>
        <div><strong className="block text-xl tabular-nums">{session.bestStreak}</strong><span className="text-xs text-muted-foreground">Mejor racha</span></div>
        <div><strong className="block text-xl tabular-nums">{accuracy} %</strong><span className="text-xs text-muted-foreground">Precisión</span></div>
      </BentoCard>

      <section aria-labelledby="round-review-title">
        <h2 id="round-review-title" className="mb-3 text-xl font-semibold">Rondas</h2>
        <div className="grid gap-3">
          {session.rounds.map((round) => (
            <BentoCard key={round.index} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Ronda {round.index}</p>
                  <h3 className="mt-1 font-bold">{round.left.name} <span className="font-medium text-muted-foreground">vs</span> {round.right.name}</h3>
                </div>
                <Badge variant={round.isCorrect ? 'secondary' : 'outline'}>
                  {round.isCorrect ? <CheckCircle aria-hidden /> : <XCircle aria-hidden />}
                  {round.isCorrect ? 'Correcto' : 'Fallo'}
                </Badge>
              </div>
              <dl className="mt-3 grid gap-1 text-sm">
                <div><dt className="inline text-muted-foreground">Tu respuesta: </dt><dd className="inline font-semibold">{answerLabel(round.userAnswer, round)}</dd></div>
                {!round.isCorrect && <div><dt className="inline text-muted-foreground">Ventaja: </dt><dd className="inline font-semibold">{answerLabel(round.correctAnswer, round)}</dd></div>}
              </dl>
              <div className="mt-3 border-t border-border pt-3">
                {round.correctAnswer === 'neutral' && (
                  <p className="mb-2 text-xs font-medium text-muted-foreground">Ambos alcanzaron el mismo multiplicador máximo.</p>
                )}
                <TypeMatchupExplanation left={round.left} right={round.right} leftBest={round.leftBest} rightBest={round.rightBest} />
              </div>
            </BentoCard>
          ))}
        </div>
      </section>

      <Button asChild variant="outline"><Link to="/more/juegos/duelo-tipos/historial"><ArrowLeft aria-hidden />Volver al historial</Link></Button>

      <RenameAttemptDialog open={renameOpen} onOpenChange={setRenameOpen} value={name} onValueChange={setName} onSave={rename} />
    </div>
  )
}
