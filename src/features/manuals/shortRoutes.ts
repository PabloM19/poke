export const shortManualDestinations = {
  'r-01': '/manuales/recursos/r-01',
  'r-02': '/manuales/recursos/r-02',
  'r-03': '/manuales/recursos/r-03',
  'r-04': '/manuales/recursos/r-04',
  'r-05': '/manuales/recursos/r-05',
  'r-06': '/manuales/recursos/r-06',
  perla: '/manuales/juegos/perla',
  platino: '/manuales/juegos/platino',
  heartgold: '/manuales/juegos/oro-heartgold',
  negro: '/manuales/juegos/negro',
  'negro-2': '/manuales/juegos/negro-2',
  'rescate-azul': '/manuales/juegos/equipo-rescate-azul',
  'exploradores-oscuridad': '/manuales/juegos/exploradores-oscuridad',
  ranger: '/manuales/juegos/ranger',
  dash: '/manuales/juegos/dash',
  link: '/manuales/juegos/link',
  conquest: '/manuales/juegos/conquest',
} as const

export type ShortManualCode = keyof typeof shortManualDestinations

export function getShortManualDestination(code: string | undefined): string | null {
  if (code == null || !(code in shortManualDestinations)) return null
  return shortManualDestinations[code as ShortManualCode]
}
