import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle, Flame, History, Play, Question, Save, XCircle } from '@/components/icons'
import { PageHeader } from '@/components/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BentoCard } from '@/components/ui/card'
import { StatusState } from '@/components/ui/status-state'
import { GamePreparationCard, GameResultCard, SaveAttemptDialog } from '@/features/gameSessions'
import { useGameContext, type GameSelection } from '@/features/games'
import {
  createPokemonIntruderSessionId,
  generateIntruderRound,
  nextPokemonIntruderAttemptName,
  POKEMON_INTRUDER_TOTAL_ROUNDS,
  savePokemonIntruderSession,
  type GeneratedIntruderRound,
  type IntruderPokemonSnapshot,
  type PokemonIntruderRound,
  type PokemonIntruderSession,
} from '@/features/pokemonIntruder'
import { useRegionalPokedexItems } from '@/features/pokedex/useRegionalPokedexItems'
import type { PokemonSummaryItem } from '@/features/pokedex/summary'
import { TypeChip } from '@/features/types'
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
  rounds: PokemonIntruderRound[]
  streak: number
  bestStreak: number
  hits: number
}

interface LiveRound extends GeneratedIntruderRound {
  selectedId: number | null
  correct: boolean | null
}

type GameStage = 'setup' | 'playing' | 'summary'

function PokemonChoice({
  pokemon,
  answered,
  selected,
  intruder,
  onSelect,
}: {
  pokemon: IntruderPokemonSnapshot
  answered: boolean
  selected: boolean
  intruder: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      disabled={answered}
      aria-label={`${pokemon.name}${selected ? ', tu elección' : ''}${answered && intruder ? ', intruso' : ''}`}
      onClick={onSelect}
      className={cn(
        'interactive-clay relative flex min-h-40 min-w-0 flex-col items-center justify-center rounded-[var(--radius-lg)] border bg-card px-2 py-3 text-center shadow-[var(--shadow-sm)] outline-none transition-[transform,box-shadow,background-color,border-color] duration-200 motion-reduce:transition-none focus-visible:ring-3 focus-visible:ring-ring/35 disabled:opacity-100',
        !answered && 'hover:bg-accent/35 active:scale-[0.98]',
        answered && intruder && 'border-ui-green-strong/45 bg-ui-green/40 shadow-[var(--shadow-xs)]',
        answered && selected && !intruder && 'border-ui-yellow-strong/45 bg-ui-yellow/45 shadow-[var(--shadow-xs)]',
      )}
    >
      {answered && intruder && <CheckCircle className="absolute right-2 top-2 size-6 text-ui-green-strong" weight="fill" aria-hidden />}
      {answered && selected && !intruder && <XCircle className="absolute right-2 top-2 size-6 text-ui-yellow-strong" weight="fill" aria-hidden />}
      <span className="flex size-24 max-w-full items-center justify-center rounded-[var(--radius-md)] bg-secondary/60">
        {pokemon.sprite ? <img src={pokemon.sprite} alt="" className="size-23 object-contain" /> : <span className="text-2xl font-black" aria-hidden>?</span>}
      </span>
      <strong className="mt-2 block max-w-full truncate text-sm">{pokemon.name}</strong>
      {answered && <span className="mt-1.5 flex flex-wrap justify-center gap-1">{pokemon.types.map((type) => <TypeChip key={type} type={type} size="compact" />)}</span>}
    </button>
  )
}

function reviewTypes(rounds: readonly PokemonIntruderRound[]): readonly string[] {
  const counts = new Map<string, number>()
  for (const round of rounds.filter((entry) => !entry.correct)) counts.set(round.criterion.type, (counts.get(round.criterion.type) ?? 0) + 1)
  return [...counts.entries()].sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0])).slice(0, 3).map(([type]) => type)
}

