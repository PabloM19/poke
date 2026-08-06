import type { ReactNode } from 'react'
import { ThemeProvider } from './ThemeProvider'
import { GameProvider } from '@/features/games'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <GameProvider>
        {children}
      </GameProvider>
    </ThemeProvider>
  )
}
