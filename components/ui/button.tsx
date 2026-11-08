import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

// Press feedback for every variant except link: scale only, never a
// positional shift, and no scale at all under reduced motion.
const PRESS = "motion-safe:active:not-aria-[haspopup]:scale-[0.97]"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 touch-manipulation items-center [-webkit-tap-highlight-color:transparent] justify-center gap-1.5 rounded-lg border border-transparent font-sans text-sm font-semibold whitespace-nowrap outline-none select-none [transition:transform_var(--dur-press)_var(--ease-out),background-color_var(--dur-fast)_ease,color_var(--dur-fast)_ease,border-color_var(--dur-fast)_ease,box-shadow_var(--dur-fast)_ease] focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-danger aria-invalid:ring-3 aria-invalid:ring-danger/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: `${PRESS} bg-primary text-primary-foreground shadow-sm hover:bg-primary-hover`,
        ocean: `${PRESS} bg-ocean text-primary-foreground shadow-sm hover:bg-ocean-hover`,
        outline: `${PRESS} border-border bg-card text-foreground hover:bg-surface-alt`,
        ghost: `${PRESS} text-muted-foreground hover:bg-surface-alt hover:text-foreground`,
        destructive: `${PRESS} bg-destructive text-danger-ink shadow-sm hover:bg-destructive/90`,
        link: "text-ocean underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        xs: "h-7 gap-1 px-2.5 text-xs",
        sm: "h-8 gap-1 px-3 text-[0.8125rem]",
        lg: "h-13 gap-2 rounded-xl px-6 text-[1.0625rem] font-medium",
        icon: "size-9",
        "icon-xs": "size-7",
        "icon-sm": "size-8",
        "icon-lg": "size-11",
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

export { Button, buttonVariants }
