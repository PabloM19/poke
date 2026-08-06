import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Combina clases con clsx y las fusiona con tailwind-merge (estándar shadcn). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helpers y utilidades genéricas
export function noop(): void {
  // placeholder
}
