import type { ComponentProps } from 'react'
import { Button } from './button'

export function IconButton({
  'aria-label': ariaLabel,
  ...props
}: ComponentProps<typeof Button> & { 'aria-label': string }) {
  return <Button size="icon" aria-label={ariaLabel} {...props} />
}
