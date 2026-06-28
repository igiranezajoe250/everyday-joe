"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";

type MenuView = null | "main" | "boutiques" | "about";

const boutiques = [
  {
    name: "Nataal",
    tagline: "Culture. Fashion. Music.",
    logo: "/images/butik/logos/nataal.png",
    color: "#1a1a1a",
    logoBg: "dark" as const,
    url: "https://nataal.com",
    category: "Media & Culture",
    sells: "A media house covering fashion, music, and culture across Africa and its diaspora.",
    why: "They tell the stories that shape how African creativity is understood — everywhere.",
  },
  {
    name: "FLEXX",
    tagline: "Push beyond limits.",
    logo: "/images/butik/logos/flexx.png",
    color: "#f0ede6",
    logoBg: "light" as const,
    url: "https://flexxnow.com",
    category: "Athletic Wear",
    sells: "Sportswear for men and women — from training gear to everyday athletic wear.",
    why: "Built on African heritage, made for real performance. They don't just look good at the gym.",
  },
  {
    name: "Sonia Mugabo",
    tagline: "Effortless. Enduring.",
    logo: "/images/butik/logos/soniamugabo.png",
    color: "#f5f0ea",
    logoBg: "light" as const,
    url: "https://soniamugabo.co",
    category: "Womenswear",
    sells: "Dresses, jumpsuits, and sets — designed and sewn in Kigali.",
    why: "Clothes you keep. Not because they're expensive, but because they never stop feeling right.",
  },
  {
    name: "House of Tayo",
    tagline: "Stories through cloth.",
    logo: "/images/butik/logos/houseoftayo.png",
    color: "#f4f1e4",
    logoBg: "light" as const,
    url: "https://www.houseoftayo.com",
    category: "Menswear",
    sells: "Menswear and accessories — tailored in Kigali with African textiles and modern cuts.",
    why: "Every piece has a story from the continent. You wear it, people ask where it's from.",
  },
  {
    name: "Inzuki Designs",
    tagline: "Handcrafted. Authentic.",
    logo: "/images/butik/logos/inzuki.png",
    color: "#2c2c2c",
    logoBg: "dark" as const,
    url: "https://inzuki.com",
    category: "Jewelry & Accessories",
    sells: "Necklaces, earrings, bracelets, bags — all made by hand in Rwanda.",
    why: "You can feel the hands that made these. Traditional craft shaped for how people live now.",
  },
  {
    name: "Ichyulu",
    tagline: "Curated African design.",
    logo: "/images/butik/logos/ichyulu.png",
    color: "#d6cec4",
    logoBg: "light" as const,
    url: "https://ichyulu.com",
    category: "Concept Store",
    sells: "A concept store — hand-picking fashion and design from across the continent.",
    why: "They find what's worth paying attention to. If it's on Ichyulu, someone good made it.",
  },
  {
    name: "K'tsobe",
    tagline: "Nature. Silver. Craft.",
    logo: "/images/butik/logos/ktsobe.png",
    color: "#ede8e0",
    logoBg: "light" as const,
    url: "https://ktsobe.com",
    category: "Fine Jewelry",
    sells: "Rings, necklaces, bracelets — silver, brass, and materials found in Rwanda's landscape.",
    why: "Each piece looks like the hills and rivers it came from. Quiet jewelry for people who notice.",
  },
];

