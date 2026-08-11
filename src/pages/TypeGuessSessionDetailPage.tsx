import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle, Eye, Pencil, XCircle } from '@/components/icons'
import { PageHeader } from '@/components/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BentoCard } from '@/components/ui/card'
import { StatusState } from '@/components/ui/status-state'
import { RenameAttemptDialog } from '@/features/gameSessions'
import { getTypeGuessSession, renameTypeGuessSession } from '@/features/typeGuess'
import { TypeChip } from '@/features/types'

const dateTimeFormatter = new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium', timeStyle: 'short' })

export function TypeGuessSessionDetailPage() {
  const { sessionId = '' } = useParams()
  const [session, setSession] = useState(() => getTypeGuessSession(sessionId))
  const [renameOpen, setRenameOpen] = useState(false)
  const [name, setName] = useState(session?.name ?? '')

  if (!session) {
    return <StatusState title="Intento no encontrado" description="Puede que se haya borrado del almacenamiento de este dispositivo." tone="error" headingLevel={1}><Button asChild><Link to="/more/juegos/adivina-el-tipo/historial"><ArrowLeft aria-hidden />Volver al historial</Link></Button></StatusState>
  }

  const accuracy = Math.round((session.score / session.totalRounds) * 100)
  const rename = () => {
    const updated = renameTypeGuessSession(session.id, name)
    if (!updated) return
    setSession(updated)
    setRenameOpen(false)
  }

  return (
    <div className="page-stack">
      <PageHeader eyebrow={`${session.gameTitle} · ${dateTimeFormatter.format(session.finishedAt)}`} title={session.name} description={session.pokedexLabel} actions={<Button variant="outline" onClick={() => { setName(session.name); setRenameOpen(true) }}><Pencil aria-hidden />Editar nombre</Button>} />
      <BentoCard tone="green" className="grid grid-cols-4 gap-2 p-4 text-center">
        <div><strong className="block text-lg tabular-nums">{session.score}/{session.totalRounds}</strong><span className="text-[0.6875rem] text-muted-foreground">Resultado</span></div>
        <div><strong className="block text-lg tabular-nums">{session.bestStreak}</strong><span className="text-[0.6875rem] text-muted-foreground">Racha</span></div>
        <div><strong className="block text-lg tabular-nums">{session.withoutDetails}</strong><span className="text-[0.6875rem] text-muted-foreground">Sin detalles</span></div>
        <div><strong className="block text-lg tabular-nums">{accuracy} %</strong><span className="text-[0.6875rem] text-muted-foreground">Precisión</span></div>
      </BentoCard>

      <section aria-labelledby="type-guess-review-title">
        <h2 id="type-guess-review-title" className="mb-3 text-xl font-semibold">Rondas</h2>
        <div className="grid gap-3">
          {session.rounds.map((round) => (
            <BentoCard key={round.index} className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex size-16 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-secondary/70">{round.pokemon.sprite ? <img src={round.pokemon.sprite} alt="" className="size-14 object-contain" /> : <span className="font-bold" aria-hidden>?</span>}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div><p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Ronda {round.index}</p><h3 className="mt-1 font-bold">{round.pokemon.name}</h3></div>
                    <Badge variant={round.result === 'correct' ? 'secondary' : 'outline'}>
                      {round.result === 'correct' ? <CheckCircle aria-hidden /> : round.result === 'partial' ? <Eye aria-hidden /> : <XCircle aria-hidden />}
                      {round.result === 'correct' ? 'Correcto' : round.result === 'partial' ? 'Parcial' : 'Incorrecto'}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="mt-3 grid gap-3 text-sm">
                <div><p className="mb-1 text-xs text-muted-foreground">Tu respuesta</p><div className="flex flex-wrap gap-1.5">{round.selectedTypes.map((type) => <TypeChip key={type} type={type} size="compact" />)}</div></div>
                {round.result !== 'correct' && <div><p className="mb-1 text-xs text-muted-foreground">Respuesta correcta</p><div className="flex flex-wrap gap-1.5">{round.pokemon.actualTypes.map((type) => <TypeChip key={type} type={type} size="compact" />)}</div></div>}
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">{round.hintUsed ? <Eye aria-hidden /> : <CheckCircle aria-hidden />}{round.hintUsed ? 'Consultaste los detalles.' : 'No consultaste los detalles.'}</p>
              </div>
            </BentoCard>
          ))}
        </div>
      </section>
      <Button asChild variant="outline"><Link to="/more/juegos/adivina-el-tipo/historial"><ArrowLeft aria-hidden />Volver al historial</Link></Button>
      <RenameAttemptDialog open={renameOpen} onOpenChange={setRenameOpen} value={name} onValueChange={setName} onSave={rename} />
    </div>
  )
}

