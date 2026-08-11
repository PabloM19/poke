import { Pencil } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

export function RenameAttemptDialog({
  open,
  onOpenChange,
  value,
  onValueChange,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  value: string
  onValueChange: (value: string) => void
  onSave: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Editar nombre</DialogTitle><DialogDescription>El resultado y las rondas no cambiarán.</DialogDescription></DialogHeader>
        <label className="text-sm font-medium" htmlFor="rename-game-attempt">Nombre del intento</label>
        <Input id="rename-game-attempt" value={value} maxLength={80} onChange={(event) => onValueChange(event.target.value)} />
        <DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button><Button disabled={value.trim().length === 0} onClick={onSave}><Pencil aria-hidden />Guardar nombre</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

