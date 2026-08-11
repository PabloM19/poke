import { useGameSessions } from '@/features/gameSessions'

export function useTypeDuelSessions() {
  return useGameSessions('type-duel')
}
