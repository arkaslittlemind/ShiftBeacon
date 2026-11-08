"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { WorkplaceMapFallback } from "@/components/manager/workplace-map-fallback";
import type { Perimeter } from "@/lib/geo";

// Loaded on demand so maplibre-gl never enters another route's bundle, and
// never loads at all when the key is absent or the draft is invalid.
const WorkplaceMapPreview = dynamic(
  () => import("@/components/manager/workplace-map-preview").then((m) => m.WorkplaceMapPreview),
  { ssr: false, loading: () => <div className="size-full bg-muted" /> }
);

// NEXT_PUBLIC_ values are inlined at build time, so this reads process.env
// directly rather than pulling server-only getEnv() into the browser.
const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY;

export function WorkplaceMapPreviewLazy({ location }: { location: Perimeter | null }) {
  const [failure, setFailure] = useState<string | null>(null);

  let content: React.ReactNode;
  if (!MAPTILER_KEY) {
    content = <WorkplaceMapFallback location={location} reason="Map preview is not configured." />;
  } else if (!location) {
    content = (
      <WorkplaceMapFallback
        location={null}
        reason="Enter a valid latitude, longitude, and radius to preview the map."
      />
    );
  } else if (failure) {
    content = <WorkplaceMapFallback location={location} reason={failure} />;
  } else {
    content = (
      <WorkplaceMapPreview location={location} apiKey={MAPTILER_KEY} onFailure={setFailure} />
    );
  }

  return <div className="h-55 w-full overflow-hidden rounded-2xl lg:h-full">{content}</div>;
}
