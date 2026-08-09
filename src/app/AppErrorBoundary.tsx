import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface State {
  failed: boolean
}

export class AppErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { failed: false }

  static getDerivedStateFromError(): State {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Error no recuperable en PokéApp', error, info)
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <main className="mx-auto flex min-h-screen max-w-lg items-center px-4 py-10">
        <section className="w-full rounded-2xl border border-border bg-card p-6 text-center" role="alert">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive"><AlertTriangle className="size-6" aria-hidden /></div>
          <p className="text-sm font-semibold uppercase tracking-widest text-destructive">Error inesperado</p>
          <h1 className="mt-2 text-2xl font-semibold">PokéApp no pudo continuar</h1>
          <p className="mt-3 leading-6 text-muted-foreground">Tus favoritos y preferencias siguen guardados en este dispositivo. Recarga para volver a intentarlo.</p>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button type="button" onClick={() => window.location.reload()}>Recargar la app</Button>
            <Button asChild variant="outline"><a href="/search">Volver al inicio</a></Button>
          </div>
        </section>
      </main>
    )
  }
}
