"use client";

import { use } from "react";
import Link from "next/link";
import Header from "../components/Header";

const categoryData: Record<string, { title: string; subtitle: string; items: { id: number; name: string; boutique: string; price: string; image: string }[] }> = {
  fashion: {
    title: "Fashion",
    subtitle: "Wear the culture",
    items: [
      { id: 1, name: "Kitenge Wrap Dress", boutique: "Umuco Fashion", price: "RWF 65,000", image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=520&fit=crop&q=80" },
      { id: 2, name: "Ankara Blazer", boutique: "House of Tayo", price: "RWF 85,000", image: "https://images.unsplash.com/photo-1507680434567-5739c80be1ac?w=400&h=520&fit=crop&q=80" },
      { id: 3, name: "Wax Print Shirt", boutique: "FLEXX", price: "RWF 42,000", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=520&fit=crop&q=80" },
      { id: 4, name: "Linen Wide-Leg Trousers", boutique: "Sonia Mugabo", price: "RWF 58,000", image: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400&h=520&fit=crop&q=80" },
      { id: 5, name: "Handwoven Scarf", boutique: "Inzuki Designs", price: "RWF 28,000", image: "https://images.unsplash.com/photo-1601924994987-69e26d50dc64?w=400&h=520&fit=crop&q=80" },
      { id: 6, name: "Dashiki Mini Dress", boutique: "Ichyulu", price: "RWF 72,000", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=520&fit=crop&q=80" },
    ],
  },
  beauty: {
    title: "Beauty",
    subtitle: "Pure radiance",
    items: [
      { id: 1, name: "Moringa Glow Serum", boutique: "Kigali Naturals", price: "RWF 24,000", image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=520&fit=crop&q=80" },
      { id: 2, name: "Shea Butter Lip Balm Set", boutique: "Imizi Beauty", price: "RWF 12,000", image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&h=520&fit=crop&q=80" },
      { id: 3, name: "Hibiscus Face Mist", boutique: "Kigali Naturals", price: "RWF 18,000", image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=520&fit=crop&q=80" },
      { id: 4, name: "Mineral Bronzer Palette", boutique: "Imizi Beauty", price: "RWF 35,000", image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&h=520&fit=crop&q=80" },
      { id: 5, name: "Coconut Oil Hair Mask", boutique: "Kigali Naturals", price: "RWF 22,000", image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&h=520&fit=crop&q=80" },
      { id: 6, name: "Volcanic Clay Cleanser", boutique: "Imizi Beauty", price: "RWF 19,000", image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=520&fit=crop&q=80" },
    ],
  },
  skincare: {
    title: "Skin Care",
    subtitle: "Glow naturally",
    items: [
      { id: 1, name: "Avocado Night Cream", boutique: "Kigali Naturals", price: "RWF 32,000", image: "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=400&h=520&fit=crop&q=80" },
      { id: 2, name: "Coffee Exfoliant Scrub", boutique: "Gorilla Coffee House", price: "RWF 15,000", image: "https://images.unsplash.com/photo-1608979048467-6194af3ab7d3?w=400&h=520&fit=crop&q=80" },
      { id: 3, name: "Aloe Vera Gel", boutique: "Kigali Naturals", price: "RWF 14,000", image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=520&fit=crop&q=80" },
      { id: 4, name: "Rosehip Face Oil", boutique: "Imizi Beauty", price: "RWF 28,000", image: "https://images.unsplash.com/photo-1601049676869-702ea24cfd58?w=400&h=520&fit=crop&q=80" },
      { id: 5, name: "Charcoal Pore Strips", boutique: "Imizi Beauty", price: "RWF 8,000", image: "https://images.unsplash.com/photo-1570194065650-d99fb4d8a609?w=400&h=520&fit=crop&q=80" },
      { id: 6, name: "Vitamin C Brightening Serum", boutique: "Kigali Naturals", price: "RWF 38,000", image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=520&fit=crop&q=80" },
    ],
  },
  fragrance: {
    title: "Fragrance",
    subtitle: "Essence of nature",
    items: [
      { id: 1, name: "Cedarwood & Vanilla EDP", boutique: "Inzozi Atelier", price: "RWF 78,000", image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=520&fit=crop&q=80" },
      { id: 2, name: "Jasmine Night Parfum", boutique: "Inzozi Atelier", price: "RWF 65,000", image: "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=400&h=520&fit=crop&q=80" },
      { id: 3, name: "Bergamot Citrus Cologne", boutique: "Inzozi Atelier", price: "RWF 52,000", image: "https://images.unsplash.com/photo-1594035910387-fea081ac51e0?w=400&h=520&fit=crop&q=80" },
      { id: 4, name: "Oud & Amber Intense", boutique: "Inzozi Atelier", price: "RWF 95,000", image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=400&h=520&fit=crop&q=80" },
      { id: 5, name: "Eucalyptus Fresh EDT", boutique: "Inzozi Atelier", price: "RWF 45,000", image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=400&h=520&fit=crop&q=80" },
      { id: 6, name: "Rose Petal Mist", boutique: "Imizi Beauty", price: "RWF 22,000", image: "https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=400&h=520&fit=crop&q=80" },
    ],
  },
  jewelry: {
    title: "Jewelry & Accessories",
    subtitle: "Adorn yourself",
    items: [
      { id: 1, name: "Silver Crescent Necklace", boutique: "K'tsobe", price: "RWF 48,000", image: "https://images.unsplash.com/photo-1515562141589-67f0d999b5f6?w=400&h=520&fit=crop&q=80" },
      { id: 2, name: "Beaded Statement Earrings", boutique: "Inzuki Designs", price: "RWF 18,000", image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=520&fit=crop&q=80" },
      { id: 3, name: "Brass Cuff Bracelet", boutique: "K'tsobe", price: "RWF 35,000", image: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400&h=520&fit=crop&q=80" },
      { id: 4, name: "Woven Sisal Clutch", boutique: "Inzuki Designs", price: "RWF 28,000", image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&h=520&fit=crop&q=80" },
      { id: 5, name: "Amber Ring Set", boutique: "K'tsobe", price: "RWF 42,000", image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=520&fit=crop&q=80" },
      { id: 6, name: "Horn Hair Pins", boutique: "Ichyulu", price: "RWF 15,000", image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&h=520&fit=crop&q=80" },
    ],
  },
  personalcare: {
    title: "Personal Care",
    subtitle: "Nourish within",
    items: [
      { id: 1, name: "Charcoal Bamboo Toothbrush Set", boutique: "Kigali Naturals", price: "RWF 8,000", image: "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=400&h=520&fit=crop&q=80" },
      { id: 2, name: "Lavender Body Lotion", boutique: "Imizi Beauty", price: "RWF 22,000", image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=520&fit=crop&q=80" },
      { id: 3, name: "Natural Deodorant Stick", boutique: "Kigali Naturals", price: "RWF 12,000", image: "https://images.unsplash.com/photo-1608979048467-6194af3ab7d3?w=400&h=520&fit=crop&q=80" },
      { id: 4, name: "Coconut Oil Soap Bar", boutique: "Inzozi Atelier", price: "RWF 6,500", image: "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=400&h=520&fit=crop&q=80" },
      { id: 5, name: "Peppermint Foot Cream", boutique: "Imizi Beauty", price: "RWF 16,000", image: "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=400&h=520&fit=crop&q=80" },
      { id: 6, name: "Shea Butter Hand Cream", boutique: "Kigali Naturals", price: "RWF 14,000", image: "https://images.unsplash.com/photo-1601049676869-702ea24cfd58?w=400&h=520&fit=crop&q=80" },
    ],
  },
  lifestyle: {
    title: "Lifestyle",
    subtitle: "Live beautifully",
    items: [
      { id: 1, name: "Handwoven Agaseke Basket", boutique: "Inzozi Atelier", price: "RWF 45,000", image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&h=520&fit=crop&q=80" },
      { id: 2, name: "Single-Origin Bourbon Coffee", boutique: "Gorilla Coffee House", price: "RWF 18,000", image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=520&fit=crop&q=80" },
      { id: 3, name: "Imigongo Art Panel", boutique: "Urugo Gallery", price: "RWF 120,000", image: "https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?w=400&h=520&fit=crop&q=80" },
      { id: 4, name: "Ceramic Serving Set", boutique: "Ishimwe Design", price: "RWF 28,000", image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=520&fit=crop&q=80" },
      { id: 5, name: "Rwandan Honey Set", boutique: "Inzozi Atelier", price: "RWF 22,000", image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=520&fit=crop&q=80" },
      { id: 6, name: "Woven Wall Hanging", boutique: "Keza Crafts", price: "RWF 55,000", image: "https://images.unsplash.com/photo-1615529328331-f8917597711f?w=400&h=520&fit=crop&q=80" },
    ],
  },
  accessories: {
    title: "Accessories",
    subtitle: "Adorn yourself",
    items: [
      { id: 1, name: "Silver Crescent Necklace", boutique: "K'tsobe", price: "RWF 48,000", image: "https://images.unsplash.com/photo-1515562141589-67f0d999b5f6?w=400&h=520&fit=crop&q=80" },
      { id: 2, name: "Beaded Statement Earrings", boutique: "Inzuki Designs", price: "RWF 18,000", image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=520&fit=crop&q=80" },
      { id: 3, name: "Brass Cuff Bracelet", boutique: "K'tsobe", price: "RWF 35,000", image: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400&h=520&fit=crop&q=80" },
      { id: 4, name: "Woven Sisal Clutch", boutique: "Inzuki Designs", price: "RWF 28,000", image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&h=520&fit=crop&q=80" },
      { id: 5, name: "Amber Ring Set", boutique: "K'tsobe", price: "RWF 42,000", image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=520&fit=crop&q=80" },
      { id: 6, name: "Horn Hair Pins", boutique: "Ichyulu", price: "RWF 15,000", image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&h=520&fit=crop&q=80" },
    ],
  },
  home: {
    title: "Home",
    subtitle: "Commerce reimagined",
    items: [
      { id: 1, name: "Handwoven Agaseke Basket", boutique: "Inzozi Atelier", price: "RWF 45,000", image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&h=520&fit=crop&q=80" },
      { id: 2, name: "Kitenge Wrap Dress", boutique: "Umuco Fashion", price: "RWF 65,000", image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=520&fit=crop&q=80" },
      { id: 3, name: "Silver Crescent Necklace", boutique: "K'tsobe", price: "RWF 48,000", image: "https://images.unsplash.com/photo-1515562141589-67f0d999b5f6?w=400&h=520&fit=crop&q=80" },
      { id: 4, name: "Moringa Glow Serum", boutique: "Kigali Naturals", price: "RWF 24,000", image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=520&fit=crop&q=80" },
      { id: 5, name: "Cedarwood & Vanilla EDP", boutique: "Inzozi Atelier", price: "RWF 78,000", image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=520&fit=crop&q=80" },
      { id: 6, name: "Imigongo Art Panel", boutique: "Urugo Gallery", price: "RWF 120,000", image: "https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?w=400&h=520&fit=crop&q=80" },
    ],
  },
};

export default function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = use(params);
  const data = categoryData[category];

  if (!data) {
    return (
      <div className="min-h-dvh bg-paper text-ink">
        <Header />
        <div className="flex items-center justify-center h-[80vh]">
          <p className="text-ink/40 text-sm">This section is coming soon.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-paper text-ink">
      <Header />

      <main style={{ paddingTop: "6rem", paddingBottom: "7rem" }}>
        <div className="max-w-[1440px] mx-auto" style={{ padding: "0 1rem" }}>
          <div className="animate-fade-up" style={{ marginBottom: "1.5rem" }}>
            <p className="text-[0.58rem] sm:text-[0.62rem] lg:text-[0.65rem] font-semibold tracking-[0.25em] uppercase text-ink/25" style={{ marginBottom: "0.5rem" }}>{data.subtitle}</p>
            <h2 className="text-xl sm:text-2xl lg:text-4xl font-normal text-ink" style={{ fontFamily: "var(--font-display)" }}>{data.title}</h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3" style={{ gap: "0.75rem" }}>
            {data.items.map((item, i) => (
              <article
                key={item.id}
                className="group cursor-pointer animate-fade-up rounded-xl sm:rounded-2xl overflow-hidden"
                style={{ animationDelay: `${i * 80}ms`, background: "rgba(255,255,255,0.45)", backdropFilter: "blur(16px)", border: "1px solid rgba(17,17,16,0.04)", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}
              >
                <div className="aspect-[3/4] relative overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image} alt={item.name} className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700" loading="lazy" />
                </div>
                <div style={{ padding: "0.625rem" }}>
                  <h3 className="text-[0.68rem] sm:text-[0.76rem] lg:text-[0.82rem] font-medium text-ink leading-snug group-hover:text-ink/50 transition-colors duration-200">{item.name}</h3>
                  <p className="text-[0.52rem] sm:text-[0.58rem] lg:text-[0.64rem] text-ink/30 tracking-[0.02em]" style={{ marginTop: "0.25rem" }}>{item.boutique}</p>
                  <p className="text-[0.68rem] sm:text-[0.76rem] lg:text-[0.82rem] text-ink/70 font-medium tabular-nums" style={{ marginTop: "0.5rem" }}>{item.price}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>

      <div className="fixed bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-30 animate-fade-up" style={{ animationDelay: "400ms" }}>
        <Link
          href="/butik"
          className="inline-flex items-center rounded-full text-[0.62rem] sm:text-[0.66rem] font-semibold tracking-[0.16em] uppercase transition-all duration-300 hover:-translate-y-px group"
          style={{ gap: "0.5rem", padding: "0.75rem 1.5rem", background: "rgba(255,255,255,0.85)", backdropFilter: "blur(20px) saturate(1.2)", boxShadow: "0 8px 32px rgba(0,0,0,0.1), 0 2px 6px rgba(0,0,0,0.04)", border: "1px solid rgba(255,255,255,0.6)" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-ink/50 group-hover:text-ink transition-colors duration-200"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          <span className="text-ink/60 group-hover:text-ink transition-colors duration-200">Back to Butik</span>
        </Link>
      </div>
    </div>
  );
}
