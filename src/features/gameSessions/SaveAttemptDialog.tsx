import { Save } from '@/components/icons'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

export function SaveAttemptDialog({
  open,
  onOpenChange,
  value,
  onValueChange,
  placeholder,
  error,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  value: string
  onValueChange: (value: string) => void
  placeholder: string
  error: string | null
  onSave: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Guardar intento</DialogTitle>
          <DialogDescription>Puedes ponerle un nombre para reconocerlo en el historial.</DialogDescription>
        </DialogHeader>
        <label className="text-sm font-medium" htmlFor="game-attempt-name">Nombre opcional</label>
        <Input id="game-attempt-name" value={value} maxLength={80} placeholder={placeholder} onChange={(event) => onValueChange(event.target.value)} />
        {error && <p className="text-sm font-medium text-destructive" role="alert">{error}</p>}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={onSave}><Save aria-hidden />Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

