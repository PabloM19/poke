import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle, Lightbulb, Pencil, XCircle } from '@/components/icons'
import { PageHeader } from '@/components/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BentoCard } from '@/components/ui/card'
import { StatusState } from '@/components/ui/status-state'
import { RenameAttemptDialog } from '@/features/gameSessions'
import { getPokemonSilhouetteSession, renamePokemonSilhouetteSession } from '@/features/pokemonSilhouette'
import { TypeChip } from '@/features/types'

const dateTimeFormatter = new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium', timeStyle: 'short' })

export function GuessPokemonSessionDetailPage() {
  const { sessionId = '' } = useParams()
  const [session, setSession] = useState(() => getPokemonSilhouetteSession(sessionId))
  const [renameOpen, setRenameOpen] = useState(false)
  const [name, setName] = useState(session?.name ?? '')

  if (!session) {
    return (
      <StatusState title="Intento no encontrado" description="Puede que se haya borrado del almacenamiento de este dispositivo." tone="error" headingLevel={1}>
        <Button asChild><Link to="/more/juegos/quien-es-ese-pokemon/historial"><ArrowLeft aria-hidden />Volver al historial</Link></Button>
      </StatusState>
    )
  }

  const accuracy = Math.round((session.score / session.totalRounds) * 100)
  const rename = () => {
    const updated = renamePokemonSilhouetteSession(session.id, name)
    if (!updated) return
    setSession(updated)
    setRenameOpen(false)
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow={`${session.gameTitle} · ${dateTimeFormatter.format(session.finishedAt)}`}
        title={session.name}
        description={session.pokedexLabel}
        actions={<Button variant="outline" onClick={() => { setName(session.name); setRenameOpen(true) }}><Pencil aria-hidden />Editar nombre</Button>}
      />

      <BentoCard tone="green" className="grid grid-cols-4 gap-2 p-4 text-center">
        <div><strong className="block text-lg tabular-nums">{session.score}/{session.totalRounds}</strong><span className="text-[0.6875rem] text-muted-foreground">Resultado</span></div>
        <div><strong className="block text-lg tabular-nums">{session.points}</strong><span className="text-[0.6875rem] text-muted-foreground">Puntos</span></div>
        <div><strong className="block text-lg tabular-nums">{session.bestStreak}</strong><span className="text-[0.6875rem] text-muted-foreground">Racha</span></div>
        <div><strong className="block text-lg tabular-nums">{accuracy} %</strong><span className="text-[0.6875rem] text-muted-foreground">Precisión</span></div>
      </BentoCard>

      <section aria-labelledby="silhouette-round-review-title">
        <h2 id="silhouette-round-review-title" className="mb-3 text-xl font-semibold">Rondas</h2>
        <div className="grid gap-3">
          {session.rounds.map((round) => (
            <BentoCard key={round.index} className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex size-16 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-ui-blue/45">
                  {round.pokemon.sprite ? <img src={round.pokemon.sprite} alt="" className="size-14 object-contain" /> : <span className="font-bold" aria-hidden>?</span>}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div><p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Ronda {round.index}</p><h3 className="mt-1 font-bold">{round.pokemon.name}</h3></div>
                    <Badge variant={round.result === 'solved' ? 'secondary' : 'outline'}>
                      {round.result === 'solved' ? <CheckCircle aria-hidden /> : <XCircle aria-hidden />}
                      {round.result === 'solved' ? 'Correcto' : 'No resuelto'}
                    </Badge>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1">{round.pokemon.types.map((type) => <TypeChip key={type} type={type} size="compact" />)}</div>
                </div>
              </div>
              <dl className="mt-3 grid gap-1 text-sm">
                <div><dt className="inline text-muted-foreground">Fallos: </dt><dd className="inline font-semibold">{round.errors}</dd></div>
                <div><dt className="inline text-muted-foreground">Puntos: </dt><dd className="inline font-semibold">{round.points}</dd></div>
                {round.incorrectLetters.length > 0 && <div><dt className="inline text-muted-foreground">Letras falladas: </dt><dd className="inline font-semibold">{round.incorrectLetters.join(' · ')}</dd></div>}
                {round.fullGuesses.length > 0 && <div><dt className="inline text-muted-foreground">Nombres probados: </dt><dd className="inline font-semibold">{round.fullGuesses.join(' · ')}</dd></div>}
              </dl>
              {round.hints.length > 0 && (
                <div className="mt-3 border-t border-border pt-3">
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground"><Lightbulb aria-hidden />Pistas utilizadas</p>
                  <div className="flex flex-wrap gap-1.5">
                    {round.hints.map((hint, index) => hint.kind === 'type'
                      ? <TypeChip key={`${hint.kind}-${index}`} type={hint.type} size="compact" />
                      : <Badge key={`${hint.kind}-${index}`} variant="outline">{hint.label}: {hint.value}</Badge>)}
                  </div>
                </div>
              )}
            </BentoCard>
          ))}
        </div>
      </section>

      <Button asChild variant="outline"><Link to="/more/juegos/quien-es-ese-pokemon/historial"><ArrowLeft aria-hidden />Volver al historial</Link></Button>

      <RenameAttemptDialog open={renameOpen} onOpenChange={setRenameOpen} value={name} onValueChange={setName} onSave={rename} />
    </div>
  )
}
