import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md border-(length:--border-w) border-border font-heading text-xs font-bold tracking-wide uppercase whitespace-nowrap shadow-sm transition-none outline-none select-none active:not-aria-[haspopup]:translate-x-[3px] active:not-aria-[haspopup]:translate-y-[3px] active:not-aria-[haspopup]:shadow-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-accent-dark",
        outline: "bg-card text-foreground hover:bg-secondary",
        secondary: "bg-secondary text-secondary-foreground hover:bg-border-soft",
        ghost:
          "border-transparent shadow-none active:translate-x-0 active:translate-y-0 hover:bg-secondary hover:text-foreground",
        destructive: "bg-destructive text-danger-ink hover:opacity-90",
        link: "border-transparent shadow-none normal-case tracking-normal text-primary underline-offset-4 hover:underline active:translate-x-0 active:translate-y-0",
      },
      size: {
        default: "h-9 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        xs: "h-7 gap-1 px-2.5 text-[0.65rem]",
        sm: "h-8 gap-1 px-3 text-[0.7rem]",
        lg: "h-11 gap-2 px-6 text-sm",
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
