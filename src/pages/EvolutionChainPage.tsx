import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowDown, ArrowLeft, CheckCircle, Dna, Flame, History, Play, Save, XCircle } from '@/components/icons'
import { PageHeader } from '@/components/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BentoCard } from '@/components/ui/card'
import { StatusState } from '@/components/ui/status-state'
import {
  createEvolutionChainSessionId,
  EVOLUTION_CHAIN_TOTAL_ROUNDS,
  generateEvolutionRound,
  nextEvolutionChainAttemptName,
  saveEvolutionChainSession,
  type EvolutionChainRound,
  type EvolutionChainSession,
  type EvolutionFamilySnapshot,
  type GeneratedEvolutionRound,
} from '@/features/evolutionChain'
import { GamePreparationCard, GameResultCard, SaveAttemptDialog } from '@/features/gameSessions'
import { getMainGameContext, useGameContext, type GameSelection, type MainGameContext } from '@/features/games'
import { useRegionalPokedexItems } from '@/features/pokedex/useRegionalPokedexItems'
import type { PokemonSummaryItem } from '@/features/pokedex/summary'
import { cn } from '@/lib/utils'

interface GameScope {
  activeGameId: GameSelection
  gameTitle: string
  pokedexLabel: string
  generation: 4 | 5
  dataGame: MainGameContext
}

interface PlayState {
  id: string
  scope: GameScope
  startedAt: number
  finishedAt: number | null
  rounds: EvolutionChainRound[]
  streak: number
  bestStreak: number
  hits: number
}

interface LiveRound extends GeneratedEvolutionRound {
  selectedOrder: number[]
  checked: boolean
  correct: boolean | null
}

type GameStage = 'setup' | 'playing' | 'summary'

function familyName(family: EvolutionFamilySnapshot): string {
  return family.stages.map((stage) => stage.name).join(' → ')
}

function OrderedFamily({ family, compact = false }: { family: EvolutionFamilySnapshot; compact?: boolean }) {
  return (
    <ol className="grid gap-1.5" aria-label={`Orden correcto: ${familyName(family)}`}>
      {family.stages.map((stage, index) => (
        <li key={stage.id}>
          {index > 0 && <ArrowDown className="mx-auto mb-1 size-4 text-muted-foreground" aria-hidden />}
          <div className={cn('mx-auto flex items-center rounded-[var(--radius-md)] border border-border bg-card/85 shadow-[var(--shadow-xs)]', compact ? 'max-w-xs gap-2 px-3 py-2' : 'max-w-sm gap-3 px-4 py-2.5')}>
            <span className={cn('flex shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-secondary/70', compact ? 'size-10' : 'size-12')}>
              {stage.sprite ? <img src={stage.sprite} alt="" className={cn('object-contain', compact ? 'size-9' : 'size-11')} /> : <span className="font-bold" aria-hidden>?</span>}
            </span>
            <span className="min-w-0 text-left">
              <strong className="block truncate text-sm">{stage.name}</strong>
              {stage.method && <span className="block text-xs text-muted-foreground">{stage.method}</span>}
            </span>
          </div>
        </li>
      ))}
    </ol>
  )
}

function EvolutionChoice({
  pokemon,
  position,
  disabled,
  onClick,
}: {
  pokemon: EvolutionFamilySnapshot['stages'][number]
  position: number | null
  disabled: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-label={`${pokemon.name}${position ? `, posición ${position}` : ', sin ordenar'}`}
      aria-pressed={position != null}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'interactive-clay relative flex min-h-40 min-w-0 flex-col items-center justify-center rounded-[var(--radius-lg)] border bg-card px-2 py-3 text-center shadow-[var(--shadow-sm)] outline-none transition-[transform,box-shadow,background-color,border-color] duration-200 motion-reduce:transition-none focus-visible:ring-3 focus-visible:ring-ring/35 disabled:opacity-100',
        position ? 'border-ui-lavender-strong/45 bg-ui-lavender/45 shadow-[var(--shadow-xs)]' : 'border-border hover:bg-accent/35',
      )}
    >
      {position && <span className="absolute left-2 top-2 flex size-7 items-center justify-center rounded-full bg-ui-lavender-strong text-sm font-black text-white shadow-[var(--shadow-xs)]" aria-hidden>{position}</span>}
      <span className="flex size-24 max-w-full items-center justify-center rounded-[var(--radius-md)] bg-secondary/60">
        {pokemon.sprite ? <img src={pokemon.sprite} alt="" className="size-23 object-contain [image-rendering:auto]" /> : <span className="text-2xl font-black" aria-hidden>?</span>}
      </span>
      <strong className="mt-2 block max-w-full truncate text-sm">{pokemon.name}</strong>
    </button>
  )
}

