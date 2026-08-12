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
  getSpanishName,
  getType,
} from '@/lib/pokeapi'
import {
  buildSpeciesIndex,
  clearSpeciesIndex,
  SpeciesIndexBuildError,
} from '@/lib/pokedex'
import { useSpeciesIndex } from '@/hooks/useSpeciesIndex'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/PageHeader'
import { Switch } from '@/components/ui/switch'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  AlertTriangle,
  CheckCircle,
  Gauge,
  History,
  LayoutGrid,
  List,
  PackageOpen,
  Play,
  RefreshCw,
  Shield,
  WifiOff,
  type PhosphorIcon,
} from '@/components/icons'
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { SpoilerPreferenceControl } from '@/features/manuals/spoilers/SpoilerPreferenceControl'
import { clearRecentActivity } from '@/features/activity'
import { clearManualReadingActivity } from '@/features/manuals/progress/readingProgress'
import { restartOnboarding } from '@/features/onboarding'
import { cn } from '@/lib/utils'

type DefaultView = 'grid' | 'list'
type RecentActivitySetting = 'enabled' | 'disabled'
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

const SECTION_TONES = {
  lavender: 'bg-ui-lavender/60 text-ui-lavender-strong',
  green: 'bg-ui-green/65 text-ui-green-strong',
  blue: 'bg-ui-blue/60 text-ui-blue-strong',
} as const

function SettingsSection({
  icon: Icon,
  eyebrow,
  title,
  description,
  tone,
  children,
}: {
  icon: PhosphorIcon
  eyebrow: string
  title: string
  description: string
  tone: keyof typeof SECTION_TONES
  children: ReactNode
}) {
  return (
    <section aria-labelledby={`${eyebrow}-${title}`.replaceAll(' ', '-').toLowerCase()}>
      <header className="mb-4 flex items-start gap-3">
        <span className={cn('flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-md)]', SECTION_TONES[tone])}>
          <Icon className="size-5" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-ui-blue-strong">{eyebrow}</p>
          <h2 id={`${eyebrow}-${title}`.replaceAll(' ', '-').toLowerCase()} className="mt-1 text-xl font-bold tracking-[-0.02em] text-foreground">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
      </header>
      <div className="divide-y divide-border/75 overflow-hidden rounded-[var(--radius-lg)] border border-border bg-card shadow-[var(--shadow-xs)]">{children}</div>
    </section>
  )
}

function SettingRow({
  icon: Icon,
  title,
  description,
  children,
  compact = false,
}: {
  icon: PhosphorIcon
  title: string
  description: string
  children: ReactNode
  compact?: boolean
}) {
  return (
    <div className={cn('grid gap-4 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-5', compact && 'grid-cols-[minmax(0,1fr)_auto] items-center')}>
      <div className="flex min-w-0 items-start gap-3">
        <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-muted-foreground">
          <Icon className="size-[1.125rem]" aria-hidden />
        </span>
        <div className="min-w-0">
          <h3 className="font-semibold leading-6 text-foreground">{title}</h3>
          <p className="mt-0.5 text-sm leading-5 text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className={cn('min-w-0 sm:min-w-52 sm:max-w-72', compact && 'min-w-0 sm:min-w-0')}>{children}</div>
    </div>
  )
}

function StatusPill({ children, ready = false }: { children: ReactNode; ready?: boolean }) {
  return (
    <span className={cn(
      'inline-flex min-h-7 items-center gap-1.5 rounded-full border px-2.5 text-xs font-semibold',
      ready
        ? 'border-ui-green-strong/20 bg-ui-green/60 text-ui-green-strong'
        : 'border-border bg-accent text-muted-foreground'
    )}>
      {ready ? <CheckCircle className="size-3.5" aria-hidden /> : <AlertTriangle className="size-3.5" aria-hidden />}
      {children}
    </span>
  )
}

