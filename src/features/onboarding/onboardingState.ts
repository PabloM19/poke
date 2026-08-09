import { getStored, removeStored, setStored } from '@/lib/storage'

export const ONBOARDING_VERSION = 1
export const ONBOARDING_STORAGE_KEY = 'onboarding:v1'
export const ONBOARDING_EVENT = 'pokeapp:onboarding'

export type OnboardingStatus = 'completed' | 'skipped' | 'in-progress'

export interface OnboardingState {
  version: typeof ONBOARDING_VERSION
  status: OnboardingStatus
  currentStep: number
}

function isState(value: unknown): value is OnboardingState {
  if (value == null || typeof value !== 'object') return false
  const state = value as Partial<OnboardingState>
  return state.version === ONBOARDING_VERSION &&
    (state.status === 'completed' || state.status === 'skipped' || state.status === 'in-progress') &&
    Number.isInteger(state.currentStep) && Number(state.currentStep) >= 0
}

function notify(): void {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(ONBOARDING_EVENT))
}

export function getOnboardingState(): OnboardingState | null {
  const raw = getStored<unknown>(ONBOARDING_STORAGE_KEY)
  if (raw == null) return null
  if (!isState(raw)) {
    removeStored(ONBOARDING_STORAGE_KEY)
    return null
  }
  return raw
}

export function isOnboardingInProgress(): boolean {
  return getOnboardingState()?.status === 'in-progress'
}

export function setOnboardingState(status: OnboardingStatus, currentStep: number): OnboardingState {
  const state: OnboardingState = {
    version: ONBOARDING_VERSION,
    status,
    currentStep: Math.max(0, Math.floor(currentStep)),
  }
  setStored(ONBOARDING_STORAGE_KEY, state)
  notify()
  return state
}

export function startOnboarding(step = 0): OnboardingState {
  return setOnboardingState('in-progress', step)
}

export function skipOnboarding(step = 0): OnboardingState {
  return setOnboardingState('skipped', step)
}

export function completeOnboarding(lastStep: number): OnboardingState {
  return setOnboardingState('completed', lastStep)
}

export function restartOnboarding(): OnboardingState {
  return startOnboarding(0)
}
