import type { GameDefinition, ResourceDefinition } from './types'

const ref = (start: number, end: number) => ({
  edition: 'ds-156-v1' as const,
  pages: Array.from({ length: end - start + 1 }, (_, index) => start + index),
})

export const gameDefinitions: readonly GameDefinition[] = [
  { slug: 'perla', title: 'Pokémon Perla', family: 'main', generation: 4, version: 'pearl', versionGroup: 'diamond-pearl', pokedex: 'original-sinnoh', printReference: ref(87, 94) },
  { slug: 'platino', title: 'Pokémon Platino', family: 'main', generation: 4, version: 'platinum', versionGroup: 'platinum', pokedex: 'extended-sinnoh', printReference: ref(95, 102) },
  { slug: 'oro-heartgold', title: 'Pokémon Oro HeartGold', family: 'main', generation: 4, version: 'heartgold', versionGroup: 'heartgold-soulsilver', pokedex: 'updated-johto', printReference: ref(103, 112) },
  { slug: 'negro', title: 'Pokémon Negro', family: 'main', generation: 5, version: 'black', versionGroup: 'black-white', pokedex: 'original-unova', printReference: ref(113, 120) },
  { slug: 'negro-2', title: 'Pokémon Negro 2', family: 'main', generation: 5, version: 'black-2', versionGroup: 'black-2-white-2', pokedex: 'updated-unova', printReference: ref(121, 128) },
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
