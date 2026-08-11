import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { SpoilerPreferenceProvider } from '@/features/manuals/spoilers/SpoilerPreferenceProvider'
import { getSetting } from '@/lib/storage'
import { SettingsPage } from './SettingsPage'

function renderPage() {
  return render(
    <MemoryRouter>
      <SpoilerPreferenceProvider>
        <SettingsPage />
      </SpoilerPreferenceProvider>
    </MemoryRouter>
  )
}

describe('Ajustes', () => {
  it('ordena las preferencias, la privacidad y los datos por secciones', () => {
    renderPage()

    expect(screen.getByRole('heading', { name: 'Tu experiencia' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Ayuda y actividad' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Datos y conexión' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Avanzado/ })).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByText(/Por ahora solo se guarda/)).not.toBeInTheDocument()
  })

  it('permite elegir una vista explícita para la Pokédex', async () => {
    const user = userEvent.setup()
    renderPage()
    const listButton = screen.getByRole('button', { name: 'Lista' })

    expect(listButton).toHaveAttribute('aria-pressed', 'false')
    await user.click(listButton)

    expect(listButton).toHaveAttribute('aria-pressed', 'true')
    expect(getSetting('defaultView', 'grid')).toBe('list')
  })

  it('permite desactivar el registro de actividad reciente', async () => {
    const user = userEvent.setup()
    renderPage()
    const activitySwitch = screen.getByRole('switch', { name: 'Guardar actividad reciente' })

    expect(activitySwitch).toBeChecked()
    await user.click(activitySwitch)

    expect(activitySwitch).not.toBeChecked()
    expect(getSetting('recentActivity', 'enabled')).toBe('disabled')
  })

  it('mantiene el diagnóstico técnico plegado hasta que se solicita', async () => {
    const user = userEvent.setup()
    renderPage()

    expect(screen.queryByRole('button', { name: 'Comprobar conexión' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Avanzado/ }))
    expect(screen.getByRole('button', { name: 'Comprobar conexión' })).toBeInTheDocument()
  })
})
