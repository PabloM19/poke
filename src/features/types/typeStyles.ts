export const POKEMON_TYPE_SLUGS = [
  'normal',
  'fighting',
  'flying',
  'poison',
  'ground',
  'rock',
  'bug',
  'ghost',
  'steel',
  'fire',
  'water',
  'grass',
  'electric',
  'psychic',
  'ice',
  'dragon',
  'dark',
  'fairy',
] as const

export type PokemonTypeSlug = (typeof POKEMON_TYPE_SLUGS)[number]

export interface PokemonTypeStyle {
  readonly base: `#${string}`
  readonly solid: `#${string}`
  readonly foreground: '#2D2A32' | '#FFFDF8'
  readonly label: string
  readonly availableFromGeneration: 1 | 2 | 6
}

/**
 * Canonical type registry. `base` always keeps the requested reference colour;
 * `solid` only differs where contrast needs an accessible adjustment.
 * Soft surfaces are derived from `base` by TypeChip/CSS rather than duplicated.
 */
export const TYPE_STYLES: Record<PokemonTypeSlug, PokemonTypeStyle> = {
  normal: { base: '#9FA19F', solid: '#9FA19F', foreground: '#2D2A32', label: 'Normal', availableFromGeneration: 1 },
  fighting: { base: '#FF8000', solid: '#FF8000', foreground: '#2D2A32', label: 'Lucha', availableFromGeneration: 1 },
  flying: { base: '#81B9EF', solid: '#81B9EF', foreground: '#2D2A32', label: 'Volador', availableFromGeneration: 1 },
  poison: { base: '#9141CB', solid: '#9141CB', foreground: '#FFFDF8', label: 'Veneno', availableFromGeneration: 1 },
  ground: { base: '#915121', solid: '#915121', foreground: '#FFFDF8', label: 'Tierra', availableFromGeneration: 1 },
  rock: { base: '#AFA981', solid: '#AFA981', foreground: '#2D2A32', label: 'Roca', availableFromGeneration: 1 },
  bug: { base: '#91A119', solid: '#91A119', foreground: '#2D2A32', label: 'Bicho', availableFromGeneration: 1 },
  ghost: { base: '#704170', solid: '#704170', foreground: '#FFFDF8', label: 'Fantasma', availableFromGeneration: 1 },
  steel: { base: '#60A1B8', solid: '#60A1B8', foreground: '#2D2A32', label: 'Acero', availableFromGeneration: 2 },
  fire: { base: '#E62829', solid: '#DB2627', foreground: '#FFFDF8', label: 'Fuego', availableFromGeneration: 1 },
  water: { base: '#2980EF', solid: '#2573D7', foreground: '#FFFDF8', label: 'Agua', availableFromGeneration: 1 },
  grass: { base: '#3FA129', solid: '#328121', foreground: '#FFFDF8', label: 'Planta', availableFromGeneration: 1 },
  electric: { base: '#FAC000', solid: '#FAC000', foreground: '#2D2A32', label: 'Eléctrico', availableFromGeneration: 1 },
  psychic: { base: '#EF4179', solid: '#CB3767', foreground: '#FFFDF8', label: 'Psíquico', availableFromGeneration: 1 },
  ice: { base: '#3FD8FF', solid: '#3FD8FF', foreground: '#2D2A32', label: 'Hielo', availableFromGeneration: 1 },
  dragon: { base: '#5060E1', solid: '#5060E1', foreground: '#FFFDF8', label: 'Dragón', availableFromGeneration: 1 },
  dark: { base: '#50413F', solid: '#50413F', foreground: '#FFFDF8', label: 'Siniestro', availableFromGeneration: 2 },
  fairy: { base: '#EF70EF', solid: '#EF70EF', foreground: '#2D2A32', label: 'Hada', availableFromGeneration: 6 },
}

export function isPokemonType(value: string): value is PokemonTypeSlug {
  return Object.hasOwn(TYPE_STYLES, value)
}

export function getPokemonTypeStyle(value: string): PokemonTypeStyle | null {
  return isPokemonType(value) ? TYPE_STYLES[value] : null
}

export function pokemonTypeFromLabel(label: string): PokemonTypeSlug | null {
  const normalized = label.trim().toLocaleLowerCase('es')
  return POKEMON_TYPE_SLUGS.find((type) => TYPE_STYLES[type].label.toLocaleLowerCase('es') === normalized) ?? null
}
