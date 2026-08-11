import type { GameSelection } from '@/features/games'

export type GameType = 'type-duel' | 'pokemon-silhouette' | 'type-guess'

export interface GameSession<
  TRound,
  TGameType extends GameType = GameType,
> {
  id: string
  gameType: TGameType
  name: string
  activeGameId: GameSelection
  gameTitle: string
  pokedexLabel: string
  generation: 4 | 5
  startedAt: number
  finishedAt: number
  score: number
  bestStreak: number
  totalRounds: number
  rounds: readonly TRound[]
}
