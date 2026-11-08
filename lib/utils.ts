import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Shared "eyebrow" label treatment - small caps, muted, wide tracking - used
// for form field labels and card title overlines across worker/manager UI.
export const eyebrowClass = "text-xs font-bold tracking-wide text-muted-foreground uppercase"

// Pourville mono label: page eyebrows, sidebar section labels, captions.
export const monoLabelClass = "font-mono text-[11px] tracking-[0.08em] text-faint uppercase"

/** Sans card titles with a leading icon, used across the manager dashboard cards. */
export const cardTitleClass = "flex items-center gap-2 font-sans text-[0.9375rem] font-semibold"

/** 44px tall on touch layouts, back to the compact 36px from `md`. */
export const touchTargetClass = "min-h-11 md:min-h-9"

export const focusRingClass = "outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
