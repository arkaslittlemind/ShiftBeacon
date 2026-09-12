"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { eyebrowClass } from "@/lib/utils";
import { captureClientEvent } from "@/lib/observability/client-events";
import type { OrganizationResponse } from "@/types/organization";

type Status = "idle" | "saving" | "success" | "error";

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

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <div className="grid gap-1.5">
        <label htmlFor="name" className={eyebrowClass}>
          Name
        </label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          aria-invalid={status === "error"}
          aria-describedby={status === "error" ? "workplace-form-error" : undefined}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="grid gap-1.5">
          <label htmlFor="latitude" className={eyebrowClass}>
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
            aria-describedby={status === "error" ? "workplace-form-error" : undefined}
          />
        </div>
        <div className="grid gap-1.5">
          <label htmlFor="longitude" className={eyebrowClass}>
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
            aria-describedby={status === "error" ? "workplace-form-error" : undefined}
          />
        </div>
        <div className="grid gap-1.5">
          <label htmlFor="radius" className={eyebrowClass}>
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
            aria-describedby={status === "error" ? "workplace-form-error" : undefined}
          />
        </div>
      </div>

      {status === "error" && errorMessage && (
        <p id="workplace-form-error" role="alert" className="text-sm text-destructive">
          {errorMessage}
        </p>
      )}
      {status === "success" && (
        <p role="status" className="text-sm text-primary">
          Saved.
        </p>
      )}

      <div>
        <Button type="submit" disabled={status === "saving"}>
          {status === "saving" ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
}
