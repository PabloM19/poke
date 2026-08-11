import { useEffect, useState } from 'react'
import { GAME_SESSIONS_EVENT, getGameSessions } from './sessionStore'
import type { GameType } from './model'

export function useGameSessions<T extends GameType>(gameType: T) {
  const [sessions, setSessions] = useState(() => getGameSessions(gameType))

  useEffect(() => {
    const refresh = () => setSessions(getGameSessions(gameType))
    window.addEventListener(GAME_SESSIONS_EVENT, refresh)
    return () => window.removeEventListener(GAME_SESSIONS_EVENT, refresh)
  }, [gameType])

  return sessions
}

