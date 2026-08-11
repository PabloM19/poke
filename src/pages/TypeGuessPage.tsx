import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle,
  Eye,
  Flame,
  History,
  Info,
  LoaderCircle,
  Play,
  Save,
  Shapes,
  XCircle,
} from '@/components/icons'
import { PageHeader } from '@/components/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { StatusState } from '@/components/ui/status-state'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { GamePreparationCard, GameResultCard, SaveAttemptDialog } from '@/features/gameSessions'
import { useGameContext, type GameSelection } from '@/features/games'
import { translatePokemonStat } from '@/features/localization'
import { useRegionalPokedexItems } from '@/features/pokedex/useRegionalPokedexItems'
import {
  correctTypeGuess,
  createTypeGuessSessionId,
  generateTypeGuessPokemon,
  nextTypeGuessAttemptName,
  saveTypeGuessSession,
  toggleTypeSelection,
  TYPE_GUESS_TOTAL_ROUNDS,
  type TypeGuessCorrection,
  type TypeGuessPokemonSnapshot,
  type TypeGuessRound,
  type TypeGuessSession,
} from '@/features/typeGuess'
import { getPokemonTypeStyle, POKEMON_TYPE_SLUGS, TypeChip } from '@/features/types'
import { cn } from '@/lib/utils'

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
  partialAnswers: number
  withoutDetails: number
  rounds: TypeGuessRound[]
}

interface LiveRound {
  pokemon: TypeGuessPokemonSnapshot
  selectedTypes: string[]
  hintUsed: boolean
  correction: TypeGuessCorrection | null
}

type GameStage = 'setup' | 'playing' | 'summary'

function formatMeasurement(value: number | null, divisor: number, suffix: string): string {
  return value == null ? 'No disponible' : `${new Intl.NumberFormat('es-ES', { maximumFractionDigits: 1 }).format(value / divisor)} ${suffix}`
}

function PokemonDetails({ pokemon }: { pokemon: TypeGuessPokemonSnapshot }) {
  return (
    <div className="grid gap-3 overflow-y-auto px-4 pb-2">
      <p className="text-sm leading-6 text-muted-foreground">Datos neutrales para ayudarte a reconocerlo sin revelar la respuesta.</p>
      <dl className="grid grid-cols-2 gap-3">
        <div className="rounded-[var(--radius-md)] border border-border bg-secondary/60 p-3"><dt className="text-xs text-muted-foreground">Altura</dt><dd className="mt-1 font-semibold">{formatMeasurement(pokemon.height, 10, 'm')}</dd></div>
        <div className="rounded-[var(--radius-md)] border border-border bg-secondary/60 p-3"><dt className="text-xs text-muted-foreground">Peso</dt><dd className="mt-1 font-semibold">{formatMeasurement(pokemon.weight, 10, 'kg')}</dd></div>
        <div className="rounded-[var(--radius-md)] border border-border bg-secondary/60 p-3"><dt className="text-xs text-muted-foreground">Total base</dt><dd className="mt-1 font-semibold tabular-nums">{pokemon.totalBaseStats || 'No disponible'}</dd></div>
        <div className="rounded-[var(--radius-md)] border border-border bg-secondary/60 p-3"><dt className="text-xs text-muted-foreground">Stat destacada</dt><dd className="mt-1 font-semibold">{pokemon.standoutStat ? `${translatePokemonStat(pokemon.standoutStat.name, true)} · ${pokemon.standoutStat.value}` : 'No disponible'}</dd></div>
      </dl>
      <p className="text-xs leading-5 text-muted-foreground">No se muestran tipos, debilidades, resistencias ni colores derivados del Pokémon antes de responder.</p>
    </div>
  )
}

