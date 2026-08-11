import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Disclosure } from './disclosure'

describe('Disclosure', () => {
  it('hace toda la cabecera pulsable y expone el estado accesible', async () => {
    const user = userEvent.setup()
    render(<Disclosure label="Índice del manual"><a href="/manuales">Manuales</a></Disclosure>)

    const trigger = screen.getByRole('button', { name: 'Índice del manual' })
    const content = screen.getByRole('region', { hidden: true })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(trigger).toHaveAttribute('aria-controls', content.id)
    expect(content).not.toBeVisible()

    await user.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('link', { name: 'Manuales' })).toBeVisible()

    await user.keyboard('{Enter}')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })
})