const articlePages = [
  { num: "01", kicker: "About Butik", title: "What does it mean to run a store in 2026?", subtitle: "And what will it look like in 2035?", body: null, bg: "#F4F6EF" },
  { num: "02", kicker: null, title: "The words we use for great stores", subtitle: null, body: "For a long time, we have associated great stores with certain words — beautiful, modern, luxurious, clean, efficient. Yet many businesses do not struggle because they lack ambition. They struggle because running a store requires carrying too many responsibilities at once.", bg: "#F0EDE6" },
  { num: "03", kicker: null, title: "The burden of running everything", subtitle: null, body: "A shop owner must serve customers, manage inventory, negotiate with suppliers, handle deliveries, organize shelves, process payments, market the business, track finances, and somehow find time to think about growth. The reality is that many businesses are operating below their potential because the burden of running everything falls on a small number of people.", bg: "#EEF2E6" },
  { num: "04", kicker: null, title: "The idea behind Butik", subtitle: null, body: "What if a merchant could focus on serving customers while benefiting from systems, processes, logistics, technology, and operational capabilities that were already proven? We are not asking businesses to become something different. We are helping them become a better version of what they already are.", bg: "#F4F1E4" },
  { num: "05", kicker: null, title: "Commerce is older than software", subtitle: null, body: "Commerce is one of humanity's oldest activities. Long before modern companies, software, payment systems, and supply chains, people exchanged goods, built trust, created markets, and formed communities around trade. Commerce has always been more than buying and selling. It is one of the ways people create value for one another.", bg: "#F0EBE3" },
  { num: "06", kicker: null, title: "The best technology should be calm", subtitle: null, body: "We believe the next chapter of commerce will be shaped by technology, but not by putting more screens, dashboards, and complexity in front of people. The best technology should operate quietly in the background while people focus on serving customers, building relationships, and growing their businesses.", bg: "#EEF0EA" },
  { num: "07", kicker: null, title: "The future is intelligent", subtitle: null, body: "Today we are entering a new era where technology is no longer just a tool. It is becoming a participant. Machines can answer questions, assist customers, understand context, recommend products, coordinate operations, and help businesses make decisions. The future is not simply digital. The future is intelligent.", bg: "#F2EDE4" },
  { num: "08", kicker: null, title: "One business at a time", subtitle: null, body: "Whatever commerce requires today, and whatever it becomes tomorrow, our goal remains the same: to help businesses participate in that future. To make running a business simpler. To make operations smarter. To make commerce more human.", bg: "#F4F6EF" },
];

