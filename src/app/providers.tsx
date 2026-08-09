import type { ReactNode } from 'react'
import { ThemeProvider } from './ThemeProvider'
import { GameProvider } from '@/features/games'
import { SpoilerPreferenceProvider } from '@/features/manuals/spoilers/SpoilerPreferenceProvider'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <GameProvider>
        <SpoilerPreferenceProvider>{children}</SpoilerPreferenceProvider>
      </GameProvider>
    </ThemeProvider>
  )
}
