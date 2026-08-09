import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "interactive-clay inline-flex shrink-0 items-center justify-center gap-2 rounded-[var(--radius-md)] border border-transparent text-sm font-semibold whitespace-nowrap outline-none focus-visible:ring-3 focus-visible:ring-ring/35 disabled:pointer-events-none disabled:opacity-45 aria-invalid:border-destructive aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-[1.125rem]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-[var(--shadow-xs)] hover:bg-[var(--primary-hover)]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-[var(--shadow-xs)] hover:bg-[var(--destructive-hover)] focus-visible:ring-destructive/25",
        outline:
          "border-border bg-card text-foreground shadow-[var(--shadow-xs)] hover:border-input hover:bg-accent hover:text-accent-foreground",
        secondary:
          "border-border/70 bg-secondary text-secondary-foreground shadow-[var(--shadow-xs)] hover:bg-[var(--secondary-hover)]",
        ghost:
          "shadow-none hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "min-h-11 px-4 py-2.5 has-[>svg]:px-3.5",
        xs: "min-h-8 gap-1 rounded-[var(--radius-xs)] px-2.5 text-xs has-[>svg]:px-2 [&_svg:not([class*='size-'])]:size-3.5",
        sm: "min-h-11 gap-1.5 px-3.5 py-2 has-[>svg]:px-3",
        lg: "min-h-12 px-6 py-3 has-[>svg]:px-4",
        icon: "size-11 rounded-[var(--radius-sm)]",
        "icon-xs": "size-8 rounded-[var(--radius-xs)] [&_svg:not([class*='size-'])]:size-3.5",
        "icon-sm": "size-11",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button }