export function SettingsPage() {
  const { meta, status, refresh } = useSpeciesIndex()
  const [defaultView, setDefaultViewState] = useState<DefaultView>(() =>
    getSetting('defaultView', 'grid')
  )
  const [recentActivity, setRecentActivityState] = useState<RecentActivitySetting>(() =>
    getSetting('recentActivity', 'enabled')
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
  const [experienceNotice, setExperienceNotice] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    setSetting('defaultView', defaultView)
  }, [defaultView])

  useEffect(() => () => {
    abortRef.current?.abort()
  }, [])

  const handleRecentActivityChange = useCallback((checked: boolean) => {
    const nextValue = checked ? 'enabled' : 'disabled'
    setRecentActivityState(nextValue)
    setSetting('recentActivity', nextValue)
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
      onProgress: (progress) => {
        setBuildProgress({
          done: progress.done,
          total: progress.total,
          phase: progress.phase as BuildPhase,
          currentSpeciesName: progress.currentSpeciesName,
        })
      },
    })
      .then(() => {
        refresh()
        setBuildProgress((previous) => (previous ? { ...previous, phase: 'done' } : null))
      })
      .catch((error) => {
        if (error instanceof SpeciesIndexBuildError && error.kind === 'abort') {
          setBuildNotice(error.message)
        } else {
          setBuildError(error instanceof Error ? error.message : 'Error al construir el índice')
        }
      })
      .finally(() => {
        setBuildRunning(false)
        abortRef.current = null
      })
  }, [buildRunning, refresh])

  const cancelBuild = useCallback(() => abortRef.current?.abort(), [])

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
      const [generation, typeResult, pokemon, species] = await Promise.all([
        getGeneration(1),
        getType('fire'),
        getPokemon('pikachu'),
        getPokemonSpecies('pikachu'),
      ])
      setDiagResult({
        generation: {
          name: generation.name,
          speciesCount: generation.pokemon_species.length,
        },
        type: {
          name: typeResult.name,
          doubleFrom: typeResult.damage_relations.double_damage_from.length,
          halfFrom: typeResult.damage_relations.half_damage_from.length,
          noFrom: typeResult.damage_relations.no_damage_from.length,
        },
        pokemon: {
          id: pokemon.id,
          name: pokemon.name,
          statsCount: pokemon.stats.length,
          typesCount: pokemon.types.length,
        },
        species: { id: species.id, nameEs: getSpanishName(species) },
      })
      setDiagState('success')
    } catch (error) {
      setDiagError(error instanceof Error ? error.message : 'No se pudo completar la prueba.')
      setDiagState('error')
    }
    setCacheIssue(getCacheWriteIssue())
  }, [])

  const handleClearApiCache = useCallback(() => {
    clearApiCache()
    setCacheIssue(null)
    setCacheNotice('Caché eliminada. Tus preferencias, favoritos e índice se conservan.')
  }, [])

  const handleRestartTour = useCallback(() => {
    setExperienceNotice('El recorrido se ha reiniciado y comenzará ahora.')
    restartOnboarding()
  }, [])

  const handleClearRecentActivity = useCallback(() => {
    clearRecentActivity()
    clearManualReadingActivity()
    setExperienceNotice('Actividad reciente eliminada. Las lecciones completadas se conservan.')
  }, [])

  return (
    <>
      <PageHeader
        eyebrow="Tu PokéApp"
        title="Ajustes"
        description="Decide cómo se ve, qué recuerda y qué datos guarda esta PokéApp en tu dispositivo."
        className="mb-6"
      />

      <div className="space-y-6">
        <SettingsSection
          icon={LayoutGrid}
          eyebrow="Personaliza"
          title="Tu experiencia"
          description="Las preferencias que cambian cómo usas la Pokédex y los manuales."
          tone="lavender"
        >
          <SettingRow
            icon={LayoutGrid}
            title="Vista de la Pokédex"
            description="Elige cómo se abrirán las listas. Puedes cambiarlo también desde la Pokédex."
          >
            <div className="grid grid-cols-2 rounded-[var(--radius-md)] border border-border bg-accent/55 p-1" role="group" aria-label="Vista por defecto de la Pokédex">
              <button
                type="button"
                aria-pressed={defaultView === 'grid'}
                onClick={() => setDefaultViewState('grid')}
                className={cn(
                  'interactive-clay flex min-h-11 items-center justify-center gap-2 rounded-[calc(var(--radius-md)-0.25rem)] px-3 text-sm font-semibold outline-none focus-visible:ring-3 focus-visible:ring-ring/35',
                  defaultView === 'grid' ? 'bg-card text-foreground shadow-[var(--shadow-xs)]' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <LayoutGrid aria-hidden /> Cuadrícula
              </button>
              <button
                type="button"
                aria-pressed={defaultView === 'list'}
                onClick={() => setDefaultViewState('list')}
                className={cn(
                  'interactive-clay flex min-h-11 items-center justify-center gap-2 rounded-[calc(var(--radius-md)-0.25rem)] px-3 text-sm font-semibold outline-none focus-visible:ring-3 focus-visible:ring-ring/35',
                  defaultView === 'list' ? 'bg-card text-foreground shadow-[var(--shadow-xs)]' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <List aria-hidden /> Lista
              </button>
            </div>
          </SettingRow>

          <SettingRow
            icon={Shield}
            title="Spoilers del manual"
            description="Controla cuánto puede mostrar una guía sin pedirte confirmación."
          >
            <SpoilerPreferenceControl compact labelVisuallyHidden />
          </SettingRow>

          <SettingRow
            icon={History}
            title="Guardar actividad reciente"
            description="Permite continuar lecturas y consultas recientes desde Inicio."
            compact
          >
            <Switch
              checked={recentActivity === 'enabled'}
              onCheckedChange={handleRecentActivityChange}
              aria-label="Guardar actividad reciente"
            />
          </SettingRow>
        </SettingsSection>

        <SettingsSection
          icon={Play}
          eyebrow="Control y privacidad"
          title="Ayuda y actividad"
          description="Recupera la introducción o decide qué recuerdos locales conservar."
          tone="green"
        >
          <SettingRow
            icon={Play}
            title="Recorrido inicial"
            description="Vuelve a ver las claves de navegación y descubre dónde está cada cosa."
          >
            <Button type="button" variant="outline" onClick={handleRestartTour} className="w-full sm:w-auto">
              <Play aria-hidden /> Ver recorrido
            </Button>
          </SettingRow>
          <SettingRow
            icon={History}
            title="Actividad reciente"
            description="Borra últimas consultas y lecturas en curso, sin tocar favoritos ni lecciones completadas."
          >
            <Button type="button" variant="ghost" onClick={handleClearRecentActivity} className="w-full sm:w-auto">
              Borrar historial
            </Button>
          </SettingRow>
          {experienceNotice && (
            <p className="px-4 py-3 text-sm text-ui-green-strong sm:px-5" role="status">{experienceNotice}</p>
          )}
        </SettingsSection>

        <SettingsSection
          icon={PackageOpen}
          eyebrow="En este dispositivo"
          title="Datos y conexión"
          description="Gestiona las descargas que hacen que la app responda más rápido."
          tone="blue"
        >
          <div className="p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-muted-foreground">
                <PackageOpen className="size-[1.125rem]" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-semibold leading-6 text-foreground">Índice de especies</h3>
                  <StatusPill ready={status === 'ready'}>{status === 'ready' ? 'Disponible' : 'Sin descargar'}</StatusPill>
                </div>
                <p className="mt-0.5 text-sm leading-5 text-muted-foreground">
                  Activa búsquedas instantáneas y la Pokédex completa de las generaciones I–V.
                </p>
                {meta && status === 'ready' && (
                  <p className="mt-2 text-xs font-medium text-muted-foreground">
                    {meta.counts.species} especies · Actualizado {new Date(meta.timestamp).toLocaleDateString()}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  {!buildRunning ? (
                    <>
                      <Button type="button" variant="outline" size="sm" onClick={startBuild}>
                        <RefreshCw aria-hidden /> {status === 'missing' ? 'Descargar índice' : 'Actualizar'}
                      </Button>
                      {status === 'ready' && (
                        <Button type="button" variant="ghost" size="sm" onClick={handleClearIndex}>Eliminar índice</Button>
                      )}
                    </>
                  ) : (
                    <Button type="button" variant="outline" size="sm" onClick={cancelBuild}>Cancelar</Button>
                  )}
                </div>
                {buildRunning && buildProgress && (
                  <div className="mt-3 space-y-1 text-sm text-muted-foreground" role="status">
                    <p>{PHASE_LABELS[buildProgress.phase]}</p>
                    {buildProgress.total > 0 && (
                      <p>{buildProgress.done} de {buildProgress.total} · {Math.round((buildProgress.done / buildProgress.total) * 100)} %</p>
                    )}
                  </div>
                )}
                {buildError && <p className="mt-3 text-sm text-destructive" role="alert">{buildError}</p>}
                {buildNotice && <p className="mt-3 text-sm text-muted-foreground" role="status">{buildNotice}</p>}
              </div>
            </div>
          </div>

          <SettingRow
            icon={WifiOff}
            title="Caché de conexión"
            description="Elimina datos temporales de PokeAPI. No borra favoritos, partidas ni preferencias."
          >
            <Button type="button" variant="outline" onClick={handleClearApiCache} className="w-full sm:w-auto">
              Vaciar caché
            </Button>
          </SettingRow>
          {cacheIssue && (
            <p className="px-4 py-3 text-sm text-destructive sm:px-5" role="alert">
              El almacenamiento temporal no está disponible. La app seguirá funcionando con conexión.
            </p>
          )}
          {cacheNotice && <p className="px-4 py-3 text-sm text-ui-blue-strong sm:px-5" role="status">{cacheNotice}</p>}
        </SettingsSection>

        <Accordion type="single" collapsible className="overflow-hidden rounded-[var(--radius-lg)] border border-border bg-card shadow-[var(--shadow-xs)]">
          <AccordionItem value="diagnostic" className="border-0">
            <AccordionTrigger className="min-h-16 rounded-none px-4 py-4 sm:px-5">
              <span className="flex items-center gap-3 text-left">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent text-muted-foreground">
                  <Gauge className="size-5" aria-hidden />
                </span>
                <span>
                  <span className="block font-semibold text-foreground">Avanzado</span>
                  <span className="mt-0.5 block text-xs font-normal leading-5 text-muted-foreground">Comprueba la conexión con la fuente de datos.</span>
                </span>
              </span>
            </AccordionTrigger>
            <AccordionContent className="border-t border-border/75 px-4 pt-4 sm:px-5">
              <p className="leading-6 text-muted-foreground">
                Ejecuta una prueba breve con generación, tipos, Pokémon y especies. Úsala solo si los datos no cargan como esperas.
              </p>
              <Button
                type="button"
                variant="outline"
                className="mt-4"
                onClick={runDiagnostic}
                disabled={diagState === 'loading'}
              >
                <Gauge aria-hidden /> {diagState === 'loading' ? 'Comprobando…' : 'Comprobar conexión'}
              </Button>

              {diagState === 'success' && diagResult && (
                <dl className="mt-4 divide-y divide-border/70 rounded-[var(--radius-md)] border border-border bg-accent/35 px-4 text-sm">
                  {diagResult.generation && <div className="flex justify-between gap-4 py-3"><dt className="font-semibold">Generación</dt><dd className="text-right text-muted-foreground">{diagResult.generation.name} · {diagResult.generation.speciesCount} especies</dd></div>}
                  {diagResult.type && <div className="flex justify-between gap-4 py-3"><dt className="font-semibold">Tipos</dt><dd className="text-right text-muted-foreground">{diagResult.type.name} · {diagResult.type.doubleFrom + diagResult.type.halfFrom + diagResult.type.noFrom} relaciones</dd></div>}
                  {diagResult.pokemon && <div className="flex justify-between gap-4 py-3"><dt className="font-semibold">Pokémon</dt><dd className="text-right text-muted-foreground">#{diagResult.pokemon.id} {diagResult.pokemon.name} · {diagResult.pokemon.typesCount} tipo(s)</dd></div>}
                  {diagResult.species && <div className="flex justify-between gap-4 py-3"><dt className="font-semibold">Especie</dt><dd className="text-right text-muted-foreground">#{diagResult.species.id} · {diagResult.species.nameEs ?? 'Sin traducción'}</dd></div>}
                </dl>
              )}
              {diagState === 'error' && diagError && <p className="mt-4 text-sm text-destructive" role="alert">{diagError}</p>}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </>
  )
}
