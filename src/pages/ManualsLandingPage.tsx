import { Library } from 'lucide-react'

export function ManualsLandingPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-5 flex size-12 items-center justify-center rounded-xl bg-secondary">
        <Library className="size-6" aria-hidden />
      </div>
      <h1 className="mb-2 text-2xl font-semibold text-foreground">Manuales</h1>
      <p className="text-muted-foreground">
        Aprende los conceptos generales y elige después tu recorrido: Entrenador
        Pokémon o Mundo Misterioso.
      </p>
    </div>
  )
}
