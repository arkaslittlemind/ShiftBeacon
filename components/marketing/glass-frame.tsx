import { cn } from "@/lib/utils";

/**
 * A frosted panel that floats over a painting, with a white card inset in it.
 * Marketing only: blur stays at 12px or less and never sits over app surfaces
 * (docs/redesign/motion-and-polish.md).
 */
export function GlassFrame({
  className,
  innerClassName,
  children,
}: {
  className?: string;
  innerClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-[22px] border border-glass-edge bg-glass p-1.5 shadow-lg backdrop-blur-[12px]",
        className
      )}
    >
      <div className={cn("rounded-[17px] border border-border-soft bg-card p-4", innerClassName)}>
        {children}
      </div>
    </div>
  );
}
