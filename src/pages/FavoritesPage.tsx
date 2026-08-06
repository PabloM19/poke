import { Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { FavoritePokemonCard } from '@/features/favorites/FavoritePokemonCard'
import { useFavoriteSpeciesIds } from '@/features/favorites/useFavoriteSpeciesIds'

export function FavoritesPage() {
  const speciesIds = useFavoriteSpeciesIds()

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Favoritos</h1>
        <p className="mt-2 text-muted-foreground">
          {speciesIds.length > 0
            ? `${speciesIds.length} ${speciesIds.length === 1 ? 'Pokémon guardado' : 'Pokémon guardados'} en este navegador.`
            : 'Guarda aquí los Pokémon que quieras tener siempre a mano.'}
        </p>
      </div>

      {speciesIds.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-5 py-12 text-center">
          <Heart className="mx-auto size-10 text-muted-foreground" aria-hidden />
          <h2 className="mt-4 text-lg font-semibold">Aún no tienes favoritos</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
            Toca el corazón de una ficha o tarjeta para añadir un Pokémon.
          </p>
          <Button asChild variant="outline" className="mt-5">
            <Link to="/search">Buscar Pokémon</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {speciesIds.map((speciesId) => (
            <FavoritePokemonCard key={speciesId} speciesId={speciesId} />
          ))}
        </div>
      )}
    </>
  )
}
