"use client"

import * as React from "react"
import { Switch as SwitchPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Switch({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: "sm" | "default"
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer group/switch relative inline-flex h-11 w-12 shrink-0 items-center rounded-full border border-transparent bg-transparent transition-all outline-none before:absolute before:left-0 before:top-1/2 before:h-7 before:w-12 before:-translate-y-1/2 before:rounded-full before:shadow-[var(--shadow-xs)] before:transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50 data-[size=sm]:w-11 data-[size=sm]:before:h-6 data-[size=sm]:before:w-11 data-[state=checked]:before:bg-primary data-[state=unchecked]:before:bg-input",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none absolute left-0 top-1/2 block size-6 -translate-y-1/2 rounded-full bg-card ring-0 shadow-sm transition-transform group-data-[size=sm]/switch:size-5 data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