function Feedback({ round }: { round: LiveRound }) {
  const correction = round.correction
  if (!correction) return null
  const title = correction.result === 'correct' ? 'Correcto' : correction.result === 'partial' ? 'Casi' : 'No exactamente'
  const Icon = correction.result === 'correct' ? CheckCircle : correction.result === 'partial' ? Eye : XCircle
  const labels = (types: readonly string[]) => types.map((type) => getPokemonTypeStyle(type)?.label ?? type).join(' y ')
  return (
    <section className={cn(
      'rounded-[var(--radius-lg)] border p-4 shadow-[var(--shadow-xs)]',
      correction.result === 'correct' ? 'border-ui-green-strong/25 bg-ui-green/45' : 'border-ui-yellow-strong/25 bg-ui-yellow/45',
    )} aria-live="polite">
      <div className="flex items-center gap-2 font-bold"><Icon className={cn('size-5', correction.result === 'correct' ? 'text-ui-green-strong' : 'text-ui-yellow-strong')} weight="fill" aria-hidden />{title}</div>
      <div className="mt-3 grid gap-2 text-sm">
        <div><p className="mb-1 text-xs font-medium text-muted-foreground">Tu respuesta</p><div className="flex flex-wrap gap-1.5">{round.selectedTypes.map((type) => <TypeChip key={type} type={type} size="compact" />)}</div></div>
        {correction.result !== 'correct' && <div><p className="mb-1 text-xs font-medium text-muted-foreground">Era</p><div className="flex flex-wrap gap-1.5">{round.pokemon.actualTypes.map((type) => <TypeChip key={type} type={type} size="compact" />)}</div></div>}
        {correction.result === 'partial' && (
          <p className="text-xs leading-5 text-muted-foreground">
            {correction.matchedTypes.length > 0 && `Acertaste ${labels(correction.matchedTypes)}. `}
            {correction.extraTypes.length > 0 && `${labels(correction.extraTypes)} no forma parte de su combinación. `}
            {correction.missingTypes.length > 0 && `Faltaba ${labels(correction.missingTypes)}.`}
          </p>
        )}
        {correction.result === 'incorrect' && <p className="text-xs text-muted-foreground">{round.pokemon.name} es de tipo {labels(round.pokemon.actualTypes)}.</p>}
      </div>
    </section>
  )
}

