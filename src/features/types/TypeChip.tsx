import type { CSSProperties, ElementType } from 'react'
import { cn } from '@/lib/utils'
import { getPokemonTypeStyle } from './typeStyles'

export type TypeChipVariant = 'solid' | 'soft'
export type TypeChipSize = 'compact' | 'default'

interface TypeChipProps {
  type: string
  variant?: TypeChipVariant
  size?: TypeChipSize
  interactive?: boolean
  className?: string
  as?: 'span' | 'button'
  onClick?: () => void
  pressed?: boolean
  suffix?: string
  ariaLabel?: string
}

type TypeChipCssProperties = CSSProperties & {
  '--type-base'?: string
  '--type-solid'?: string
  '--type-foreground'?: string
}

export function TypeChip({
  type,
  variant = 'soft',
  size = 'default',
  interactive = false,
  className,
  as = 'span',
  onClick,
  pressed,
  suffix,
  ariaLabel,
}: TypeChipProps) {
  const definition = getPokemonTypeStyle(type)
  const Component: ElementType = as
  const style: TypeChipCssProperties | undefined = definition
    ? {
        '--type-base': definition.base,
        '--type-solid': definition.solid,
        '--type-foreground': definition.foreground,
      }
    : undefined

  return (
    <Component
      type={as === 'button' ? 'button' : undefined}
      data-pokemon-type={definition ? type : 'unknown'}
      data-variant={variant}
      aria-pressed={as === 'button' ? pressed : undefined}
      aria-label={ariaLabel}
      onClick={onClick}
      style={style}
      className={cn(
        'inline-flex w-fit shrink-0 items-center justify-center gap-1.5 rounded-full border font-semibold leading-none whitespace-nowrap',
        'data-[variant=solid]:border-transparent data-[variant=solid]:bg-[var(--type-solid)] data-[variant=solid]:text-[var(--type-foreground)]',
        'data-[variant=soft]:border-[color-mix(in_srgb,var(--type-base)_30%,var(--border))] data-[variant=soft]:bg-[color-mix(in_srgb,var(--type-base)_14%,var(--card))] data-[variant=soft]:text-foreground',
        size === 'compact' ? 'min-h-6 px-2 text-[0.6875rem]' : 'min-h-8 px-3 text-xs',
        interactive && 'interactive-clay min-h-11 cursor-pointer px-4 hover:border-[var(--type-base)] focus-visible:outline-none aria-pressed:ring-2 aria-pressed:ring-[var(--type-base)] aria-pressed:ring-offset-2',
        !definition && 'border-border bg-secondary text-secondary-foreground',
        className
      )}
    >
      <span className={cn(suffix && 'tabular-nums')}>
        {definition?.label ?? type}{suffix ? ` ${suffix}` : ''}
      </span>
    </Component>
  )
}
