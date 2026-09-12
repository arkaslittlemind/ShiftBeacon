import { cn } from "@/lib/utils";
import { ShiftBeaconMark } from "@/components/brand/shift-beacon-mark";

// The mark plus wordmark, in one place so the five headers that show it cannot
// drift apart. gap-3 is not arbitrary: brand/README.md requires clear space of
// half the shield height on all sides, and at h-6 the shield is ~22.6px tall.
export function BrandLockup({
  variant,
  className,
}: {
  variant?: "full-colour" | "on-ink";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "flex items-center gap-3 font-heading text-lg font-bold",
        className
      )}
    >
      <ShiftBeaconMark variant={variant} className="h-6 w-auto" />
      ShiftBeacon
    </span>
  );
}
