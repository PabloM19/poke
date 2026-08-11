import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle,
  Eye,
  Flame,
  History,
  Keyboard,
  Lightbulb,
  Play,
  Question,
  Save,
} from '@/components/icons'
import { PageHeader } from '@/components/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BentoCard } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { StatusState } from '@/components/ui/status-state'
import { GamePreparationCard, GameResultCard, SaveAttemptDialog } from '@/features/gameSessions'
import { useGameContext, type GameSelection } from '@/features/games'
import {
  createPokemonSilhouetteSessionId,
  generatePokemonSilhouette,
  getPokemonNameCells,
  isPokemonNameSolved,
  matchesPokemonName,
  nextPokemonSilhouetteAttemptName,
  POKEMON_SILHOUETTE_MAX_ERRORS,
  POKEMON_SILHOUETTE_TOTAL_ROUNDS,
  pointsForSilhouetteRound,
  pokemonNameLetters,
  progressiveHint,
  savePokemonSilhouetteSession,
  type PokemonSilhouetteHint,
  type PokemonSilhouetteRound,
  type PokemonSilhouetteSession,
  type PokemonSilhouetteSnapshot,
} from '@/features/pokemonSilhouette'
import { useRegionalPokedexItems } from '@/features/pokedex/useRegionalPokedexItems'
import { TypeChip } from '@/features/types'
import { cn } from '@/lib/utils'

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

interface GameScope {
  activeGameId: GameSelection
  gameTitle: string
  pokedexLabel: string
  generation: 4 | 5
}

interface PlayState {
  id: string
  scope: GameScope
  startedAt: number
  finishedAt: number | null
  streak: number
  bestStreak: number
  hits: number
  points: number
  perfectRounds: number
  rounds: PokemonSilhouetteRound[]
}

interface LiveRound {
  pokemon: PokemonSilhouetteSnapshot
  selectedLetters: Set<string>
  incorrectLetters: Set<string>
  fullGuesses: string[]
  errors: number
  hints: PokemonSilhouetteHint[]
  revealedByHint: Set<string>
  status: 'playing' | 'solved' | 'failed'
}

type GameStage = 'setup' | 'playing' | 'summary'

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

function MaskedName({ name, revealed, revealAll = false }: { name: string; revealed: ReadonlySet<string>; revealAll?: boolean }) {
  return (
    <div className="flex min-h-10 flex-wrap items-end justify-center gap-x-1.5 gap-y-2" aria-label={revealAll ? name : 'Nombre parcialmente oculto'}>
      {getPokemonNameCells(name, revealed, revealAll).map((cell, index) => {
        if (cell.key == null) {
          return <span key={`${cell.character}-${index}`} className={cell.character === ' ' ? 'w-3' : 'px-0.5 text-lg font-bold'} aria-hidden>{cell.character}</span>
        }
        return (
          <span
            key={`${cell.character}-${index}`}
            className="inline-flex h-8 min-w-5 items-end justify-center border-b-2 border-foreground/55 pb-0.5 text-lg font-black uppercase"
            aria-hidden
          >
            {cell.visible ? cell.character : ''}
          </span>
        )
      })}
    </div>
  )
}

function HintList({ hints }: { hints: readonly PokemonSilhouetteHint[] }) {
  if (hints.length === 0) return null
  return (
    <div className="flex flex-wrap justify-center gap-2" aria-label="Pistas reveladas">
      {hints.map((hint, index) => hint.kind === 'type' ? (
        <TypeChip key={`${hint.kind}-${index}`} type={hint.type} size="compact" />
      ) : (
        <Badge key={`${hint.kind}-${index}`} variant="outline">
          <Lightbulb aria-hidden />{hint.label}: {hint.value}
        </Badge>
      ))}
    </div>
  )
}

