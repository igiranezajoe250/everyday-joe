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
  title: "Syncabi — Build a business worth investing in.",
  description:
    "Most Rwandan businesses are worth more than they can prove. Syncabi changes that.",
  metadataBase: new URL("https://designops.dev"),
  openGraph: {
    title: "Syncabi — Build a business worth investing in.",
    description:
      "Most Rwandan businesses are worth more than they can prove. Syncabi changes that.",
    url: "https://designops.dev",
    siteName: "Syncabi",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Syncabi — Build a business worth investing in.",
    description:
      "Most Rwandan businesses are worth more than they can prove. Syncabi changes that.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#8B3A2F",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${hankenGrotesk.variable} ${jetBrainsMono.variable} ${playfairDisplay.variable}`}
    >
      <body>
        <Providers>
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
