import { cn } from "@/lib/utils";

/** CSS ring spinner. Pikaicons' `spinner` is locked, so this stands in for it. */
export function Spinner({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-block size-6 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent",
        className
      )}
    />
  );
}
