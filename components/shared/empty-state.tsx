import type { IconComponent } from "@/types/icons";

export function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: IconComponent;
  title: string;
  description: string;
}) {
  return (
    <div className="flex translate-y-0 flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-surface-alt/60 px-6 py-10 text-center opacity-100 transition-[opacity,translate] duration-(--dur-base) ease-(--ease-out) starting:translate-y-1.5 starting:opacity-0">
      <div className="grid size-12 place-items-center rounded-full bg-card text-muted-foreground shadow-sm">
        <Icon className="size-5" aria-hidden />
      </div>
      <h2 className="font-heading text-lg leading-snug font-normal text-foreground">{title}</h2>
      <p className="max-w-[42ch] text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
