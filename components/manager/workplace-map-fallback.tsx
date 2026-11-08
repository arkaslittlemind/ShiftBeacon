import { MapPinIcon } from "@/components/icons";
import type { Perimeter } from "@/lib/geo";

export function WorkplaceMapFallback({
  location,
  reason,
}: {
  location: Perimeter | null;
  reason: string;
}) {
  return (
    <div className="flex size-full flex-col items-center justify-center gap-2 bg-muted px-6 text-center">
      <MapPinIcon aria-hidden className="size-6 text-muted-foreground" />
      {location ? (
        <p className="font-mono text-xs text-foreground">
          {`${location.latitude}, ${location.longitude} · ${location.clockInRadiusMeters} m radius`}
        </p>
      ) : null}
      <p className="text-sm text-muted-foreground">{reason}</p>
    </div>
  );
}
