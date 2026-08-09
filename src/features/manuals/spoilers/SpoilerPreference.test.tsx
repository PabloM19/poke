import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { getSetting } from '@/lib/storage'
import { SpoilerGate } from './SpoilerGate'
import { SpoilerPreferenceControl } from './SpoilerPreferenceControl'
import { SpoilerPreferenceProvider } from './SpoilerPreferenceProvider'

function Fixture() {
  return (
    <MemoryRouter>
      <SpoilerPreferenceProvider>
        <SpoilerPreferenceControl />
        <SpoilerGate level="mechanics" title="Combate avanzado"><p>Contenido visible</p></SpoilerGate>
      </SpoilerPreferenceProvider>
    </MemoryRouter>
  )
}

describe('preferencia de spoilers', () => {
  beforeEach(() => localStorage.clear())

  it('oculta mecánicas por defecto y permite revelarlas una vez', async () => {
    const user = userEvent.setup()
    render(<Fixture />)
    expect(screen.queryByText('Contenido visible')).not.toBeInTheDocument()
    expect(screen.getByText(/Tu nivel actual solo muestra contenido sin spoilers/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Mostrar solo esta vez' }))
    expect(screen.getByText('Contenido visible')).toBeInTheDocument()
    expect(getSetting('spoilerLevel', 'none')).toBe('none')
  })

  it('persiste mecánicas desde el selector', async () => {
    const user = userEvent.setup()
    render(<Fixture />)
    await user.selectOptions(screen.getByLabelText('Nivel de spoilers'), 'mechanics')
    expect(screen.getByText('Contenido visible')).toBeInTheDocument()
    expect(getSetting('spoilerLevel', 'none')).toBe('mechanics')
  })
})
