import { cn } from "@/lib/utils";

export function Avatar({ initials, className }: { initials: string; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid size-8 shrink-0 place-items-center rounded-full border border-ocean-tint bg-ocean-soft text-xs font-semibold text-ocean",
        className
      )}
    >
      {initials}
    </span>
  );
}
