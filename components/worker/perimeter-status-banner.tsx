import { AlertTriangleIcon, CheckTickCircleIcon, MapPinIcon } from "@/components/icons";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { formatDistance, perimeterCheck } from "@/lib/geo";
import type { GeolocationState } from "./use-geolocation";
import type { IconComponent } from "@/types/icons";

export type WorkplacePerimeter = {
  name: string;
  latitude: number;
  longitude: number;
  clockInRadiusMeters: number;
};

export type PerimeterView =
  | { kind: "loading" }
  | { kind: "unavailable"; message: string }
  | { kind: "inside" | "outside"; distanceMeters: number };

export function toPerimeterView(
  geolocation: GeolocationState,
  workplace: WorkplacePerimeter
): PerimeterView {
  if (geolocation.status === "granted" && geolocation.coords) {
    const { inside, distanceMeters } = perimeterCheck(geolocation.coords, workplace);
    return { kind: inside ? "inside" : "outside", distanceMeters };
  }
  if (geolocation.status === "idle" || geolocation.status === "prompting") {
    return { kind: "loading" };
  }
  return { kind: "unavailable", message: geolocation.error ?? "We can't check your location." };
}

type BannerContent = { title: string; message: string; icon: IconComponent | null; className: string };

function bannerContent(view: PerimeterView, workplace: WorkplacePerimeter): BannerContent {
  switch (view.kind) {
    case "loading":
      return {
        title: "Checking your location",
        message: "This tells us whether you're inside the clock-in perimeter.",
        icon: null,
        className: "bg-surface-alt text-muted-foreground",
      };
    case "unavailable":
      return {
        title: "Location unavailable",
        message: view.message,
        icon: MapPinIcon,
        className: "bg-danger-soft text-danger",
      };
    case "inside":
      return {
        title: "You're inside the perimeter",
        message: `${formatDistance(view.distanceMeters)} from the workplace. You can clock in.`,
        icon: CheckTickCircleIcon,
        className: "bg-success-soft text-success",
      };
    case "outside":
      return {
        title: "You're outside the perimeter",
        message: `About ${formatDistance(view.distanceMeters)} away. Move within ${workplace.clockInRadiusMeters} m of ${workplace.name} to clock in.`,
        icon: AlertTriangleIcon,
        className: "bg-danger-soft text-danger",
      };
  }
}

export function PerimeterStatusBanner({
  view,
  workplace,
}: {
  view: PerimeterView;
  workplace: WorkplacePerimeter;
}) {
  const { title, message, icon: Icon, className } = bannerContent(view, workplace);

  // The live region stays mounted so a change is announced; only its content
  // re-keys, which replays the entrance.
  return (
    <div role="status" className="w-full max-w-115">
      <div
        key={view.kind}
        className={cn(
          "flex translate-y-0 items-start gap-3 rounded-lg px-4 py-3 text-left opacity-100 transition-[opacity,translate] duration-(--dur-base) ease-(--ease-out) starting:translate-y-1 starting:opacity-0",
          className
        )}
      >
        {Icon ? (
          <Icon className="mt-0.5 size-5 shrink-0" aria-hidden />
        ) : (
          <Spinner className="mt-0.5 size-5 shrink-0" />
        )}
        <div className="text-sm">
          <p className="font-semibold">{title}</p>
          <p className="text-foreground">{message}</p>
        </div>
      </div>
    </div>
  );
}
