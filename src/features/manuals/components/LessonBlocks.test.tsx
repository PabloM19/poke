import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  LessonCallout,
  LessonSteps,
  LessonTable,
  PhysicalReference,
  TypeExample,
} from './LessonBlocks'

describe('componentes de lección', () => {
  it('renderiza pasos, avisos, tipos y referencia física de forma semántica', () => {
    render(<>
      <LessonSteps title="Antes de salir" items={['Guarda la partida', 'Revisa la Bolsa']} />
      <LessonCallout kind="warning">No apagues durante el guardado.</LessonCallout>
      <TypeExample matchups={['Agua vence a Fuego', 'Fuego vence a Planta']} />
      <PhysicalReference reference={{ edition: 'ds-156-v1', pages: [24, 25] }} />
      <PhysicalReference reference={{ edition: 'ds-156-v1', pages: [49, 50, 51, 52, 53, 54, 153, 154] }} />
    </>)

    expect(screen.getByRole('list')).toBeInTheDocument()
    expect(screen.getByText('Guarda la partida')).toBeInTheDocument()
    expect(screen.getByText('Revisa la Bolsa')).toBeInTheDocument()
    expect(screen.getByLabelText('Atención')).toHaveTextContent('No apagues')
    expect(screen.getByText('Agua vence a Fuego')).toBeInTheDocument()
    expect(screen.getByText('En el manual físico: páginas 24–25')).toBeInTheDocument()
    expect(screen.getByText('En el manual físico: páginas 49–54 y 153–154')).toBeInTheDocument()
  })

  it('ofrece tabla de escritorio y tarjetas móviles con el mismo contenido', () => {
    render(<LessonTable
      caption="Comparador"
      headers={['Juego', 'Control']}
      rows={[["Ranger", 'Lápiz'], ['Conquest', 'Botones']]}
    />)

    expect(screen.getByRole('table', { name: 'Comparador' })).toBeInTheDocument()
    expect(screen.getAllByText('Ranger')).toHaveLength(2)
    expect(screen.getAllByText('Lápiz')).toHaveLength(2)
  })
})
