import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle,
  Flame,
  History,
  Play,
  Save,
  Sword,
  XCircle,
} from '@/components/icons'
import { PageHeader } from '@/components/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BentoCard } from '@/components/ui/card'
import { StatusState } from '@/components/ui/status-state'
import { GamePreparationCard, GameResultCard, SaveAttemptDialog } from '@/features/gameSessions'
import { useGameContext, type GameSelection } from '@/features/games'
import { useRegionalPokedexItems } from '@/features/pokedex/useRegionalPokedexItems'
import { TypeChip } from '@/features/types'
import {
  createTypeDuelSessionId,
  generateTypeDuelRound,
  nextTypeDuelAttemptName,
  saveTypeDuelSession,
  TYPE_DUEL_TOTAL_ROUNDS,
  TypeMatchupExplanation,
  type GeneratedTypeDuelRound,
  type TypeDuelAnswer,
  type TypeDuelMode,
  type TypeDuelRound,
  type TypeDuelSession,
} from '@/features/typeDuel'
import { cn } from '@/lib/utils'

interface DuelScope {
  activeGameId: GameSelection
  gameTitle: string
  pokedexLabel: string
  generation: 4 | 5
}

interface PlayState {
  id: string
  scope: DuelScope
  mode: TypeDuelMode
  startedAt: number
  finishedAt: number | null
  streak: number
  bestStreak: number
  hits: number
  misses: number
  rounds: TypeDuelRound[]
}

type DuelStage = 'setup' | 'playing' | 'summary'

function ModeChoice({
  value,
  selected,
  title,
  description,
  onSelect,
}: {
  value: TypeDuelMode
  selected: boolean
  title: string
  description: string
  onSelect: (value: TypeDuelMode) => void
}) {
  return (
    <button
      type="button"
      className={cn(
        'interactive-clay min-h-20 rounded-[var(--radius-md)] border p-3 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/35',
        selected
          ? 'border-ui-lavender-strong/40 bg-ui-lavender/55 shadow-[var(--shadow-xs)]'
          : 'border-border bg-card hover:bg-accent/50'
      )}
      aria-pressed={selected}
      onClick={() => onSelect(value)}
    >
      <span className="block text-sm font-semibold">{title}</span>
      <span className="mt-1 block text-xs leading-5 text-muted-foreground">{description}</span>
    </button>
  )
}

function PokemonFace({ pokemon, side }: { pokemon: GeneratedTypeDuelRound['left']; side: 'izquierda' | 'derecha' }) {
  return (
    <figure className="min-w-0 text-center">
      <div className="mx-auto flex size-28 items-center justify-center rounded-[var(--radius-lg)] border border-border/70 bg-card/75 shadow-[var(--shadow-xs)] sm:size-36">
        {pokemon.sprite ? (
          <img className="size-24 object-contain sm:size-32" src={pokemon.sprite} alt={`Imagen de ${pokemon.name}, opción ${side}`} />
        ) : (
          <span className="text-4xl font-bold text-muted-foreground" aria-hidden>?</span>
        )}
      </div>
      <figcaption className="mt-2 truncate text-sm font-bold sm:text-base">{pokemon.name}</figcaption>
      <div className="mt-1 flex min-h-6 flex-wrap justify-center gap-1">
        {pokemon.types.map((type) => <TypeChip key={type} type={type} size="compact" />)}
      </div>
    </figure>
  )
}

function Metric({ label, value, icon: Icon }: { label: string; value: number; icon?: typeof Flame }) {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-1 text-base font-bold tabular-nums">
        {Icon && <Icon className="size-4 text-ui-lavender-strong" weight="fill" aria-hidden />}
        {value}
      </div>
      <div className="text-[0.625rem] leading-4 text-muted-foreground">{label}</div>
    </div>
  )
}

function answerLabel(answer: TypeDuelAnswer, round: GeneratedTypeDuelRound): string {
  if (answer === 'left') return round.left.name
  if (answer === 'right') return round.right.name
  return 'Neutral'
}

