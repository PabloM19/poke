import { Heart } from '@/components/icons'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { FavoritePokemonCard } from '@/features/favorites/FavoritePokemonCard'
import { useFavoriteSpeciesIds } from '@/features/favorites/useFavoriteSpeciesIds'
import { BentoCard } from '@/components/ui/card'

export function FavoritesPage() {
  const speciesIds = useFavoriteSpeciesIds()

  return (
    <div className="page-stack">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ui-lavender-strong">Tu colección</p>
        <h1 className="page-title mt-1">Guardados</h1>
        <p className="mt-2 text-muted-foreground">
          {speciesIds.length > 0
            ? `${speciesIds.length} ${speciesIds.length === 1 ? 'Pokémon guardado' : 'Pokémon guardados'} en este navegador.`
            : 'Guarda aquí los Pokémon que quieras tener siempre a mano.'}
        </p>
      </div>

      {speciesIds.length === 0 ? (
        <BentoCard tone="lavender" className="px-5 py-12 text-center">
          <Heart className="mx-auto size-10 text-muted-foreground" aria-hidden />
          <h2 className="mt-4 text-lg font-semibold">Aún no tienes favoritos</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
            Toca el corazón de una ficha o tarjeta para añadir un Pokémon.
          </p>
          <Button asChild variant="outline" className="mt-5">
            <Link to="/search">Buscar Pokémon</Link>
          </Button>
        </BentoCard>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {speciesIds.map((speciesId) => (
            <FavoritePokemonCard key={speciesId} speciesId={speciesId} />
          ))}
        </div>
      )}
    </div>
  )
}
