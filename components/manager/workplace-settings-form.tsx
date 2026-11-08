"use client";

import { useState } from "react";
import { BuildingApartmentTwoIcon, MapPinIcon, ShieldCheckIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cardTitleClass, cn } from "@/lib/utils";
import { captureClientEvent } from "@/lib/observability/client-events";
import type { IconComponent } from "@/types/icons";
import type { OrganizationResponse } from "@/types/organization";

type Status = "idle" | "saving" | "success" | "error";

const ERROR_ID = "workplace-form-error";
const RADIUS_HINT_ID = "workplace-radius-hint";

const FIELD_LABEL = "text-sm font-medium text-foreground";
const MESSAGE_FADE =
  "translate-y-0 opacity-100 transition-[opacity,translate] duration-(--dur-base) ease-(--ease-out) starting:-translate-y-1 starting:opacity-0";

function SectionTitle({ icon: Icon, children }: { icon: IconComponent; children: string }) {
  return (
    <h2 className={cardTitleClass}>
      <Icon aria-hidden className="size-4.5" />
      {children}
    </h2>
  );
}

export function WorkplaceSettingsForm({
  organization,
}: {
  organization: OrganizationResponse;
}) {
  const [name, setName] = useState(organization.name);
  const [latitude, setLatitude] = useState(String(organization.latitude));
  const [longitude, setLongitude] = useState(String(organization.longitude));
  const [radius, setRadius] = useState(String(organization.clockInRadiusMeters));
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("saving");
    setErrorMessage(null);

    const response = await fetch("/api/organizations/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        latitude: Number(latitude),
        longitude: Number(longitude),
        clockInRadiusMeters: Number(radius),
      }),
    });
    const body = await response.json();

    if (!response.ok) {
      setStatus("error");
      setErrorMessage(body.error.message);
      captureClientEvent({ name: "workplace_settings_save_failed" });
      return;
    }

    setName(body.data.name);
    setLatitude(String(body.data.latitude));
    setLongitude(String(body.data.longitude));
    setRadius(String(body.data.clockInRadiusMeters));
    setStatus("success");
  }

  const errorDescribedBy = status === "error" ? ERROR_ID : undefined;

  return (
    <Card className="max-w-xl gap-0 py-0">
      <form onSubmit={handleSubmit}>
        <section className="grid gap-4 border-b border-border-soft p-5 sm:p-6">
          <SectionTitle icon={BuildingApartmentTwoIcon}>Details</SectionTitle>
          <div className="grid gap-1.5">
            <label htmlFor="name" className={FIELD_LABEL}>
              Name
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              aria-invalid={status === "error"}
              aria-describedby={errorDescribedBy}
            />
          </div>
        </section>

        <section className="grid gap-4 border-b border-border-soft p-5 sm:p-6">
          <SectionTitle icon={MapPinIcon}>Location</SectionTitle>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <label htmlFor="latitude" className={FIELD_LABEL}>
                Latitude
              </label>
              <Input
                id="latitude"
                type="number"
                step="any"
                min={-90}
                max={90}
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                required
                aria-invalid={status === "error"}
                aria-describedby={errorDescribedBy}
                className="font-mono tabular-nums"
              />
            </div>
            <div className="grid gap-1.5">
              <label htmlFor="longitude" className={FIELD_LABEL}>
                Longitude
              </label>
              <Input
                id="longitude"
                type="number"
                step="any"
                min={-180}
                max={180}
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                required
                aria-invalid={status === "error"}
                aria-describedby={errorDescribedBy}
                className="font-mono tabular-nums"
              />
            </div>
          </div>
        </section>

        <section className="grid gap-4 p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <SectionTitle icon={ShieldCheckIcon}>Clock-in radius</SectionTitle>
            <span aria-hidden className="font-mono text-2xl tracking-tight text-ocean tabular-nums">
              {`${radius || "0"} m`}
            </span>
          </div>
          <div className="grid gap-1.5">
            <label htmlFor="radius" className={FIELD_LABEL}>
              Clock-in radius (m)
            </label>
            <Input
              id="radius"
              type="number"
              step="1"
              min={1}
              value={radius}
              onChange={(e) => setRadius(e.target.value)}
              required
              aria-invalid={status === "error"}
              aria-describedby={[RADIUS_HINT_ID, errorDescribedBy].filter(Boolean).join(" ")}
              className="font-mono tabular-nums"
            />
            <p id={RADIUS_HINT_ID} className="text-xs text-muted-foreground">
              Large buildings or car parks may need 200 m or more. Smaller radii are stricter but
              can reject staff at the door.
            </p>
          </div>
        </section>

        <div className="flex flex-col gap-3 border-t border-border-soft bg-surface-alt p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="min-w-0">
            {status === "error" && errorMessage && (
              <p id={ERROR_ID} role="alert" className={cn("text-sm text-danger", MESSAGE_FADE)}>
                {errorMessage}
              </p>
            )}
            {status === "success" && (
              <p role="status" className={cn("text-sm text-success", MESSAGE_FADE)}>
                Saved.
              </p>
            )}
          </div>
          <div className="min-w-0">
            <Button
              type="submit"
              disabled={status === "saving"}
              className="min-h-11 w-full sm:min-h-9 sm:w-auto"
            >
              {status === "saving" ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
}
