import {
  clearApiCache,
  getCacheWriteIssue,
  getSetting,
  setSetting,
} from '@/lib/storage'
import {
  getGeneration,
  getPokemon,
  getPokemonSpecies,
  getType,
  getSpanishName,
  PokeApiError,
} from '@/lib/pokeapi'
import {
  buildSpeciesIndex,
  clearSpeciesIndex,
  SpeciesIndexBuildError,
} from '@/lib/pokedex'
import { useSpeciesIndex } from '@/hooks/useSpeciesIndex'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { useCallback, useEffect, useRef, useState } from 'react'
import { SpoilerPreferenceControl } from '@/features/manuals/spoilers/SpoilerPreferenceControl'

type DefaultView = 'grid' | 'list'

type DiagState = 'idle' | 'loading' | 'success' | 'error'

interface DiagResult {
  generation?: { name: string; speciesCount: number }
  type?: { name: string; doubleFrom: number; halfFrom: number; noFrom: number }
  pokemon?: { id: number; name: string; statsCount: number; typesCount: number }
  species?: { id: number; nameEs: string | null }
}

type BuildPhase = 'generations' | 'species' | 'done'

const PHASE_LABELS: Record<BuildPhase, string> = {
  generations: 'Cargando generaciones…',
  species: 'Procesando especies…',
  done: 'Listo',
}

