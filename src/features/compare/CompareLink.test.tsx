import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { CompareLink } from './CompareLink'

describe('CompareLink', () => {
  it('crea una URL compartible con la especie inicial', () => {
    render(<MemoryRouter><CompareLink speciesId={25} speciesName="Pikachu" showLabel /></MemoryRouter>)
    expect(screen.getByRole('link', { name: 'Comparar Pikachu' }))
      .toHaveAttribute('href', '/compare?ids=25')
  })
})
