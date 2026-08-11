import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil } from '@/components/icons'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/button'
import { BentoCard } from '@/components/ui/card'
import { StatusState } from '@/components/ui/status-state'
import { GameResultCard, RenameAttemptDialog } from '@/features/gameSessions'
import { formatMemoryDuration, getTypeMemorySession, renameTypeMemorySession, TYPE_MEMORY_DIFFICULTIES } from '@/features/typeMemory'
import { TypeChip } from '@/features/types'

const dateTimeFormatter = new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium', timeStyle: 'short' })

export function TypeMemorySessionDetailPage() {
  const { sessionId = '' } = useParams()
  const [session, setSession] = useState(() => getTypeMemorySession(sessionId))
  const [renameOpen, setRenameOpen] = useState(false)
  const [name, setName] = useState(session?.name ?? '')

  if (!session) return <StatusState title="Intento no encontrado" description="Puede que se haya borrado del almacenamiento de este dispositivo." tone="error" headingLevel={1}><Button asChild><Link to="/more/juegos/memoria-tipos/historial"><ArrowLeft aria-hidden />Volver al historial</Link></Button></StatusState>

  const rename = () => {
    const updated = renameTypeMemorySession(session.id, name)
    if (!updated) return
    setSession(updated)
    setRenameOpen(false)
  }

  return (
    <div className="page-stack">
      <PageHeader eyebrow={`${session.gameTitle} · ${dateTimeFormatter.format(session.finishedAt)}`} title={session.name} description={`${TYPE_MEMORY_DIFFICULTIES[session.difficulty].label} · ${session.pokedexLabel}`} actions={<Button variant="outline" onClick={() => { setName(session.name); setRenameOpen(true) }}><Pencil aria-hidden />Editar nombre</Button>} />
      <GameResultCard result={<>{session.pairCount} parejas</>} subtitle="tablero completado" metrics={[{ label: 'Intentos', value: session.attempts }, { label: 'Tiempo', value: formatMemoryDuration(session.durationMs) }, { label: 'Mejor racha', value: session.bestStreak }]} />
      <BentoCard className="p-4 sm:p-5">
        <h2 className="text-lg font-semibold">Tipos practicados</h2>
        <div className="mt-3 flex flex-wrap gap-2">{session.typesUsed.map((type) => <TypeChip key={type} type={type} />)}</div>
      </BentoCard>
      <BentoCard className="p-4 sm:p-5">
        <h2 className="text-lg font-semibold">Resumen</h2>
        <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div><dt className="text-muted-foreground">Dificultad</dt><dd className="mt-0.5 font-semibold">{TYPE_MEMORY_DIFFICULTIES[session.difficulty].label}</dd></div>
          <div><dt className="text-muted-foreground">Fecha</dt><dd className="mt-0.5 font-semibold">{dateTimeFormatter.format(session.finishedAt)}</dd></div>
          <div><dt className="text-muted-foreground">Parejas</dt><dd className="mt-0.5 font-semibold">{session.pairCount}</dd></div>
          <div><dt className="text-muted-foreground">Intentos</dt><dd className="mt-0.5 font-semibold">{session.attempts}</dd></div>
        </dl>
      </BentoCard>
      <Button asChild variant="outline"><Link to="/more/juegos/memoria-tipos/historial"><ArrowLeft aria-hidden />Volver al historial</Link></Button>
      <RenameAttemptDialog open={renameOpen} onOpenChange={setRenameOpen} value={name} onValueChange={setName} onSave={rename} />
    </div>
  )
}
