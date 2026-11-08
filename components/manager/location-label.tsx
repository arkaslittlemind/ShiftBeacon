import { MapPinIcon } from "@/components/icons";
import { formatDistance, perimeterCheck, type Perimeter } from "@/lib/geo";
import { cn } from "@/lib/utils";

/** "Inside · 42 m" or "Outside · 380 m": the word carries the meaning, the colour only backs it up. */
export function LocationLabel({
  latitude,
  longitude,
  workplace,
}: {
  latitude: number;
  longitude: number;
  workplace: Perimeter;
}) {
  const { inside, distanceMeters } = perimeterCheck({ latitude, longitude }, workplace);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs",
        inside ? "text-muted-foreground" : "text-danger"
      )}
    >
      <MapPinIcon aria-hidden className="size-3.5 shrink-0" />
      <span>{`${inside ? "Inside" : "Outside"} · ${formatDistance(distanceMeters)}`}</span>
    </span>
  );
}
