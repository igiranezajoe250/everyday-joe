"use client";

import { useState, useCallback, useEffect, useRef, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

const categories = [
  { id: "home", title: "COMMERCE", subtitle: "Reimagined", image: "/images/butik/hero.png", searchScope: "Search everything" },
  { id: "fashion", title: "FASHION", subtitle: "Wear the culture", image: "/images/butik/fashion.png", searchScope: "Search fashion" },
  { id: "beauty", title: "BEAUTY", subtitle: "Pure radiance", image: "/images/butik/cosmetics.png", searchScope: "Search beauty" },
  { id: "accessories", title: "ACCESSORIES", subtitle: "Adorn yourself", image: "/images/butik/jewels.png", searchScope: "Search accessories" },
  { id: "lifestyle", title: "LIFESTYLE", subtitle: "Live beautifully", image: "/images/butik/boutiques.png", searchScope: "Search lifestyle" },
];

const results = [
  { id: 1, name: "Handwoven Agaseke Basket", boutique: "Inzozi Atelier", price: "RWF 45,000", image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&h=520&fit=crop&q=80" },
  { id: 2, name: "Single-Origin Bourbon Coffee", boutique: "Gorilla Coffee House", price: "RWF 18,000", image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=520&fit=crop&q=80" },
  { id: 3, name: "Imigongo Art Panel", boutique: "Urugo Gallery", price: "RWF 120,000", image: "https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?w=400&h=520&fit=crop&q=80" },
  { id: 4, name: "Kitenge Wrap Dress", boutique: "Umuco Fashion", price: "RWF 65,000", image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=520&fit=crop&q=80" },
  { id: 5, name: "Banana Leaf Tote", boutique: "Keza Crafts", price: "RWF 32,000", image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&h=520&fit=crop&q=80" },
  { id: 6, name: "Ceramic Serving Set", boutique: "Ishimwe Design", price: "RWF 28,000", image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=520&fit=crop&q=80" },
  { id: 7, name: "Rwandan Honey Set", boutique: "Inzozi Atelier", price: "RWF 22,000", image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=520&fit=crop&q=80" },
  { id: 8, name: "Woven Wall Hanging", boutique: "Keza Crafts", price: "RWF 55,000", image: "https://images.unsplash.com/photo-1615529328331-f8917597711f?w=400&h=520&fit=crop&q=80" },
];

type SearchMode = "text" | "voice" | "image" | "video" | "live";

const modeIcons: Record<SearchMode, ReactNode> = {
  text: <path d="M21 21l-4.35-4.35M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z" />,
  voice: <><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="22" /></>,
  image: <><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></>,
  video: <><path d="m22 8-6 4 6 4V8z" /><rect x="2" y="6" width="14" height="12" rx="2" /></>,
  live: <><circle cx="12" cy="12" r="3" /><path d="M16.24 7.76a6 6 0 0 1 0 8.49" /><path d="M7.76 16.24a6 6 0 0 1 0-8.49" /></>,
};

const modeLabels: Record<SearchMode, string> = { text: "Search", voice: "Voice", image: "Image", video: "Video", live: "Live" };

export default function HeroSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [searchMode, setSearchMode] = useState<SearchMode>("text");
  const [showModes, setShowModes] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrolling = useRef(false);
  const touchStartY = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cat = categories[activeIndex];

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) { setSearchQuery(query.trim()); setShowModes(false); }
  }, [query]);

  const clearSearch = useCallback(() => {
    setSearchQuery(null); setQuery(""); setSearchMode("text"); setIsListening(false);
  }, []);

  const selectMode = useCallback((mode: SearchMode) => {
    setSearchMode(mode); setShowModes(false); setIsListening(false);
    if (mode === "voice") { setIsListening(true); setTimeout(() => { setQuery("Handwoven basket"); setIsListening(false); }, 2500); }
    if (mode === "image") fileInputRef.current?.click();
    if (mode === "live") { setIsListening(true); setTimeout(() => { setQuery("Kitenge fabric dress"); setIsListening(false); }, 3000); }
    if (mode === "video") { setIsListening(true); setTimeout(() => { setQuery("Ceramic serving set"); setIsListening(false); }, 2800); }
  }, []);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setQuery(`Image: ${file.name}`); setTimeout(() => setSearchQuery(`Image: ${file.name}`), 800); }
  }, []);

  const goToCategory = useCallback((index: number) => {
    if (isTransitioning) return;
    let next = index;
    if (next < 0) next = categories.length - 1;
    if (next >= categories.length) next = 0;
    setIsTransitioning(true); setActiveIndex(next);
    setTimeout(() => setIsTransitioning(false), 700);
  }, [isTransitioning]);

  useEffect(() => {
    if (searchQuery) return;
    const container = containerRef.current;
    if (!container) return;
    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < 10 || isScrolling.current) return;
      e.preventDefault(); isScrolling.current = true;
      goToCategory(activeIndex + (e.deltaY > 0 ? 1 : -1));
      setTimeout(() => { isScrolling.current = false; }, 900);
    };
    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, [searchQuery, activeIndex, goToCategory]);

  useEffect(() => {
    if (searchQuery) return;
    const container = containerRef.current;
    if (!container) return;
    const handleTouchStart = (e: TouchEvent) => { touchStartY.current = e.touches[0].clientY; };
    const handleTouchEnd = (e: TouchEvent) => {
      if (isScrolling.current) return;
      const deltaY = touchStartY.current - e.changedTouches[0].clientY;
      if (Math.abs(deltaY) < 50) return;
      isScrolling.current = true;
      goToCategory(activeIndex + (deltaY > 0 ? 1 : -1));
      setTimeout(() => { isScrolling.current = false; }, 900);
    };
    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchend", handleTouchEnd, { passive: true });
    return () => { container.removeEventListener("touchstart", handleTouchStart); container.removeEventListener("touchend", handleTouchEnd); };
  }, [searchQuery, activeIndex, goToCategory]);

  const fileInput = <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />;
  const allModes: SearchMode[] = ["text", "voice", "image", "video", "live"];

  if (searchQuery) {
    return (
      <section className="w-full h-dvh bg-paper text-ink flex flex-col">
        {fileInput}
        <div className="flex items-center justify-between animate-fade-up" style={{ padding: "5rem 1.25rem 1rem" }}>
          <div className="min-w-0 flex-1" style={{ marginRight: "1rem" }}>
            <p className="text-[0.62rem] font-semibold tracking-[0.2em] uppercase text-ink/30" style={{ marginBottom: "0.375rem" }}>Results for</p>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-ink truncate" style={{ fontFamily: "var(--font-display)" }}>&ldquo;{searchQuery}&rdquo;</h2>
          </div>
          <button onClick={clearSearch} className="text-[0.6rem] font-semibold tracking-[0.16em] uppercase text-ink/30 hover:text-ink/60 border border-ink/8 hover:border-ink/20 rounded-full transition-all duration-200 flex-shrink-0 inline-flex items-center" style={{ padding: "0.5rem 1.25rem", gap: "0.375rem" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
            Back
          </button>
        </div>
        <div className="flex-1 flex items-center overflow-hidden" style={{ padding: "0 1.25rem" }}>
          <div className="flex overflow-x-auto hide-scrollbar w-full" style={{ gap: "0.75rem", paddingBottom: "1.5rem" }}>
            {[...results, ...results].map((item, i) => (
              <article key={`${item.id}-${i}`} className="flex-shrink-0 w-[160px] sm:w-[240px] lg:w-[280px] group cursor-pointer animate-slide-in rounded-2xl overflow-hidden" style={{ animationDelay: `${i * 70}ms`, background: "rgba(255,255,255,0.45)", backdropFilter: "blur(16px)", border: "1px solid rgba(17,17,16,0.04)", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
                <div className="aspect-[3/4] relative overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image} alt={item.name} className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700" loading="lazy" />
                </div>
                <div style={{ padding: "0.75rem" }}>
                  <h3 className="text-[0.7rem] sm:text-[0.78rem] lg:text-[0.82rem] font-medium text-ink leading-snug group-hover:text-ink/50 transition-colors duration-200">{item.name}</h3>
                  <p className="text-[0.54rem] sm:text-[0.6rem] lg:text-[0.64rem] text-ink/30 tracking-[0.02em]" style={{ marginTop: "0.25rem" }}>{item.boutique}</p>
                  <p className="text-[0.7rem] sm:text-[0.78rem] lg:text-[0.82rem] text-ink/70 font-medium tabular-nums" style={{ marginTop: "0.5rem" }}>{item.price}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
        <div className="flex justify-center" style={{ padding: "0 1.25rem 1.25rem" }}>
          <div className="w-full max-w-[520px]">
            <SearchBarInline query={query} setQuery={setQuery} onSubmit={handleSubmit} searchMode={searchMode} showModes={showModes} setShowModes={setShowModes} selectMode={selectMode} isListening={isListening} allModes={allModes} scopeLabel={searchQuery} placeholder={query || "Search for something else"} />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={containerRef} className="w-full h-dvh relative overflow-hidden bg-[#080808] touch-none">
      {fileInput}

      <div className={`absolute inset-0 transition-opacity duration-700 ${isTransitioning ? "opacity-0" : "opacity-100"}`}>
        <Image
          src={cat.image}
          alt={cat.title.replace("\n", " ")}
          fill
          priority={activeIndex === 0}
          className="object-cover object-top brightness-[0.88] contrast-[1.05]"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
      </div>

      {/* Desktop: centered content */}
      <div className="hidden lg:flex absolute inset-0 z-[5] items-center justify-center" style={{ padding: "0 10rem" }}>
        <div className={`text-center flex flex-col items-center transition-all duration-700 ${isTransitioning ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"}`}>
          <h1
            className="text-[clamp(2.8rem,4.5vw,4.5rem)] font-semibold tracking-[0.06em] uppercase text-white leading-[0.95] whitespace-pre-line drop-shadow-[0_2px_20px_rgba(0,0,0,0.3)]"
            style={{ marginBottom: "1rem", fontFamily: "var(--font-display)" }}
          >
            {cat.title}
          </h1>
          <p className="text-[1rem] lg:text-[1.05rem] italic text-white/70 tracking-[0.03em]" style={{ marginBottom: "2rem" }}>{cat.subtitle}</p>
          {activeIndex !== 0 && (
            <Link
              href={`/butik/${cat.id}`}
              className="inline-flex items-center text-[0.64rem] font-semibold tracking-[0.16em] uppercase border border-white/20 hover:border-white/40 rounded-full transition-all duration-300 hover:-translate-y-px hover:shadow-[0_4px_24px_rgba(255,255,255,0.1)] group backdrop-blur-sm"
              style={{ color: "rgba(255,255,255,0.7)", gap: "0.625rem", padding: "0.75rem 1.5rem" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 group-hover:translate-x-0.5">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
                <path d="M11 8v6M8 11h6" />
              </svg>
              Explore {cat.title.replace("\n", " ").toLowerCase()}
            </Link>
          )}
        </div>
      </div>

      {/* Mobile/tablet: centered content */}
      <div className="lg:hidden absolute inset-0 z-[5] flex flex-col items-center justify-center" style={{ padding: "0 4rem" }}>
        <div className={`text-center flex flex-col items-center transition-all duration-700 ${isTransitioning ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"}`}>
          <h1
            className="text-[clamp(1.8rem,9vw,3.2rem)] font-semibold tracking-[0.06em] uppercase text-white leading-[0.95] whitespace-pre-line drop-shadow-[0_2px_16px_rgba(0,0,0,0.4)]"
            style={{ fontFamily: "var(--font-display)", marginBottom: "0.75rem" }}
          >
            {cat.title}
          </h1>
          <p className="text-[0.84rem] sm:text-[0.88rem] italic text-white/65 tracking-[0.03em]" style={{ marginBottom: "1.25rem" }}>{cat.subtitle}</p>
          {activeIndex !== 0 && (
            <Link
              href={`/butik/${cat.id}`}
              className="inline-flex items-center text-[0.58rem] sm:text-[0.6rem] font-semibold tracking-[0.16em] uppercase border border-white/20 hover:border-white/40 rounded-full transition-all duration-300 backdrop-blur-sm"
              style={{ color: "rgba(255,255,255,0.7)", gap: "0.5rem", padding: "0.625rem 1.25rem" }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
                <path d="M11 8v6M8 11h6" />
              </svg>
              Explore
            </Link>
          )}
        </div>
      </div>

      {/* Search bar */}
      <div className="absolute inset-x-0 bottom-0 z-10 pointer-events-none flex justify-center" style={{ paddingBottom: "3rem" }}>
        <div className="pointer-events-auto w-full max-w-[480px] lg:max-w-[520px]" style={{ padding: "0 1.25rem" }}>
          <SearchBarInline
            query={query} setQuery={setQuery} onSubmit={handleSubmit}
            searchMode={searchMode} showModes={showModes} setShowModes={setShowModes}
            selectMode={selectMode} isListening={isListening} allModes={allModes}
            scopeLabel={cat.searchScope}
            placeholder={activeIndex === 0 ? "Ask about the rebirth of commerce" : `Find ${cat.title.toLowerCase().replace("\n", " ")}...`}
          />
        </div>
      </div>

      {/* Right: section nav */}
      <div className="absolute right-3 sm:right-5 lg:right-8 top-1/2 -translate-y-1/2 z-10">
        <div className="flex flex-col animate-fade-in" style={{ gap: "0.125rem" }}>
          {categories.map((c, i) => {
            const isActive = i === activeIndex;
            const label = c.title.replace("\n", " ");
            return (
              <button
                key={c.id}
                onClick={() => goToCategory(i)}
                className="flex items-center justify-end group transition-all duration-300"
                style={{ gap: "0.5rem", padding: "0.375rem 0" }}
              >
                <span
                  className={`text-[0.42rem] sm:text-[0.48rem] lg:text-[0.54rem] font-semibold tracking-[0.12em] uppercase whitespace-nowrap transition-all duration-300 ${
                    isActive ? "text-white/90" : "text-white/25 group-hover:text-white/55"
                  }`}
                >
                  {label}
                </span>
                <div className={`w-[2px] rounded-full transition-all duration-500 flex-shrink-0 ${
                  isActive ? "h-4 sm:h-5 lg:h-6 bg-white/80" : "h-[2px] bg-white/20 group-hover:bg-white/45"
                }`} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Counter */}
      <div className="absolute bottom-3 sm:bottom-4 lg:bottom-5 left-1/2 -translate-x-1/2 z-10">
        <span className="text-[0.5rem] sm:text-[0.55rem] lg:text-[0.6rem] font-medium tracking-[0.2em] uppercase text-white/25 tabular-nums">
          {String(activeIndex + 1).padStart(2, "0")} / {String(categories.length).padStart(2, "0")}
        </span>
      </div>
    </section>
  );
}

function SearchBarInline({ query, setQuery, onSubmit, searchMode, showModes, setShowModes, selectMode, isListening, allModes, scopeLabel, placeholder }: {
  query: string; setQuery: (q: string) => void; onSubmit: (e: React.FormEvent) => void;
  searchMode: SearchMode; showModes: boolean; setShowModes: (v: boolean) => void;
  selectMode: (m: SearchMode) => void; isListening: boolean; allModes: SearchMode[];
  scopeLabel: string; placeholder: string;
}) {
  return (
    <form onSubmit={onSubmit} className="w-full">
      <div
        className="rounded-[22px] sm:rounded-[26px] lg:rounded-[30px] overflow-hidden transition-all duration-300"
        style={{
          border: "1px solid rgba(255,255,255,0.5)",
          background: "linear-gradient(145deg, rgba(255,255,255,0.48), rgba(255,255,255,0.16)), rgba(238,235,221,0.4)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.65), 0 16px 56px rgba(52,45,31,0.16), 0 4px 12px rgba(0,0,0,0.04)",
          backdropFilter: "blur(28px) saturate(1.3)",
        }}
      >
        <div className="h-[36px] sm:h-[40px] lg:h-[44px] flex items-center justify-between border-b border-ink/[0.06]" style={{ padding: "0 0.75rem" }}>
          <span className="text-ink/45 text-[0.66rem] sm:text-[0.72rem] lg:text-[0.76rem] font-medium tracking-[0.02em] truncate">{scopeLabel}</span>
          <div className="flex items-center" style={{ gap: "0.375rem" }}>
            {searchMode !== "text" && (
              <span className="text-[0.5rem] font-semibold tracking-[0.12em] uppercase text-green-ink/60 bg-green-ink/8 rounded-full" style={{ padding: "0.125rem 0.5rem" }}>{modeLabels[searchMode]}</span>
            )}
          </div>
        </div>

        <div className="bg-ink/[0.03]">
          <div className="grid transition-all duration-300 ease-out" style={{ gridTemplateRows: showModes ? "1fr" : "0fr", opacity: showModes ? 1 : 0 }}>
            <div className="overflow-hidden">
              <div className="flex items-center justify-between" style={{ padding: "0.75rem" }}>
                {allModes.map((mode) => (
                  <button key={mode} type="button" onClick={() => selectMode(mode)}
                    className={`flex flex-col items-center flex-1 rounded-xl transition-all duration-200 ${searchMode === mode ? "text-ink" : "text-ink/30 hover:text-ink/60"}`}
                    style={{ gap: "0.375rem", padding: "0.5rem 0" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{modeIcons[mode]}</svg>
                    <span className="text-[0.5rem] sm:text-[0.55rem] font-semibold tracking-[0.1em] uppercase">{modeLabels[mode]}</span>
                    {searchMode === mode && <div className="w-1 h-1 rounded-full bg-ink" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid transition-all duration-300 ease-out" style={{ gridTemplateRows: showModes ? "0fr" : "1fr", opacity: showModes ? 0 : 1 }}>
            <div className="overflow-hidden">
              <div className="min-h-[46px] sm:min-h-[52px] lg:min-h-[58px] grid grid-cols-[auto_1fr_auto] items-center" style={{ gap: "0.5rem", padding: "0.375rem 0.625rem" }}>
                <button type="button" onClick={(e) => { e.stopPropagation(); setShowModes(true); }}
                  className="w-[30px] h-[30px] sm:w-[34px] sm:h-[34px] lg:w-[36px] lg:h-[36px] rounded-full inline-flex items-center justify-center text-ink/35 hover:text-ink/60 hover:bg-white/40 transition-all duration-200" aria-label="Search modes">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
                </button>
                {isListening ? (
                  <div className="flex items-center min-w-0" style={{ gap: "0.75rem" }}>
                    <div className="w-2 h-2 rounded-full bg-green-ink/70 listening-dot" />
                    <span className="text-ink/35 text-[0.78rem] sm:text-[0.84rem] lg:text-[0.9rem]">Listening...</span>
                  </div>
                ) : (
                  <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={placeholder}
                    className="w-full bg-transparent text-ink text-[0.78rem] sm:text-[0.84rem] lg:text-[0.9rem] placeholder:text-ink/30 focus:outline-none min-w-0" autoComplete="off" />
                )}
                <button type="submit" className="w-[34px] h-[34px] sm:w-[38px] sm:h-[38px] lg:w-[42px] lg:h-[42px] rounded-full inline-flex items-center justify-center bg-ink text-white shadow-[0_4px_16px_rgba(17,17,16,0.18)] hover:shadow-[0_6px_24px_rgba(17,17,16,0.24)] hover:-translate-y-px transition-all duration-200" aria-label="Search">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 12h12M13 7l5 5-5 5" /></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