export function PokemonIntruderPage() {
  const { game, selection, isAll } = useGameContext()
  const regional = useRegionalPokedexItems(isAll ? null : game)
  const [stage, setStage] = useState<GameStage>('setup')
  const [play, setPlay] = useState<PlayState | null>(null)
  const [liveRound, setLiveRound] = useState<LiveRound | null>(null)
  const [loadingRound, setLoadingRound] = useState(false)
  const [roundError, setRoundError] = useState<string | null>(null)
  const [saveOpen, setSaveOpen] = useState(false)
  const [attemptName, setAttemptName] = useState('')
  const [saveError, setSaveError] = useState<string | null>(null)
  const [savedSession, setSavedSession] = useState<PokemonIntruderSession | null>(null)
  const usedPokemonIds = useRef(new Set<number>())
  const usedTypes = useRef(new Set<string>())
  const intruderPositionCounts = useRef([0, 0, 0, 0])
  const playItems = useRef<readonly PokemonSummaryItem[]>(regional.items)
  const request = useRef<AbortController | null>(null)

  useEffect(() => () => request.current?.abort(), [])

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
      const generated = await generateIntruderRound({
        items: playItems.current,
        generation: state.scope.generation,
        excludedPokemonIds: usedPokemonIds.current,
        excludedTypes: usedTypes.current,
        intruderPositionCounts: intruderPositionCounts.current,
        signal: controller.signal,
      })
      if (controller.signal.aborted) return
      for (const pokemon of generated.pokemon) usedPokemonIds.current.add(pokemon.id)
      usedTypes.current.add(generated.criterion.type)
      const position = generated.pokemon.findIndex((pokemon) => pokemon.id === generated.intruderId)
      if (position >= 0) intruderPositionCounts.current[position] += 1
      setLiveRound({ ...generated, selectedId: null, correct: null })
    } catch {
      if (!controller.signal.aborted) setRoundError('No pudimos formar otro grupo claro. Comprueba la conexión y vuelve a intentarlo.')
    } finally {
      if (!controller.signal.aborted) setLoadingRound(false)
    }
  }

  const startGame = () => {
    const startedAt = Date.now()
    const next: PlayState = {
      id: createPokemonIntruderSessionId(startedAt), scope: currentScope, startedAt, finishedAt: null,
      rounds: [], streak: 0, bestStreak: 0, hits: 0,
    }
    playItems.current = regional.items
    usedPokemonIds.current = new Set()
    usedTypes.current = new Set()
    intruderPositionCounts.current = [0, 0, 0, 0]
    setSavedSession(null)
    setPlay(next)
    setStage('playing')
    void prepareRound(next)
  }

  const answer = (selectedId: number) => {
    if (!play || !liveRound || liveRound.selectedId != null) return
    const correct = selectedId === liveRound.intruderId
    const streak = correct ? play.streak + 1 : 0
    const record: PokemonIntruderRound = {
      index: play.rounds.length + 1,
      criterion: liveRound.criterion,
      pokemon: liveRound.pokemon,
      intruderId: liveRound.intruderId,
      selectedId,
      correct,
    }
    setLiveRound({ ...liveRound, selectedId, correct })
    setPlay({ ...play, rounds: [...play.rounds, record], streak, bestStreak: Math.max(play.bestStreak, streak), hits: play.hits + Number(correct) })
  }

  const continueGame = () => {
    if (!play || liveRound?.selectedId == null) return
    if (play.rounds.length >= POKEMON_INTRUDER_TOTAL_ROUNDS) {
      setPlay({ ...play, finishedAt: Date.now() })
      setStage('summary')
      return
    }
    void prepareRound(play)
  }

  const leaveGame = () => {
    request.current?.abort()
    setLiveRound(null)
    setPlay(null)
    setStage('setup')
  }

  const saveAttempt = () => {
    if (!play || play.rounds.length !== POKEMON_INTRUDER_TOTAL_ROUNDS) return
    const session: PokemonIntruderSession = {
      id: play.id, gameType: 'pokemon-intruder', name: '', activeGameId: play.scope.activeGameId,
      gameTitle: play.scope.gameTitle, pokedexLabel: play.scope.pokedexLabel, generation: play.scope.generation,
      startedAt: play.startedAt, finishedAt: play.finishedAt ?? Date.now(), score: play.hits, bestStreak: play.bestStreak,
      totalRounds: POKEMON_INTRUDER_TOTAL_ROUNDS, rounds: play.rounds,
    }
    const saved = savePokemonIntruderSession(session, attemptName)
    if (!saved) { setSaveError('No se pudo guardar el intento en este dispositivo.'); return }
    setSavedSession(saved)
    setSaveError(null)
    setSaveOpen(false)
  }

  if (stage === 'setup') {
    return (
      <div className="page-stack">
        <PageHeader eyebrow="Juegos · Tipos" title="Pokémon intruso" description="Encuentra el Pokémon que no pertenece al grupo." actions={<Button asChild variant="outline"><Link to="/more/juegos/pokemon-intruso/historial"><History aria-hidden />Historial</Link></Button>} />
        <GamePreparationCard icon={Question} gameTitle={currentScope.gameTitle} pokedexLabel={currentScope.pokedexLabel} entryCount={regional.status === 'success' ? regional.entryCount : undefined} tone="yellow" />
        {regional.status === 'error' ? <StatusState title="No pudimos cargar esta Pokédex" description="La necesitamos para crear grupos del juego activo." tone="error"><Button onClick={regional.retry}>Reintentar</Button></StatusState> : <Button size="lg" className="w-full" onClick={startGame} disabled={regional.status !== 'success'}><Play weight="fill" aria-hidden />{regional.status === 'loading' ? 'Preparando Pokédex…' : 'Empezar · 10 grupos'}</Button>}
      </div>
    )
  }

  if (!play) return null

  if (stage === 'summary') {
    const accuracy = Math.round((play.hits / POKEMON_INTRUDER_TOTAL_ROUNDS) * 100)
    const typesToReview = reviewTypes(play.rounds)
    return (
      <div className="page-stack">
        <PageHeader eyebrow={`${play.scope.gameTitle} · Generación ${play.scope.generation === 4 ? 'IV' : 'V'}`} title="Partida completada" description="Has encontrado intrusos en 10 grupos." actions={<Button asChild variant="outline"><Link to="/more/juegos/pokemon-intruso/historial"><History aria-hidden />Historial</Link></Button>} />
        <GameResultCard result={<>{play.hits} / {POKEMON_INTRUDER_TOTAL_ROUNDS}</>} subtitle="intrusos encontrados" metrics={[{ label: 'Precisión', value: `${accuracy} %` }, { label: 'Mejor racha', value: play.bestStreak }]} />
        {typesToReview.length > 0 && <BentoCard className="p-4"><h2 className="text-sm font-semibold">Tipos para repasar</h2><div className="mt-2 flex flex-wrap gap-2">{typesToReview.map((type) => <TypeChip key={type} type={type} />)}</div></BentoCard>}
        <div className="grid gap-3 sm:grid-cols-2">
          {savedSession ? <Button asChild size="lg"><Link to={`/more/juegos/pokemon-intruso/historial/${savedSession.id}`}><CheckCircle aria-hidden />Ver intento guardado</Link></Button> : <Button size="lg" onClick={() => { setAttemptName(''); setSaveError(null); setSaveOpen(true) }}><Save aria-hidden />Guardar intento</Button>}
          <Button size="lg" variant="secondary" onClick={startGame}><Play aria-hidden />Jugar otra vez</Button>
          <Button asChild size="lg" variant="outline" className="sm:col-span-2"><Link to="/more"><ArrowLeft aria-hidden />Volver a Juegos</Link></Button>
        </div>
        <SaveAttemptDialog open={saveOpen} onOpenChange={setSaveOpen} value={attemptName} onValueChange={setAttemptName} placeholder={nextPokemonIntruderAttemptName()} error={saveError} onSave={saveAttempt} />
      </div>
    )
  }

  const answered = liveRound?.selectedId != null
  const intruder = liveRound?.pokemon.find((pokemon) => pokemon.id === liveRound.intruderId)
  return (
    <div className="grid gap-4 sm:gap-5">
      <header className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={leaveGame}><ArrowLeft aria-hidden />Salir</Button>
        <div className="flex items-center gap-3 text-xs font-semibold"><span className="flex items-center gap-1"><CheckCircle className="size-4 text-ui-green-strong" aria-hidden />{play.hits}</span><span className="flex items-center gap-1"><Flame className="size-4 text-ui-lavender-strong" weight="fill" aria-hidden />{play.streak}</span><Badge variant="secondary">{Math.min(play.rounds.length + Number(!answered), POKEMON_INTRUDER_TOTAL_ROUNDS)} / {POKEMON_INTRUDER_TOTAL_ROUNDS}</Badge></div>
      </header>
      {loadingRound && <StatusState title="Preparando el grupo…" description="Buscamos cuatro Pokémon sin una respuesta ambigua." tone="loading" compact />}
      {roundError && <StatusState title="No pudimos preparar la ronda" description={roundError} tone="error" compact><Button onClick={() => void prepareRound(play)}>Reintentar</Button></StatusState>}
      {liveRound && (
        <>
          {!answered && <section className="text-center" aria-labelledby="intruder-title"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-ui-blue-strong">Toca una card</p><h1 id="intruder-title" className="mt-1 text-xl font-bold">¿Cuál es el intruso?</h1></section>}
          <section className="grid grid-cols-2 gap-2" aria-label="Grupo de Pokémon">
            {liveRound.pokemon.map((pokemon) => <PokemonChoice key={pokemon.id} pokemon={pokemon} answered={answered} selected={liveRound.selectedId === pokemon.id} intruder={liveRound.intruderId === pokemon.id} onSelect={() => answer(pokemon.id)} />)}
          </section>
          {answered && intruder && (
            <section className={cn('rounded-[var(--radius-xl)] border p-4 text-center shadow-[var(--shadow-sm)]', liveRound.correct ? 'border-ui-green-strong/25 bg-ui-green/45' : 'border-ui-yellow-strong/25 bg-ui-yellow/45')} aria-live="polite">
              {liveRound.correct ? <CheckCircle className="mx-auto size-8 text-ui-green-strong" weight="fill" aria-hidden /> : <XCircle className="mx-auto size-8 text-ui-yellow-strong" weight="fill" aria-hidden />}
              <h2 className="mt-1 text-xl font-bold">{liveRound.correct ? '¡Correcto!' : 'No exactamente'}</h2>
              <p className="mt-1 text-sm"><strong>{intruder.name}</strong> es el intruso.</p>
              <div className="mt-3 flex items-center justify-center gap-2 text-sm"><span className="text-muted-foreground">Los demás comparten:</span><TypeChip type={liveRound.criterion.type} variant="solid" /></div>
              <Button className="mt-4 w-full" onClick={continueGame}>{play.rounds.length >= POKEMON_INTRUDER_TOTAL_ROUNDS ? 'Ver resultado' : 'Siguiente grupo'}</Button>
            </section>
          )}
        </>
      )}
    </div>
  )
}
