import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GameProvider } from '@/features/games'
import { getEffectivenessSessions, type GeneratedEffectivenessQuestion } from '@/features/effectivenessQuiz'

const mocks = vi.hoisted(() => ({ generateEffectivenessQuestions: vi.fn() }))

vi.mock('@/features/effectivenessQuiz', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/features/effectivenessQuiz')>()
  return { ...actual, generateEffectivenessQuestions: mocks.generateEffectivenessQuestions }
})

import { EffectivenessQuizPage } from './EffectivenessQuizPage'

const questions: GeneratedEffectivenessQuestion[] = [
  { attackingType: 'fire', defendingType: 'grass', multiplier: 2 },
  { attackingType: 'normal', defendingType: 'water', multiplier: 1 },
  { attackingType: 'fire', defendingType: 'water', multiplier: 0.5 },
  { attackingType: 'normal', defendingType: 'ghost', multiplier: 0 },
  { attackingType: 'electric', defendingType: 'water', multiplier: 2 },
  { attackingType: 'water', defendingType: 'normal', multiplier: 1 },
  { attackingType: 'grass', defendingType: 'fire', multiplier: 0.5 },
  { attackingType: 'electric', defendingType: 'ground', multiplier: 0 },
  { attackingType: 'fighting', defendingType: 'normal', multiplier: 2 },
  { attackingType: 'ghost', defendingType: 'water', multiplier: 1 },
]

function renderPage() { return render(<MemoryRouter><GameProvider><EffectivenessQuizPage /></GameProvider></MemoryRouter>) }

beforeEach(() => mocks.generateEffectivenessQuestions.mockReset().mockReturnValue(questions))

describe('¿Es eficaz?', () => {
  it('completa los cuatro multiplicadores, actualiza racha y guarda el intento', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('button', { name: 'Empezar · 10 preguntas' }))

    await user.click(screen.getByRole('button', { name: 'Supereficaz' }))
    expect(screen.getByRole('heading', { name: '¡Correcto!' })).toBeInTheDocument()
    expect(screen.getByText('Fuego es supereficaz contra Planta.')).toBeInTheDocument()
    expect(screen.getByText('×2')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Siguiente' }))

    await user.click(screen.getByRole('button', { name: 'Supereficaz' }))
    expect(screen.getByRole('heading', { name: 'No exactamente' })).toBeInTheDocument()
    expect(screen.getByText('Normal tiene eficacia normal contra Agua.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Siguiente' }))

    const correctAnswers = ['Poco eficaz', 'Sin efecto', 'Supereficaz', 'Eficacia normal', 'Poco eficaz', 'Sin efecto', 'Supereficaz', 'Eficacia normal']
    for (let index = 0; index < correctAnswers.length; index += 1) {
      await user.click(screen.getByRole('button', { name: correctAnswers[index] }))
      await user.click(screen.getByRole('button', { name: index === correctAnswers.length - 1 ? 'Ver resultado' : 'Siguiente' }))
    }

    expect(await screen.findByRole('heading', { name: 'Resultado' })).toBeInTheDocument()
    expect(screen.getByText('9 / 10')).toBeInTheDocument()
    expect(screen.getByText('90 %')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Guardar intento' }))
    await user.click(screen.getByRole('button', { name: 'Guardar' }))
    expect(getEffectivenessSessions()[0]).toMatchObject({ score: 9, bestStreak: 8 })
    expect(getEffectivenessSessions()[0].rounds).toHaveLength(10)
  })
})
