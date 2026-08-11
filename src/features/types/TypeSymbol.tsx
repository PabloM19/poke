import type { ComponentProps } from 'react'
import {
  Bug,
  Circle,
  Dna,
  Drop,
  Eye,
  Feather,
  Flame,
  Flask,
  Ghost,
  Hexagon,
  Leaf,
  Lightning,
  Moon,
  Mountains,
  Settings,
  Snowflake,
  Sparkles,
  Sword,
  type PhosphorIcon,
} from '@/components/icons'
import { cn } from '@/lib/utils'
import type { PokemonTypeSlug } from './typeStyles'

const TYPE_SYMBOLS: Record<PokemonTypeSlug, PhosphorIcon> = {
  normal: Circle,
  fighting: Sword,
  flying: Feather,
  poison: Flask,
  ground: Mountains,
  rock: Hexagon,
  bug: Bug,
  ghost: Ghost,
  steel: Settings,
  fire: Flame,
  water: Drop,
  grass: Leaf,
  electric: Lightning,
  psychic: Eye,
  ice: Snowflake,
  dragon: Dna,
  dark: Moon,
  fairy: Sparkles,
}

export function TypeSymbol({
  type,
  className,
  ...props
}: Omit<ComponentProps<PhosphorIcon>, 'type'> & { type: PokemonTypeSlug }) {
  const Icon = TYPE_SYMBOLS[type]
  return <Icon className={cn('size-6', className)} weight="fill" {...props} />
}
