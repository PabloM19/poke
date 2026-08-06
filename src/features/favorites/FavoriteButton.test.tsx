import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { getFavoriteSpeciesIds } from './favoritesStore'
import { FavoriteButton } from './FavoriteButton'

describe('FavoriteButton', () => {
  it('añade y quita con estado accesible', async () => {
    const user = userEvent.setup()
    render(<FavoriteButton speciesId={25} speciesName="Pikachu" showLabel />)

    const add = screen.getByRole('button', { name: 'Añadir a favoritos: Pikachu' })
    expect(add).toHaveAttribute('aria-pressed', 'false')
    await user.click(add)
    const remove = screen.getByRole('button', { name: 'Quitar de favoritos: Pikachu' })
    expect(remove).toHaveAttribute('aria-pressed', 'true')
    expect(getFavoriteSpeciesIds()).toEqual([25])

    await user.click(remove)
    expect(getFavoriteSpeciesIds()).toEqual([])
  })

  it('sincroniza dos botones de la misma especie', async () => {
    const user = userEvent.setup()
    render(<>
      <FavoriteButton speciesId={150} speciesName="Mewtwo" />
      <FavoriteButton speciesId={150} speciesName="Mewtwo" />
    </>)

    const buttons = screen.getAllByRole('button', { name: 'Añadir a favoritos: Mewtwo' })
    await user.click(buttons[0])
    expect(screen.getAllByRole('button', { name: 'Quitar de favoritos: Mewtwo' })).toHaveLength(2)
  })
})
