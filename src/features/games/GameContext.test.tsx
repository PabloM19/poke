import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { setStored } from '@/lib/storage'
import { GameProvider } from './GameContext'
import { useGameContext } from './useGameContext'
import { GameSelector } from './GameSelector'

function Consumer() {
  const { game } = useGameContext()
  return <output>{game.title} · {game.versionGroup}</output>
}

describe('GameContext', () => {
  it('usa Perla ante almacenamiento ausente o inválido', () => {
    setStored('game-context:v1', { version: 99, slug: 'inventado' })
    render(<GameProvider><Consumer /></GameProvider>)
    expect(screen.getByText('Pokémon Perla · diamond-pearl')).toBeInTheDocument()
  })

  it('comparte y persiste el juego elegido', async () => {
    const user = userEvent.setup()
    const first = render(
      <GameProvider>
        <GameSelector />
        <Consumer />
      </GameProvider>
    )

    await user.selectOptions(screen.getByLabelText('Juego activo'), 'negro-2')
    expect(screen.getByText('Pokémon Negro 2 · black-2-white-2')).toBeInTheDocument()

    first.unmount()
    render(<GameProvider><Consumer /></GameProvider>)
    expect(screen.getByText('Pokémon Negro 2 · black-2-white-2')).toBeInTheDocument()
  })
})
