import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-md border-(length:--border-w) border-dashed border-border-soft bg-secondary/40 px-6 py-12 text-center">
      <div className="flex size-11 items-center justify-center border-2 border-border bg-card text-muted-foreground">
        <Icon className="size-5" />
      </div>
      <h2 className="font-heading text-base font-bold">{title}</h2>
      <p className="max-w-[42ch] text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
