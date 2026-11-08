import { cn } from "@/lib/utils";
import type { IconComponent } from "@/types/icons";

/** A centered card on paper for whole-page states: the page's `h1`, one icon, and its actions. */
export function StatePanel({
  icon: Icon,
  tone = "neutral",
  title,
  description,
  children,
}: {
  icon: IconComponent;
  tone?: "neutral" | "danger";
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4 py-10">
      <div className="flex w-full max-w-md flex-col items-center gap-5 rounded-[20px] border border-border-soft bg-card px-6 py-10 text-center shadow-sm">
        <div
          className={cn(
            "grid size-14 place-items-center rounded-full",
            tone === "danger" ? "bg-danger-soft text-danger" : "bg-surface-alt text-muted-foreground"
          )}
        >
          <Icon aria-hidden className="size-6" />
        </div>
        <div className="grid gap-1.5">
          <h1 className="font-heading text-2xl leading-tight font-normal text-foreground">
            {title}
          </h1>
          <p className="max-w-[46ch] text-sm text-muted-foreground">{description}</p>
        </div>
        {children ? (
          <div className="flex flex-wrap items-center justify-center gap-3">{children}</div>
        ) : null}
      </div>
    </div>
  );
}
