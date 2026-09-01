"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, MapPinOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { haversineDistanceMeters } from "@/lib/geo";
import { useGeolocation } from "./use-geolocation";
import type { OrganizationResponse } from "@/types/organization";

type OrgFetchState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; organization: OrganizationResponse };

export function PerimeterStatusBanner() {
  const geolocation = useGeolocation();
  const [org, setOrg] = useState<OrgFetchState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    fetch("/api/organizations/me")
      .then((response) => response.json())
      .then((body) => {
        if (!cancelled) {
          setOrg({ status: "ready", organization: body.data });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setOrg({ status: "error" });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (geolocation.status === "unsupported" || geolocation.status === "denied" || geolocation.status === "error") {
    return (
      <Banner tone="outside" icon={MapPinOff} title="Location unavailable" message={geolocation.error ?? "We can't check your location."} />
    );
  }

  if (org.status === "error") {
    return (
      <Banner tone="outside" icon={AlertTriangle} title="Couldn't load your workplace" message="Refresh the page to try again." />
    );
  }

  if (geolocation.status === "idle" || geolocation.status === "prompting" || org.status === "loading") {
    return (
      <Banner tone="loading" icon={Loader2} title="Checking your location" message="This tells us whether you're inside the clock-in perimeter." spin />
    );
  }

  const distanceMeters = haversineDistanceMeters(
    geolocation.coords!.latitude,
    geolocation.coords!.longitude,
    org.organization.latitude,
    org.organization.longitude
  );
  const isInside = distanceMeters <= org.organization.clockInRadiusMeters;

  return isInside ? (
    <Banner tone="inside" icon={CheckCircle2} title="You're inside the perimeter" message="Clock-in is available right now." />
  ) : (
    <Banner tone="outside" icon={AlertTriangle} title="You're outside the perimeter" message={`Get within ${org.organization.clockInRadiusMeters}m of ${org.organization.name} to clock in.`} />
  );
}

function Banner({
  tone,
  icon: Icon,
  title,
  message,
  spin = false,
}: {
  tone: "inside" | "outside" | "loading";
  icon: typeof CheckCircle2;
  title: string;
  message: string;
  spin?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-md border-(length:--border-w) border-border p-4 shadow-md",
        tone === "inside" && "bg-accent text-accent-foreground",
        tone === "outside" && "bg-danger text-danger-ink",
        tone === "loading" && "bg-card text-muted-foreground"
      )}
      role="status"
    >
      <Icon className={cn("size-6 shrink-0", spin && "animate-spin")} />
      <div>
        <p className="font-heading text-sm font-bold">{title}</p>
        <p className="text-sm opacity-90">{message}</p>
      </div>
    </div>
  );
}
