import { describe, expect, it } from 'vitest'
import documentHtml from '../../index.html?raw'
import iconSvg from '../assets/pokeapp-icon.svg?raw'

describe('identidad del documento', () => {
  it('declara idioma, nombre y descripción en español', () => {
    expect(documentHtml).toContain('<html lang="es">')
    expect(documentHtml).toContain('<title>PokéApp · Pokédex y manual Nintendo DS</title>')
    expect(documentHtml).toContain('name="description"')
    expect(documentHtml).toContain('manuales de los juegos de Pokémon para Nintendo DS')
  })

  it('usa la identidad propia y colores del sistema', () => {
    expect(documentHtml).toContain('href="/src/assets/pokeapp-icon.svg"')
    expect(documentHtml).toContain('name="theme-color"')
    expect(documentHtml).not.toContain('vite.svg')
    expect(iconSvg).toContain('<title>Icono de PokéApp</title>')
    expect(iconSvg).toContain('viewBox="0 0 64 64"')
  })
})
