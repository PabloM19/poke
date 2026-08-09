import type { ReactNode } from 'react'
import { GameProvider } from '@/features/games'
import { SpoilerPreferenceProvider } from '@/features/manuals/spoilers/SpoilerPreferenceProvider'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <GameProvider>
      <SpoilerPreferenceProvider>{children}</SpoilerPreferenceProvider>
    </GameProvider>
  )
}
