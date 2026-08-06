import type { GameDefinition, ResourceDefinition } from './types'
import { MAIN_GAME_CONTEXTS, type MainGameSlug } from '@/features/games/gameCatalog'

const ref = (start: number, end: number) => ({
  edition: 'ds-156-v1' as const,
  pages: Array.from({ length: end - start + 1 }, (_, index) => start + index),
})

const mainGamePageRanges: Record<MainGameSlug, readonly [number, number]> = {
  perla: [87, 94],
  platino: [95, 102],
  'oro-heartgold': [103, 112],
  negro: [113, 120],
  'negro-2': [121, 128],
}

export const gameDefinitions: readonly GameDefinition[] = [
  ...MAIN_GAME_CONTEXTS.map((game) => ({
    ...game,
    family: 'main' as const,
    printReference: ref(...mainGamePageRanges[game.slug]),
  })),
  { slug: 'equipo-rescate-azul', title: 'Equipo de Rescate Azul', family: 'pmd', generation: null, version: null, versionGroup: null, pokedex: null, printReference: ref(129, 136) },
  { slug: 'exploradores-oscuridad', title: 'Exploradores de la Oscuridad', family: 'pmd', generation: null, version: null, versionGroup: null, pokedex: null, printReference: ref(137, 144) },
  { slug: 'ranger', title: 'Pokémon Ranger', family: 'spin-off', generation: null, version: null, versionGroup: null, pokedex: null, printReference: ref(145, 146) },
  { slug: 'dash', title: 'Pokémon Dash', family: 'spin-off', generation: null, version: null, versionGroup: null, pokedex: null, printReference: ref(147, 148) },
  { slug: 'link', title: 'Pokémon Link!', family: 'spin-off', generation: null, version: null, versionGroup: null, pokedex: null, printReference: ref(149, 150) },
  { slug: 'conquest', title: 'Pokémon Conquest', family: 'spin-off', generation: null, version: null, versionGroup: null, pokedex: null, printReference: ref(151, 152) },
] as const

export const resourceDefinitions: readonly ResourceDefinition[] = [
  { code: 'R-01', title: 'Tabla de tipos', path: '/manuales/recursos/r-01', spoilerLevel: 'none', relatedGames: ['perla', 'platino', 'oro-heartgold', 'negro', 'negro-2'] },
  { code: 'R-02', title: 'Estados y efectos', path: '/manuales/recursos/r-02', spoilerLevel: 'mechanics', relatedGames: ['perla', 'platino', 'oro-heartgold', 'negro', 'negro-2'] },
  { code: 'R-03', title: 'Iconos y símbolos', path: '/manuales/recursos/r-03', spoilerLevel: 'none', relatedGames: [] },
  { code: 'R-04', title: 'Kit de exploración PMD', path: '/manuales/recursos/r-04', spoilerLevel: 'mechanics', relatedGames: ['equipo-rescate-azul', 'exploradores-oscuridad'] },
  { code: 'R-05', title: 'Técnica de captura Ranger', path: '/manuales/recursos/r-05', spoilerLevel: 'mechanics', relatedGames: ['ranger'] },
  { code: 'R-06', title: 'Recordatorio táctico Conquest', path: '/manuales/recursos/r-06', spoilerLevel: 'mechanics', relatedGames: ['conquest'] },
] as const
