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

export const focusRingClass = "outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
