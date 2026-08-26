export default function Loading() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
      <div className="size-9 animate-spin border-4 border-border border-t-primary" />
      <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
        Loading&hellip;
      </p>
    </div>
  );
}
