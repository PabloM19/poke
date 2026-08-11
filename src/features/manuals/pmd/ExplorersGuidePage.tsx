import { Compass, Skull, Sparkles } from '@/components/icons'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LessonCallout, LessonSteps, PhysicalReference } from '../components/LessonBlocks'
import { ReadingProgressControls } from '../progress/ReadingProgressControls'
import type { PokemonReference } from '../content/types'
import { SpeciesChoiceGrid } from './PmdGuidePage'
import { ManualFigureCarousel } from '../components/ManualFigure'
import { manualVisualCatalog } from '../content/manualVisuals'

const protagonists: readonly (PokemonReference & { type: string })[] = [
  { speciesId: 1, name: 'Bulbasaur', type: 'Planta/Veneno' }, { speciesId: 4, name: 'Charmander', type: 'Fuego' },
  { speciesId: 7, name: 'Squirtle', type: 'Agua' }, { speciesId: 25, name: 'Pikachu', type: 'Eléctrico' },
  { speciesId: 52, name: 'Meowth', type: 'Normal' }, { speciesId: 152, name: 'Chikorita', type: 'Planta' },
  { speciesId: 155, name: 'Cyndaquil', type: 'Fuego' }, { speciesId: 158, name: 'Totodile', type: 'Agua' },
  { speciesId: 252, name: 'Treecko', type: 'Planta' }, { speciesId: 255, name: 'Torchic', type: 'Fuego' },
  { speciesId: 258, name: 'Mudkip', type: 'Agua' }, { speciesId: 300, name: 'Skitty', type: 'Normal' },
  { speciesId: 387, name: 'Turtwig', type: 'Planta' }, { speciesId: 390, name: 'Chimchar', type: 'Fuego' },
  { speciesId: 393, name: 'Piplup', type: 'Agua' }, { speciesId: 446, name: 'Munchlax', type: 'Normal' },
]

const companionIds = new Set([1, 4, 7, 25, 152, 155, 158, 252, 255, 258, 387, 390, 393])
const companions = protagonists.filter((pokemon) => companionIds.has(pokemon.speciesId))
const ranks = ['Normal', 'Bronce', 'Plata', 'Oro', 'Diamante', 'Super', 'Ultra', 'Híper', 'Maestro']