export function TypeGuessPage() {
  const { game, selection, isAll } = useGameContext()
  const regional = useRegionalPokedexItems(isAll ? null : game)
  const [stage, setStage] = useState<GameStage>('setup')
  const [play, setPlay] = useState<PlayState | null>(null)
  const [liveRound, setLiveRound] = useState<LiveRound | null>(null)
  const [loadingRound, setLoadingRound] = useState(false)
  const [roundError, setRoundError] = useState<string | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [checking, setChecking] = useState(false)
  const [saveOpen, setSaveOpen] = useState(false)
  const [attemptName, setAttemptName] = useState('')
  const [saveError, setSaveError] = useState<string | null>(null)
  const [savedSession, setSavedSession] = useState<TypeGuessSession | null>(null)
  const usedIds = useRef(new Set<number>())
  const playItems = useRef(regional.items)
  const playEntryNumbers = useRef(regional.entryNumbers)
  const request = useRef<AbortController | null>(null)
  const checkingTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    request.current?.abort()
    if (checkingTimer.current) clearTimeout(checkingTimer.current)
  }, [])

  const currentScope: GameScope = {
    activeGameId: selection,
    gameTitle: isAll ? 'Todos los juegos' : game.title,
    pokedexLabel: isAll ? 'Pokédex nacional I–V' : `Pokédex regional de ${game.region}`,
    generation: isAll ? 5 : game.generation,
  }

  const prepareRound = async (state: PlayState) => {
    request.current?.abort()
    const controller = new AbortController()
    request.current = controller
    setLoadingRound(true)
    setRoundError(null)
    setLiveRound(null)
    try {
      const pokemon = await generateTypeGuessPokemon({
        items: playItems.current,
        entryNumbers: playEntryNumbers.current,
        generation: state.scope.generation,
        excludedIds: usedIds.current,
        signal: controller.signal,
      })
      if (controller.signal.aborted) return
      usedIds.current.add(pokemon.id)
      setLiveRound({ pokemon, selectedTypes: [], hintUsed: false, correction: null })
    } catch {
      if (!controller.signal.aborted) setRoundError('No pudimos preparar este Pokémon. Comprueba la conexión y vuelve a intentarlo.')
    } finally {
      if (!controller.signal.aborted) setLoadingRound(false)
    }
  }

  const startGame = () => {
    const startedAt = Date.now()
    const next: PlayState = {
      id: createTypeGuessSessionId(startedAt), scope: currentScope, startedAt, finishedAt: null,
      streak: 0, bestStreak: 0, hits: 0, partialAnswers: 0, withoutDetails: 0, rounds: [],
    }
    playItems.current = regional.items
    playEntryNumbers.current = regional.entryNumbers
    usedIds.current = new Set()
    setSavedSession(null)
    setPlay(next)
    setStage('playing')
    void prepareRound(next)
  }

  const chooseType = (type: string) => {
    if (!liveRound || liveRound.correction || checking) return
    setLiveRound({ ...liveRound, selectedTypes: [...toggleTypeSelection(liveRound.selectedTypes, type)] })
  }

  const checkAnswer = () => {
    if (!play || !liveRound || liveRound.selectedTypes.length === 0 || liveRound.correction || checking) return
    setChecking(true)
    checkingTimer.current = setTimeout(() => {
      const correction = correctTypeGuess(liveRound.selectedTypes, liveRound.pokemon.actualTypes)
      const streak = correction.result === 'correct' ? play.streak + 1 : 0
      const record: TypeGuessRound = {
        index: play.rounds.length + 1,
        pokemon: {
          id: liveRound.pokemon.id,
          name: liveRound.pokemon.name,
          sprite: liveRound.pokemon.sprite,
          actualTypes: liveRound.pokemon.actualTypes,
          regionalNumber: liveRound.pokemon.regionalNumber,
        },
        selectedTypes: liveRound.selectedTypes,
        result: correction.result,
        hintUsed: liveRound.hintUsed,
        answeredAt: Date.now(),
      }
      const isFinal = record.index === TYPE_GUESS_TOTAL_ROUNDS
      setLiveRound({ ...liveRound, correction })
      setPlay({
        ...play,
        streak,
        bestStreak: Math.max(play.bestStreak, streak),
        hits: play.hits + Number(correction.result === 'correct'),
        partialAnswers: play.partialAnswers + Number(correction.result === 'partial'),
        withoutDetails: play.withoutDetails + Number(correction.result === 'correct' && !liveRound.hintUsed),
        rounds: [...play.rounds, record],
        finishedAt: isFinal ? Date.now() : null,
      })
      setChecking(false)
      checkingTimer.current = null
    }, 260)
  }

  const continueGame = () => {
    if (!play || !liveRound?.correction) return
    if (play.rounds.length >= TYPE_GUESS_TOTAL_ROUNDS) {
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

  const openDetails = () => {
    if (!liveRound) return
    if (!liveRound.correction && !liveRound.hintUsed) setLiveRound({ ...liveRound, hintUsed: true })
    setDetailsOpen(true)
  }

  const saveAttempt = () => {
    if (!play || play.rounds.length !== TYPE_GUESS_TOTAL_ROUNDS) return
    const session: TypeGuessSession = {
      id: play.id, gameType: 'type-guess', name: '', activeGameId: play.scope.activeGameId,
      gameTitle: play.scope.gameTitle, pokedexLabel: play.scope.pokedexLabel, generation: play.scope.generation,
      startedAt: play.startedAt, finishedAt: play.finishedAt ?? Date.now(), score: play.hits,
      bestStreak: play.bestStreak, totalRounds: TYPE_GUESS_TOTAL_ROUNDS, partialAnswers: play.partialAnswers,
      withoutDetails: play.withoutDetails, rounds: play.rounds,
    }
    const saved = saveTypeGuessSession(session, attemptName)
    if (!saved) { setSaveError('No se pudo guardar el intento en este dispositivo.'); return }
    setSavedSession(saved)
    setSaveError(null)
    setSaveOpen(false)
  }

  if (stage === 'setup') {
    const ready = regional.status === 'success' && regional.items.length > 0
    return (
      <div className="page-stack">
        <PageHeader eyebrow="Juegos · Aprende a reconocer tipos" title="Adivina el tipo" description="Observa cada Pokémon y descubre su tipo o combinación de tipos." actions={<Button asChild variant="outline"><Link to="/more/juegos/adivina-el-tipo/historial"><History aria-hidden />Historial</Link></Button>} />
        <GamePreparationCard icon={Shapes} gameTitle={currentScope.gameTitle} pokedexLabel={currentScope.pokedexLabel} entryCount={regional.status === 'success' ? regional.entryCount : undefined} tone="blue" />
        {regional.status === 'error' && <StatusState title="No se pudo cargar esta Pokédex" description="Reintenta la carga antes de empezar." tone="error" compact><Button onClick={regional.retry}>Reintentar</Button></StatusState>}
        <Button size="lg" className="w-full" disabled={!ready} onClick={startGame}><Play weight="fill" aria-hidden />{regional.status === 'loading' ? 'Preparando Pokédex…' : 'Empezar · 10 Pokémon'}</Button>
      </div>
    )
  }

  if (!play) return null

  if (stage === 'summary') {
    const accuracy = Math.round((play.hits / TYPE_GUESS_TOTAL_ROUNDS) * 100)
    return (
      <div className="page-stack">
        <PageHeader eyebrow={play.scope.gameTitle} title="Partida completada" description="Has terminado las 10 preguntas de tipos." actions={<Button asChild variant="outline"><Link to="/more/juegos/adivina-el-tipo/historial"><History aria-hidden />Historial</Link></Button>} />
        <GameResultCard result={<>{play.hits} / {TYPE_GUESS_TOTAL_ROUNDS}</>} subtitle="respuestas completamente correctas" metrics={[
          { label: 'Mejor racha', value: play.bestStreak },
          { label: 'Sin detalles', value: play.withoutDetails },
          { label: 'Parciales', value: play.partialAnswers },
        ]} />
        <p className="text-center text-sm text-muted-foreground">Precisión: <strong className="text-foreground">{accuracy} %</strong></p>
        <div className="grid gap-3 sm:grid-cols-2">
          {savedSession ? <Button asChild size="lg"><Link to={`/more/juegos/adivina-el-tipo/historial/${savedSession.id}`}><CheckCircle aria-hidden />Ver intento guardado</Link></Button> : <Button size="lg" onClick={() => { setAttemptName(''); setSaveError(null); setSaveOpen(true) }}><Save aria-hidden />Guardar intento</Button>}
          <Button size="lg" variant="secondary" onClick={startGame}><Play aria-hidden />Jugar otra vez</Button>
          <Button asChild size="lg" variant="outline" className="sm:col-span-2"><Link to="/more"><ArrowLeft aria-hidden />Volver a Juegos</Link></Button>
        </div>
        <SaveAttemptDialog open={saveOpen} onOpenChange={setSaveOpen} value={attemptName} onValueChange={setAttemptName} placeholder={nextTypeGuessAttemptName()} error={saveError} onSave={saveAttempt} />
      </div>
    )
  }

  const roundNumber = play.rounds.length + (liveRound?.correction ? 0 : 1)
  return (
    <div className="grid gap-3 sm:gap-4">
      <header className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={leaveGame}><ArrowLeft aria-hidden />Salir</Button>
        <div className="flex items-center gap-3 text-xs font-semibold"><span className="flex items-center gap-1"><Flame className="size-4 text-ui-lavender-strong" weight="fill" aria-hidden />Racha {play.streak}</span><Badge variant="secondary">{Math.min(roundNumber, TYPE_GUESS_TOTAL_ROUNDS)} / {TYPE_GUESS_TOTAL_ROUNDS}</Badge></div>
      </header>

      {loadingRound && <StatusState title="Preparando Pokémon…" description="Cargando una especie de esta Pokédex." tone="loading" compact />}
      {roundError && <StatusState title="No se pudo cargar la ronda" description={roundError} tone="error" compact><Button onClick={() => void prepareRound(play)}>Reintentar</Button><Button variant="outline" onClick={leaveGame}>Volver</Button></StatusState>}

      {liveRound && (
        <>
          <section className="text-center" aria-labelledby="type-guess-pokemon">
            <div className="mx-auto flex size-40 items-center justify-center rounded-[var(--radius-xl)] border border-border bg-card shadow-[var(--shadow-xs)] sm:size-52">
              {liveRound.pokemon.sprite ? <img src={liveRound.pokemon.sprite} alt={liveRound.pokemon.name} className={cn('size-36 object-contain transition-transform duration-200 sm:size-48', liveRound.correction?.result === 'correct' && 'scale-105')} /> : <Shapes className="size-14 text-muted-foreground" aria-label="Artwork no disponible" />}
            </div>
            <h1 id="type-guess-pokemon" className="mt-2 text-2xl font-black">{liveRound.pokemon.name}</h1>
            <p className="text-sm text-muted-foreground">#{String(liveRound.pokemon.regionalNumber).padStart(3, '0')}</p>
            {!liveRound.correction ? <Button variant="ghost" size="sm" className="mt-1" onClick={openDetails}><Info aria-hidden />Ver detalles</Button> : <Button asChild variant="ghost" size="sm" className="mt-1"><Link to={`/pokemon/${liveRound.pokemon.id}`} target="_blank" rel="noopener noreferrer"><Eye aria-hidden />Ver ficha completa</Link></Button>}
          </section>

          {!liveRound.correction && (
            <section aria-labelledby="type-question">
              <div className="mb-2 flex items-end justify-between gap-2"><div><h2 id="type-question" className="text-lg font-bold">¿De qué tipo es?</h2><p className="text-xs text-muted-foreground">Selecciona uno o dos tipos. El orden no importa.</p></div><span className="text-xs font-semibold tabular-nums text-muted-foreground">{liveRound.selectedTypes.length}/2</span></div>
              <div className="flex flex-wrap justify-center gap-1.5" role="group" aria-label="Selecciona los tipos">
                {POKEMON_TYPE_SLUGS.map((type) => <TypeChip key={type} type={type} as="button" interactive size="compact" pressed={liveRound.selectedTypes.includes(type)} disabled={checking} ariaLabel={`${getPokemonTypeStyle(type)?.label ?? type}${liveRound.selectedTypes.includes(type) ? ', seleccionado' : ''}`} onClick={() => chooseType(type)} />)}
              </div>
              <Button size="lg" className="mt-3 w-full" disabled={liveRound.selectedTypes.length === 0 || checking} onClick={checkAnswer}>
                {checking ? <><LoaderCircle className="animate-spin" aria-hidden />Comprobando…</> : <><CheckCircle aria-hidden />Comprobar</>}
              </Button>
            </section>
          )}

          <Feedback round={liveRound} />
          {liveRound.correction && <Button size="lg" className="w-full" onClick={continueGame}>{play.rounds.length >= TYPE_GUESS_TOTAL_ROUNDS ? 'Ver resultado' : 'Siguiente Pokémon'}</Button>}

          <Sheet open={detailsOpen} onOpenChange={setDetailsOpen}>
            <SheetContent side="bottom">
              <SheetHeader><SheetTitle>Pistas sobre {liveRound.pokemon.name}</SheetTitle><SheetDescription>Información adicional sin revelar sus tipos.</SheetDescription></SheetHeader>
              <PokemonDetails pokemon={liveRound.pokemon} />
              <SheetFooter><Button variant="outline" onClick={() => setDetailsOpen(false)}>Cerrar detalles</Button></SheetFooter>
            </SheetContent>
          </Sheet>
        </>
      )}
    </div>
  )
}
