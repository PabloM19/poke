export interface ManualReturn {
  path: string
  label: string
}

export interface ManualReturnState {
  manualReturn: ManualReturn
}

export function createManualReturnState(path: string, label = 'Volver al manual'): ManualReturnState {
  return { manualReturn: { path, label } }
}

export function readManualReturn(state: unknown): ManualReturn | null {
  if (state == null || typeof state !== 'object' || !('manualReturn' in state)) return null
  const value = (state as { manualReturn?: unknown }).manualReturn
  if (value == null || typeof value !== 'object') return null
  const candidate = value as Partial<ManualReturn>
  if (typeof candidate.path !== 'string' || !candidate.path.startsWith('/manuales/')) return null
  if (typeof candidate.label !== 'string' || candidate.label.length < 1 || candidate.label.length > 80) return null
  return { path: candidate.path, label: candidate.label }
}
