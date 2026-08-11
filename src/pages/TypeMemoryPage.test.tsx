import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { GameProvider } from '@/features/games'
import { createTypeMemoryBoard } from '@/features/typeMemory'
import { getPokemonTypeStyle } from '@/features/types'
import { TypeMemoryPage } from './TypeMemoryPage'

function renderPage() {
  return render(<MemoryRouter><GameProvider><TypeMemoryPage /></GameProvider></MemoryRouter>)
}

describe('Memoria de tipos', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('empieza en Fácil y no filtra soluciones mediante aria', async () => {
    const user = userEvent.setup()
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const expected = createTypeMemoryBoard(4, 'easy', () => 0)
    renderPage()
    expect(screen.getByRole('heading', { name: 'Memoria de tipos' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /Fácil/ })).toHaveAttribute('aria-checked', 'true')
    await user.click(screen.getByRole('button', { name: /Empezar · 4 parejas/ }))
    const hiddenCards = screen.getAllByRole('button', { name: /Carta boca abajo, posición/ })
    expect(hiddenCards).toHaveLength(8)
    expect(hiddenCards.every((card) => !/Fuego|Agua|Planta|Eléctrico/.test(card.getAttribute('aria-label') ?? ''))).toBe(true)
    for (const type of expected.types) expect(screen.queryByText(getPokemonTypeStyle(type)!.label)).not.toBeInTheDocument()
  })

  it('crea 12 cartas al escoger Normal', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('radio', { name: /Normal/ }))
    await user.click(screen.getByRole('button', { name: /Empezar · 6 parejas/ }))
    expect(screen.getAllByRole('button', { name: /Carta boca abajo, posición/ })).toHaveLength(12)
  })

  it('ignora doble toque y bloquea una tercera carta mientras evalúa un fallo', () => {
    vi.useFakeTimers()
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const expected = createTypeMemoryBoard(4, 'easy', () => 0)
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: /Empezar · 4 parejas/ }))
    let cards = screen.getAllByRole('button', { name: /Carta boca abajo, posición/ })
    fireEvent.click(cards[0])
    fireEvent.click(cards[0])
    expect(screen.getByText('Intentos 0')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /Nombre |Símbolo del tipo / })).toHaveLength(1)

    const mismatchIndex = expected.cards.findIndex((card) => card.type !== expected.cards[0].type)
    cards = screen.getAllByRole('button').filter((button) => button.getAttribute('aria-label')?.startsWith('Carta boca abajo'))
    const mismatchPosition = expected.cards[mismatchIndex] === expected.cards[0] ? -1 : mismatchIndex + 1
    const mismatchButton = cards.find((button) => button.getAttribute('aria-label') === `Carta boca abajo, posición ${mismatchPosition}`)!
    fireEvent.click(mismatchButton)
    expect(screen.getByLabelText('Tablero de memoria')).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByText('Intentos 1')).toBeInTheDocument()
    const third = screen.getAllByRole('button').find((button) => button.getAttribute('aria-label')?.startsWith('Carta boca abajo'))!
    fireEvent.click(third)
    expect(screen.getAllByRole('button', { name: /Nombre |Símbolo del tipo / })).toHaveLength(2)
    act(() => vi.advanceTimersByTime(750))
    expect(screen.getAllByRole('button', { name: /Carta boca abajo, posición/ })).toHaveLength(8)
  })

  it('completa el tablero solo tras emparejar nombre y símbolo', () => {
    vi.useFakeTimers()
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const expected = createTypeMemoryBoard(4, 'easy', () => 0)
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: /Empezar · 4 parejas/ }))
    for (const type of expected.types) {
      const positions = expected.cards.map((card, index) => card.type === type ? index + 1 : 0).filter(Boolean)
      for (const position of positions) {
        fireEvent.click(screen.getByRole('button', { name: `Carta boca abajo, posición ${position}` }))
      }
    }
    expect(screen.getByText('Parejas 4/4')).toBeInTheDocument()
    act(() => vi.advanceTimersByTime(450))
    expect(screen.getByRole('heading', { name: '¡Completado!' })).toBeInTheDocument()
    expect(screen.getByText('4 parejas')).toBeInTheDocument()
    expect(screen.getByText('Intentos')).toBeInTheDocument()
  })
})