export function SettingsPage() {
  const { meta, status, refresh } = useSpeciesIndex()
  const [defaultView, setDefaultViewState] = useState<DefaultView>(() =>
    getSetting('defaultView', 'grid')
  )
  const [diagState, setDiagState] = useState<DiagState>('idle')
  const [diagResult, setDiagResult] = useState<DiagResult | null>(null)
  const [diagError, setDiagError] = useState<string | null>(null)
  const [cacheIssue, setCacheIssue] = useState(() => getCacheWriteIssue())
  const [cacheNotice, setCacheNotice] = useState<string | null>(null)
  const [buildRunning, setBuildRunning] = useState(false)
  const [buildProgress, setBuildProgress] = useState<{
    done: number
    total: number
    phase: BuildPhase
    currentSpeciesName?: string
  } | null>(null)
  const [buildError, setBuildError] = useState<string | null>(null)
  const [buildNotice, setBuildNotice] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    setSetting('defaultView', defaultView)
  }, [defaultView])

  useEffect(() => () => {
    abortRef.current?.abort()
  }, [])

  const handleDefaultViewChange = useCallback((checked: boolean) => {
    setDefaultViewState(checked ? 'list' : 'grid')
  }, [])

  const startBuild = useCallback(() => {
    if (buildRunning) return
    abortRef.current = new AbortController()
    setBuildRunning(true)
    setBuildProgress({ done: 0, total: 0, phase: 'generations' })
    setBuildError(null)
    setBuildNotice(null)
    buildSpeciesIndex({
      maxGen: 5,
      concurrency: 6,
      signal: abortRef.current.signal,
      onProgress: (p) => {
        setBuildProgress({
          done: p.done,
          total: p.total,
          phase: p.phase as BuildPhase,
          currentSpeciesName: p.currentSpeciesName,
        })
      },
    })
      .then(() => {
        refresh()
        setBuildProgress((prev) => (prev ? { ...prev, phase: 'done' } : null))
      })
      .catch((e) => {
        if (e instanceof SpeciesIndexBuildError && e.kind === 'abort') {
          setBuildNotice(e.message)
        } else {
          setBuildError(e instanceof Error ? e.message : 'Error al construir índice')
        }
      })
      .finally(() => {
        setBuildRunning(false)
        abortRef.current = null
      })
  }, [buildRunning, refresh])

  const cancelBuild = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort()
    }
  }, [])

  const handleClearIndex = useCallback(() => {
    if (buildRunning) return
    clearSpeciesIndex()
    setBuildError(null)
    setBuildNotice(null)
    refresh()
  }, [buildRunning, refresh])

  const runDiagnostic = useCallback(async () => {
    setDiagState('loading')
    setDiagResult(null)
    setDiagError(null)

    try {
      const [generation, typeRes, pokemon, species] = await Promise.all([
        getGeneration(1),
        getType('fire'),
        getPokemon('pikachu'),
        getPokemonSpecies('pikachu'),
      ])

      const nameEs = getSpanishName(species)

      setDiagResult({
        generation: {
          name: generation.name,
          speciesCount: generation.pokemon_species.length,
        },
        type: {
          name: typeRes.name,
          doubleFrom: typeRes.damage_relations.double_damage_from.length,
          halfFrom: typeRes.damage_relations.half_damage_from.length,
          noFrom: typeRes.damage_relations.no_damage_from.length,
        },
        pokemon: {
          id: pokemon.id,
          name: pokemon.name,
          statsCount: pokemon.stats.length,
          typesCount: pokemon.types.length,
        },
        species: { id: species.id, nameEs },
      })
      setDiagState('success')
    } catch (e) {
      if (e instanceof PokeApiError) {
        const parts = [e.message]
        if (e.kind) parts.push(`kind: ${e.kind}`)
        if (e.status != null) parts.push(`status: ${e.status}`)
        if (e.path) parts.push(`path: ${e.path}`)
        setDiagError(parts.join(' · '))
      } else {
        setDiagError(e instanceof Error ? e.message : 'Error desconocido')
      }
      setDiagState('error')
    }
    setCacheIssue(getCacheWriteIssue())
  }, [])

  const handleClearApiCache = useCallback(() => {
    clearApiCache()
    setCacheIssue(null)
    setCacheNotice('Caché de PokeAPI eliminada. Tus preferencias y el índice se conservan.')
  }, [])

  return (
    <>
      <h1 className="page-title">Ajustes</h1>
      <p className="mb-6 mt-2 text-muted-foreground">
        Controla la lectura del manual, tus preferencias de listas y los datos locales.
      </p>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Spoilers del manual</CardTitle>
            <CardDescription>Elige el nivel máximo que puede aparecer sin una confirmación puntual.</CardDescription>
          </CardHeader>
          <CardContent><SpoilerPreferenceControl compact /></CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Vista por defecto</CardTitle>
            <CardDescription>
              Cómo ver las listas de Pokémon (grid o lista). Por ahora solo se
              guarda la preferencia.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-row items-center justify-between">
            <span className="text-sm font-medium text-foreground">
              {defaultView === 'list' ? 'Lista' : 'Cuadrícula'}
            </span>
            <Switch
              checked={defaultView === 'list'}
              onCheckedChange={handleDefaultViewChange}
              aria-label="Alternar entre vista cuadrícula y lista"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Datos de Pokédex (Gen I–V)</CardTitle>
            <CardDescription>
              La primera vez descargamos un índice local para que el buscador y la
              Pokédex sean instantáneos. Se guarda en tu navegador. No afecta a
              favoritos ni otras preferencias.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {meta != null && status === 'ready' && (
              <p className="text-sm text-muted-foreground">
                {meta.counts.species} especies · Gen 1–{meta.maxGen} · Actualizado:{' '}
                {new Date(meta.timestamp).toLocaleString()}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              {!buildRunning && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={startBuild}
                    aria-label={status === 'missing' ? 'Construir índice de especies' : 'Reconstruir índice'}
                  >
                    {status === 'missing' ? 'Construir índice' : 'Reconstruir'}
                  </Button>
                  {status === 'ready' && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleClearIndex}
                      aria-label="Borrar datos locales del índice"
                    >
                      Borrar datos locales
                    </Button>
                  )}
                </>
              )}
              {buildRunning && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={cancelBuild}
                  aria-label="Cancelar construcción"
                >
                  Cancelar
                </Button>
              )}
            </div>
            {buildRunning && buildProgress != null && (
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>{PHASE_LABELS[buildProgress.phase]}</p>
                {buildProgress.total > 0 && (
                  <>
                    <p>
                      {buildProgress.done} / {buildProgress.total} (
                      {Math.round((buildProgress.done / buildProgress.total) * 100)}%)
                    </p>
                    {buildProgress.currentSpeciesName != null &&
                      buildProgress.phase === 'species' && (
                        <p>Última: {buildProgress.currentSpeciesName}</p>
                      )}
                  </>
                )}
              </div>
            )}
            {buildError != null && (
              <p className="text-sm text-destructive" role="alert">
                {buildError}
              </p>
            )}
            {buildNotice != null && (
              <p className="text-sm text-muted-foreground" role="status">
                {buildNotice}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Almacenamiento de PokeAPI</CardTitle>
            <CardDescription>
              Los datos consultados se guardan temporalmente para ahorrar red.
              Puedes vaciar esta caché sin borrar favoritos ni el índice.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {cacheIssue != null && (
              <p className="text-sm text-destructive" role="alert">
                No se pudo guardar la caché local ({cacheIssue.reason === 'quota'
                  ? 'espacio agotado'
                  : 'almacenamiento no disponible'}). La app seguirá funcionando con conexión.
              </p>
            )}
            <Button type="button" variant="outline" size="sm" onClick={handleClearApiCache}>
              Vaciar caché API
            </Button>
            {cacheNotice != null && (
              <p className="text-sm text-muted-foreground" role="status">{cacheNotice}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Diagnóstico PokeAPI</CardTitle>
            <CardDescription>
              Prueba la capa de datos: generation(1), type(fire), pokemon(pikachu),
              species(pikachu). La segunda vez debería leer desde cache.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={runDiagnostic}
              disabled={diagState === 'loading'}
              aria-label="Probar API PokeAPI"
            >
              {diagState === 'loading' ? 'Cargando…' : 'Probar API'}
            </Button>

            {diagState === 'success' && diagResult && (
              <dl className="grid gap-2 text-sm text-muted-foreground">
                {diagResult.generation && (
                  <>
                    <dt className="font-medium text-foreground">Generation</dt>
                    <dd>
                      {diagResult.generation.name} —{' '}
                      {diagResult.generation.speciesCount} species
                    </dd>
                  </>
                )}
                {diagResult.type && (
                  <>
                    <dt className="font-medium text-foreground">Type</dt>
                    <dd>
                      {diagResult.type.name} — double_from:{' '}
                      {diagResult.type.doubleFrom}, half_from:{' '}
                      {diagResult.type.halfFrom}, no_from:{' '}
                      {diagResult.type.noFrom}
                    </dd>
                  </>
                )}
                {diagResult.pokemon && (
                  <>
                    <dt className="font-medium text-foreground">Pokemon</dt>
                    <dd>
                      #{diagResult.pokemon.id} {diagResult.pokemon.name} —{' '}
                      {diagResult.pokemon.statsCount} stats,{' '}
                      {diagResult.pokemon.typesCount} types
                    </dd>
                  </>
                )}
                {diagResult.species && (
                  <>
                    <dt className="font-medium text-foreground">Species</dt>
                    <dd>
                      id {diagResult.species.id}, nombre ES:{' '}
                      {diagResult.species.nameEs ?? '—'}
                    </dd>
                  </>
                )}
              </dl>
            )}

            {diagState === 'error' && diagError && (
              <p className="text-sm text-destructive" role="alert">
                {diagError}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
