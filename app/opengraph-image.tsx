import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt =
  "ShiftBeacon - healthcare team management. Geofenced clock-in and out, live staff visibility, and attendance analytics.";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Satori needs a ttf/otf/woff and next/font/google only leaves woff2 behind, so
// the card renders no live text. The wordmark is the exported lockup instead
// and `alt` above carries the words. The lockup ships pre-trimmed because the
// raw export is 2157x384 with the art in the left 45%.
const lockup = await readFile(
  join(process.cwd(), "brand", "lockup-horizontal-trimmed.png")
);

export default function OpengraphImage() {
  const lockupSrc = `data:image/png;base64,${lockup.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#eaf3f0",
          padding: 64,
        }}
      >
        <div
          style={{
            flex: 1,
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#ffffff",
            border: "8px solid #16262b",
            // The hard offset shadow is the neobrutalist signature, and Satori
            // supports box-shadow without blur.
            boxShadow: "16px 16px 0 0 #2e8b57",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- Satori
              renders this, not the browser; next/image does not exist here. */}
          <img src={lockupSrc} width={831} height={200} alt="" />
        </div>
      </div>
    ),
    { ...size }
  );
}
