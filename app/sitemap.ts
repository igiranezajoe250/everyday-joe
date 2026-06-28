import { MetadataRoute } from "next";

const BASE = "https://designops.dev";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: BASE, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/case-studies`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/case-studies/blessed-dairy`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/case-studies/exp-rw`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/case-studies/kigali-coffee-co`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/case-studies/umurimo-textiles`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/business/syncabi`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/business/butik`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/business/noetic-credit-line`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/ventures/manufacturing-operations`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/ventures/services-consumer-brands`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
  ];
}
