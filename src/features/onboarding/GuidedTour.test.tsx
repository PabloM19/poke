import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { GuidedTour } from './GuidedTour'
import { getOnboardingState, restartOnboarding, skipOnboarding } from './onboardingState'

describe('recorrido guiado', () => {
  beforeEach(() => localStorage.clear())

  it('aparece en primera visita, avanza y se puede saltar', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter initialEntries={['/search']}><div data-tour="home-overview" /><div data-tour="search-field" /><GuidedTour /></MemoryRouter>)

    expect(screen.getByRole('dialog', { name: 'Bienvenido a PokéApp' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Empezar recorrido' }))
    expect(await screen.findByRole('heading', { name: 'Tu punto de partida' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Siguiente' }))
    expect(await screen.findByRole('heading', { name: 'Encuentra un Pokémon' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Anterior' }))
    expect(await screen.findByRole('heading', { name: 'Tu punto de partida' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Siguiente' }))
    await user.click(screen.getByRole('button', { name: 'Saltar' }))
    expect(getOnboardingState()).toMatchObject({ status: 'skipped', currentStep: 1 })
  })

  it('no reaparece tras saltarlo y puede reiniciarse', async () => {
    skipOnboarding()
    render(<MemoryRouter initialEntries={['/search']}><div data-tour="home-overview" /><GuidedTour /></MemoryRouter>)
    expect(screen.queryByText('Bienvenido a PokéApp')).not.toBeInTheDocument()
    restartOnboarding()
    expect(await screen.findByRole('heading', { name: 'Tu punto de partida' })).toBeInTheDocument()
  })
})
