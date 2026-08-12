import { useState } from 'react'
import { Apple, PackageOpen, ShieldCheck, Sparkles } from '@/components/icons'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LessonCallout, PhysicalReference } from '../components/LessonBlocks'
import { ManualFigureCarousel } from '../components/ManualFigure'
import { manualVisualCatalog } from '../content/manualVisuals'

const kitItems = [
  { id: 'food', label: 'Alimento', example: 'Manzana', reason: 'Recupera Tripa; lleva una segunda en territorios largos.' },
  { id: 'health', label: 'Curación', example: 'Baya', reason: 'Restaura PS o cura estados, según el objeto.' },
  { id: 'pp', label: 'Recuperación de PP', example: 'Elixir', reason: 'Devuelve usos a los movimientos cuando se agotan.' },
  { id: 'seed', label: 'Semilla', example: 'Comer o lanzar', reason: 'Puede producir efectos variados o frenar una amenaza.' },
  { id: 'orb', label: 'Orbe o esfera', example: 'Emergencia', reason: 'Altera la situación de una planta; resérvalo para varios enemigos.' },
  { id: 'gear', label: 'Equipo o arrojadizo', example: 'Ventaja y alcance', reason: 'Concede una ventaja al llevarlo o permite responder a distancia.' },
] as const

export function PmdExplorationKitPage() {
  const [checked, setChecked] = useState<readonly string[]>([])
  const toggle = (id: string) => setChecked((current) => current.includes(id)
    ? current.filter((item) => item !== id)
    : [...current, id])

  return (
    <article className="space-y-8">
      <header className="rounded-[var(--radius-xl)] border border-border bg-ui-blue/40 p-5 shadow-[var(--shadow-xs)] sm:p-8">
        <div className="mb-5 flex size-12 items-center justify-center rounded-[var(--radius-md)] bg-ui-blue text-ui-blue-strong shadow-[var(--shadow-xs)]"><PackageOpen className="size-6" aria-hidden /></div>
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">R-04 · Mecánicas de Mundo Misterioso</p>
        <h1 className="mt-2 page-title">Kit de exploración PMD</h1>
        <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">Prepara alimento, PP, semillas, orbes y equipamiento antes de entrar. La mochila también puede ganar combates si cada objeto tiene una función.</p>
        <div className="mt-5 flex flex-wrap gap-2"><Badge variant="metadata">Páginas 70–74 y 153–154</Badge><Badge variant="metadata">· Sin red</Badge></div>
      </header>

      <ManualFigureCarousel id="pmd-kit-in-context" label="La mochila dentro de la mazmorra" figures={[manualVisualCatalog.pmdBlueDungeon, manualVisualCatalog.pmdDarknessDungeon]} />

      <section className="grid gap-3 sm:grid-cols-3">
        <Card><CardHeader><div className="mb-2 flex size-9 items-center justify-center rounded-lg bg-secondary"><Apple className="size-5" aria-hidden /></div><CardTitle>Tripa y PS</CardTitle></CardHeader><CardContent className="text-sm leading-6 text-muted-foreground">La Tripa baja al caminar; a cero, pierdes PS. Lleva alimento y curación.</CardContent></Card>
        <Card><CardHeader><div className="mb-2 flex size-9 items-center justify-center rounded-lg bg-secondary"><Sparkles className="size-5" aria-hidden /></div><CardTitle>PP y control</CardTitle></CardHeader><CardContent className="text-sm leading-6 text-muted-foreground">Reserva movimientos valiosos y usa semillas u orbes para controlar una situación difícil.</CardContent></Card>
        <Card><CardHeader><div className="mb-2 flex size-9 items-center justify-center rounded-lg bg-secondary"><ShieldCheck className="size-5" aria-hidden /></div><CardTitle>Plan de salida</CardTitle></CardHeader><CardContent className="text-sm leading-6 text-muted-foreground">Deposita antes el dinero y los objetos que no quieras arriesgar.</CardContent></Card>
      </section>

      <section aria-labelledby="checklist-title" className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-end justify-between gap-3">
          <div><p className="text-sm font-medium text-primary">Lista local de preparación</p><h2 id="checklist-title" className="mt-1 text-xl font-semibold">Antes de entrar</h2></div>
          <p className="shrink-0 text-sm font-medium" role="status">{checked.length} de {kitItems.length}</p>
        </div>
        <div className="mt-4 space-y-2">
          {kitItems.map((item) => (
            <label key={item.id} className="flex cursor-pointer gap-3 rounded-lg border border-border p-3 has-[:checked]:border-primary/50 has-[:checked]:bg-primary/5">
              <input type="checkbox" checked={checked.includes(item.id)} onChange={() => toggle(item.id)} className="mt-1 size-4 accent-primary" />
              <span className="min-w-0"><span className="block font-medium">{item.label} <span className="font-normal text-muted-foreground">· {item.example}</span></span><span className="mt-1 block text-sm leading-5 text-muted-foreground">{item.reason}</span></span>
            </label>
          ))}
        </div>
      </section>

      <section aria-labelledby="use-title">
        <h2 id="use-title" className="mb-3 text-xl font-semibold">Usar, entregar o lanzar</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ['Usar', 'Aplica el objeto al protagonista.'],
            ['Entregar', 'Permite que lo lleve o use un compañero.'],
            ['Lanzar', 'Alcanza a distancia y puede aplicar el efecto a un enemigo.'],
          ].map(([title, text], index) => <Card key={title} className="gap-2 py-4"><CardHeader className="px-4"><span className="mb-1 flex size-7 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">{index + 1}</span><CardTitle className="text-base">{title}</CardTitle></CardHeader><CardContent className="px-4 text-sm leading-5 text-muted-foreground">{text}</CardContent></Card>)}
        </div>
      </section>

      <LessonCallout kind="tip">Asigna un objeto arrojadizo para responder rápido en los pasillos y conserva los orbes para situaciones con varios enemigos.</LessonCallout>
      <LessonCallout kind="warning" title="No explores por inercia">Si la Tripa, los PP o la curación escasean, prioriza el objetivo o las escaleras en lugar de recorrer cada rincón.</LessonCallout>
      <PhysicalReference reference={{ edition: 'ds-156-v1', pages: [70, 71, 72, 73, 74] }} />
      <nav className="flex flex-wrap gap-3" aria-label="Recursos relacionados">
        <Link className="manual-nav-link" to="/manuales/juegos/equipo-rescate-azul">Equipo de Rescate Azul</Link>
        <Link className="manual-nav-link" to="/manuales/juegos/exploradores-oscuridad">Exploradores de la Oscuridad</Link>
        <Link className="manual-nav-link" to="/manuales/recursos/r-03">Anterior: R-03</Link>
        <Link className="manual-nav-link" to="/manuales/recursos/r-05">Siguiente: R-05 · Ranger</Link>
      </nav>
    </article>
  )
}
