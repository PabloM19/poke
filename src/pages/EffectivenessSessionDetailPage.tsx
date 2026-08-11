import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CheckCircle, Pencil, XCircle } from '@/components/icons'
import { PageHeader } from '@/components/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BentoCard } from '@/components/ui/card'
import { StatusState } from '@/components/ui/status-state'
import { answerForMultiplier, effectivenessAnswerLabel, effectivenessMultiplierLabel, getEffectivenessSession, renameEffectivenessSession } from '@/features/effectivenessQuiz'
import { GameResultCard, RenameAttemptDialog } from '@/features/gameSessions'
import { TypeChip } from '@/features/types'

const dateTimeFormatter = new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium', timeStyle: 'short' })

export function EffectivenessSessionDetailPage() {
  const { sessionId = '' } = useParams()
  const [session, setSession] = useState(() => getEffectivenessSession(sessionId))
  const [renameOpen, setRenameOpen] = useState(false)
  const [name, setName] = useState(session?.name ?? '')

  if (!session) return <StatusState title="Intento no encontrado" description="Puede que se haya borrado del almacenamiento de este dispositivo." tone="error" headingLevel={1}><Button asChild><Link to="/more/juegos/es-eficaz/historial"><ArrowLeft aria-hidden />Volver al historial</Link></Button></StatusState>

  const accuracy = Math.round((session.score / session.totalRounds) * 100)
  const rename = () => {
    const updated = renameEffectivenessSession(session.id, name)
    if (!updated) return
    setSession(updated)
    setRenameOpen(false)
  }

  return (
    <div className="page-stack">
      <PageHeader eyebrow={`${session.gameTitle} · ${dateTimeFormatter.format(session.finishedAt)}`} title={session.name} description={session.pokedexLabel} actions={<Button variant="outline" onClick={() => { setName(session.name); setRenameOpen(true) }}><Pencil aria-hidden />Editar nombre</Button>} />
      <GameResultCard result={<>{session.score}/{session.totalRounds}</>} subtitle="respuestas correctas" metrics={[{ label: 'Precisión', value: `${accuracy} %` }, { label: 'Mejor racha', value: session.bestStreak }]} />
      <section aria-labelledby="effectiveness-review-title">
        <h2 id="effectiveness-review-title" className="mb-3 text-xl font-semibold">Rondas</h2>
        <div className="grid gap-3">
          {session.rounds.map((round) => (
            <BentoCard key={round.index} className="p-4">
              <div className="flex items-start justify-between gap-3"><p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Ronda {round.index}</p><Badge variant={round.correct ? 'secondary' : 'outline'}>{round.correct ? <CheckCircle aria-hidden /> : <XCircle aria-hidden />}{round.correct ? 'Correcto' : 'Incorrecto'}</Badge></div>
              <div className="mt-3 flex flex-wrap items-center gap-2"><TypeChip type={round.attackingType} size="compact" /><ArrowRight className="size-4 text-muted-foreground" aria-hidden /><TypeChip type={round.defendingType} size="compact" /><strong className="ml-auto tabular-nums">{effectivenessMultiplierLabel(round.multiplier)}</strong></div>
              <dl className="mt-3 grid gap-1 text-sm"><div><dt className="inline text-muted-foreground">Tu respuesta: </dt><dd className="inline font-semibold">{effectivenessAnswerLabel(round.selectedAnswer)}</dd></div>{!round.correct && <div><dt className="inline text-muted-foreground">Respuesta correcta: </dt><dd className="inline font-semibold">{effectivenessAnswerLabel(answerForMultiplier(round.multiplier))}</dd></div>}</dl>
            </BentoCard>
          ))}
        </div>
      </section>
      <Button asChild variant="outline"><Link to="/more/juegos/es-eficaz/historial"><ArrowLeft aria-hidden />Volver al historial</Link></Button>
      <RenameAttemptDialog open={renameOpen} onOpenChange={setRenameOpen} value={name} onValueChange={setName} onSave={rename} />
    </div>
  )
}
