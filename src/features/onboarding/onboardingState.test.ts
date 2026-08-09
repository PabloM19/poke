import { beforeEach, describe, expect, it } from 'vitest'
import { setStored } from '@/lib/storage'
import {
  completeOnboarding,
  getOnboardingState,
  ONBOARDING_STORAGE_KEY,
  restartOnboarding,
  skipOnboarding,
  startOnboarding,
} from './onboardingState'

describe('persistencia del onboarding', () => {
  beforeEach(() => localStorage.clear())

  it('distingue primera visita, progreso, salto y finalización', () => {
    expect(getOnboardingState()).toBeNull()
    expect(startOnboarding(2)).toMatchObject({ version: 1, status: 'in-progress', currentStep: 2 })
    expect(skipOnboarding(2).status).toBe('skipped')
    expect(restartOnboarding()).toMatchObject({ status: 'in-progress', currentStep: 0 })
    expect(completeOnboarding(6).status).toBe('completed')
  })

  it('elimina versiones o datos corruptos', () => {
    setStored(ONBOARDING_STORAGE_KEY, { version: 3, status: 'completed', currentStep: 2 })
    expect(getOnboardingState()).toBeNull()
  })
})
