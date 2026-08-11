import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CheckCircle, Pencil, XCircle } from '@/components/icons'
import { PageHeader } from '@/components/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BentoCard } from '@/components/ui/card'
import { StatusState } from '@/components/ui/status-state'
import { getEvolutionChainSession, renameEvolutionChainSession, type EvolutionChainRound } from '@/features/evolutionChain'
import { GameResultCard, RenameAttemptDialog } from '@/features/gameSessions'

const dateTimeFormatter = new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium', timeStyle: 'short' })

function namesFor(order: readonly number[], round: EvolutionChainRound): string {
  return order.map((id) => round.pokemon.find((pokemon) => pokemon.id === id)?.name ?? 'Pokémon').join(' → ')
}

export function EvolutionChainSessionDetailPage() {
  const { sessionId = '' } = useParams()
  const [session, setSession] = useState(() => getEvolutionChainSession(sessionId))
  const [renameOpen, setRenameOpen] = useState(false)
  const [name, setName] = useState(session?.name ?? '')

  if (!session) return <StatusState title="Intento no encontrado" description="Puede que se haya borrado del almacenamiento de este dispositivo." tone="error" headingLevel={1}><Button asChild><Link to="/more/juegos/cadena-evolutiva/historial"><ArrowLeft aria-hidden />Volver al historial</Link></Button></StatusState>

  const accuracy = Math.round((session.score / session.totalRounds) * 100)
  const rename = () => {
    const updated = renameEvolutionChainSession(session.id, name)
    if (!updated) return
    setSession(updated)
    setRenameOpen(false)
  }

  return (
    <div className="page-stack">
      <PageHeader eyebrow={`${session.gameTitle} · ${dateTimeFormatter.format(session.finishedAt)}`} title={session.name} description={session.pokedexLabel} actions={<Button variant="outline" onClick={() => { setName(session.name); setRenameOpen(true) }}><Pencil aria-hidden />Editar nombre</Button>} />
      <GameResultCard result={<>{session.score}/{session.totalRounds}</>} subtitle="familias bien ordenadas" metrics={[{ label: 'Precisión', value: `${accuracy} %` }, { label: 'Mejor racha', value: session.bestStreak }]} />
      <section aria-labelledby="evolution-review-title">
        <h2 id="evolution-review-title" className="mb-3 text-xl font-semibold">Rondas</h2>
        <div className="grid gap-3">
          {session.rounds.map((round) => (
            <BentoCard key={round.index} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Ronda {round.index}</p>
                <Badge variant={round.correct ? 'secondary' : 'outline'}>{round.correct ? <CheckCircle aria-hidden /> : <XCircle aria-hidden />}{round.correct ? 'Correcto' : 'Incorrecto'}</Badge>
              </div>
              <div className="mt-3 flex items-center justify-center gap-1.5 overflow-hidden" aria-hidden>
                {round.correctOrder.map((id, index) => {
                  const pokemon = round.pokemon.find((entry) => entry.id === id)
                  return <span key={id} className="contents">{index > 0 && <ArrowRight className="size-4 shrink-0 text-muted-foreground" />}{pokemon?.sprite ? <img src={pokemon.sprite} alt="" className="size-14 min-w-0 object-contain" /> : <span className="flex size-14 items-center justify-center rounded-lg bg-secondary font-bold">?</span>}</span>
                })}
              </div>
              <dl className="mt-3 grid gap-2 text-sm">
                {!round.correct && <div><dt className="text-xs text-muted-foreground">Tu orden</dt><dd className="mt-0.5 font-medium">{namesFor(round.selectedOrder, round)}</dd></div>}
                <div><dt className="text-xs text-muted-foreground">Orden correcto</dt><dd className="mt-0.5 font-semibold">{namesFor(round.correctOrder, round)}</dd></div>
              </dl>
              {round.pokemon.some((pokemon) => pokemon.method) && <ul className="mt-3 grid gap-1 border-t border-border/70 pt-3 text-xs text-muted-foreground">{round.pokemon.slice(1).map((pokemon) => <li key={pokemon.id}><strong className="text-foreground">{pokemon.name}:</strong> {pokemon.method ?? 'Método especial'}</li>)}</ul>}
            </BentoCard>
          ))}
        </div>
      </section>
      <Button asChild variant="outline"><Link to="/more/juegos/cadena-evolutiva/historial"><ArrowLeft aria-hidden />Volver al historial</Link></Button>
      <RenameAttemptDialog open={renameOpen} onOpenChange={setRenameOpen} value={name} onValueChange={setName} onSave={rename} />
    </div>
  )
}
