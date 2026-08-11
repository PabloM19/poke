import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle, Pencil, XCircle } from '@/components/icons'
import { PageHeader } from '@/components/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BentoCard } from '@/components/ui/card'
import { StatusState } from '@/components/ui/status-state'
import { GameResultCard, RenameAttemptDialog } from '@/features/gameSessions'
import { getPokemonIntruderSession, renamePokemonIntruderSession } from '@/features/pokemonIntruder'
import { TypeChip } from '@/features/types'

const dateTimeFormatter = new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium', timeStyle: 'short' })

export function PokemonIntruderSessionDetailPage() {
  const { sessionId = '' } = useParams()
  const [session, setSession] = useState(() => getPokemonIntruderSession(sessionId))
  const [renameOpen, setRenameOpen] = useState(false)
  const [name, setName] = useState(session?.name ?? '')

  if (!session) return <StatusState title="Intento no encontrado" description="Puede que se haya borrado del almacenamiento de este dispositivo." tone="error" headingLevel={1}><Button asChild><Link to="/more/juegos/pokemon-intruso/historial"><ArrowLeft aria-hidden />Volver al historial</Link></Button></StatusState>

  const accuracy = Math.round((session.score / session.totalRounds) * 100)
  const rename = () => {
    const updated = renamePokemonIntruderSession(session.id, name)
    if (!updated) return
    setSession(updated)
    setRenameOpen(false)
  }

  return (
    <div className="page-stack">
      <PageHeader eyebrow={`${session.gameTitle} · ${dateTimeFormatter.format(session.finishedAt)}`} title={session.name} description={session.pokedexLabel} actions={<Button variant="outline" onClick={() => { setName(session.name); setRenameOpen(true) }}><Pencil aria-hidden />Editar nombre</Button>} />
      <GameResultCard result={<>{session.score}/{session.totalRounds}</>} subtitle="intrusos encontrados" metrics={[{ label: 'Precisión', value: `${accuracy} %` }, { label: 'Mejor racha', value: session.bestStreak }]} />
      <section aria-labelledby="intruder-review-title">
        <h2 id="intruder-review-title" className="mb-3 text-xl font-semibold">Rondas</h2>
        <div className="grid gap-3">
          {session.rounds.map((round) => {
            const selected = round.pokemon.find((pokemon) => pokemon.id === round.selectedId)
            const intruder = round.pokemon.find((pokemon) => pokemon.id === round.intruderId)
            return (
              <BentoCard key={round.index} className="p-4">
                <div className="flex items-start justify-between gap-3"><p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Ronda {round.index}</p><Badge variant={round.correct ? 'secondary' : 'outline'}>{round.correct ? <CheckCircle aria-hidden /> : <XCircle aria-hidden />}{round.correct ? 'Correcto' : 'Incorrecto'}</Badge></div>
                <div className="mt-3 grid grid-cols-4 gap-1.5">{round.pokemon.map((pokemon) => <div key={pokemon.id} className="min-w-0 text-center"><span className="mx-auto flex aspect-square items-center justify-center rounded-[var(--radius-sm)] bg-secondary/70">{pokemon.sprite ? <img src={pokemon.sprite} alt="" className="size-full object-contain" /> : <span className="font-bold">?</span>}</span><span className="mt-1 block truncate text-[0.6875rem] font-semibold">{pokemon.name}</span></div>)}</div>
                <dl className="mt-3 grid gap-1.5 text-sm"><div><dt className="inline text-muted-foreground">Elegiste: </dt><dd className="inline font-semibold">{selected?.name ?? 'Pokémon'}</dd></div>{!round.correct && <div><dt className="inline text-muted-foreground">Intruso: </dt><dd className="inline font-semibold">{intruder?.name ?? 'Pokémon'}</dd></div>}</dl>
                <div className="mt-3 flex items-center gap-2 border-t border-border/70 pt-3 text-xs text-muted-foreground"><span>Tipo compartido:</span><TypeChip type={round.criterion.type} size="compact" /></div>
              </BentoCard>
            )
          })}
        </div>
      </section>
      <Button asChild variant="outline"><Link to="/more/juegos/pokemon-intruso/historial"><ArrowLeft aria-hidden />Volver al historial</Link></Button>
      <RenameAttemptDialog open={renameOpen} onOpenChange={setRenameOpen} value={name} onValueChange={setName} onSave={rename} />
    </div>
  )
}