export function TypeDuelPage() {
  const { game, selection, isAll } = useGameContext()
  const regional = useRegionalPokedexItems(isAll ? null : game)
  const [mode, setMode] = useState<TypeDuelMode>('learn')
  const [stage, setStage] = useState<DuelStage>('setup')
  const [play, setPlay] = useState<PlayState | null>(null)
  const [round, setRound] = useState<GeneratedTypeDuelRound | null>(null)
  const [answer, setAnswer] = useState<TypeDuelAnswer | null>(null)
  const [loadingRound, setLoadingRound] = useState(false)
  const [roundError, setRoundError] = useState<string | null>(null)
  const [saveOpen, setSaveOpen] = useState(false)
  const [attemptName, setAttemptName] = useState('')
  const [saveError, setSaveError] = useState<string | null>(null)
  const [savedSession, setSavedSession] = useState<TypeDuelSession | null>(null)
  const usedIds = useRef(new Set<number>())
  const playItems = useRef(regional.items)
  const request = useRef<AbortController | null>(null)

  useEffect(() => () => request.current?.abort(), [])

  const currentScope: DuelScope = {
    activeGameId: selection,
    gameTitle: isAll ? 'Todos los juegos' : game.title,
    pokedexLabel: isAll ? 'Pokédex nacional I–V · reglas de Generación V' : `Pokédex regional de ${game.region}`,
    generation: isAll ? 5 : game.generation,
  }

  const prepareRound = async (state: PlayState) => {
    request.current?.abort()
    const controller = new AbortController()
    request.current = controller
    setLoadingRound(true)
    setRoundError(null)
    setRound(null)
    setAnswer(null)
    try {
      const generated = await generateTypeDuelRound({
        items: playItems.current,
        generation: state.scope.generation,
        mode: state.mode,
        excludedIds: usedIds.current,
        signal: controller.signal,
      })
      if (controller.signal.aborted) return
      usedIds.current.add(generated.left.id)
      usedIds.current.add(generated.right.id)
      setRound(generated)
    } catch {
      if (!controller.signal.aborted) setRoundError('No pudimos preparar este enfrentamiento. Comprueba la conexión y vuelve a intentarlo.')
    } finally {
      if (!controller.signal.aborted) setLoadingRound(false)
    }
  }

  const startGame = () => {
    const startedAt = Date.now()
    const next: PlayState = {
      id: createTypeDuelSessionId(startedAt),
      scope: currentScope,
      mode,
      startedAt,
      finishedAt: null,
      streak: 0,
      bestStreak: 0,
      hits: 0,
      misses: 0,
      rounds: [],
    }
    playItems.current = regional.items
    usedIds.current = new Set()
    setSavedSession(null)
    setPlay(next)
    setStage('playing')
    void prepareRound(next)
  }

  const chooseAnswer = (choice: TypeDuelAnswer) => {
    if (!play || !round || answer != null) return
    const isCorrect = choice === round.correctAnswer
    const streak = isCorrect ? play.streak + 1 : 0
    const record: TypeDuelRound = {
      ...round,
      index: play.rounds.length + 1,
      userAnswer: choice,
      isCorrect,
    }
    const isFinal = record.index === TYPE_DUEL_TOTAL_ROUNDS
    setAnswer(choice)
    setPlay({
      ...play,
      streak,
      bestStreak: Math.max(play.bestStreak, streak),
      hits: play.hits + Number(isCorrect),
      misses: play.misses + Number(!isCorrect),
      rounds: [...play.rounds, record],
      finishedAt: isFinal ? Date.now() : null,
    })
  }

  const continueGame = () => {
    if (!play || answer == null) return
    if (play.rounds.length >= TYPE_DUEL_TOTAL_ROUNDS) {
      setStage('summary')
      return
    }
    void prepareRound(play)
  }

  const leaveGame = () => {
    request.current?.abort()
    setStage('setup')
    setPlay(null)
    setRound(null)
    setAnswer(null)
    setRoundError(null)
  }

  const saveAttempt = () => {
    if (!play || play.rounds.length !== TYPE_DUEL_TOTAL_ROUNDS) return
    const session: TypeDuelSession = {
      id: play.id,
      gameType: 'type-duel',
      name: '',
      activeGameId: play.scope.activeGameId,
      gameTitle: play.scope.gameTitle,
      pokedexLabel: play.scope.pokedexLabel,
      generation: play.scope.generation,
      mode: play.mode,
      startedAt: play.startedAt,
      finishedAt: play.finishedAt ?? Date.now(),
      score: play.hits,
      bestStreak: play.bestStreak,
      totalRounds: TYPE_DUEL_TOTAL_ROUNDS,
      rounds: play.rounds,
    }
    const saved = saveTypeDuelSession(session, attemptName)
    if (!saved) {
      setSaveError('No se pudo guardar el intento en este dispositivo.')
      return
    }
    setSavedSession(saved)
    setSaveError(null)
    setSaveOpen(false)
  }

  if (stage === 'setup') {
    const ready = regional.status === 'success' && regional.items.length >= 2
    return (
      <div className="page-stack">
        <PageHeader
          eyebrow="Juegos · Aprende los tipos"
          title="Duelo de tipos"
          description="Compara únicamente la ventaja por tipos. Las estadísticas, movimientos y estrategia real no deciden estas rondas."
          actions={<Button asChild variant="outline"><Link to="/more/juegos/duelo-tipos/historial"><History aria-hidden />Historial</Link></Button>}
        />
        <GamePreparationCard
          icon={Sword}
          gameTitle={currentScope.gameTitle}
          pokedexLabel={currentScope.pokedexLabel}
          entryCount={regional.status === 'success' ? regional.entryCount : undefined}
        />

        <fieldset>
          <legend className="text-base font-semibold">Modo</legend>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <ModeChoice value="learn" selected={mode === 'learn'} title="Aprender" description="Cruces claros y tipos sencillos." onSelect={setMode} />
            <ModeChoice value="normal" selected={mode === 'normal'} title="Normal" description="Cualquier cruce de la Pokédex." onSelect={setMode} />
          </div>
        </fieldset>

        {regional.status === 'error' && (
          <StatusState title="No se pudo cargar esta Pokédex" description="Reintenta la carga antes de empezar." tone="error" compact>
            <Button onClick={regional.retry}>Reintentar</Button>
          </StatusState>
        )}
        <Button size="lg" className="w-full" disabled={!ready} onClick={startGame}>
          <Play weight="fill" aria-hidden />
          {regional.status === 'loading' ? 'Preparando Pokédex…' : 'Empezar · 10 rondas'}
        </Button>
      </div>
    )
  }

  if (!play) return null

  if (stage === 'summary') {
    const accuracy = Math.round((play.hits / TYPE_DUEL_TOTAL_ROUNDS) * 100)
    return (
      <div className="page-stack">
        <PageHeader
          eyebrow={`${play.scope.gameTitle} · ${play.mode === 'learn' ? 'Aprender' : 'Normal'}`}
          title="Resultado"
          description="Has completado las 10 rondas de ventaja por tipos."
          actions={<Button asChild variant="outline"><Link to="/more/juegos/duelo-tipos/historial"><History aria-hidden />Historial</Link></Button>}
        />
        <GameResultCard
          result={<>{play.hits} / {TYPE_DUEL_TOTAL_ROUNDS}</>}
          subtitle="aciertos"
          metrics={[
            { label: 'Mejor racha', value: play.bestStreak },
            { label: 'Precisión', value: `${accuracy} %` },
          ]}
        />

        <div className="grid gap-3 sm:grid-cols-2">
          {savedSession ? (
            <Button asChild size="lg"><Link to={`/more/juegos/duelo-tipos/historial/${savedSession.id}`}><CheckCircle aria-hidden />Ver intento guardado</Link></Button>
          ) : (
            <Button size="lg" onClick={() => {
              setAttemptName('')
              setSaveError(null)
              setSaveOpen(true)
            }}><Save aria-hidden />Guardar intento</Button>
          )}
          <Button size="lg" variant="secondary" onClick={startGame}><Play aria-hidden />Jugar otra vez</Button>
          <Button asChild size="lg" variant="outline" className="sm:col-span-2"><Link to="/more"><ArrowLeft aria-hidden />Volver a Juegos</Link></Button>
        </div>

        <SaveAttemptDialog
          open={saveOpen}
          onOpenChange={setSaveOpen}
          value={attemptName}
          onValueChange={setAttemptName}
          placeholder={nextTypeDuelAttemptName()}
          error={saveError}
          onSave={saveAttempt}
        />
      </div>
    )
  }

  const roundNumber = play.rounds.length + (answer == null ? 1 : 0)
  return (
    <div className="grid gap-3 sm:gap-4">
      <header className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={leaveGame}><ArrowLeft aria-hidden />Salir</Button>
        <Badge variant="secondary">Ronda {Math.min(roundNumber, TYPE_DUEL_TOTAL_ROUNDS)} / {TYPE_DUEL_TOTAL_ROUNDS}</Badge>
      </header>

      <section className="grid grid-cols-4 rounded-[var(--radius-lg)] border border-border bg-card px-2 py-2 shadow-[var(--shadow-xs)]" aria-label="Marcador de la partida">
        <Metric label="Racha" value={play.streak} icon={Flame} />
        <Metric label="Mejor" value={play.bestStreak} />
        <Metric label="Aciertos" value={play.hits} />
        <Metric label="Fallos" value={play.misses} />
      </section>

      {loadingRound && <StatusState title="Preparando duelo…" description="Comprobando los tipos de ambos Pokémon." tone="loading" compact />}
      {roundError && (
        <StatusState title="No se pudo cargar la ronda" description={roundError} tone="error" compact>
          <Button onClick={() => void prepareRound(play)}>Reintentar</Button>
          <Button variant="outline" onClick={leaveGame}>Volver</Button>
        </StatusState>
      )}

      {round && (
        <>
          <BentoCard tone="blue" className="p-3 sm:p-5">
            <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
              <PokemonFace pokemon={round.left} side="izquierda" />
              <span className="rounded-full border border-border bg-card px-2 py-1 text-xs font-black shadow-[var(--shadow-xs)]" aria-hidden>VS</span>
              <PokemonFace pokemon={round.right} side="derecha" />
            </div>
          </BentoCard>

          <section aria-labelledby="duel-question">
            <h1 id="duel-question" className="text-center text-lg font-bold">¿Quién tiene ventaja por tipos?</h1>
            <p className="mt-1 text-center text-xs text-muted-foreground">Compara el mejor ataque del mismo tipo de cada Pokémon.</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {(['left', 'neutral', 'right'] as const).map((choice) => {
                const isChosen = answer === choice
                const isCorrectChoice = answer != null && round.correctAnswer === choice
                return (
                  <button
                    key={choice}
                    type="button"
                    className={cn(
                      'interactive-clay min-h-11 rounded-[var(--radius-md)] border px-3 py-2 text-sm font-semibold shadow-[var(--shadow-xs)] outline-none focus-visible:ring-3 focus-visible:ring-ring/35',
                      answer == null && 'border-border bg-card hover:bg-accent',
                      isCorrectChoice && 'border-ui-green-strong/35 bg-ui-green text-ui-green-strong',
                      isChosen && !isCorrectChoice && 'border-ui-yellow-strong/35 bg-ui-yellow text-ui-yellow-strong',
                      answer != null && !isChosen && !isCorrectChoice && 'border-border bg-card opacity-55'
                    )}
                    disabled={answer != null}
                    aria-pressed={isChosen}
                    onClick={() => chooseAnswer(choice)}
                  >
                    {answerLabel(choice, round)}
                  </button>
                )
              })}
            </div>
          </section>

          {answer != null && (
            <section
              className={cn(
                'rounded-[var(--radius-lg)] border p-4 shadow-[var(--shadow-xs)]',
                answer === round.correctAnswer
                  ? 'border-ui-green-strong/25 bg-ui-green/45'
                  : 'border-ui-yellow-strong/25 bg-ui-yellow/45'
              )}
              aria-live="polite"
            >
              <div className="flex items-center gap-2 font-bold">
                {answer === round.correctAnswer
                  ? <CheckCircle className="size-5 text-ui-green-strong" weight="fill" aria-hidden />
                  : <XCircle className="size-5 text-ui-yellow-strong" weight="fill" aria-hidden />}
                {answer === round.correctAnswer ? 'Correcto' : `No exactamente: ${answerLabel(round.correctAnswer, round)}`}
              </div>
              <div className="mt-3 border-t border-border/60 pt-3">
                {round.correctAnswer === 'neutral' && (
                  <p className="mb-2 text-xs font-medium text-muted-foreground">Ambos alcanzan el mismo multiplicador máximo: es un equilibrio por tipos.</p>
                )}
                <TypeMatchupExplanation left={round.left} right={round.right} leftBest={round.leftBest} rightBest={round.rightBest} />
              </div>
              <Button className="mt-4 w-full" onClick={continueGame}>
                {play.rounds.length >= TYPE_DUEL_TOTAL_ROUNDS ? 'Ver resultado' : 'Siguiente ronda'}
              </Button>
            </section>
          )}
        </>
      )}
    </div>
  )
}