export function ExplorersGuidePage() {
  return (
    <article className="space-y-10">
      <header className="overflow-hidden rounded-[var(--radius-xl)] border border-border bg-ui-blue/40 p-5 shadow-[var(--shadow-sm)] sm:p-8">
        <div className="mb-5 flex size-12 items-center justify-center rounded-[var(--radius-md)] bg-ui-blue text-ui-blue-strong shadow-[var(--shadow-xs)]"><Compass className="size-6" aria-hidden /></div>
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">Mundo Misterioso · Equipo de Exploración</p>
        <h1 className="mt-2 page-title">Exploradores de la Oscuridad</h1>
        <p className="mt-3 text-lg font-medium">Misterio, amistad y exploración a través del tiempo.</p>
        <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">Despiertas convertido en Pokémon y sin recuerdos junto a una playa. Allí conoces a un Pokémon que sueña con ser explorador, pero aún no se atreve a dar el primer paso. Una piedra con un extraño dibujo será el comienzo de vuestra aventura.</p>
        <div className="mt-5 flex flex-wrap gap-2"><Badge variant="secondary">Sin spoilers de historia</Badge><Badge variant="secondary">Páginas 137–144</Badge><Badge variant="secondary">Mecánicas PMD</Badge></div>
      </header>

      <ManualFigureCarousel id="explorers-visual-guide" label="Reconoce Aldea Tesoro y una expedición" figures={[manualVisualCatalog.pmdDarknessTown, manualVisualCatalog.pmdDarknessDungeon, manualVisualCatalog.pmdDarknessMap]} />

      <section><p className="text-sm font-medium text-primary">El test de personalidad</p><h2 className="mt-1 text-2xl font-semibold">¿En qué Pokémon te convertirás?</h2><p className="mt-3 leading-7 text-muted-foreground">El juego propone al protagonista según las respuestas iniciales. Hay dieciséis posibilidades, cada una con un tipo y movimientos distintos.</p></section>
      <SpeciesChoiceGrid title="Los dieciséis protagonistas" entries={protagonists} />
      <LessonCallout kind="note">Todos pueden completar la historia. El tipo, los movimientos y la combinación con el compañero cambian la dificultad de algunas mazmorras.</LessonCallout>

      <SpeciesChoiceGrid title="El Pokémon que creerá en ti" entries={companions} />
      <LessonCallout kind="tip">El juego muestra siete candidatos entre estas trece especies. El compañero no puede compartir tipo con el protagonista y las especies Normal no forman parte de la selección.</LessonCallout>

      <section>
        <div className="mb-4 flex items-center gap-3"><Skull className="size-5 text-primary" aria-hidden /><h2 className="text-2xl font-semibold">Rivales y miembros del gremio</h2></div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Card><CardHeader><CardTitle>Equipo Calavera</CardTitle></CardHeader><CardContent className="space-y-3"><p className="font-medium">Skuntank · Koffing · Zubat</p><p className="text-sm leading-6 text-muted-foreground">Roba tesoros, intimida a principiantes y trata de aprovechar el trabajo ajeno. Es el rival más directo de las primeras etapas.</p></CardContent></Card>
          <Card><CardHeader><CardTitle>Pokégremio</CardTitle></CardHeader><CardContent className="space-y-3"><p className="font-medium">Wigglytuff y Chatot</p><p className="text-sm leading-6 text-muted-foreground">Dirigen el gremio: el maestro aporta entusiasmo imprevisible y Chatot organiza la disciplina y las tareas diarias.</p></CardContent></Card>
        </div>
      </section>

      <section><div className="mb-4 flex items-center gap-3"><Sparkles className="size-5 text-primary" aria-hidden /><h2 className="text-2xl font-semibold">Rangos de exploración</h2></div><p className="mb-4 leading-7 text-muted-foreground">Cada ascenso representa mayor experiencia y aumenta la capacidad de la consigna.</p><div className="grid grid-cols-3 gap-2">{ranks.map((rank, index) => <Card key={rank} className="gap-1 py-4"><CardHeader className="px-3"><CardTitle className="text-sm">{rank}</CardTitle></CardHeader><CardContent className="px-3 text-xs text-muted-foreground">{index === 0 ? 'Punto de partida' : index === ranks.length - 1 ? 'Máximo rango' : 'Rango de exploración'}</CardContent></Card>)}</div></section>

      <LessonSteps title="La vida en el Pokégremio" items={['Consulta los tablones del gremio.', 'Elige encargos por territorio y dificultad.', 'Organiza equipo, Bolsa y movimientos.', 'Explora y cumple los objetivos.', 'Informa del resultado y recibe puntos.']} />
      <p className="leading-7 text-muted-foreground">Las tácticas y habilidades CI controlan a los compañeros. Los objetos exclusivos mejoran especies concretas y los movimientos enlazados ejecutan varias acciones a cambio de más PP.</p>

      <section><h2 className="mb-4 text-2xl font-semibold">Tu primera expedición</h2><ul className="ml-5 list-disc space-y-2 leading-7"><li>Acepta las misiones antes de partir.</li><li>Lleva alimento, curación y recuperación de PP.</li><li>Comprueba desde dónde atacará tu compañero.</li><li>Guarda objetos raros y dinero.</li><li>Usa el registro para comprender cada turno.</li><li>Interrumpe la partida solo mediante la opción indicada.</li></ul><LessonCallout kind="warning" title="Aviso de spoilers">Evita buscar información sobre los Engranajes del Tiempo o el origen del protagonista.</LessonCallout><Link to="/manuales/recursos/r-04" className="block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"><Card className="gap-2 py-5 transition-colors hover:bg-accent/50"><CardHeader className="px-5"><CardTitle>Recursos de exploración</CardTitle></CardHeader><CardContent className="px-5 text-sm text-muted-foreground">R-04 · objetos PMD · tácticas y CI · objetos exclusivos · misiones</CardContent></Card></Link></section>

      <PhysicalReference reference={{ edition: 'ds-156-v1', pages: Array.from({ length: 8 }, (_, index) => 137 + index) }} />
      <ReadingProgressControls articlePath="/manuales/juegos/exploradores-oscuridad" />
    </article>
  )
}
