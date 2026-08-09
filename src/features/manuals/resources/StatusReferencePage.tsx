import { Link } from 'react-router-dom'
import { useGameContext } from '@/features/games'

const persistentStatuses = [
  { name: 'Parálisis', effect: 'Reduce mucho la Velocidad y a veces impide actuar.', care: 'Antiparalizador, Cura Total o ciertos objetos y movimientos.' },
  { name: 'Quemadura', effect: 'Resta PS cada turno y reduce el daño de muchos ataques físicos.', care: 'Antiquemar, Cura Total o curación equivalente.' },
  { name: 'Veneno', effect: 'Resta PS al final de cada turno. El veneno grave aumenta su daño mientras el Pokémon siga en combate.', care: 'Antídoto, Cura Total o curación equivalente.' },
  { name: 'Sueño', effect: 'Impide elegir acciones normales durante varios turnos.', care: 'Despertar, Cura Total; algunos movimientos solo funcionan dormido.' },
  { name: 'Congelación', effect: 'Impide actuar hasta descongelarse. Algunos movimientos de Fuego pueden ayudar.', care: 'Antihielo, Cura Total o curación equivalente.' },
] as const

const temporaryEffects = [
  ['Confusión', 'Puede hacer que el Pokémon se golpee a sí mismo; desaparece con el tiempo o al retirarlo.'],
  ['Retroceso', 'Impide actuar ese turno. Normalmente solo funciona si el atacante se mueve antes.'],
  ['Enamoramiento', 'A veces impide atacar; desaparece al retirar al Pokémon o al terminar el combate.'],
  ['Drenadoras y trampas', 'Quitan PS o limitan el cambio durante varios turnos; no sustituyen al estado principal.'],
] as const

export function StatusReferencePage() {
  const { game } = useGameContext()
  return (
    <article>
      <p className="text-sm font-semibold text-muted-foreground">R-02 · REFERENCIA DE MECÁNICAS</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">Estados y efectos</h1>
      <p className="mt-3 leading-7 text-muted-foreground">Un Pokémon solo conserva un estado principal a la vez, pero puede sufrir además efectos temporales y cambios de características.</p>
      <div className="my-5 rounded-xl border border-border bg-muted/40 p-4 text-sm">
        <p className="font-medium">{game.title} · Generación {game.generation === 4 ? 'IV' : 'V'}</p>
        <p className="mt-1 text-muted-foreground">Referencia pensada para los juegos principales de Nintendo DS.</p>
      </div>
      <p className="mb-6 text-sm text-muted-foreground">En el manual físico: páginas 49–54 y 153–154.</p>

      <section aria-labelledby="persistent-title">
        <h2 id="persistent-title" className="mb-3 text-xl font-semibold">Estados principales</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {persistentStatuses.map((status) => (
            <article key={status.name} className="rounded-xl border border-border p-4">
              <h3 className="font-semibold">{status.name}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{status.effect}</p>
              <p className="mt-2 text-sm"><strong>Qué hacer:</strong> {status.care}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-8" aria-labelledby="temporary-title">
        <h2 id="temporary-title" className="mb-3 text-xl font-semibold">Efectos temporales</h2>
        <div className="overflow-hidden rounded-xl border border-border">
          <dl className="divide-y divide-border">
            {temporaryEffects.map(([name, description]) => (
              <div key={name} className="p-4 sm:grid sm:grid-cols-[9rem_1fr] sm:gap-4">
                <dt className="font-medium">{name}</dt>
                <dd className="mt-1 text-sm leading-6 text-muted-foreground sm:mt-0">{description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mt-8 rounded-xl border border-border p-4" aria-labelledby="stages-title">
        <h2 id="stages-title" className="text-xl font-semibold">Cambios de características</h2>
        <p className="mt-2 leading-7 text-muted-foreground">Ataque, Defensa, Ataque Especial, Defensa Especial, Velocidad, Precisión y Evasión pueden subir o bajar por niveles durante el combate. No son estados principales y normalmente se reinician al retirar al Pokémon.</p>
      </section>

      <aside className="mt-6 rounded-xl border border-border bg-muted/40 p-4">
        <h2 className="font-semibold">Kit sencillo de curación</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">Lleva algunas curas específicas para ahorrar dinero y una o dos Curas Totales para emergencias. Antes de una ruta larga, revisa también PS, PP y objetos equipados.</p>
      </aside>

      <nav className="mt-8 flex flex-wrap gap-3" aria-label="Recursos relacionados">
        <Link className="text-sm font-medium text-primary hover:underline" to="/manuales/entrenador/combate">Volver a Comprender el combate</Link>
        <Link className="text-sm font-medium text-primary hover:underline" to="/manuales/recursos/r-01">Abrir R-01 · Tipos</Link>
        <Link className="text-sm font-medium text-primary hover:underline" to="/manuales/recursos/r-03">Siguiente: R-03 · Iconos</Link>
      </nav>
    </article>
  )
}
