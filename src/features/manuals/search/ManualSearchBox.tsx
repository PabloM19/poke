import { useDeferredValue, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Gamepad2, Search, Shapes } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { searchManuals, type ManualSearchResultKind } from './searchIndex'

const kindConfig: Record<ManualSearchResultKind, { label: string; icon: typeof BookOpen }> = {
  article: { label: 'Lección', icon: BookOpen },
  game: { label: 'Juego', icon: Gamepad2 },
  resource: { label: 'Recurso', icon: Shapes },
}

export function ManualSearchBox() {
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query)
  const results = searchManuals(deferredQuery)
  const showResults = query.trim().length >= 2

  return (
    <section className="mb-8" aria-labelledby="manual-search-title">
      <h2 id="manual-search-title" className="mb-3 text-lg font-semibold">Encuentra una respuesta</h2>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Ej.: captura, hambre, Perla o R-01"
          aria-label="Buscar en Manuales"
          className="h-12 pl-10"
        />
      </div>
      {showResults && (
        <div className="mt-3 rounded-xl border border-border bg-card p-2" role="region" aria-label="Resultados del manual">
          {results.length > 0 ? (
            <ul className="divide-y divide-border">
              {results.map((result) => {
                const config = kindConfig[result.kind]
                const Icon = config.icon
                return (
                  <li key={`${result.kind}-${result.id}`}>
                    <Link to={result.path} className="flex min-h-14 items-start gap-3 rounded-lg p-3 outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring">
                      <Icon className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden />
                      <span className="min-w-0">
                        <span className="block font-medium">{result.title}</span>
                        <span className="mt-0.5 block text-sm text-muted-foreground">{config.label} · {result.description}</span>
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="p-3 text-sm text-muted-foreground">No hay resultados. Prueba con otro concepto o nombre de juego.</p>
          )}
        </div>
      )}
    </section>
  )
}