export function GuessPokemonPage() {
  const { game, selection, isAll } = useGameContext()
  const regional = useRegionalPokedexItems(isAll ? null : game)
  const [stage, setStage] = useState<GameStage>('setup')
  const [play, setPlay] = useState<PlayState | null>(null)
  const [liveRound, setLiveRound] = useState<LiveRound | null>(null)
  const [loadingRound, setLoadingRound] = useState(false)
  const [roundError, setRoundError] = useState<string | null>(null)
  const [guessOpen, setGuessOpen] = useState(false)
  const [fullGuess, setFullGuess] = useState('')
  const [saveOpen, setSaveOpen] = useState(false)
  const [attemptName, setAttemptName] = useState('')
  const [saveError, setSaveError] = useState<string | null>(null)
  const [savedSession, setSavedSession] = useState<PokemonSilhouetteSession | null>(null)
  const usedIds = useRef(new Set<number>())
  const playItems = useRef(regional.items)
  const playEntryNumbers = useRef(regional.entryNumbers)
  const request = useRef<AbortController | null>(null)

  useEffect(() => () => request.current?.abort(), [])

  const currentScope: GameScope = {
    activeGameId: selection,
    gameTitle: isAll ? 'Todos los juegos' : game.title,
    pokedexLabel: isAll ? 'Pokédex nacional I–V' : `Pokédex regional de ${game.region}`,
    generation: isAll ? 5 : game.generation,
  }

  const revealedLetters = useMemo(() => {
    const result = new Set(liveRound?.selectedLetters ?? [])
    for (const letter of liveRound?.revealedByHint ?? []) result.add(letter)
    return result
  }, [liveRound])

  const prepareRound = async (state: PlayState) => {
    request.current?.abort()
    const controller = new AbortController()
    request.current = controller
    setLoadingRound(true)
    setRoundError(null)
    setLiveRound(null)
    try {
      const pokemon = await generatePokemonSilhouette({
        items: playItems.current,
        entryNumbers: playEntryNumbers.current,
        generation: state.scope.generation,
        excludedIds: usedIds.current,
        signal: controller.signal,
      })
      if (controller.signal.aborted) return
      usedIds.current.add(pokemon.id)
      setLiveRound({
        pokemon,
        selectedLetters: new Set(),
        incorrectLetters: new Set(),
        fullGuesses: [],
        errors: 0,
        hints: [],
        revealedByHint: new Set(),
        status: 'playing',
      })
    } catch {
      if (!controller.signal.aborted) setRoundError('No pudimos preparar esta silueta. Comprueba la conexión y vuelve a intentarlo.')
    } finally {
      if (!controller.signal.aborted) setLoadingRound(false)
    }
  }

  const startGame = () => {
    const startedAt = Date.now()
    const next: PlayState = {
      id: createPokemonSilhouetteSessionId(startedAt),
      scope: currentScope,
      startedAt,
      finishedAt: null,
      streak: 0,
      bestStreak: 0,
      hits: 0,
      points: 0,
      perfectRounds: 0,
      rounds: [],
    }
    playItems.current = regional.items
    playEntryNumbers.current = regional.entryNumbers
    usedIds.current = new Set()
    setSavedSession(null)
    setPlay(next)
    setStage('playing')
    void prepareRound(next)
  }

  const finishRound = (nextRound: LiveRound, result: 'solved' | 'failed') => {
    if (!play) return
    const points = pointsForSilhouetteRound(result, nextRound.errors)
    const streak = result === 'solved' ? play.streak + 1 : 0
    const record: PokemonSilhouetteRound = {
      index: play.rounds.length + 1,
      pokemon: nextRound.pokemon,
      selectedLetters: [...nextRound.selectedLetters],
      incorrectLetters: [...nextRound.incorrectLetters],
      fullGuesses: nextRound.fullGuesses,
      errors: nextRound.errors,
      hints: nextRound.hints,
      result,
      points,
    }
    const isFinal = record.index === POKEMON_SILHOUETTE_TOTAL_ROUNDS
    setLiveRound({ ...nextRound, status: result })
    setPlay({
      ...play,
      streak,
      bestStreak: Math.max(play.bestStreak, streak),
      hits: play.hits + Number(result === 'solved'),
      points: play.points + points,
      perfectRounds: play.perfectRounds + Number(result === 'solved' && nextRound.errors === 0),
      rounds: [...play.rounds, record],
      finishedAt: isFinal ? Date.now() : null,
    })
  }

  const registerMistake = (round: LiveRound, letter?: string, guess?: string) => {
    const errors = Math.min(POKEMON_SILHOUETTE_MAX_ERRORS, round.errors + 1)
    const selectedLetters = new Set(round.selectedLetters)
    const incorrectLetters = new Set(round.incorrectLetters)
    if (letter) {
      selectedLetters.add(letter)
      incorrectLetters.add(letter)
    }
    const fullGuesses = guess ? [...round.fullGuesses, guess] : round.fullGuesses
    if (errors >= POKEMON_SILHOUETTE_MAX_ERRORS) {
      finishRound({ ...round, selectedLetters, incorrectLetters, fullGuesses, errors }, 'failed')
      return
    }
    const alreadyRevealed = new Set([...selectedLetters, ...round.revealedByHint])
    const progression = progressiveHint({
      pokemon: round.pokemon,
      errorNumber: errors,
      revealedLetters: alreadyRevealed,
      hints: round.hints,
    })
    const revealedByHint = new Set(round.revealedByHint)
    if (progression.revealedLetter) revealedByHint.add(progression.revealedLetter)
    const next = {
      ...round,
      selectedLetters,
      incorrectLetters,
      fullGuesses,
      errors,
      hints: [...round.hints, progression.hint],
      revealedByHint,
    }
    const allRevealed = new Set([...selectedLetters, ...revealedByHint])
    if (isPokemonNameSolved(round.pokemon.name, allRevealed)) finishRound(next, 'solved')
    else setLiveRound(next)
  }

  const chooseLetter = (letter: string) => {
    if (!liveRound || liveRound.status !== 'playing' || liveRound.selectedLetters.has(letter)) return
    const selectedLetters = new Set(liveRound.selectedLetters)
    if (pokemonNameLetters(liveRound.pokemon.name).includes(letter)) {
      selectedLetters.add(letter)
      const next = { ...liveRound, selectedLetters }
      const allRevealed = new Set([...selectedLetters, ...liveRound.revealedByHint])
      if (isPokemonNameSolved(liveRound.pokemon.name, allRevealed)) finishRound(next, 'solved')
      else setLiveRound(next)
      return
    }
    registerMistake(liveRound, letter)
  }

  const submitFullGuess = () => {
    if (!liveRound || liveRound.status !== 'playing' || fullGuess.trim().length === 0) return
    const guess = fullGuess.trim()
    setGuessOpen(false)
    setFullGuess('')
    if (matchesPokemonName(guess, liveRound.pokemon.name)) {
      finishRound({ ...liveRound, fullGuesses: [...liveRound.fullGuesses, guess] }, 'solved')
    } else {
      registerMistake(liveRound, undefined, guess)
    }
  }

  const continueGame = () => {
    if (!play || liveRound?.status === 'playing') return
    if (play.rounds.length >= POKEMON_SILHOUETTE_TOTAL_ROUNDS) {
      setStage('summary')
      return
    }
    void prepareRound(play)
  }

  const leaveGame = () => {
    request.current?.abort()
    setStage('setup')
    setPlay(null)
    setLiveRound(null)
    setRoundError(null)
  }

  const saveAttempt = () => {
    if (!play || play.rounds.length !== POKEMON_SILHOUETTE_TOTAL_ROUNDS) return
    const session: PokemonSilhouetteSession = {
      id: play.id,
      gameType: 'pokemon-silhouette',
      name: '',
      activeGameId: play.scope.activeGameId,
      gameTitle: play.scope.gameTitle,
      pokedexLabel: play.scope.pokedexLabel,
      generation: play.scope.generation,
      startedAt: play.startedAt,
      finishedAt: play.finishedAt ?? Date.now(),
      score: play.hits,
      bestStreak: play.bestStreak,
      totalRounds: POKEMON_SILHOUETTE_TOTAL_ROUNDS,
      points: play.points,
      perfectRounds: play.perfectRounds,
      rounds: play.rounds,
    }
    const saved = savePokemonSilhouetteSession(session, attemptName)
    if (!saved) {
      setSaveError('No se pudo guardar el intento en este dispositivo.')
      return
    }
    setSavedSession(saved)
    setSaveError(null)
    setSaveOpen(false)
  }

  if (stage === 'setup') {
    const ready = regional.status === 'success' && regional.items.length > 0
    return (
      <div className="page-stack">
        <PageHeader
          eyebrow="Juegos · Reconoce siluetas"
          title="¿Quién es ese Pokémon?"
          description="Descubre el nombre letra a letra. Cada fallo desbloquea una pista para ayudarte a aprender."
          actions={<Button asChild variant="outline"><Link to="/more/juegos/quien-es-ese-pokemon/historial"><History aria-hidden />Historial</Link></Button>}
        />
        <GamePreparationCard
          icon={Question}
          gameTitle={currentScope.gameTitle}
          pokedexLabel={currentScope.pokedexLabel}
          entryCount={regional.status === 'success' ? regional.entryCount : undefined}
          tone="yellow"
        />
        <BentoCard className="p-4">
          <div className="flex items-start gap-3">
            <Lightbulb className="mt-0.5 size-5 shrink-0 text-ui-yellow-strong" weight="fill" aria-hidden />
            <div><h2 className="font-semibold">Cómo se juega</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">Pulsa letras o escribe el nombre completo. Tienes hasta 6 fallos y 10 Pokémon por partida.</p></div>
          </div>
        </BentoCard>
        {regional.status === 'error' && (
          <StatusState title="No se pudo cargar esta Pokédex" description="Reintenta la carga antes de empezar." tone="error" compact>
            <Button onClick={regional.retry}>Reintentar</Button>
          </StatusState>
        )}
        <Button size="lg" className="w-full" disabled={!ready} onClick={startGame}>
          <Play weight="fill" aria-hidden />
          {regional.status === 'loading' ? 'Preparando Pokédex…' : 'Empezar · 10 Pokémon'}
        </Button>
      </div>
    )
  }

  if (!play) return null

  if (stage === 'summary') {
    const accuracy = Math.round((play.hits / POKEMON_SILHOUETTE_TOTAL_ROUNDS) * 100)
    return (
      <div className="page-stack">
        <PageHeader
          eyebrow={play.scope.gameTitle}
          title="Resultado"
          description="Has completado las 10 siluetas de esta partida."
          actions={<Button asChild variant="outline"><Link to="/more/juegos/quien-es-ese-pokemon/historial"><History aria-hidden />Historial</Link></Button>}
        />
        <GameResultCard
          result={<>{play.hits} / {POKEMON_SILHOUETTE_TOTAL_ROUNDS}</>}
          subtitle={<>Pokémon reconocidos · {play.points} puntos</>}
          metrics={[
            { label: 'Mejor racha', value: play.bestStreak },
            { label: 'Sin fallos', value: play.perfectRounds },
            { label: 'Precisión', value: `${accuracy} %` },
          ]}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          {savedSession ? (
            <Button asChild size="lg"><Link to={`/more/juegos/quien-es-ese-pokemon/historial/${savedSession.id}`}><CheckCircle aria-hidden />Ver intento guardado</Link></Button>
          ) : (
            <Button size="lg" onClick={() => { setAttemptName(''); setSaveError(null); setSaveOpen(true) }}><Save aria-hidden />Guardar intento</Button>
          )}
          <Button size="lg" variant="secondary" onClick={startGame}><Play aria-hidden />Jugar otra vez</Button>
          <Button asChild size="lg" variant="outline" className="sm:col-span-2"><Link to="/more"><ArrowLeft aria-hidden />Volver a Juegos</Link></Button>
        </div>
        <SaveAttemptDialog
          open={saveOpen}
          onOpenChange={setSaveOpen}
          value={attemptName}
          onValueChange={setAttemptName}
          placeholder={nextPokemonSilhouetteAttemptName()}
          error={saveError}
          onSave={saveAttempt}
        />
      </div>
    )
  }

  const roundNumber = play.rounds.length + (liveRound?.status === 'playing' || liveRound == null ? 1 : 0)
  const revealPokemon = liveRound?.status !== 'playing'
  return (
    <div className="grid gap-3 sm:gap-4">
      <header className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={leaveGame}><ArrowLeft aria-hidden />Salir</Button>
        <Badge variant="secondary">Ronda {Math.min(roundNumber, POKEMON_SILHOUETTE_TOTAL_ROUNDS)} / {POKEMON_SILHOUETTE_TOTAL_ROUNDS}</Badge>
      </header>

      <section className="grid grid-cols-4 rounded-[var(--radius-lg)] border border-border bg-card px-2 py-2 shadow-[var(--shadow-xs)]" aria-label="Marcador de la partida">
        <Metric label="Racha" value={play.streak} icon={Flame} />
        <Metric label="Aciertos" value={play.hits} />
        <Metric label="Sin fallos" value={play.perfectRounds} />
        <Metric label="Puntos" value={play.points} />
      </section>

      {loadingRound && <StatusState title="Preparando silueta…" description="Eligiendo un Pokémon de esta Pokédex." tone="loading" compact />}
      {roundError && (
        <StatusState title="No se pudo cargar la ronda" description={roundError} tone="error" compact>
          <Button onClick={() => void prepareRound(play)}>Reintentar</Button>
          <Button variant="outline" onClick={leaveGame}>Volver</Button>
        </StatusState>
      )}

      {liveRound && (
        <>
          <BentoCard tone="blue" className="p-3 text-center sm:p-4">
            <div className="mx-auto flex size-36 items-center justify-center rounded-[var(--radius-lg)] border border-border/70 bg-card/80 shadow-[var(--shadow-xs)] sm:size-44">
              {liveRound.pokemon.sprite ? (
                <img
                  src={liveRound.pokemon.sprite}
                  alt={revealPokemon ? liveRound.pokemon.name : 'Silueta de un Pokémon por descubrir'}
                  className={cn('size-32 object-contain transition-[filter,transform] duration-300 sm:size-40', !revealPokemon && 'brightness-0', revealPokemon && 'scale-105')}
                />
              ) : <Question className="size-14 text-muted-foreground" aria-label="Imagen no disponible" />}
            </div>
            <div className="mt-3">
              <MaskedName name={liveRound.pokemon.name} revealed={revealedLetters} revealAll={revealPokemon} />
            </div>
            <div className="mt-3 flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground">
              <span>{liveRound.errors} / {POKEMON_SILHOUETTE_MAX_ERRORS} fallos</span>
              <span aria-hidden>·</span>
              <span>{POKEMON_SILHOUETTE_MAX_ERRORS - liveRound.errors} restantes</span>
            </div>
            <div className="mt-3"><HintList hints={liveRound.hints} /></div>
          </BentoCard>

          {liveRound.status === 'playing' ? (
            <section aria-labelledby="letter-keyboard-title">
              <div className="mb-2 flex items-center justify-between gap-3">
                <h1 id="letter-keyboard-title" className="text-sm font-bold">Elige una letra</h1>
                <Button variant="ghost" size="sm" onClick={() => { setFullGuess(''); setGuessOpen(true) }}><Keyboard aria-hidden />Escribir nombre</Button>
              </div>
              <div className="grid grid-cols-7 gap-1.5" aria-label="Teclado de letras">
                {ALPHABET.map((letter) => {
                  const selected = liveRound.selectedLetters.has(letter)
                  const incorrect = liveRound.incorrectLetters.has(letter)
                  const correct = selected && !incorrect
                  return (
                    <button
                      key={letter}
                      type="button"
                      className={cn(
                        'interactive-clay min-h-11 rounded-[var(--radius-sm)] border text-sm font-bold shadow-[var(--shadow-xs)] outline-none focus-visible:ring-3 focus-visible:ring-ring/35',
                        !selected && 'border-border bg-card hover:bg-accent',
                        correct && 'border-ui-green-strong/30 bg-ui-green text-ui-green-strong',
                        incorrect && 'border-ui-yellow-strong/30 bg-ui-yellow text-ui-yellow-strong opacity-65',
                      )}
                      disabled={selected}
                      aria-label={`${letter}${correct ? ', acertada' : incorrect ? ', incorrecta' : ''}`}
                      onClick={() => chooseLetter(letter)}
                    >{letter}</button>
                  )
                })}
              </div>
            </section>
          ) : (
            <section className={cn(
              'rounded-[var(--radius-lg)] border p-4 text-center shadow-[var(--shadow-xs)]',
              liveRound.status === 'solved' ? 'border-ui-green-strong/25 bg-ui-green/45' : 'border-ui-yellow-strong/25 bg-ui-yellow/45',
            )} aria-live="polite">
              {liveRound.status === 'solved'
                ? <CheckCircle className="mx-auto size-7 text-ui-green-strong" weight="fill" aria-hidden />
                : <Eye className="mx-auto size-7 text-ui-yellow-strong" weight="fill" aria-hidden />}
              <h2 className="mt-1 text-xl font-bold">{liveRound.status === 'solved' ? '¡Correcto!' : `Era ${liveRound.pokemon.name}`}</h2>
              <p className="mt-1 text-sm text-muted-foreground">#{String(liveRound.pokemon.regionalNumber).padStart(3, '0')} · {liveRound.errors} {liveRound.errors === 1 ? 'fallo utilizado' : 'fallos utilizados'}</p>
              <div className="mt-2 flex flex-wrap justify-center gap-1.5">
                {liveRound.pokemon.types.map((type) => <TypeChip key={type} type={type} size="compact" />)}
              </div>
              {liveRound.status === 'failed' && <p className="mt-2 text-xs text-muted-foreground">Ahora ya conoces su silueta. La próxima será más fácil.</p>}
              <Button className="mt-4 w-full" onClick={continueGame}>
                {play.rounds.length >= POKEMON_SILHOUETTE_TOTAL_ROUNDS ? 'Ver resultado' : 'Siguiente Pokémon'}
              </Button>
            </section>
          )}
        </>
      )}

      <Dialog open={guessOpen} onOpenChange={setGuessOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolver el nombre</DialogTitle>
            <DialogDescription>Los espacios, guiones, puntos y mayúsculas no afectan a la respuesta. Un intento incorrecto cuenta como fallo.</DialogDescription>
          </DialogHeader>
          <label className="text-sm font-medium" htmlFor="full-pokemon-guess">Nombre del Pokémon</label>
          <Input id="full-pokemon-guess" value={fullGuess} autoComplete="off" maxLength={80} onChange={(event) => setFullGuess(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') submitFullGuess() }} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setGuessOpen(false)}>Cancelar</Button>
            <Button disabled={fullGuess.trim().length === 0} onClick={submitFullGuess}><CheckCircle aria-hidden />Comprobar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
