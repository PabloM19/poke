import { getPokemonTypeStyle } from '@/features/types/typeStyles'

const STAT_NAMES: Record<string, string> = {
  hp: 'PS',
  attack: 'Ataque',
  defense: 'Defensa',
  'special-attack': 'Ataque Especial',
  special: 'Especial',
  'special-defense': 'Defensa Especial',
  speed: 'Velocidad',
  accuracy: 'Precisión',
  evasion: 'Evasión',
}

const LEARN_METHOD_NAMES: Record<string, string> = {
  'level-up': 'Subiendo de nivel',
  machine: 'MT o MO',
  tutor: 'Tutor de movimientos',
  egg: 'Huevo',
  'stadium-surfing-pikachu': 'Pikachu Surfista de Stadium',
  'light-ball-egg': 'Huevo con Bola Luminosa',
  'colosseum-purification': 'Purificación en Colosseum',
  'xd-shadow': 'Pokémon oscuro en XD',
  'xd-purification': 'Purificación en XD',
  'form-change': 'Cambio de forma',
}

const VERSION_GROUP_NAMES: Record<string, string> = {
  'diamond-pearl': 'Diamante y Perla',
  platinum: 'Platino',
  'heartgold-soulsilver': 'HeartGold y SoulSilver',
  'black-white': 'Negro y Blanco',
  'black-2-white-2': 'Negro 2 y Blanco 2',
}

const GENERATION_NAMES: Record<string, string> = {
  'generation-i': 'Generación I',
  'generation-ii': 'Generación II',
  'generation-iii': 'Generación III',
  'generation-iv': 'Generación IV',
  'generation-v': 'Generación V',
  'generation-vi': 'Generación VI',
  'generation-vii': 'Generación VII',
  'generation-viii': 'Generación VIII',
  'generation-ix': 'Generación IX',
}

export function humanizePokeApiName(value: string): string {
  const normalized = value.trim().replaceAll('-', ' ')
  return normalized.length === 0
    ? '—'
    : normalized[0].toUpperCase() + normalized.slice(1)
}

export function translatePokemonType(value: string): string {
  return getPokemonTypeStyle(value)?.label ?? humanizePokeApiName(value)
}

export function translatePokemonStat(value: string, abbreviated = false): string {
  if (abbreviated && value === 'special-attack') return 'At. Esp.'
  if (abbreviated && value === 'special-defense') return 'Def. Esp.'
  return STAT_NAMES[value] ?? humanizePokeApiName(value)
}

export function translateMoveLearnMethod(value: string): string {
  return LEARN_METHOD_NAMES[value] ?? humanizePokeApiName(value)
}

export function translateVersionGroup(value: string): string {
  return VERSION_GROUP_NAMES[value] ?? humanizePokeApiName(value)
}

export function translateGeneration(value: string): string {
  return GENERATION_NAMES[value] ?? humanizePokeApiName(value)
}
