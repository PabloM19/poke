import { Link, useLocation } from 'react-router-dom'
import {
  BookOpen,
  GitCompare,
  Heart,
  Library,
  Search,
} from '@/components/icons'
import { cn } from '@/lib/utils'

const mobileItems = [
  { to: '/search', label: 'Inicio', icon: Search },
  { to: '/pokedex', label: 'Pokédex', icon: BookOpen },
  { to: '/manuales', label: 'Manuales', icon: Library },
  {
    to: '/more',
    label: 'Herramientas',
    icon: GitCompare,
    activePaths: ['/more', '/compare', '/settings'],
  },
  { to: '/favorites', label: 'Guardados', icon: Heart },
] as const

const desktopItems = [
  ...mobileItems,
] as const

export type AppNavVariant = 'mobile' | 'desktop'

function matchesSegment(pathname: string, route: string): boolean {
  return pathname === route || pathname.startsWith(`${route}/`)
}

export function AppNav({ variant = 'mobile' }: { variant?: AppNavVariant }) {
  const location = useLocation()
  const navItems = variant === 'mobile' ? mobileItems : desktopItems

  return (
    <nav
      className={cn(
        'flex items-center justify-center gap-1',
        variant === 'desktop' && 'gap-1 lg:gap-2'
      )}
      aria-label={variant === 'mobile' ? 'Navegación principal móvil' : 'Navegación principal'}
    >
      {navItems.map((item) => {
        const activePaths = 'activePaths' in item ? item.activePaths : [item.to]
        const isActive = activePaths.some((route) => matchesSegment(location.pathname, route))
        const Icon = item.icon
        return (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              'interactive-clay flex min-h-11 min-w-11 items-center justify-center rounded-[var(--radius-md)] text-xs font-semibold',
              'touch-manipulation outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              variant === 'mobile'
                ? 'flex-1 flex-col gap-0.5 px-0.5 py-1.5'
                : 'flex-row gap-1.5 px-3 py-2',
              isActive
                ? 'bg-ui-green text-ui-green-strong shadow-[var(--shadow-xs)] ring-1 ring-ui-green-strong/15'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
            aria-current={isActive ? 'page' : undefined}
            aria-label={item.label}
          >
            <Icon
              className={cn('shrink-0', variant === 'mobile' ? 'size-[1.35rem]' : 'size-[1.125rem]')}
              weight={isActive ? 'fill' : 'regular'}
              aria-hidden
            />
            <span className={cn(
              variant === 'mobile' && 'max-w-full text-[0.625rem] leading-none tracking-[-0.01em]',
              variant === 'mobile' && item.label === 'Herramientas' && 'text-[0.55rem]'
            )}>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
