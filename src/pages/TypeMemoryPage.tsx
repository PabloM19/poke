import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle, Grid3X3, History, Play, RefreshCw, Save } from '@/components/icons'
import { PageHeader } from '@/components/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BentoCard } from '@/components/ui/card'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { GamePreparationCard, GameResultCard, SaveAttemptDialog } from '@/features/gameSessions'
import { useGameContext, type GameSelection } from '@/features/games'
import {
  createTypeMemoryBoard,
  cardsFormMemoryPair,
  createTypeMemorySessionId,
  nextTypeMemoryAttemptName,
  saveTypeMemorySession,
  TYPE_MEMORY_DIFFICULTIES,
  type TypeMemoryCard,
  type TypeMemoryDifficulty,
  type TypeMemorySession,
  type TypeMemoryTurn,
  formatMemoryDuration,
} from '@/features/typeMemory'
import { getPokemonTypeStyle, TypeSymbol } from '@/features/types'
import { cn } from '@/lib/utils'

type Stage = 'setup' | 'playing' | 'summary'
type ConfirmAction = 'leave' | 'restart'

interface GameScope {
  activeGameId: GameSelection
  gameTitle: string
  pokedexLabel: string
  generation: 4 | 5
}

interface PlayState {
  id: string
  scope: GameScope
  difficulty: TypeMemoryDifficulty
  cards: readonly TypeMemoryCard[]
  types: TypeMemorySession['typesUsed']
  startedAt: number
  finishedAt: number | null
  revealedIds: readonly string[]
  matchedTypes: TypeMemorySession['typesUsed']
  attempts: number
  turns: readonly TypeMemoryTurn[]
  streak: number
  bestStreak: number
}

function currentTimestamp(): number {
  return Date.now()
}

