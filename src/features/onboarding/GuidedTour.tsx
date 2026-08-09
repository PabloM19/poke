import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Compass, Sparkles } from '@/components/icons'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  completeOnboarding,
  getOnboardingState,
  ONBOARDING_EVENT,
  setOnboardingState,
  skipOnboarding,
  startOnboarding,
  type OnboardingState,
} from './onboardingState'
import { tourSteps } from './tourSteps'

interface SpotlightRect {
  top: number
  left: number
  width: number
  height: number
}

function visibleTarget(selector: string): HTMLElement | null {
  return [...document.querySelectorAll<HTMLElement>(selector)].find((element) => {
    const rect = element.getBoundingClientRect()
    const style = getComputedStyle(element)
    return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden'
  }) ?? null
}

function rectFor(element: HTMLElement): SpotlightRect {
  const rect = element.getBoundingClientRect()
  const padding = 7
  return {
    top: Math.max(6, rect.top - padding),
    left: Math.max(6, rect.left - padding),
    width: Math.min(window.innerWidth - 12, rect.width + padding * 2),
    height: Math.min(window.innerHeight - 12, rect.height + padding * 2),
  }
}

export function GuidedTour() {
  const location = useLocation()
  const navigate = useNavigate()
  const panelRef = useRef<HTMLElement>(null)
  const targetRef = useRef<HTMLElement | null>(null)
  const [state, setState] = useState<OnboardingState | null>(() => getOnboardingState())
  const [spotlight, setSpotlight] = useState<SpotlightRect | null>(null)
  const isActive = state?.status === 'in-progress'
  const stepIndex = Math.min(state?.currentStep ?? 0, tourSteps.length - 1)
  const step = tourSteps[stepIndex]

  useEffect(() => {
    const update = () => setState(getOnboardingState())
    window.addEventListener(ONBOARDING_EVENT, update)
    window.addEventListener('storage', update)
    return () => {
      window.removeEventListener(ONBOARDING_EVENT, update)
      window.removeEventListener('storage', update)
    }
  }, [])

  useEffect(() => {
    if (!isActive || !step) return
    const desired = step.route
    const current = `${location.pathname}${location.search}`
    if (current !== desired) navigate(desired)

    let cancelled = false
    let attempts = 0
    let timer = 0
    const locate = () => {
      if (cancelled) return
      const target = visibleTarget(step.target)
      if (target) {
        targetRef.current = target
        const rect = target.getBoundingClientRect()
        const obscured = rect.top < 72 || rect.bottom > window.innerHeight - 118
        if (obscured) {
          const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
          target.scrollIntoView({ block: 'center', behavior: reduced ? 'auto' : 'smooth' })
          timer = window.setTimeout(() => !cancelled && setSpotlight(rectFor(target)), reduced ? 0 : 240)
        } else {
          setSpotlight(rectFor(target))
        }
        return
      }
      attempts += 1
      if (attempts < 18) timer = window.setTimeout(locate, 120)
      else {
        targetRef.current = null
        setSpotlight(null)
      }
    }
    timer = window.setTimeout(locate, current === desired ? 20 : 180)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [isActive, location.pathname, location.search, navigate, step])

  useEffect(() => {
    if (!isActive) return
    const update = () => {
      if (targetRef.current?.isConnected) setSpotlight(rectFor(targetRef.current))
    }
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }, [isActive])

  useEffect(() => {
    if (!isActive) return
    panelRef.current?.focus()
  }, [isActive, stepIndex])

  const updateStep = useCallback((next: number) => {
    setOnboardingState('in-progress', Math.max(0, Math.min(tourSteps.length - 1, next)))
  }, [])

  const finish = useCallback(() => {
    completeOnboarding(tourSteps.length - 1)
    setSpotlight(null)
  }, [])

  const skip = useCallback(() => {
    skipOnboarding(stepIndex)
    setSpotlight(null)
  }, [stepIndex])

  const dots = useMemo(() => tourSteps.map((_, index) => (
    <span key={index} className={index === stepIndex ? 'h-2 w-5 rounded-full bg-primary' : 'size-2 rounded-full bg-border'} aria-hidden />
  )), [stepIndex])

  return (
    <>
      <Dialog open={state == null} onOpenChange={(open) => { if (!open && state == null) skipOnboarding(0) }}>
        <DialogContent showCloseButton={false} className="overflow-hidden p-0 sm:max-w-md">
          <div className="bg-ui-lavender/55 p-6 pb-5">
            <span className="flex size-12 items-center justify-center rounded-[var(--radius-md)] bg-card/75 text-ui-lavender-strong shadow-[var(--shadow-xs)]"><Sparkles className="size-6" aria-hidden /></span>
            <DialogHeader className="mt-5 text-left">
              <DialogTitle className="text-2xl">Bienvenido a PokéApp</DialogTitle>
              <DialogDescription className="text-base leading-7 text-foreground/70">En un minuto verás dónde consultar Pokémon, comparar datos y continuar tus guías.</DialogDescription>
            </DialogHeader>
          </div>
          <DialogFooter className="p-5 pt-1 sm:justify-stretch">
            <Button type="button" variant="ghost" className="sm:flex-1" onClick={() => skipOnboarding(0)}>Ahora no</Button>
            <Button type="button" className="sm:flex-1" onClick={() => startOnboarding(0)}><Compass className="size-5" aria-hidden />Empezar recorrido</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isActive && step && (
        <div data-testid="guided-tour">
          {spotlight ? (
            <div
              className="pointer-events-none fixed z-[90] rounded-[var(--radius-lg)] border-2 border-ui-yellow transition-[top,left,width,height] duration-200"
              style={{ ...spotlight, boxShadow: '0 0 0 9999px rgb(45 42 50 / 0.58)' }}
              aria-hidden
            />
          ) : <div className="pointer-events-none fixed inset-0 z-[90] bg-foreground/55" aria-hidden />}

          <section
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="tour-title"
            aria-describedby="tour-description"
            tabIndex={-1}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                event.preventDefault()
                skip()
              }
              if (event.key === 'Tab') {
                const buttons = [...event.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')]
                if (buttons.length === 0) return
                const first = buttons[0]
                const last = buttons.at(-1)!
                if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
                else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
              }
            }}
            className="fixed inset-x-4 bottom-[calc(5.75rem+env(safe-area-inset-bottom))] z-[100] rounded-[var(--radius-xl)] border border-border bg-card p-5 shadow-[var(--shadow-md)] outline-none lg:inset-x-auto lg:bottom-6 lg:right-6 lg:w-[25rem]"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex gap-1.5" aria-label={`Paso ${stepIndex + 1} de ${tourSteps.length}`}>{dots}</div>
              <span className="text-xs font-semibold text-muted-foreground">{stepIndex + 1} / {tourSteps.length}</span>
            </div>
            <h2 id="tour-title" className="mt-4 text-xl font-bold">{step.title}</h2>
            <p id="tour-description" className="mt-2 text-sm leading-6 text-muted-foreground">{step.description}</p>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={skip}>Saltar</Button>
              <span className="flex-1" />
              <Button type="button" variant="outline" size="sm" onClick={() => updateStep(stepIndex - 1)} disabled={stepIndex === 0}>Anterior</Button>
              {stepIndex === tourSteps.length - 1
                ? <Button type="button" size="sm" onClick={finish}>Terminar</Button>
                : <Button type="button" size="sm" onClick={() => updateStep(stepIndex + 1)}>Siguiente</Button>}
            </div>
          </section>
        </div>
      )}
    </>
  )
}

