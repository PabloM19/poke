import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowDown, ArrowLeft, CheckCircle, CircleDot, Flame, History, Play, Save, XCircle } from '@/components/icons'
import { PageHeader } from '@/components/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BentoCard } from '@/components/ui/card'
import {
  answerForMultiplier,
  createEffectivenessSessionId,
  EFFECTIVENESS_ANSWERS,
  EFFECTIVENESS_TOTAL_ROUNDS,
  effectivenessAnswerLabel,
  effectivenessMultiplierLabel,
  generateEffectivenessQuestions,
  nextEffectivenessAttemptName,
  saveEffectivenessSession,
  type EffectivenessAnswer,
  type EffectivenessRound,
  type EffectivenessSession,
  type GeneratedEffectivenessQuestion,
} from '@/features/effectivenessQuiz'
import { GamePreparationCard, GameResultCard, SaveAttemptDialog } from '@/features/gameSessions'
import { useGameContext, type GameSelection } from '@/features/games'
import { getPokemonTypeStyle, TypeChip } from '@/features/types'
import { cn } from '@/lib/utils'

interface GameScope {
  activeGameId: GameSelection
  gameTitle: string
  rulesLabel: string
  generation: 4 | 5
}

interface PlayState {
  id: string
  scope: GameScope
  startedAt: number
  finishedAt: number | null
  questions: GeneratedEffectivenessQuestion[]
  rounds: EffectivenessRound[]
  streak: number
  bestStreak: number
  hits: number
  selectedAnswer: EffectivenessAnswer | null
}

type GameStage = 'setup' | 'playing' | 'summary'

function typeLabel(type: string): string {
  return getPokemonTypeStyle(type)?.label ?? type
}

function relationSentence(question: GeneratedEffectivenessQuestion): string {
  const attacker = typeLabel(question.attackingType)
  const defender = typeLabel(question.defendingType)
  const answer = answerForMultiplier(question.multiplier)
  if (answer === 'super-effective') return `${attacker} es supereficaz contra ${defender}.`
  if (answer === 'not-very-effective') return `${attacker} es poco eficaz contra ${defender}.`
  if (answer === 'no-effect') return `${attacker} no tiene efecto contra ${defender}.`
  return `${attacker} tiene eficacia normal contra ${defender}.`
}

function reviewTypes(rounds: readonly EffectivenessRound[]): readonly string[] {
  const counts = new Map<string, number>()
  for (const round of rounds.filter((entry) => !entry.correct)) {
    counts.set(round.attackingType, (counts.get(round.attackingType) ?? 0) + 1)
    counts.set(round.defendingType, (counts.get(round.defendingType) ?? 0) + 1)
  }
  return [...counts.entries()].sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0])).slice(0, 2).map(([type]) => type)
}

