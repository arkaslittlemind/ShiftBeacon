"use client";

import { ViewTransition } from "react";
import { usePathname } from "next/navigation";

// Crossfades the main content region between route navigations instead of
// hard-cutting. Keyed by pathname so React treats each route's content as an
// exit/enter pair; the browser's default view-transition crossfade needs no
// extra CSS (see the reduced-motion override in globals.css).
export function RouteTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return <ViewTransition key={pathname}>{children}</ViewTransition>;
}
