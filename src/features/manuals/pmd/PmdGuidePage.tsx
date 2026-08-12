import { Link } from 'react-router-dom'
import { ShieldCheck, Sparkles, Users } from '@/components/icons'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PokemonReferenceGrid } from '../components/PokemonReferenceCard'
import { ManualFigureCarousel } from '../components/ManualFigure'
import { manualVisualCatalog } from '../content/manualVisuals'
import { LessonCallout, LessonSteps, PhysicalReference } from '../components/LessonBlocks'
import { ReadingProgressControls } from '../progress/ReadingProgressControls'
import type { PokemonReference } from '../content/types'

const protagonists: readonly (PokemonReference & { type: string })[] = [
  { speciesId: 1, name: 'Bulbasaur', type: 'Planta/Veneno' },
  { speciesId: 4, name: 'Charmander', type: 'Fuego' },
  { speciesId: 7, name: 'Squirtle', type: 'Agua' },
  { speciesId: 25, name: 'Pikachu', type: 'Eléctrico' },
  { speciesId: 52, name: 'Meowth', type: 'Normal' },
  { speciesId: 54, name: 'Psyduck', type: 'Agua' },
  { speciesId: 66, name: 'Machop', type: 'Lucha' },
  { speciesId: 104, name: 'Cubone', type: 'Tierra' },
  { speciesId: 133, name: 'Eevee', type: 'Normal' },
  { speciesId: 152, name: 'Chikorita', type: 'Planta' },
  { speciesId: 155, name: 'Cyndaquil', type: 'Fuego' },
  { speciesId: 158, name: 'Totodile', type: 'Agua' },
  { speciesId: 252, name: 'Treecko', type: 'Planta' },
  { speciesId: 255, name: 'Torchic', type: 'Fuego' },
  { speciesId: 258, name: 'Mudkip', type: 'Agua' },
  { speciesId: 300, name: 'Skitty', type: 'Normal' },
]

const companionIds = new Set([1, 4, 7, 25, 152, 155, 158, 252, 255, 258])
const companions = protagonists.filter((pokemon) => companionIds.has(pokemon.speciesId))

export function SpeciesChoiceGrid({
  title,
  entries,
}: {
  title: string
  entries: readonly (PokemonReference & { type: string })[]
}) {
  return (
    <section>
      <div className="mb-4">
        <h2 className="text-2xl font-semibold">{title}</h2>
      </div>
      <PokemonReferenceGrid references={entries} />
    </section>
  )
}

const ranks = [
  ['Normal', 'Rango inicial'], ['Bronce', '50 puntos'], ['Plata', '500 puntos'],
  ['Oro', '1.500 puntos'], ['Platino', '3.000 puntos'], ['Diamante', '7.500 puntos'],
  ['Lucario', '15.000 puntos'],
] as const

