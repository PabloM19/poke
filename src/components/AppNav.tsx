import { NavLink, useLocation } from 'react-router-dom'
import { Search, BookOpen, Heart, GitCompare, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/search', label: 'Buscar', icon: Search },
  { to: '/pokedex', label: 'Pokédex', icon: BookOpen },
  { to: '/favorites', label: 'Favoritos', icon: Heart },
  { to: '/compare', label: 'Comparar', icon: GitCompare },
  { to: '/settings', label: 'Ajustes', icon: Settings },
] as const

export function AppNav() {
  const location = useLocation()

  return (
    <nav
      className="flex items-center justify-center gap-1 sm:gap-2"
      aria-label="Navegación principal"
    >
      {navItems.map(({ to, label, icon: Icon }) => {
        const isActive = location.pathname === to
        return (
          <NavLink
            key={to}
            to={to}
            className={({ isActive: active }) =>
              cn(
                'flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors sm:min-h-10 sm:flex-row sm:gap-2 sm:rounded-md sm:px-4 sm:text-sm',
                'touch-manipulation outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )
            }
            aria-current={isActive ? 'page' : undefined}
            aria-label={label}
          >
            <Icon className="size-5 shrink-0 sm:size-4" aria-hidden />
            <span>{label}</span>
          </NavLink>
        )
      })}
    </nav>
  )
}
