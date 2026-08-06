import { Link, useLocation } from 'react-router-dom'
import {
  BookOpen,
  Ellipsis,
  GitCompare,
  Heart,
  Library,
  Search,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const mobileItems = [
  { to: '/search', label: 'Buscar', icon: Search },
  { to: '/pokedex', label: 'Pokédex', icon: BookOpen },
  { to: '/manuales', label: 'Manuales', icon: Library },
  { to: '/favorites', label: 'Favoritos', icon: Heart },
  {
    to: '/more',
    label: 'Más',
    icon: Ellipsis,
    activePaths: ['/more', '/compare', '/settings'],
  },
] as const

const desktopItems = [
  ...mobileItems.slice(0, 4),
  { to: '/compare', label: 'Comparar', icon: GitCompare },
  { to: '/settings', label: 'Ajustes', icon: Settings },
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
              'flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-xs font-medium transition-colors',
              'touch-manipulation outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              variant === 'mobile'
                ? 'flex-1 flex-col gap-0.5 px-1 py-2'
                : 'flex-row gap-1.5 px-2.5 py-2 lg:px-3',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
            aria-current={isActive ? 'page' : undefined}
            aria-label={item.label}
          >
            <Icon className={cn('shrink-0', variant === 'mobile' ? 'size-5' : 'size-4')} aria-hidden />
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
