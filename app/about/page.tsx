import type { Metadata } from "next";
import AboutPageClient from "./AboutPageClient";

export const metadata: Metadata = {
  title: "About — Ingoga Labs",
  description:
    "We are an independent research and development lab investigating complex problems across health, food, climate, and mobility — and building practical futures from Kigali, Rwanda.",
};

export default function AboutPage() {
  return <AboutPageClient />;
}
