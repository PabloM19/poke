export type ManualFamily = 'start' | 'trainer' | 'main-games' | 'mystery-dungeon' | 'other' | 'resources'

export interface ManualNavigationEntry {
  path: string
  title: string
  shortTitle: string
  family: ManualFamily
  pages: readonly [number, number]
}

export const manualNavigationEntries: readonly ManualNavigationEntry[] = [
  { path: '/manuales/empezar/que-es-pokemon', title: '¿Qué es un Pokémon?', shortTitle: 'El mundo Pokémon', family: 'start', pages: [21, 23] },
  { path: '/manuales/empezar/crecer-y-combatir', title: 'Crecer y combatir', shortTitle: 'Crecer y combatir', family: 'start', pages: [24, 27] },
  { path: '/manuales/empezar/objetos-y-exploracion', title: 'Objetos y exploración', shortTitle: 'Objetos y exploración', family: 'start', pages: [28, 31] },
  { path: '/manuales/empezar/elegir-recorrido', title: 'Elige tu recorrido', shortTitle: 'Elegir recorrido', family: 'start', pages: [32, 33] },
  { path: '/manuales/empezar/nintendo-ds', title: 'Tu Nintendo DS', shortTitle: 'Nintendo DS', family: 'start', pages: [34, 38] },
  { path: '/manuales/empezar/recursos-y-coleccion', title: 'Recursos y mapa de la colección', shortTitle: 'Recursos', family: 'start', pages: [39, 40] },
  { path: '/manuales/entrenador/primeros-pasos', title: 'Tus primeros pasos', shortTitle: 'Primeros pasos', family: 'trainer', pages: [41, 44] },
  { path: '/manuales/entrenador/explorar-region', title: 'Explorar la región', shortTitle: 'Explorar la región', family: 'trainer', pages: [45, 48] },
  { path: '/manuales/entrenador/combate', title: 'Comprender el combate', shortTitle: 'Combate', family: 'trainer', pages: [49, 54] },
  { path: '/manuales/entrenador/captura', title: 'Capturar Pokémon', shortTitle: 'Captura', family: 'trainer', pages: [55, 56] },
  { path: '/manuales/entrenador/crecimiento', title: 'Experiencia y evolución', shortTitle: 'Crecimiento', family: 'trainer', pages: [57, 59] },
  { path: '/manuales/entrenador/equipo-y-meta', title: 'Equipo, Bolsa y Medallas', shortTitle: 'Equipo y meta', family: 'trainer', pages: [60, 62] },
  { path: '/manuales/mundo-misterioso/equipo-y-ciclo', title: 'Tu equipo y cada nuevo día', shortTitle: 'Equipo y ciclo', family: 'mystery-dungeon', pages: [63, 65] },
  { path: '/manuales/mundo-misterioso/mazmorras', title: 'Cómo funcionan las mazmorras', shortTitle: 'Mazmorras', family: 'mystery-dungeon', pages: [66, 69] },
  { path: '/manuales/mundo-misterioso/supervivencia', title: 'Sobrevivir a una expedición', shortTitle: 'Supervivencia', family: 'mystery-dungeon', pages: [70, 74] },
  { path: '/manuales/mundo-misterioso/companeros', title: 'Compañeros y crecimiento', shortTitle: 'Compañeros', family: 'mystery-dungeon', pages: [75, 76] },
  { path: '/manuales/mundo-misterioso/misiones-y-fracaso', title: 'Misiones, rango y nuevos intentos', shortTitle: 'Misiones y fracaso', family: 'mystery-dungeon', pages: [77, 78] },
  { path: '/manuales/otros', title: 'Otras formas de jugar', shortTitle: 'Otros juegos', family: 'other', pages: [79, 86] },
  { path: '/manuales/juegos/perla', title: 'Pokémon Edición Perla', shortTitle: 'Pokémon Perla', family: 'main-games', pages: [87, 94] },
  { path: '/manuales/juegos/platino', title: 'Pokémon Edición Platino', shortTitle: 'Pokémon Platino', family: 'main-games', pages: [95, 102] },
  { path: '/manuales/juegos/oro-heartgold', title: 'Pokémon Edición Oro HeartGold', shortTitle: 'Oro HeartGold', family: 'main-games', pages: [103, 112] },
  { path: '/manuales/juegos/negro', title: 'Pokémon Edición Negra', shortTitle: 'Pokémon Negro', family: 'main-games', pages: [113, 120] },
  { path: '/manuales/juegos/negro-2', title: 'Pokémon Edición Negra 2', shortTitle: 'Pokémon Negro 2', family: 'main-games', pages: [121, 128] },
  { path: '/manuales/recursos/r-01', title: 'R-01 · Tabla de tipos', shortTitle: 'R-01 · Tipos', family: 'resources', pages: [153, 154] },
  { path: '/manuales/recursos/r-02', title: 'R-02 · Estados y efectos', shortTitle: 'R-02 · Estados', family: 'resources', pages: [153, 154] },
] as const

export const manualFamilyLabels: Record<ManualFamily, string> = {
  start: 'Empieza aquí',
  trainer: 'Ser Entrenador',
  'main-games': 'Guías por juego',
  'mystery-dungeon': 'Mundo Misterioso',
  other: 'Otras formas de jugar',
  resources: 'Recursos',
}

export function getManualEntry(pathname: string): ManualNavigationEntry | null {
  return manualNavigationEntries.find((entry) => entry.path === pathname) ?? null
}

export function getAdjacentManualEntries(pathname: string): {
  previous: ManualNavigationEntry | null
  next: ManualNavigationEntry | null
} {
  const index = manualNavigationEntries.findIndex((entry) => entry.path === pathname)
  if (index < 0) return { previous: null, next: null }
  return {
    previous: manualNavigationEntries[index - 1] ?? null,
    next: manualNavigationEntries[index + 1] ?? null,
  }
}