export function PmdGuidePage() {
  return (
    <article className="space-y-10">
      <header className="overflow-hidden rounded-[var(--radius-xl)] border border-border bg-ui-blue/40 p-5 shadow-[var(--shadow-xs)] sm:p-8">
        <div className="mb-5 flex size-12 items-center justify-center rounded-[var(--radius-md)] bg-ui-blue text-ui-blue-strong shadow-[var(--shadow-xs)]"><ShieldCheck className="size-6" aria-hidden /></div>
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">Mundo Misterioso · Equipo de Rescate</p>
        <h1 className="mt-2 page-title">Equipo de Rescate Azul</h1>
        <p className="mt-3 text-lg font-medium">Encontrar tu identidad mientras haces del mundo un lugar más seguro.</p>
        <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">Abres los ojos y descubres que te has convertido en Pokémon. No recuerdas tu pasado, pero un nuevo compañero confía en ti. Juntos formaréis un equipo de rescate para ayudar a quienes quedan atrapados en territorios peligrosos.</p>
        <div className="mt-5 flex flex-wrap gap-2"><Badge variant="metadata">Sin spoilers de historia</Badge><Badge variant="metadata">· Páginas 129–136</Badge><Badge variant="metadata">· Mecánicas PMD</Badge></div>
      </header>

      <ManualFigureCarousel id="rescue-team-visual-guide" label="Reconoce la base y la mazmorra" figures={[manualVisualCatalog.pmdBlueBase, manualVisualCatalog.pmdBlueDungeon, manualVisualCatalog.pmdBlueMap]} />

      <section>
        <p className="text-sm font-medium text-primary">El test de personalidad</p>
        <h2 className="mt-1 text-2xl font-semibold">¿En qué Pokémon te convertirás?</h2>
        <p className="mt-3 leading-7 text-muted-foreground">Al comenzar responderás varias preguntas. El juego relaciona tus respuestas y tu sexo con uno de dieciséis protagonistas. El resultado cambia la especie y las primeras mazmorras, pero cualquiera puede completar la historia.</p>
      </section>
      <SpeciesChoiceGrid title="Los dieciséis protagonistas" entries={protagonists} />
      <LessonCallout kind="note">El resultado no determina si jugarás mejor o peor. Sus tipos y movimientos solo cambian la forma de afrontar las primeras mazmorras.</LessonCallout>

      <SpeciesChoiceGrid title="Elige a tu acompañante" entries={companions} />
      <LessonCallout kind="tip">Elige entre los iniciales de las tres primeras generaciones y Pikachu. No puede compartir tipo con el protagonista; combina tipos y piensa a quién quieres como interlocutor principal.</LessonCallout>

      <section>
        <div className="mb-4 flex items-center gap-3"><Users className="size-5 text-primary" aria-hidden /><h2 className="text-2xl font-semibold">Equipos rivales y referentes</h2></div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Card><CardHeader><CardTitle>Equipo Bellaco</CardTitle></CardHeader><CardContent className="space-y-3"><p className="font-medium">Gengar · Medicham · Ekans</p><p className="text-sm leading-6 text-muted-foreground">Compite por misiones y recompensas. Gengar utiliza rumores y engaños para poner a otros Pokémon en contra del protagonista.</p></CardContent></Card>
          <Card><CardHeader><CardTitle>Equipo de Alakazam</CardTitle></CardHeader><CardContent className="space-y-3"><p className="font-medium">Alakazam · Charizard · Tyranitar</p><p className="text-sm leading-6 text-muted-foreground">Un equipo experimentado y respetado que representa el nivel al que aspiran los rescatadores principiantes.</p></CardContent></Card>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center gap-3"><Sparkles className="size-5 text-primary" aria-hidden /><h2 className="text-2xl font-semibold">Rangos de rescate</h2></div>
        <p className="mb-4 leading-7 text-muted-foreground">Las misiones conceden puntos. Al acumularlos aumenta la reputación y el rango del equipo.</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{ranks.map(([rank, points]) => <Card key={rank} className="gap-1 py-4"><CardHeader className="px-4"><CardTitle className="text-base">{rank}</CardTitle></CardHeader><CardContent className="px-4 text-sm text-muted-foreground">{points}</CardContent></Card>)}</div>
        <LessonCallout kind="note">Al alcanzar el rango Lucario recibirás una estatua para la base.</LessonCallout>
      </section>

      <LessonSteps title="La vida del equipo" items={[
        'Lee y acepta peticiones de rescate.', 'Agrupa misiones del mismo territorio.',
        'Prepara Bolsa, dinero y compañeros.', 'Explora y cumple los objetivos.',
        'Regresa para recibir recompensas y puntos.',
      ]} />
      <p className="leading-7 text-muted-foreground">La Plaza Pokémon es el centro de operaciones. Allí podrás guardar objetos y dinero, enlazar movimientos y preparar a los reclutados en sus Zonas de Recreo. Las Gomis desarrollan habilidades CI que modifican su comportamiento.</p>

      <section>
        <h2 className="mb-4 text-2xl font-semibold">Tu primera misión</h2>
        <ul className="ml-5 list-disc space-y-2 leading-7"><li>Lleva una Manzana, una Baya Aranja y un Elixir Máx.</li><li>Deposita dinero y objetos valiosos.</li><li>Comprueba movimientos y tácticas.</li><li>Usa los pasillos para combatir de uno en uno.</li><li>Conserva recursos si ya has encontrado las escaleras.</li><li>Regresa a la Plaza después de cada salida.</li></ul>
        <LessonCallout kind="warning" title="Aviso de spoilers">No consultes la causa de los desastres naturales si quieres descubrir la historia sin spoilers.</LessonCallout>
        <Link to="/manuales/recursos/r-04" className="block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"><Card className="gap-2 py-5 transition-colors hover:bg-accent/50"><CardHeader className="px-5"><CardTitle>Recursos de rescate</CardTitle></CardHeader><CardContent className="px-5 text-sm text-muted-foreground">R-04 · objetos PMD · Gomis y CI · Zonas de Recreo · reclutamiento</CardContent></Card></Link>
      </section>

      <PhysicalReference reference={{ edition: 'ds-156-v1', pages: Array.from({ length: 8 }, (_, index) => 129 + index) }} />
      <ReadingProgressControls articlePath="/manuales/juegos/equipo-rescate-azul" />
    </article>
  )
}
