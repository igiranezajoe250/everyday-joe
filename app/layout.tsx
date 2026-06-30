import type { Metadata, Viewport } from "next";
import {
  Hanken_Grotesk,
  JetBrains_Mono,
  Playfair_Display,
  Space_Grotesk,
} from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import Providers from "./components/Providers";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});
const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-hanken-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});
const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});
const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Ingoga Labs — Curiosity, Applied.",
  description:
    "An independent research and development lab in Kigali working across social impact, intelligent technology, and climate resilience.",
  metadataBase: new URL("https://ingogalabs.com"),
  openGraph: {
    title: "Ingoga Labs — Curiosity, Applied.",
    description:
      "Researching complex problems and building practical futures from Kigali, Rwanda.",
    url: "https://ingogalabs.com",
    siteName: "Ingoga Labs",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ingoga Labs — Curiosity, Applied.",
    description:
      "Researching complex problems and building practical futures from Kigali, Rwanda.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#A9D9EC",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} ${hankenGrotesk.variable} ${jetBrainsMono.variable} ${playfairDisplay.variable}`}
    >
      <body>
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
