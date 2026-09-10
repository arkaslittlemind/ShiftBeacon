import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ShiftBeacon",
    short_name: "ShiftBeacon",
    description:
      "Location-aware shift management for healthcare teams: geofenced clock-in/out, live staff visibility, and attendance analytics.",
    start_url: "/",
    display: "standalone",
    background_color: "#eaf3f0",
    theme_color: "#2e8b57",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