export function EffectivenessQuizPage() {
  const { game, selection, isAll } = useGameContext()
  const [stage, setStage] = useState<GameStage>('setup')
  const [play, setPlay] = useState<PlayState | null>(null)
  const [saveOpen, setSaveOpen] = useState(false)
  const [attemptName, setAttemptName] = useState('')
  const [saveError, setSaveError] = useState<string | null>(null)
  const [savedSession, setSavedSession] = useState<EffectivenessSession | null>(null)

  const currentScope: GameScope = {
    activeGameId: selection,
    gameTitle: isAll ? 'Todos los juegos' : game.title,
    rulesLabel: `Tabla de tipos · Generación ${isAll ? 'V' : game.generation === 4 ? 'IV' : 'V'}`,
    generation: isAll ? 5 : game.generation,
  }

  const startGame = () => {
    const startedAt = Date.now()
    setSavedSession(null)
    setPlay({
      id: createEffectivenessSessionId(startedAt),
      scope: currentScope,
      startedAt,
      finishedAt: null,
      questions: generateEffectivenessQuestions(currentScope.generation),
      rounds: [],
      streak: 0,
      bestStreak: 0,
      hits: 0,
      selectedAnswer: null,
    })
    setStage('playing')
  }

  const answerQuestion = (selectedAnswer: EffectivenessAnswer) => {
    if (!play || play.selectedAnswer) return
    const question = play.questions[play.rounds.length]
    const correct = selectedAnswer === answerForMultiplier(question.multiplier)
    const streak = correct ? play.streak + 1 : 0
    const record: EffectivenessRound = {
      ...question,
      index: play.rounds.length + 1,
      selectedAnswer,
      correct,
    }
    setPlay({
      ...play,
      rounds: [...play.rounds, record],
      streak,
      bestStreak: Math.max(play.bestStreak, streak),
      hits: play.hits + Number(correct),
      selectedAnswer,
      finishedAt: null,
    })
  }

  const continueGame = () => {
    if (!play?.selectedAnswer) return
    if (play.rounds.length >= EFFECTIVENESS_TOTAL_ROUNDS) {
      setPlay({ ...play, finishedAt: Date.now() })
      setStage('summary')
      return
    }
    setPlay({ ...play, selectedAnswer: null })
  }

  const leaveGame = () => {
    setPlay(null)
    setStage('setup')
  }

  const saveAttempt = () => {
    if (!play || play.rounds.length !== EFFECTIVENESS_TOTAL_ROUNDS) return
    const session: EffectivenessSession = {
      id: play.id,
      gameType: 'type-effectiveness',
      name: '',
      activeGameId: play.scope.activeGameId,
      gameTitle: play.scope.gameTitle,
      pokedexLabel: play.scope.rulesLabel,
      generation: play.scope.generation,
      startedAt: play.startedAt,
      finishedAt: play.finishedAt ?? Date.now(),
      score: play.hits,
      bestStreak: play.bestStreak,
      totalRounds: EFFECTIVENESS_TOTAL_ROUNDS,
      rounds: play.rounds,
    }
    const saved = saveEffectivenessSession(session, attemptName)
    if (!saved) { setSaveError('No se pudo guardar el intento en este dispositivo.'); return }
    setSavedSession(saved)
    setSaveError(null)
    setSaveOpen(false)
  }

  if (stage === 'setup') {
    return (
      <div className="page-stack">
        <PageHeader eyebrow="Juegos · Fundamentos de tipos" title="¿Es eficaz?" description="Practica cómo interactúan los tipos entre sí." actions={<Button asChild variant="outline"><Link to="/more/juegos/es-eficaz/historial"><History aria-hidden />Historial</Link></Button>} />
        <GamePreparationCard icon={CircleDot} gameTitle={currentScope.gameTitle} pokedexLabel={currentScope.rulesLabel} tone="green" />
        <Button size="lg" className="w-full" onClick={startGame}><Play weight="fill" aria-hidden />Empezar · 10 preguntas</Button>
      </div>
    )
  }

  if (!play) return null

  if (stage === 'summary') {
    const accuracy = Math.round((play.hits / EFFECTIVENESS_TOTAL_ROUNDS) * 100)
    const typesToReview = reviewTypes(play.rounds)
    return (
      <div className="page-stack">
        <PageHeader eyebrow={`${play.scope.gameTitle} · Generación ${play.scope.generation === 4 ? 'IV' : 'V'}`} title="Resultado" description="Has completado las 10 relaciones de tipos." actions={<Button asChild variant="outline"><Link to="/more/juegos/es-eficaz/historial"><History aria-hidden />Historial</Link></Button>} />
        <GameResultCard result={<>{play.hits} / {EFFECTIVENESS_TOTAL_ROUNDS}</>} subtitle="respuestas correctas" metrics={[{ label: 'Precisión', value: `${accuracy} %` }, { label: 'Mejor racha', value: play.bestStreak }]} />
        {typesToReview.length > 0 && <BentoCard className="p-4"><h2 className="text-sm font-semibold">Repasa</h2><div className="mt-2 flex flex-wrap gap-2">{typesToReview.map((type) => <TypeChip key={type} type={type} />)}</div></BentoCard>}
        <div className="grid gap-3 sm:grid-cols-2">
          {savedSession ? <Button asChild size="lg"><Link to={`/more/juegos/es-eficaz/historial/${savedSession.id}`}><CheckCircle aria-hidden />Ver intento guardado</Link></Button> : <Button size="lg" onClick={() => { setAttemptName(''); setSaveError(null); setSaveOpen(true) }}><Save aria-hidden />Guardar intento</Button>}
          <Button size="lg" variant="secondary" onClick={startGame}><Play aria-hidden />Jugar otra vez</Button>
          <Button asChild size="lg" variant="outline" className="sm:col-span-2"><Link to="/more"><ArrowLeft aria-hidden />Volver a Juegos</Link></Button>
        </div>
        <SaveAttemptDialog open={saveOpen} onOpenChange={setSaveOpen} value={attemptName} onValueChange={setAttemptName} placeholder={nextEffectivenessAttemptName()} error={saveError} onSave={saveAttempt} />
      </div>
    )
  }

  const question = play.questions[play.rounds.length - Number(play.selectedAnswer != null)] ?? play.questions[play.rounds.length]
  const answeredRound = play.selectedAnswer ? play.rounds.at(-1) ?? null : null
  const correctAnswer = answerForMultiplier(question.multiplier)
  return (
    <div className="grid gap-4 sm:gap-5">
      <header className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={leaveGame}><ArrowLeft aria-hidden />Salir</Button>
        <div className="flex items-center gap-3 text-xs font-semibold"><span className="flex items-center gap-1"><CheckCircle className="size-4 text-ui-green-strong" aria-hidden />{play.hits}</span><span className="flex items-center gap-1"><Flame className="size-4 text-ui-lavender-strong" weight="fill" aria-hidden />{play.streak}</span><Badge variant="secondary">{Math.min(play.rounds.length + Number(!play.selectedAnswer), EFFECTIVENESS_TOTAL_ROUNDS)} / {EFFECTIVENESS_TOTAL_ROUNDS}</Badge></div>
      </header>

      <section className="py-3 text-center" aria-labelledby="effectiveness-question">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Tipo atacante</p>
        <TypeChip type={question.attackingType} variant="solid" className="min-h-12 px-6 text-base" />
        <ArrowDown className="mx-auto my-4 size-7 text-muted-foreground" weight="bold" aria-hidden />
        <TypeChip type={question.defendingType} variant="solid" className="min-h-12 px-6 text-base" />
        <p className="mt-3 text-xs font-medium text-muted-foreground">Tipo defensor</p>
      </section>

      {!play.selectedAnswer ? (
        <section aria-labelledby="effectiveness-question">
          <h1 id="effectiveness-question" className="text-center text-xl font-bold">¿Qué ocurre?</h1>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {EFFECTIVENESS_ANSWERS.map((answer) => <Button key={answer} variant="outline" className="min-h-14 h-auto whitespace-normal px-3 py-2 text-center" onClick={() => answerQuestion(answer)}>{effectivenessAnswerLabel(answer)}</Button>)}
          </div>
        </section>
      ) : answeredRound && (
        <section className={cn('rounded-[var(--radius-lg)] border p-4 text-center shadow-[var(--shadow-xs)]', answeredRound.correct ? 'border-ui-green-strong/25 bg-ui-green/45' : 'border-ui-yellow-strong/25 bg-ui-yellow/45')} aria-live="polite">
          {answeredRound.correct ? <CheckCircle className="mx-auto size-7 text-ui-green-strong" weight="fill" aria-hidden /> : <XCircle className="mx-auto size-7 text-ui-yellow-strong" weight="fill" aria-hidden />}
          <h1 className="mt-1 text-xl font-bold">{answeredRound.correct ? '¡Correcto!' : 'No exactamente'}</h1>
          <p className="mt-2 text-sm leading-6">{relationSentence(question)}</p>
          <p className="mt-1 text-2xl font-black tabular-nums">{effectivenessMultiplierLabel(question.multiplier)}</p>
          {!answeredRound.correct && <p className="mt-2 text-xs text-muted-foreground">Tu respuesta: {effectivenessAnswerLabel(answeredRound.selectedAnswer)} · Correcta: {effectivenessAnswerLabel(correctAnswer)}</p>}
          <Button className="mt-4 w-full" onClick={continueGame}>{play.rounds.length >= EFFECTIVENESS_TOTAL_ROUNDS ? 'Ver resultado' : 'Siguiente'}</Button>
        </section>
      )}
    </div>
  )
}
