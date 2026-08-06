import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { ContinueReadingCard } from './ContinueReadingCard'
import { ReadingProgressControls } from './ReadingProgressControls'
import { getManualReadingProgress, recordLastRead } from './readingProgress'

const path = '/manuales/entrenador/combate'

describe('controles de progreso', () => {
  it('registra el último artículo y alterna la lectura', async () => {
    const user = userEvent.setup()
    render(<ReadingProgressControls articlePath={path} />)

    expect(getManualReadingProgress().lastPath).toBe(path)
    await user.click(screen.getByRole('button', { name: 'Marcar como leída' }))
    expect(screen.getByText('Lección completada')).toBeInTheDocument()
    expect(getManualReadingProgress().completedPaths).toContain(path)
    await user.click(screen.getByRole('button', { name: 'Marcar pendiente' }))
    expect(getManualReadingProgress().completedPaths).not.toContain(path)
  })

  it('ofrece continuar desde la portada', () => {
    recordLastRead(path)
    render(<MemoryRouter><ContinueReadingCard /></MemoryRouter>)
    expect(screen.getByRole('link', { name: /Continuar leyendo.*Comprender el combate/ }))
      .toHaveAttribute('href', path)
  })
})
