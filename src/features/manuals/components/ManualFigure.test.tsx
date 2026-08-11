import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ManualFigure, ManualFigureCarousel } from './ManualFigure'

const realFigure = {
  id: 'real-shot',
  src: '/manuals/visuals/ranger-capture-bellsprout.png',
  alt: 'Captura de Ranger con un círculo alrededor de Bellsprout',
  caption: 'El trazo debe rodear al Pokémon.',
  credit: 'Nintendo',
  placeholderDescription: 'Un círculo real alrededor de Bellsprout.',
} as const

const secondFigure = {
  ...realFigure,
  id: 'second-shot',
  src: '/manuals/visuals/ranger-capture-combusken.png',
  alt: 'Captura de Ranger con un círculo alrededor de Combusken',
  caption: 'Otro ejemplo de trazo continuo.',
} as const

describe('ManualFigure', () => {
  it('usa semántica de figura, carga diferida y conserva fuente y pie', () => {
    const { container } = render(<ManualFigure {...realFigure} />)

    const image = screen.getByRole('img', { name: realFigure.alt })
    expect(container.querySelector('figure')).toBeInTheDocument()
    expect(image).toHaveAttribute('loading', 'lazy')
    expect(image).toHaveAttribute('decoding', 'async')
    expect(screen.getByText(realFigure.caption)).toBeInTheDocument()
    expect(screen.getByText('Fuente: Nintendo')).toBeInTheDocument()
  })

  it('muestra un fallback descriptivo si el archivo no carga', () => {
    render(<ManualFigure {...realFigure} />)
    fireEvent.error(screen.getByRole('img', { name: realFigure.alt }))

    expect(screen.getByText('Imagen no disponible')).toBeInTheDocument()
    expect(screen.getByText(realFigure.placeholderDescription)).toBeInTheDocument()
  })

  it('permite recorrer un carrusel sin autoplay', () => {
    render(<ManualFigureCarousel id="capture-tour" label="Capturas" figures={[realFigure, secondFigure]} />)

    expect(screen.getByRole('img', { name: realFigure.alt })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Imagen siguiente' }))
    expect(screen.getByRole('img', { name: secondFigure.alt })).toBeInTheDocument()
    expect(screen.getByText('2 / 2')).toBeInTheDocument()
  })
})
