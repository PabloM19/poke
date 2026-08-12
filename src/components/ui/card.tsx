import * as React from "react"

import { cn } from "@/lib/utils"

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "flex flex-col gap-4 rounded-[var(--radius-lg)] border border-border bg-card py-5 text-card-foreground shadow-[var(--shadow-xs)]",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-5 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-5 sm:px-6",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2
      data-slot="card-title"
      className={cn("text-lg leading-tight font-semibold tracking-[-0.015em]", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="card-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-5 sm:px-6", className)}
      {...props}
    />
  )
}

function BentoCard({
  className,
  tone = 'surface',
  ...props
}: React.ComponentProps<"section"> & {
  tone?: 'surface' | 'green' | 'lavender' | 'blue' | 'yellow'
}) {
  return (
    <section
      data-slot="bento-card"
      data-tone={tone}
      className={cn(
        "rounded-[var(--radius-xl)] border border-border p-5 shadow-[var(--shadow-xs)]",
        "data-[tone=surface]:bg-card data-[tone=green]:bg-ui-green data-[tone=lavender]:bg-ui-lavender data-[tone=blue]:bg-ui-blue data-[tone=yellow]:bg-ui-yellow",
        className
      )}
      {...props}
    />
  )
}

function ContentCard({ className, ...props }: React.ComponentProps<"section">) {
  return (
    <section
      data-slot="content-card"
      className={cn(
        "rounded-[var(--radius-lg)] border border-border bg-card p-5 text-card-foreground shadow-[var(--shadow-xs)] sm:p-6",
        className
      )}
      {...props}
    />
  )
}

function MiniCard({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="mini-card"
      className={cn("rounded-[var(--radius-md)] border border-border/80 bg-card p-4 shadow-[var(--shadow-xs)]", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  BentoCard,
  ContentCard,
  MiniCard,
}
