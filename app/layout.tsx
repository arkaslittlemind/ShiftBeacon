import type { Metadata, Viewport } from "next";
import { Newsreader, Inter, JetBrains_Mono } from "next/font/google";
import { RegisterServiceWorker } from "@/components/pwa/register-service-worker";
import "./globals.css";

// Newsreader is variable, so no weight list; the opsz axis lets large
// headings use the display cut. Roman only: the design never sets italic.
const newsreader = Newsreader({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["opsz"],
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ShiftBeacon",
  description:
    "Location-aware shift management for healthcare teams: geofenced clock-in/out, live staff visibility, and attendance analytics.",
  appleWebApp: {
    title: "ShiftBeacon",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#16212b",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${newsreader.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-dvh flex flex-col">
        <RegisterServiceWorker />
        {children}
      </body>
    </html>
  );
}