function MemoryCard({ card, position, revealed, matched, locked, onOpen }: {
  card: TypeMemoryCard
  position: number
  revealed: boolean
  matched: boolean
  locked: boolean
  onOpen: () => void
}) {
  const definition = getPokemonTypeStyle(card.type)!
  const label = !revealed
    ? `Carta boca abajo, posición ${position}`
    : `${card.kind === 'name' ? `Nombre ${definition.label}` : `Símbolo del tipo ${definition.label}`}${matched ? ', pareja encontrada' : ''}`
  const faceStyle = { backgroundColor: definition.solid, color: definition.foreground } satisfies CSSProperties

  return (
    <button
      type="button"
      aria-label={label}
      disabled={locked || matched}
      onClick={onOpen}
      className={cn(
        'group relative aspect-square min-h-16 w-full rounded-[var(--radius-md)] outline-none [perspective:900px] focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:ring-offset-2 disabled:opacity-100',
        !locked && !matched && 'cursor-pointer active:scale-[0.98]',
      )}
    >
      <span className={cn(
        'absolute inset-0 rounded-[inherit] transition-transform duration-300 [transform-style:preserve-3d] motion-reduce:transform-none motion-reduce:transition-opacity',
        revealed && '[transform:rotateY(180deg)]',
      )}>
        <span className={cn(
          'absolute inset-0 flex items-center justify-center rounded-[inherit] border border-border bg-card text-muted-foreground shadow-[var(--shadow-sm)] transition-[box-shadow,background-color] [-webkit-backface-visibility:hidden] [backface-visibility:hidden]',
          !locked && 'group-hover:bg-accent/35 group-active:shadow-[var(--shadow-xs)]',
          revealed && 'motion-reduce:pointer-events-none motion-reduce:opacity-0',
        )} aria-hidden>
          <span className="flex size-9 items-center justify-center rounded-full border border-border/75 bg-secondary/70 text-lg font-black shadow-[var(--shadow-xs)]">?</span>
        </span>
        <span
          className={cn(
            'absolute inset-0 flex flex-col items-center justify-center overflow-hidden rounded-[inherit] border border-white/30 p-1.5 text-center shadow-[var(--shadow-xs)] [transform:rotateY(180deg)] [-webkit-backface-visibility:hidden] [backface-visibility:hidden] motion-reduce:transform-none motion-reduce:opacity-0',
            revealed && 'motion-reduce:opacity-100',
            matched && 'saturate-[0.72] ring-2 ring-ui-green-strong/55 ring-inset',
          )}
          style={faceStyle}
          aria-hidden={!revealed}
        >
          {revealed && (card.kind === 'symbol'
            ? <TypeSymbol type={card.type} className="size-8 sm:size-10" aria-hidden />
            : <strong className="max-w-full text-[0.64rem] leading-tight font-black tracking-[0.04em] uppercase sm:text-sm">{definition.label}</strong>)}
          {matched && <span className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-card text-ui-green-strong shadow-[var(--shadow-xs)]"><CheckCircle className="size-4" weight="fill" aria-hidden /></span>}
          {matched && <span className="sr-only">Pareja encontrada</span>}
        </span>
      </span>
    </button>
  )
}

function DifficultyPicker({ value, onChange }: { value: TypeMemoryDifficulty; onChange: (value: TypeMemoryDifficulty) => void }) {
  return (
    <section aria-labelledby="memory-difficulty-title">
      <h2 id="memory-difficulty-title" className="mb-3 text-sm font-semibold">Dificultad</h2>
      <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Dificultad">
        {(Object.entries(TYPE_MEMORY_DIFFICULTIES) as [TypeMemoryDifficulty, (typeof TYPE_MEMORY_DIFFICULTIES)[TypeMemoryDifficulty]][]).map(([id, option]) => (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={value === id}
            onClick={() => onChange(id)}
            className={cn(
              'interactive-clay min-h-20 rounded-[var(--radius-lg)] border bg-card px-2 py-3 text-center shadow-[var(--shadow-xs)] outline-none focus-visible:ring-3 focus-visible:ring-ring/35',
              value === id && 'border-ui-lavender-strong/45 bg-ui-lavender/45 ring-2 ring-ui-lavender-strong/20',
            )}
          >
            <strong className="block text-sm">{option.label}</strong>
            <span className="mt-1 block text-[0.68rem] leading-tight text-muted-foreground">{option.pairCount} parejas</span>
          </button>
        ))}
      </div>
    </section>
  )
}

export function TypeMemoryPage() {
  const { game, selection, isAll } = useGameContext()
  const [stage, setStage] = useState<Stage>('setup')
  const [difficulty, setDifficulty] = useState<TypeMemoryDifficulty>('easy')
  const [play, setPlay] = useState<PlayState | null>(null)
  const [saveOpen, setSaveOpen] = useState(false)
  const [attemptName, setAttemptName] = useState('')
  const [saveError, setSaveError] = useState<string | null>(null)
  const [savedSession, setSavedSession] = useState<TypeMemorySession | null>(null)
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null)
  const [locked, setLocked] = useState(false)
  const [feedback, setFeedback] = useState('Toca dos cartas para compararlas.')
  const firstCard = useRef<TypeMemoryCard | null>(null)
  const interactionLocked = useRef(false)
  const mismatchTimer = useRef<number | null>(null)
  const completionTimer = useRef<number | null>(null)

  useEffect(() => () => {
    if (mismatchTimer.current != null) window.clearTimeout(mismatchTimer.current)
    if (completionTimer.current != null) window.clearTimeout(completionTimer.current)
  }, [])

  const currentScope: GameScope = {
    activeGameId: selection,
    gameTitle: isAll ? 'Todos los juegos' : game.title,
    pokedexLabel: `Tabla de tipos · Generación ${isAll || game.generation === 5 ? 'V' : 'IV'}`,
    generation: isAll ? 5 : game.generation,
  }

  const startGame = (selectedDifficulty = difficulty) => {
    const board = createTypeMemoryBoard(currentScope.generation, selectedDifficulty)
    const startedAt = Date.now()
    firstCard.current = null
    interactionLocked.current = false
    setLocked(false)
    setFeedback('Toca dos cartas para compararlas.')
    setSavedSession(null)
    setPlay({
      id: createTypeMemorySessionId(startedAt), scope: currentScope, difficulty: selectedDifficulty,
      cards: board.cards, types: board.types, startedAt, finishedAt: null, revealedIds: [], matchedTypes: [],
      attempts: 0, turns: [], streak: 0, bestStreak: 0,
    })
    setStage('playing')
  }

  const openCard = (card: TypeMemoryCard) => {
    if (!play || interactionLocked.current || play.revealedIds.includes(card.id) || play.matchedTypes.includes(card.type)) return
    if (!firstCard.current) {
      firstCard.current = card
      setFeedback('Busca ahora su pareja.')
      setPlay({ ...play, revealedIds: [...play.revealedIds, card.id] })
      return
    }

    const first = firstCard.current
    interactionLocked.current = true
    setLocked(true)
    const matched = cardsFormMemoryPair(first, card)
    const turn: TypeMemoryTurn = {
      index: play.attempts + 1,
      firstCardId: first.id,
      secondCardId: card.id,
      firstType: first.type,
      secondType: card.type,
      matched,
    }
    const matchedTypes = matched ? [...play.matchedTypes, card.type] : play.matchedTypes
    const streak = matched ? play.streak + 1 : 0
    const complete = matchedTypes.length === TYPE_MEMORY_DIFFICULTIES[play.difficulty].pairCount
    setFeedback(matched ? '¡Pareja encontrada!' : 'No coinciden. Memorízalas y vuelve a intentarlo.')
    setPlay({
      ...play,
      revealedIds: [...play.revealedIds, card.id],
      matchedTypes,
      attempts: play.attempts + 1,
      turns: [...play.turns, turn],
      streak,
      bestStreak: Math.max(play.bestStreak, streak),
      finishedAt: complete ? currentTimestamp() : null,
    })

    if (matched) {
      firstCard.current = null
      interactionLocked.current = false
      setLocked(false)
      if (complete) completionTimer.current = window.setTimeout(() => setStage('summary'), 450)
      return
    }

    mismatchTimer.current = window.setTimeout(() => {
      setPlay((current) => current ? {
        ...current,
        revealedIds: current.revealedIds.filter((id) => id !== first.id && id !== card.id),
      } : current)
      firstCard.current = null
      interactionLocked.current = false
      setLocked(false)
    }, 750)
  }

  const leave = () => {
    if (mismatchTimer.current != null) window.clearTimeout(mismatchTimer.current)
    if (completionTimer.current != null) window.clearTimeout(completionTimer.current)
    firstCard.current = null
    interactionLocked.current = false
    setLocked(false)
    setFeedback('Toca dos cartas para compararlas.')
    setConfirmAction(null)
    setPlay(null)
    setStage('setup')
  }

  const requestAction = (action: ConfirmAction) => {
    const hasProgress = Boolean(play && (play.attempts > 0 || play.matchedTypes.length > 0))
    if (!hasProgress) {
      if (action === 'leave') leave()
      else startGame(play?.difficulty ?? difficulty)
      return
    }
    setConfirmAction(action)
  }

  const confirm = () => {
    if (confirmAction === 'restart') startGame(play?.difficulty ?? difficulty)
    else leave()
    setConfirmAction(null)
  }

  const saveAttempt = () => {
    if (!play || play.finishedAt == null) return
    const pairCount = TYPE_MEMORY_DIFFICULTIES[play.difficulty].pairCount
    const session: TypeMemorySession = {
      id: play.id, gameType: 'type-memory', name: '', activeGameId: play.scope.activeGameId,
      gameTitle: play.scope.gameTitle, pokedexLabel: play.scope.pokedexLabel, generation: play.scope.generation,
      startedAt: play.startedAt, finishedAt: play.finishedAt, score: pairCount, bestStreak: play.bestStreak,
      totalRounds: pairCount, rounds: play.turns, difficulty: play.difficulty, pairCount,
      attempts: play.attempts, durationMs: play.finishedAt - play.startedAt, typesUsed: play.types,
    }
    const saved = saveTypeMemorySession(session, attemptName)
    if (!saved) { setSaveError('No se pudo guardar el intento en este dispositivo.'); return }
    setSavedSession(saved)
    setSaveError(null)
    setSaveOpen(false)
  }

  if (stage === 'setup') return (
    <div className="page-stack">
      <PageHeader eyebrow="Juegos · Tipos" title="Memoria de tipos" description="Encuentra cada tipo y su símbolo." actions={<Button asChild variant="outline"><Link to="/more/juegos/memoria-tipos/historial"><History aria-hidden />Historial</Link></Button>} />
      <GamePreparationCard icon={Grid3X3} gameTitle={currentScope.gameTitle} pokedexLabel={currentScope.pokedexLabel} tone="blue" />
      <BentoCard className="p-4 sm:p-5"><DifficultyPicker value={difficulty} onChange={setDifficulty} /></BentoCard>
      <Button size="lg" className="w-full" onClick={() => startGame()}><Play weight="fill" aria-hidden />Empezar · {TYPE_MEMORY_DIFFICULTIES[difficulty].pairCount} parejas</Button>
    </div>
  )

  if (!play) return null

  if (stage === 'summary' && play.finishedAt != null) {
    const pairCount = TYPE_MEMORY_DIFFICULTIES[play.difficulty].pairCount
    const duration = play.finishedAt - play.startedAt
    return (
      <div className="page-stack">
        <PageHeader eyebrow={`${play.scope.gameTitle} · ${TYPE_MEMORY_DIFFICULTIES[play.difficulty].label}`} title="¡Completado!" description="Has relacionado todos los nombres con sus símbolos." actions={<Button asChild variant="outline"><Link to="/more/juegos/memoria-tipos/historial"><History aria-hidden />Historial</Link></Button>} />
        <GameResultCard result={<>{pairCount} parejas</>} subtitle="tablero completado" metrics={[{ label: 'Intentos', value: play.attempts }, { label: 'Tiempo', value: formatMemoryDuration(duration) }, { label: 'Mejor racha', value: play.bestStreak }]} />
        <div className="grid gap-3 sm:grid-cols-2">
          {savedSession ? <Button asChild size="lg"><Link to={`/more/juegos/memoria-tipos/historial/${savedSession.id}`}><CheckCircle aria-hidden />Ver intento guardado</Link></Button> : <Button size="lg" onClick={() => { setAttemptName(''); setSaveError(null); setSaveOpen(true) }}><Save aria-hidden />Guardar intento</Button>}
          <Button size="lg" variant="secondary" onClick={() => startGame(play.difficulty)}><RefreshCw aria-hidden />Jugar otra vez</Button>
          <Button asChild size="lg" variant="outline" className="sm:col-span-2"><Link to="/more"><ArrowLeft aria-hidden />Volver a Juegos</Link></Button>
        </div>
        <SaveAttemptDialog open={saveOpen} onOpenChange={setSaveOpen} value={attemptName} onValueChange={setAttemptName} placeholder={nextTypeMemoryAttemptName()} error={saveError} onSave={saveAttempt} />
      </div>
    )
  }

  const pairCount = TYPE_MEMORY_DIFFICULTIES[play.difficulty].pairCount
  return (
    <div className="grid gap-4 sm:gap-5">
      <header className="flex items-center justify-between gap-2">
        <Button variant="ghost" size="sm" onClick={() => requestAction('leave')}><ArrowLeft aria-hidden />Salir</Button>
        <div className="flex items-center gap-2 text-xs font-semibold">
          <Badge variant="secondary">Parejas {play.matchedTypes.length}/{pairCount}</Badge>
          <Badge variant="outline">Intentos {play.attempts}</Badge>
        </div>
        <Button variant="ghost" size="icon" aria-label="Reiniciar partida" onClick={() => requestAction('restart')}><RefreshCw aria-hidden /></Button>
      </header>
      <section className="text-center" aria-labelledby="memory-board-title">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ui-blue-strong">{TYPE_MEMORY_DIFFICULTIES[play.difficulty].label}</p>
        <h1 id="memory-board-title" className="mt-1 text-xl font-bold">Encuentra las parejas</h1>
        <p className="mt-1 text-sm text-muted-foreground">Une cada nombre con su símbolo.</p>
      </section>
      <section
        aria-label="Tablero de memoria"
        aria-busy={locked}
        className={cn('grid gap-2', play.difficulty === 'easy' ? 'grid-cols-4' : 'grid-cols-3')}
      >
        {play.cards.map((card, index) => {
          const matched = play.matchedTypes.includes(card.type)
          const revealed = matched || play.revealedIds.includes(card.id)
          return <MemoryCard key={card.id} card={card} position={index + 1} revealed={revealed} matched={matched} locked={locked} onOpen={() => openCard(card)} />
        })}
      </section>
      <p className="text-center text-xs text-muted-foreground" aria-live="polite">{play.streak > 1 && feedback === '¡Pareja encontrada!' ? `${feedback} ${play.streak} seguidas.` : feedback}</p>
      <Dialog open={confirmAction != null} onOpenChange={(open) => { if (!open) setConfirmAction(null) }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{confirmAction === 'restart' ? '¿Reiniciar la partida?' : '¿Salir de la partida?'}</DialogTitle><DialogDescription>El progreso de esta partida no se guardará.</DialogDescription></DialogHeader>
          <DialogFooter><DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose><Button onClick={confirm}>{confirmAction === 'restart' ? 'Reiniciar' : 'Salir'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