function failedFamilies(rounds: readonly EvolutionChainRound[]): readonly EvolutionChainRound[] {
  return rounds.filter((round) => !round.correct).slice(0, 3)
}

export function EvolutionChainPage() {
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
  const [savedSession, setSavedSession] = useState<EvolutionChainSession | null>(null)
  const usedChainIds = useRef(new Set<number>())
  const playItems = useRef<readonly PokemonSummaryItem[]>(regional.items)
  const request = useRef<AbortController | null>(null)

  useEffect(() => () => request.current?.abort(), [])

  const dataGame = isAll ? getMainGameContext('negro-2') : game
  const currentScope: GameScope = {
    activeGameId: selection,
    gameTitle: isAll ? 'Todos los juegos' : game.title,
    pokedexLabel: isAll ? 'Pokédex nacional I–V' : `Pokédex regional de ${game.region}`,
    generation: dataGame.generation,
    dataGame,
  }

  const prepareRound = async (state: PlayState) => {
    request.current?.abort()
    const controller = new AbortController()
    request.current = controller
    setLoadingRound(true)
    setRoundError(null)
    setLiveRound(null)
    try {
      const generated = await generateEvolutionRound({
        items: playItems.current,
        game: state.scope.dataGame,
        excludedChainIds: usedChainIds.current,
        signal: controller.signal,
      })
      if (controller.signal.aborted) return
      usedChainIds.current.add(generated.family.chainId)
      setLiveRound({ ...generated, selectedOrder: [], checked: false, correct: null })
    } catch {
      if (!controller.signal.aborted) setRoundError('No pudimos preparar otra familia. Comprueba la conexión y vuelve a intentarlo.')
    } finally {
      if (!controller.signal.aborted) setLoadingRound(false)
    }
  }

  const startGame = () => {
    const startedAt = Date.now()
    const next: PlayState = {
      id: createEvolutionChainSessionId(startedAt),
      scope: currentScope,
      startedAt,
      finishedAt: null,
      rounds: [],
      streak: 0,
      bestStreak: 0,
      hits: 0,
    }
    playItems.current = regional.items
    usedChainIds.current = new Set()
    setSavedSession(null)
    setPlay(next)
    setStage('playing')
    void prepareRound(next)
  }

  const togglePokemon = (pokemonId: number) => {
    if (!liveRound || liveRound.checked) return
    const selected = liveRound.selectedOrder.includes(pokemonId)
      ? liveRound.selectedOrder.filter((id) => id !== pokemonId)
      : [...liveRound.selectedOrder, pokemonId]
    setLiveRound({ ...liveRound, selectedOrder: selected })
  }

  const checkOrder = () => {
    if (!play || !liveRound || liveRound.checked || liveRound.selectedOrder.length !== liveRound.family.stages.length) return
    const correctOrder = liveRound.family.stages.map((pokemon) => pokemon.id)
    const correct = liveRound.selectedOrder.every((id, index) => id === correctOrder[index])
    const streak = correct ? play.streak + 1 : 0
    const record: EvolutionChainRound = {
      index: play.rounds.length + 1,
      chainId: liveRound.family.chainId,
      pokemon: liveRound.family.stages,
      presentedOrder: liveRound.presentedOrder,
      selectedOrder: liveRound.selectedOrder,
      correctOrder,
      correct,
    }
    setLiveRound({ ...liveRound, checked: true, correct })
    setPlay({
      ...play,
      rounds: [...play.rounds, record],
      streak,
      bestStreak: Math.max(play.bestStreak, streak),
      hits: play.hits + Number(correct),
    })
  }

  const continueGame = () => {
    if (!play || !liveRound?.checked) return
    if (play.rounds.length >= EVOLUTION_CHAIN_TOTAL_ROUNDS) {
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
    if (!play || play.rounds.length !== EVOLUTION_CHAIN_TOTAL_ROUNDS) return
    const session: EvolutionChainSession = {
      id: play.id,
      gameType: 'evolution-chain',
      name: '',
      activeGameId: play.scope.activeGameId,
      gameTitle: play.scope.gameTitle,
      pokedexLabel: play.scope.pokedexLabel,
      generation: play.scope.generation,
      startedAt: play.startedAt,
      finishedAt: play.finishedAt ?? Date.now(),
      score: play.hits,
      bestStreak: play.bestStreak,
      totalRounds: EVOLUTION_CHAIN_TOTAL_ROUNDS,
      rounds: play.rounds,
    }
    const saved = saveEvolutionChainSession(session, attemptName)
    if (!saved) { setSaveError('No se pudo guardar el intento en este dispositivo.'); return }
    setSavedSession(saved)
    setSaveError(null)
    setSaveOpen(false)
  }

  if (stage === 'setup') {
    return (
      <div className="page-stack">
        <PageHeader eyebrow="Juegos · Evoluciones" title="Cadena evolutiva" description="Ordena Pokémon desde su primera fase hasta su evolución final." actions={<Button asChild variant="outline"><Link to="/more/juegos/cadena-evolutiva/historial"><History aria-hidden />Historial</Link></Button>} />
        <GamePreparationCard icon={Dna} gameTitle={currentScope.gameTitle} pokedexLabel={currentScope.pokedexLabel} entryCount={regional.status === 'success' ? regional.entryCount : undefined} tone="lavender" />
        {regional.status === 'error' ? <StatusState title="No pudimos cargar esta Pokédex" description="La necesitamos para elegir familias relevantes para el juego activo." tone="error"><Button onClick={regional.retry}>Reintentar</Button></StatusState> : <Button size="lg" className="w-full" onClick={startGame} disabled={regional.status !== 'success'}><Play weight="fill" aria-hidden />{regional.status === 'loading' ? 'Preparando Pokédex…' : 'Empezar · 10 familias'}</Button>}
      </div>
    )
  }

  if (!play) return null

  if (stage === 'summary') {
    const accuracy = Math.round((play.hits / EVOLUTION_CHAIN_TOTAL_ROUNDS) * 100)
    const missed = failedFamilies(play.rounds)
    return (
      <div className="page-stack">
        <PageHeader eyebrow={`${play.scope.gameTitle} · Generación ${play.scope.generation === 4 ? 'IV' : 'V'}`} title="Partida completada" description="Has ordenado 10 familias evolutivas." actions={<Button asChild variant="outline"><Link to="/more/juegos/cadena-evolutiva/historial"><History aria-hidden />Historial</Link></Button>} />
        <GameResultCard result={<>{play.hits} / {EVOLUTION_CHAIN_TOTAL_ROUNDS}</>} subtitle="familias bien ordenadas" metrics={[{ label: 'Precisión', value: `${accuracy} %` }, { label: 'Mejor racha', value: play.bestStreak }]} />
        {missed.length > 0 && <BentoCard className="p-4"><h2 className="text-sm font-semibold">Familias para repasar</h2><ul className="mt-2 grid gap-2 text-sm text-muted-foreground">{missed.map((round) => <li key={round.chainId}>{round.pokemon.map((pokemon) => pokemon.name).join(' → ')}</li>)}</ul></BentoCard>}
        <div className="grid gap-3 sm:grid-cols-2">
          {savedSession ? <Button asChild size="lg"><Link to={`/more/juegos/cadena-evolutiva/historial/${savedSession.id}`}><CheckCircle aria-hidden />Ver intento guardado</Link></Button> : <Button size="lg" onClick={() => { setAttemptName(''); setSaveError(null); setSaveOpen(true) }}><Save aria-hidden />Guardar intento</Button>}
          <Button size="lg" variant="secondary" onClick={startGame}><Play aria-hidden />Jugar otra vez</Button>
          <Button asChild size="lg" variant="outline" className="sm:col-span-2"><Link to="/more"><ArrowLeft aria-hidden />Volver a Juegos</Link></Button>
        </div>
        <SaveAttemptDialog open={saveOpen} onOpenChange={setSaveOpen} value={attemptName} onValueChange={setAttemptName} placeholder={nextEvolutionChainAttemptName()} error={saveError} onSave={saveAttempt} />
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:gap-5">
      <header className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={leaveGame}><ArrowLeft aria-hidden />Salir</Button>
        <div className="flex items-center gap-3 text-xs font-semibold"><span className="flex items-center gap-1"><CheckCircle className="size-4 text-ui-green-strong" aria-hidden />{play.hits}</span><span className="flex items-center gap-1"><Flame className="size-4 text-ui-lavender-strong" weight="fill" aria-hidden />{play.streak}</span><Badge variant="secondary">{Math.min(play.rounds.length + Number(!liveRound?.checked), EVOLUTION_CHAIN_TOTAL_ROUNDS)} / {EVOLUTION_CHAIN_TOTAL_ROUNDS}</Badge></div>
      </header>

      {loadingRound && <StatusState title="Buscando una familia…" description="Elegimos una cadena lineal sin repetir." tone="loading" compact />}
      {roundError && <StatusState title="No pudimos preparar la ronda" description={roundError} tone="error" compact><Button onClick={() => void prepareRound(play)}>Reintentar</Button></StatusState>}

      {liveRound && !liveRound.checked && (
        <>
          <section className="text-center" aria-labelledby="evolution-order-title">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ui-blue-strong">Toca en orden</p>
            <h1 id="evolution-order-title" className="mt-1 text-xl font-bold">Ordena la evolución</h1>
            <p className="mt-1 text-xs text-muted-foreground">Toca otra vez una card para deshacerla.</p>
          </section>
          <section className={cn('grid gap-2', liveRound.family.stages.length === 2 ? 'grid-cols-2' : 'grid-cols-3')} aria-label="Pokémon desordenados">
            {liveRound.presentedOrder.map((id) => {
              const pokemon = liveRound.family.stages.find((stage) => stage.id === id)
              if (!pokemon) return null
              const selectedIndex = liveRound.selectedOrder.indexOf(id)
              return <EvolutionChoice key={id} pokemon={pokemon} position={selectedIndex >= 0 ? selectedIndex + 1 : null} disabled={false} onClick={() => togglePokemon(id)} />
            })}
          </section>
          <div className="flex min-h-7 items-center justify-center gap-2" aria-live="polite">
            {liveRound.family.stages.map((pokemon, index) => <span key={pokemon.id} className={cn('flex size-7 items-center justify-center rounded-full border text-xs font-bold transition-colors motion-reduce:transition-none', liveRound.selectedOrder[index] ? 'border-ui-lavender-strong/40 bg-ui-lavender text-ui-lavender-strong' : 'border-border bg-card text-muted-foreground')}>{index + 1}</span>)}
          </div>
          <Button size="lg" className="w-full" disabled={liveRound.selectedOrder.length !== liveRound.family.stages.length} onClick={checkOrder}>Comprobar</Button>
        </>
      )}

      {liveRound?.checked && (
        <section className={cn('rounded-[var(--radius-xl)] border p-4 text-center shadow-[var(--shadow-sm)]', liveRound.correct ? 'border-ui-green-strong/25 bg-ui-green/45' : 'border-ui-yellow-strong/25 bg-ui-yellow/45')} aria-live="polite">
          {liveRound.correct ? <CheckCircle className="mx-auto size-8 text-ui-green-strong" weight="fill" aria-hidden /> : <XCircle className="mx-auto size-8 text-ui-yellow-strong" weight="fill" aria-hidden />}
          <h1 className="mt-1 text-xl font-bold">{liveRound.correct ? '¡Correcto!' : 'Casi'}</h1>
          {!liveRound.correct && <p className="mt-2 text-xs text-muted-foreground">Tu orden: {liveRound.selectedOrder.map((id) => liveRound.family.stages.find((pokemon) => pokemon.id === id)?.name).join(' → ')}</p>}
          <div className="mt-3"><p className="mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Orden correcto</p><OrderedFamily family={liveRound.family} compact /></div>
          <Button className="mt-4 w-full" onClick={continueGame}>{play.rounds.length >= EVOLUTION_CHAIN_TOTAL_ROUNDS ? 'Ver resultado' : 'Siguiente familia'}</Button>
        </section>
      )}
    </div>
  )
}
