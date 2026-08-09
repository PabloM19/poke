export interface TourStep {
  route: string
  target: string
  title: string
  description: string
}

export const tourSteps: readonly TourStep[] = [
  {
    route: '/search',
    target: '[data-tour="home-overview"]',
    title: 'Tu punto de partida',
    description: 'Inicio reúne la consulta rápida y, con el uso, aquello que quieras retomar.',
  },
  {
    route: '/search',
    target: '[data-tour="search-field"]',
    title: 'Encuentra un Pokémon',
    description: 'Busca por nombre o número para abrir una ficha; si falta el índice, Inicio te indica cómo prepararlo.',
  },
  {
    route: '/pokemon/25',
    target: '[data-tour="pokemon-identity"]',
    title: 'Consulta su ficha',
    description: 'Aquí encontrarás tipos, estadísticas y defensa histórica, además de acciones para guardar y comparar.',
  },
  {
    route: '/compare?ids=25,150',
    target: '[data-tour="combat-tools"]',
    title: 'Planifica y compara',
    description: 'Las herramientas conservan el contexto del juego activo para comparar datos correctamente.',
  },
  {
    route: '/manuales',
    target: '[data-tour="manuals-home"]',
    title: 'Aprende a tu ritmo',
    description: 'Manuales reúne conceptos, guías por juego y recursos enlazados con el libro físico.',
  },
  {
    route: '/manuales',
    target: '[data-tour="main-navigation"]',
    title: 'Muévete con facilidad',
    description: 'La navegación mantiene cerca Inicio, Pokédex, Manuales, Herramientas y Guardados.',
  },
  {
    route: '/search',
    target: '[data-tour="home-overview"]',
    title: 'Continúa después',
    description: 'Los Pokémon recientes y el punto de lectura de las guías aparecerán aquí de forma local.',
  },
]