export default function Header() {
  const [menuView, setMenuView] = useState<MenuView>(null);
  const [selectedBoutique, setSelectedBoutique] = useState<typeof boutiques[number] | null>(null);

  const closeMenu = () => { setMenuView(null); setSelectedBoutique(null); };

  return (
    <>
      <div className="fixed top-4 left-4 sm:top-6 sm:left-6 lg:top-8 lg:left-8 z-30 min-w-0 sm:min-w-[220px] lg:min-w-[260px] rounded-2xl text-ink flex items-center justify-between" style={{ padding: "0.75rem 1rem", background: "rgba(255,255,255,0.88)", backdropFilter: "blur(20px) saturate(1.2)", boxShadow: "0 8px 32px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04)", border: "1px solid rgba(255,255,255,0.6)" }}>
        <Link href="/butik" onClick={closeMenu}>
          <span className="text-[0.85rem] sm:text-[0.95rem] lg:text-[1.02rem] font-semibold tracking-[0.18em] uppercase" style={{ fontFamily: "var(--font-display)" }}>Butik</span>
        </Link>
        <button
          onClick={() => setMenuView(menuView ? null : "main")}
          className="w-[22px] h-[14px] flex flex-col justify-between cursor-pointer"
          style={{ marginLeft: "1.5rem" }}
          aria-label={menuView ? "Close menu" : "Open menu"}
        >
          <span className={`block w-full h-[1.5px] bg-ink transition-transform duration-300 origin-center ${menuView ? "translate-y-[6px] rotate-45" : ""}`} />
          <span className={`block w-full h-[1.5px] bg-ink transition-transform duration-300 origin-center ${menuView ? "-translate-y-[6px] -rotate-45" : ""}`} />
        </button>
      </div>

      {!menuView && (
        <div className="hidden sm:block fixed bottom-6 lg:bottom-8 left-6 lg:left-8 z-30">
          <Link
            href="/butik/cart"
            className="w-[48px] h-[48px] rounded-full bg-white/92 text-ink inline-flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.1),0_2px_6px_rgba(0,0,0,0.04)] backdrop-blur-[16px] hover:bg-white hover:scale-105 hover:shadow-[0_12px_32px_rgba(0,0,0,0.14)] transition-all duration-200 border border-white/20"
            aria-label="Cart"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </Link>
        </div>
      )}

      {menuView && (
        <div className="fixed inset-0 z-20 animate-fade-in">
          {menuView === "main" && (
            <div className="w-full h-full bg-paper text-ink flex flex-col">
              <div className="h-16 sm:h-20" />
              <nav className="flex-1 flex flex-col justify-center gap-4 sm:gap-5 max-w-[800px]" style={{ padding: "0 1.5rem" }}>
                <button onClick={() => setMenuView("boutiques")} className="text-left text-2xl sm:text-3xl lg:text-5xl font-normal text-ink hover:text-green-ink transition-colors duration-300 animate-fade-up" style={{ fontFamily: "var(--font-display)" }}>Boutiques</button>
                <button onClick={() => setMenuView("about")} className="text-left text-2xl sm:text-3xl lg:text-5xl font-normal text-ink hover:text-green-ink transition-colors duration-300 animate-fade-up delay-100" style={{ fontFamily: "var(--font-display)" }}>About</button>
                <Link href="/butik/cart" onClick={closeMenu} className="text-2xl sm:text-3xl lg:text-5xl font-normal text-ink hover:text-green-ink transition-colors duration-300 animate-fade-up delay-200" style={{ fontFamily: "var(--font-display)" }}>Cart & Wallet</Link>
              </nav>
            </div>
          )}

          {menuView === "boutiques" && !selectedBoutique && (
            <div className="w-full h-full bg-[#faf9f6] text-ink flex flex-col">
              <div className="h-16 sm:h-20" />
              <div className="flex-1 flex flex-col items-center justify-center" style={{ padding: "1.5rem 1.25rem" }}>
                <button onClick={() => setMenuView("main")} className="self-start text-[0.6rem] sm:text-[0.64rem] font-semibold tracking-[0.16em] uppercase text-ink/30 hover:text-ink/60 rounded-full border border-ink/8 hover:border-ink/20 transition-all duration-200 inline-flex items-center" style={{ padding: "0.5rem 1rem", marginBottom: "1.5rem", gap: "0.375rem" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                  Back
                </button>

                <div className="flex-1 flex flex-col items-center justify-center w-full max-w-[1100px]">
                  <p className="text-[0.6rem] sm:text-[0.65rem] font-semibold tracking-[0.25em] uppercase text-ink/25 animate-fade-up" style={{ marginBottom: "2.5rem" }}>Boutiques</p>

                  <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-8 gap-x-4 sm:gap-x-6 lg:gap-x-8 gap-y-8 sm:gap-y-10 place-items-center">
                    {boutiques.map((b, i) => (
                      <button
                        key={b.name}
                        className="flex flex-col items-center gap-3 sm:gap-4 group cursor-pointer animate-fade-up"
                        style={{ animationDelay: `${i * 70}ms` }}
                        onClick={() => setSelectedBoutique(b)}
                      >
                        <div
                          className="w-[80px] h-[80px] sm:w-[104px] sm:h-[104px] lg:w-[120px] lg:h-[120px] rounded-full flex items-center justify-center transition-all duration-500 group-hover:scale-110"
                          style={{ backgroundColor: b.color, boxShadow: "0 4px 24px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.08)" }}
                        >
                          <div className="relative w-[56%] aspect-square flex items-center justify-center">
                            <Image src={b.logo} alt={b.name} fill className="object-contain" sizes="120px" />
                          </div>
                        </div>
                        <div className="text-center max-w-[100px] sm:max-w-[110px]">
                          <h3 className="text-[0.62rem] sm:text-[0.7rem] font-semibold tracking-[0.04em] text-ink/80 group-hover:text-ink leading-tight transition-colors duration-300">{b.name}</h3>
                        </div>
                      </button>
                    ))}

                    <button className="flex flex-col items-center gap-3 sm:gap-4 group cursor-pointer animate-fade-up" style={{ animationDelay: `${boutiques.length * 70}ms` }}>
                      <div className="w-[80px] h-[80px] sm:w-[104px] sm:h-[104px] lg:w-[120px] lg:h-[120px] rounded-full flex items-center justify-center border border-dashed border-ink/12 group-hover:border-ink/30 transition-all duration-500 group-hover:scale-110 bg-white/50">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-ink/18 group-hover:text-ink/45 transition-colors duration-300"><path d="M12 5v14M5 12h14" /></svg>
                      </div>
                      <div className="text-center max-w-[100px] sm:max-w-[110px]">
                        <h3 className="text-[0.62rem] sm:text-[0.7rem] font-semibold tracking-[0.04em] text-ink/35 group-hover:text-ink/60 leading-tight transition-colors duration-300">Add yours</h3>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {menuView === "boutiques" && selectedBoutique && (
            <div className="w-full h-full bg-[#faf9f6] text-ink flex flex-col animate-fade-in">
              <div className="h-16 sm:h-20" />
              <div className="flex-1 flex items-center justify-center" style={{ padding: "1.5rem 1.25rem" }}>
                <div className="w-full max-w-[480px] animate-fade-up rounded-3xl" style={{ padding: "2rem", background: "rgba(255,255,255,0.45)", backdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.6)", boxShadow: "0 8px 40px rgba(0,0,0,0.04)" }}>
                  <div className="flex justify-center" style={{ marginBottom: "2rem" }}>
                    <div className="w-[100px] h-[100px] sm:w-[128px] sm:h-[128px] rounded-full flex items-center justify-center" style={{ backgroundColor: selectedBoutique.color, boxShadow: "0 8px 40px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.08)" }}>
                      <div className="relative w-[56%] aspect-square flex items-center justify-center">
                        <Image src={selectedBoutique.logo} alt={selectedBoutique.name} fill className="object-contain" sizes="128px" />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center" style={{ marginBottom: "1rem" }}>
                    <span className="text-[0.56rem] sm:text-[0.6rem] font-semibold tracking-[0.22em] uppercase text-ink/28">{selectedBoutique.category}</span>
                  </div>
                  <h2 className="text-center text-xl sm:text-2xl lg:text-[1.85rem] font-normal text-ink" style={{ fontFamily: "var(--font-display)", marginBottom: "0.625rem" }}>{selectedBoutique.name}</h2>
                  <p className="text-center text-[0.84rem] sm:text-[0.92rem] italic text-green-ink tracking-[0.02em]" style={{ marginBottom: "2rem" }}>{selectedBoutique.tagline}</p>
                  <div className="w-8 h-[0.5px] bg-ink/12 mx-auto" style={{ marginBottom: "1.5rem" }} />
                  <p className="text-center text-[0.78rem] sm:text-[0.84rem] leading-[1.85] text-ink/42 max-w-[380px] mx-auto" style={{ marginBottom: "1rem" }}>{selectedBoutique.sells}</p>
                  <p className="text-center text-[0.74rem] sm:text-[0.8rem] leading-[1.75] text-ink/62 font-medium max-w-[340px] mx-auto" style={{ marginBottom: "2rem" }}>{selectedBoutique.why}</p>
                  <div className="flex flex-col items-center gap-3">
                    <a href={selectedBoutique.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-[0.66rem] sm:text-[0.7rem] font-semibold tracking-[0.16em] uppercase bg-ink rounded-full hover:bg-ink/88 transition-all duration-200 hover:-translate-y-px shadow-[0_4px_16px_rgba(17,17,16,0.12)]" style={{ color: "white", gap: "0.625rem", padding: "0.875rem 1.75rem" }}>
                      Visit {selectedBoutique.name}
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M17 7H7M17 7v10" /></svg>
                    </a>
                    <button onClick={() => setSelectedBoutique(null)} className="text-[0.6rem] sm:text-[0.64rem] font-semibold tracking-[0.16em] uppercase text-ink/25 hover:text-ink/55 transition-colors duration-200" style={{ marginTop: "0.25rem" }}>Back to all</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {menuView === "about" && (
            <AboutArticle onBack={() => setMenuView("main")} />
          )}
        </div>
      )}
    </>
  );
}

function AboutArticle({ onBack }: { onBack: () => void }) {
  const [activePage, setActivePage] = useState(0);
  const isScrolling = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);

  const goToPage = useCallback((index: number) => {
    let next = index;
    if (next < 0) next = articlePages.length - 1;
    if (next >= articlePages.length) next = 0;
    setActivePage(next);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handleWheel = (e: WheelEvent) => {
      if (isScrolling.current || Math.abs(e.deltaY) < 10) return;
      e.preventDefault();
      isScrolling.current = true;
      goToPage(activePage + (e.deltaY > 0 ? 1 : -1));
      setTimeout(() => { isScrolling.current = false; }, 800);
    };
    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, [activePage, goToPage]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handleTouchStart = (e: TouchEvent) => { touchStartY.current = e.touches[0].clientY; };
    const handleTouchEnd = (e: TouchEvent) => {
      if (isScrolling.current) return;
      const deltaY = touchStartY.current - e.changedTouches[0].clientY;
      if (Math.abs(deltaY) < 50) return;
      isScrolling.current = true;
      goToPage(activePage + (deltaY > 0 ? 1 : -1));
      setTimeout(() => { isScrolling.current = false; }, 800);
    };
    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchend", handleTouchEnd, { passive: true });
    return () => { container.removeEventListener("touchstart", handleTouchStart); container.removeEventListener("touchend", handleTouchEnd); };
  }, [activePage, goToPage]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); goToPage(activePage + 1); }
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); goToPage(activePage - 1); }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [activePage, goToPage]);

  const page = articlePages[activePage];

  return (
    <div ref={containerRef} className="w-full h-full text-ink overflow-hidden relative touch-none" style={{ backgroundColor: page.bg, transition: "background-color 0.7s cubic-bezier(0.22, 1, 0.36, 1)" }}>
      <button onClick={onBack} className="fixed top-4 right-4 sm:top-6 sm:right-6 lg:top-8 lg:right-8 z-30 text-[0.6rem] sm:text-[0.66rem] font-semibold tracking-[0.16em] uppercase text-ink/35 hover:text-ink rounded-full bg-white/50 backdrop-blur-md transition-all duration-200" style={{ padding: "0.5rem 1rem", border: "1px solid rgba(17,17,16,0.06)" }}>Close</button>

      <div className="w-full h-full flex items-center justify-center" style={{ padding: "0 1.5rem" }} key={activePage}>
        <div className="max-w-[900px] w-full animate-fade-up">
          {page.kicker && <p className="text-[0.68rem] sm:text-[0.72rem] font-bold tracking-[0.16em] uppercase text-green-ink" style={{ marginBottom: "1rem" }}>{page.kicker}</p>}
          <div className="flex items-start gap-4 sm:gap-8 lg:gap-16">
            <span className="text-2xl sm:text-4xl lg:text-6xl text-ink/10 font-normal flex-shrink-0 leading-none tabular-nums" style={{ fontFamily: "var(--font-display)" }}>{page.num}</span>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-3xl lg:text-[clamp(2.5rem,5vw,4.5rem)] font-normal leading-[1.08] sm:leading-[1.02] max-w-[14ch]" style={{ fontFamily: "var(--font-display)", marginBottom: "1rem" }}>{page.title}</h2>
              {page.subtitle && <p className="text-base sm:text-lg italic text-green-ink tracking-wide">{page.subtitle}</p>}
              {page.body && <p className="text-[0.82rem] sm:text-[0.88rem] lg:text-[0.94rem] leading-[1.75] sm:leading-[1.85] text-ink/55 max-w-[56ch]" style={{ marginTop: "0.75rem" }}>{page.body}</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-1.5 sm:gap-2">
        {articlePages.map((_, i) => (
          <button key={i} onClick={() => goToPage(i)} className={`rounded-full transition-all duration-500 ${i === activePage ? "w-6 sm:w-8 h-1.5 bg-ink/60" : "w-1.5 h-1.5 bg-ink/15 hover:bg-ink/30"}`} aria-label={`Page ${i + 1}`} />
        ))}
      </div>

      <div className="absolute bottom-4 sm:bottom-8 right-4 sm:right-10">
        <span className="text-[0.55rem] sm:text-[0.58rem] font-medium tracking-[0.2em] uppercase text-ink/25 tabular-nums">
          {String(activePage + 1).padStart(2, "0")} / {String(articlePages.length).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}
