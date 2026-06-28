"use client";

import { useEffect, useRef, useState } from "react";
import MutaraCapitalNav from "./components/MutaraCapitalNav";

export default function Home() {
  const outerRef = useRef<HTMLDivElement>(null);
  const deviceRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const phoneContentRef = useRef<HTMLDivElement>(null);
  const desktopContentRef = useRef<HTMLDivElement>(null);
  const portfolioTrackRef = useRef<HTMLDivElement>(null);
  const portfolioSectionRef = useRef<HTMLElement>(null);
  const [ctaStep, setCtaStep] = useState(0);
  const [ctaValues, setCtaValues] = useState<Record<string, string>>({});
  const [ctaPhase, setCtaPhase] = useState<"form" | "done">("form");
  const ctaInputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  const ctaSteps = [
    { id: "name", question: "What’s your name?", placeholder: "Your name", type: "text" },
    { id: "email", question: "Where can we reach you?", placeholder: "your@email.com", type: "email" },
    { id: "company", question: "What does your business do?", placeholder: "Brief description", type: "text" },
    { id: "help", question: "How can we help?", placeholder: "Tell us briefly", type: "textarea" },
  ];

  useEffect(() => {
    if (ctaPhase === "form") ctaInputRef.current?.focus();
  }, [ctaStep, ctaPhase]);

  function ctaAdvance() {
    const current = ctaSteps[ctaStep];
    if (!ctaValues[current.id]?.trim()) return;
    if (ctaStep < ctaSteps.length - 1) {
      setCtaStep((s) => s + 1);
    } else {
      setCtaPhase("done");
    }
  }

  useEffect(() => {
    const outer = outerRef.current;
    const frame = frameRef.current;
    const phoneContent = phoneContentRef.current;
    const desktopContent = desktopContentRef.current;
    const portfolioTrack = portfolioTrackRef.current;

    // Skip scroll animation on mobile
    const isMobile = window.innerWidth <= 600;
    if (isMobile) {
      if (phoneContent) {
        phoneContent.style.display = "flex";
      }
      if (desktopContent) {
        desktopContent.style.display = "none";
      }
    }

    function smoothstep(t: number) {
      return t * t * (3 - 2 * t);
    }

    function easeOutQuart(t: number) {
      return 1 - Math.pow(1 - t, 4);
    }

    function handleScroll() {
      if (!outer || !frame || !phoneContent || !desktopContent) return;
      if (window.innerWidth <= 600) return; // disable on mobile

      const reveal = deviceRef.current;
      if (!reveal) return;

      const rect = outer.getBoundingClientRect();
      const outerH = outer.offsetHeight;
      const viewH = window.innerHeight;
      const revealH = reveal.offsetHeight;

      // Pin the reveal container within the outer wrapper
      const outerTop = rect.top;
      const pinOffset = 80;
      const maxPin = outerH - revealH;

      if (outerTop >= pinOffset) {
        reveal.style.transform = "translateY(0)";
      } else if (outerTop + outerH - revealH <= pinOffset) {
        reveal.style.transform = "translateY(" + maxPin + "px)";
      } else {
        reveal.style.transform = "translateY(" + (-outerTop + pinOffset) + "px)";
      }

      // Progress: 0 when outer top is at pinOffset -> 1 when scrolled through full travel
      const scrollableDistance = outerH - viewH;
      const scrolled = -(outerTop - pinOffset);
      const progress = scrollableDistance > 0
        ? Math.min(1, Math.max(0, scrolled / scrollableDistance))
        : 0;

      // Phase 1 (0->0.20): Phone presents -- gentle tilt eases off
      const p1 = easeOutQuart(Math.min(1, progress / 0.20));
      // Phase 2 (0.15->0.35): Phone straightens fully
      const p2 = smoothstep(Math.max(0, Math.min(1, (progress - 0.15) / 0.20)));
      // Phase 3 (0.35->0.65): Frame expands to desktop width
      const p3 = smoothstep(Math.max(0, Math.min(1, (progress - 0.35) / 0.30)));
      // Phase 4 (0.60->0.90): Final settle
      const p4 = smoothstep(Math.max(0, Math.min(1, (progress - 0.60) / 0.30)));

      const expandEase = p3 * 0.35 + p4 * 0.65;

      // Rotation: starts subtle (6 / 4 deg), eases to zero
      const rotX = 6 * (1 - p1 * 0.5) * (1 - p2);
      const rotY = 4 * (1 - p1 * 0.5) * (1 - p2);

      // Scale: 0.92 -> 0.96 -> 1.0
      const sc = 0.92 + 0.04 * p1 + 0.04 * p2;

      // Width: 375px -> 960px
      const phoneW = 375;
      const desktopW = 960;
      const currentW = phoneW + (desktopW - phoneW) * expandEase;
      frame.style.width = currentW + "px";
      frame.style.maxWidth = expandEase > 0.005 ? "90vw" : "375px";

      // Height: 680px -> 560px
      const phoneH = 680;
      const desktopH = 560;
      const currentH = phoneH + (desktopH - phoneH) * expandEase;
      frame.style.height = currentH + "px";

      // Border radius: 44px -> 12px (tighter for desktop browser look)
      const radius = 44 - 32 * expandEase;
      frame.style.borderRadius = radius + "px";

      // Border: thick phone bezel -> thin desktop border
      const borderW = 3 - 2 * expandEase;
      const borderAlpha = 1 - 0.7 * expandEase;
      frame.style.border = borderW.toFixed(1) + "px solid rgba(26,26,26," + borderAlpha.toFixed(2) + ")";

      // Opacity: fade in during first phase
      const opacityP = Math.min(1, progress / 0.15);
      frame.style.opacity = (0.7 + 0.3 * opacityP).toFixed(3);

      // Shadow: evolves from dramatic phone shadow to subtle desktop shadow
      const shadowAlpha = 0.14 + 0.06 * (1 - expandEase);
      const shadowY = 20 + rotX * 2;
      const shadowBlur = 80 + rotX * 2;
      frame.style.boxShadow =
        "0 " + shadowY.toFixed(0) + "px " + shadowBlur.toFixed(0) + "px rgba(0,0,0," + shadowAlpha.toFixed(3) + ")," +
        " 0 2px 8px rgba(0,0,0," + (shadowAlpha * 0.18).toFixed(3) + ")";

      // 3D transform
      frame.style.transform =
        "perspective(1400px) rotateX(" + rotX.toFixed(2) + "deg) rotateY(" + rotY.toFixed(2) + "deg) scale(" + sc.toFixed(4) + ")";

      // Binary swap at midpoint -- no overlap, no white flash
      if (expandEase >= 0.5) {
        phoneContent.style.display = "none";
        desktopContent.style.display = "flex";
      } else {
        phoneContent.style.display = "flex";
        desktopContent.style.display = "none";
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    // Scroll reveal
    const reveals = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach((el) => observer.observe(el));

    let isDraggingPortfolio = false;
    let portfolioStartX = 0;
    let portfolioStartScrollLeft = 0;
    let portfolioDidDrag = false;

    const portfolioSection = portfolioSectionRef.current;
    let portfolioLocked = false;

    function handlePortfolioWheel(event: WheelEvent) {
      if (!portfolioTrack || !portfolioSection) return;
      const maxScroll = portfolioTrack.scrollWidth - portfolioTrack.clientWidth;
      if (maxScroll <= 0) return;

      const rect = portfolioSection.getBoundingClientRect();
      const navHeight = 64;

      // Lock when portfolio header is at or past the nav
      if (rect.top <= navHeight + 2 && rect.bottom > window.innerHeight * 0.5) {
        const delta =
          Math.abs(event.deltaY) > Math.abs(event.deltaX)
            ? event.deltaY
            : event.deltaX;
        if (delta === 0) return;

        const atStart = portfolioTrack.scrollLeft <= 0 && delta < 0;
        const atEnd = portfolioTrack.scrollLeft >= maxScroll - 1 && delta > 0;

        if (atStart || atEnd) {
          // Release — allow normal scroll
          portfolioLocked = false;
          return;
        }

        // Lock the page and scroll horizontally
        event.preventDefault();
        portfolioLocked = true;
        portfolioTrack.scrollLeft += delta;
      }
    }

    // Snap the portfolio into view when scrolling near it
    function handlePageScroll() {
      if (!portfolioSection || !portfolioTrack) return;
      const rect = portfolioSection.getBoundingClientRect();
      const maxScroll = portfolioTrack.scrollWidth - portfolioTrack.clientWidth;
      const navHeight = 64;

      // If the section top is close to the nav and there's still horizontal scroll to do, snap it
      if (
        rect.top > -10 && rect.top < navHeight + 40 &&
        portfolioTrack.scrollLeft > 0 &&
        portfolioTrack.scrollLeft < maxScroll - 1
      ) {
        window.scrollTo({ top: portfolioSection.offsetTop - navHeight, behavior: "auto" });
      }
    }

    window.addEventListener("scroll", handlePageScroll, { passive: true });

    function handlePortfolioPointerDown(event: PointerEvent) {
      if (!portfolioTrack) return;
      if (event.pointerType === "mouse" && event.button !== 0) return;

      isDraggingPortfolio = true;
      portfolioDidDrag = false;
      portfolioStartX = event.clientX;
      portfolioStartScrollLeft = portfolioTrack.scrollLeft;
      portfolioTrack.classList.add("portfolio__track--dragging");
    }

    function handlePortfolioPointerMove(event: PointerEvent) {
      if (!portfolioTrack || !isDraggingPortfolio) return;

      const deltaX = event.clientX - portfolioStartX;
      if (Math.abs(deltaX) > 4) portfolioDidDrag = true;
      portfolioTrack.scrollLeft = portfolioStartScrollLeft - deltaX;
      event.preventDefault();
    }

    function endPortfolioDrag() {
      if (!portfolioTrack) return;
      isDraggingPortfolio = false;
      portfolioTrack.classList.remove("portfolio__track--dragging");
    }

    function handlePortfolioClick(event: MouseEvent) {
      if (!portfolioDidDrag) return;
      event.preventDefault();
      event.stopPropagation();
      portfolioDidDrag = false;
    }

    function handlePortfolioNavClick(event: MouseEvent) {
      if (!portfolioTrack) return;
      const target = event.currentTarget as HTMLButtonElement;
      const index = Number(target.dataset.portfolioIndex);
      const cards = portfolioTrack.querySelectorAll<HTMLElement>(".portfolio__card");
      const card = cards[index];
      if (!card) return;

      portfolioTrack.scrollTo({
        left: card.offsetLeft - portfolioTrack.offsetLeft,
        behavior: "smooth",
      });
    }

    window.addEventListener("wheel", handlePortfolioWheel, { passive: false });
    portfolioTrack?.addEventListener("pointerdown", handlePortfolioPointerDown);
    portfolioTrack?.addEventListener("pointermove", handlePortfolioPointerMove);
    portfolioTrack?.addEventListener("pointerup", endPortfolioDrag);
    portfolioTrack?.addEventListener("pointerleave", endPortfolioDrag);
    portfolioTrack?.addEventListener("click", handlePortfolioClick, true);
    const portfolioNavButtons = document.querySelectorAll<HTMLButtonElement>("[data-portfolio-index]");
    portfolioNavButtons.forEach((button) => {
      button.addEventListener("click", handlePortfolioNavClick);
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("scroll", handlePageScroll);
      observer.disconnect();
      window.removeEventListener("wheel", handlePortfolioWheel);
      portfolioTrack?.removeEventListener("pointerdown", handlePortfolioPointerDown);
      portfolioTrack?.removeEventListener("pointermove", handlePortfolioPointerMove);
      portfolioTrack?.removeEventListener("pointerup", endPortfolioDrag);
      portfolioTrack?.removeEventListener("pointerleave", endPortfolioDrag);
      portfolioTrack?.removeEventListener("click", handlePortfolioClick, true);
      portfolioNavButtons.forEach((button) => {
        button.removeEventListener("click", handlePortfolioNavClick);
      });
    };
  }, []);

  return (
    <>
      <MutaraCapitalNav />

      {/* ════════════════ HERO ════════════════ */}
      <section className="hero">
        <div
          className="container"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <h1 className="hero__headline">The software that powers your operations.</h1>
          <p className="hero__sub">
            Rwandan companies work hard, so should the software they use. Syncabi connects dots and processes it all in one platform.
          </p>
          <div className="hero__cta" style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
            <a href="/contact" className="pill-btn pill-btn--solid">Let&apos;s build together</a>
            <a href="/login" className="pill-btn pill-btn--outline-light">Try Syncabi</a>
          </div>
        </div>

        {/* ── Device — phone → desktop scroll transition ── */}
        <div className="device-reveal-outer" ref={outerRef}>
        <div className="device-reveal" ref={deviceRef}>
          <div className="dash-frame" ref={frameRef}>

            {/* ── Phone content (swapped via display) ── */}
            <div className="dash-phone" ref={phoneContentRef}>
              <div className="dash-phone__status">
                <span className="dash-phone__time">9:41</span>
                <div className="dash-phone__notch"></div>
                <div className="dash-phone__indicators">
                  <svg width="16" height="12" viewBox="0 0 16 12" fill="none"><rect x="0" y="4" width="3" height="8" rx="1" fill="var(--ink-40)"/><rect x="4.5" y="2.5" width="3" height="9.5" rx="1" fill="var(--ink-40)"/><rect x="9" y="0" width="3" height="12" rx="1" fill="var(--ink)"/></svg>
                  <svg width="22" height="12" viewBox="0 0 22 12" fill="none"><rect x="0.5" y="0.5" width="19" height="11" rx="2" stroke="var(--ink-40)"/><rect x="2" y="2" width="13" height="8" rx="1" fill="#2E7D32"/><rect x="20" y="3.5" width="2" height="5" rx="1" fill="var(--ink-40)"/></svg>
                </div>
              </div>
              <div className="dash-phone__header">
                <div className="dash-phone__logo">S</div>
                <span className="dash-phone__name">Syncabi</span>
                <div className="dash-phone__avatar">JI</div>
              </div>
              <div className="dash-phone__date">Operations &middot; Today</div>
              <div className="dash-phone__metrics">
                <div className="dash-phone__metric">
                  <div className="dash-phone__metric-val">3.2M</div>
                  <div className="dash-phone__metric-lbl">RWF revenue</div>
                </div>
                <div className="dash-phone__metric-div" />
                <div className="dash-phone__metric">
                  <div className="dash-phone__metric-val">47</div>
                  <div className="dash-phone__metric-lbl">Orders today</div>
                </div>
              </div>
              <div className="dash-phone__bar-wrap">
                <div className="dash-phone__bar-header">
                  <span>Operations on track</span>
                  <span className="dash-phone__bar-pct">94%</span>
                </div>
                <div className="dash-phone__bar"><div className="dash-phone__bar-fill" style={{ width: "94%" }} /></div>
              </div>
              <div className="dash-phone__activity">
                <div className="dash-phone__activity-title">Recent</div>
                <div className="dash-phone__activity-row"><span className="dash-phone__dot dash-phone__dot--green" /><span>Invoice #0142 sent</span></div>
                <div className="dash-phone__activity-row"><span className="dash-phone__dot dash-phone__dot--green" /><span>Stock levels updated</span></div>
                <div className="dash-phone__activity-row"><span className="dash-phone__dot dash-phone__dot--green" /><span>PAYE filed on time</span></div>
              </div>
              <div className="dash-phone__actions">
                <button className="dash-phone__btn dash-phone__btn--primary">Record</button>
                <button className="dash-phone__btn">Report</button>
              </div>
              <div className="dash-phone__home-bar"></div>
            </div>

            {/* ── Desktop content (swapped via display) ── */}
            <div className="dash-desktop" ref={desktopContentRef}>
              {/* Browser chrome */}
              <div className="dash-browser-chrome">
                <div className="dash-browser-chrome__dots">
                  <div className="dash-browser-chrome__dot dash-browser-chrome__dot--red" />
                  <div className="dash-browser-chrome__dot dash-browser-chrome__dot--yellow" />
                  <div className="dash-browser-chrome__dot dash-browser-chrome__dot--green" />
                </div>
                <div className="dash-browser-chrome__url">app.syncabi.com</div>
              </div>
              {/* App nav bar */}
              <div className="dash-desktop__topbar">
                <div className="dash-desktop__topbar-left">
                  <div className="dash-desktop__app-logo">S</div>
                  <span className="dash-desktop__app-name">Syncabi</span>
                </div>
                <div className="dash-desktop__topbar-nav">
                  <span className="dash-desktop__nav-item dash-desktop__nav-item--active">Dashboard</span>
                  <span className="dash-desktop__nav-item">Operations</span>
                  <span className="dash-desktop__nav-item">Finance</span>
                  <span className="dash-desktop__nav-item">Compliance</span>
                </div>
                <div className="dash-desktop__topbar-right">
                  <div className="dash-desktop__avatar">JI</div>
                </div>
              </div>

              {/* Main content area */}
              <div className="dash-desktop__body">
                {/* Sidebar */}
                <div className="dash-desktop__sidebar">
                  <div className="dash-desktop__sidebar-section">
                    <div className="dash-desktop__sidebar-title">Run it</div>
                    <div className="dash-desktop__sidebar-item dash-desktop__sidebar-item--active">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><rect x="8" y="1" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><rect x="1" y="8" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><rect x="8" y="8" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.2"/></svg>
                      Overview
                    </div>
                    <div className="dash-desktop__sidebar-item">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 4h10M2 7h10M2 10h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                      Operations
                    </div>
                    <div className="dash-desktop__sidebar-item">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 11V6M7 11V3M11 11V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                      Intelligence
                    </div>
                  </div>
                  <div className="dash-desktop__sidebar-section">
                    <div className="dash-desktop__sidebar-title">Prove it</div>
                    <div className="dash-desktop__sidebar-item">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="2" y="1" width="10" height="12" rx="2" stroke="currentColor" strokeWidth="1.2"/><path d="M5 5h4M5 7.5h4M5 10h2" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/></svg>
                      Reports
                    </div>
                    <div className="dash-desktop__sidebar-item">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 10l3-3 2 2 5-5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      Tax &amp; Compliance
                    </div>
                  </div>
                  <div className="dash-desktop__sidebar-section">
                    <div className="dash-desktop__sidebar-title">Grow it</div>
                    <div className="dash-desktop__sidebar-item">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.2"/><path d="M7 5v4M5 7h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                      Credit Line
                    </div>
                  </div>
                </div>

                {/* Dashboard area */}
                <div className="dash-desktop__main">
                  <div className="dash-desktop__greeting">
                    <div>
                      <div className="dash-desktop__greeting-title">Good morning, Joseph</div>
                      <div className="dash-desktop__greeting-sub">Here&apos;s how your business is performing today.</div>
                    </div>
                    <div className="dash-desktop__date-badge">June 4, 2026</div>
                  </div>

                  {/* Metric cards */}
                  <div className="dash-desktop__cards">
                    <div className="dash-desktop__card">
                      <div className="dash-desktop__card-label">Revenue</div>
                      <div className="dash-desktop__card-value">3.2M <span>RWF</span></div>
                      <div className="dash-desktop__card-change dash-desktop__card-change--up">+12% vs last week</div>
                    </div>
                    <div className="dash-desktop__card">
                      <div className="dash-desktop__card-label">Orders</div>
                      <div className="dash-desktop__card-value">47</div>
                      <div className="dash-desktop__card-change dash-desktop__card-change--up">+8 vs yesterday</div>
                    </div>
                    <div className="dash-desktop__card">
                      <div className="dash-desktop__card-label">Ops Score</div>
                      <div className="dash-desktop__card-value">94<span>%</span></div>
                      <div className="dash-desktop__card-change">On track</div>
                    </div>
                    <div className="dash-desktop__card">
                      <div className="dash-desktop__card-label">Tax Status</div>
                      <div className="dash-desktop__card-value dash-desktop__card-value--sm">Compliant</div>
                      <div className="dash-desktop__card-change dash-desktop__card-change--up">VAT &amp; PAYE filed</div>
                    </div>
                  </div>

                  {/* Activity + Chart row */}
                  <div className="dash-desktop__bottom-row">
                    <div className="dash-desktop__chart-card">
                      <div className="dash-desktop__chart-title">Weekly Revenue</div>
                      <div className="dash-desktop__chart">
                        <div className="dash-desktop__chart-bar" style={{ height: "45%" }}><span>Mon</span></div>
                        <div className="dash-desktop__chart-bar" style={{ height: "62%" }}><span>Tue</span></div>
                        <div className="dash-desktop__chart-bar" style={{ height: "38%" }}><span>Wed</span></div>
                        <div className="dash-desktop__chart-bar" style={{ height: "78%" }}><span>Thu</span></div>
                        <div className="dash-desktop__chart-bar dash-desktop__chart-bar--accent" style={{ height: "90%" }}><span>Fri</span></div>
                        <div className="dash-desktop__chart-bar" style={{ height: "55%" }}><span>Sat</span></div>
                        <div className="dash-desktop__chart-bar" style={{ height: "30%" }}><span>Sun</span></div>
                      </div>
                    </div>
                    <div className="dash-desktop__activity-card">
                      <div className="dash-desktop__activity-title">Recent Activity</div>
                      <div className="dash-desktop__activity-row"><span className="dash-desktop__dot dash-desktop__dot--green" /><span>Invoice #0142 sent</span><span className="dash-desktop__activity-time">2m ago</span></div>
                      <div className="dash-desktop__activity-row"><span className="dash-desktop__dot dash-desktop__dot--green" /><span>Stock levels updated</span><span className="dash-desktop__activity-time">14m ago</span></div>
                      <div className="dash-desktop__activity-row"><span className="dash-desktop__dot dash-desktop__dot--green" /><span>PAYE filed on time</span><span className="dash-desktop__activity-time">1h ago</span></div>
                      <div className="dash-desktop__activity-row"><span className="dash-desktop__dot dash-desktop__dot--blue" /><span>Credit line approved</span><span className="dash-desktop__activity-time">3h ago</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
        </div>
      </section>

      {/* ════════════════ OLD HERO TEXT (saved for reuse) ════════════════
          <h1 className="hero__headline">Turn hard work into proof.</h1>
          <p className="hero__sub">
            Most Rwandan businesses are worth more than they can prove. Syncabi helps you build the systems, visibility, and confidence that help your business speak for itself.
          </p>
      ════════════════════════════════════════════════════════════════════ */}

      {/* ════════════════ SECTION 2: PORTFOLIO COMPANIES ════════════════ */}
      <section className="portfolio" ref={portfolioSectionRef}>
        <div className="portfolio__header">
          <p className="portfolio__eyebrow">Portfolio</p>
          <h2 className="portfolio__title">Featured Brands</h2>
          <div className="portfolio__nav" aria-label="Portfolio companies">
            <button className="portfolio__nav-btn" type="button" data-portfolio-index="0" aria-label="Show Blessed Dairy">1</button>
            <button className="portfolio__nav-btn" type="button" data-portfolio-index="1" aria-label="Show Amazing Tools">2</button>
            <button className="portfolio__nav-btn" type="button" data-portfolio-index="2" aria-label="Show Maran Design">3</button>
            <button className="portfolio__nav-btn" type="button" data-portfolio-index="3" aria-label="Show Kootana Holdings">4</button>
          </div>
        </div>
        <div className="portfolio__track" ref={portfolioTrackRef}>
          {/* Blessed Dairy */}
          <a href="/case-studies/blessed-dairy" className="portfolio__card" style={{ background: "#E8DDD3" }}>
            <div className="portfolio__card-content">
              <p className="portfolio__card-eyebrow">Blessed Dairy</p>
              <h3 className="portfolio__card-headline">
                Quality dairy, from farm to table
              </h3>
              <p className="portfolio__card-desc">
                Dairy production and distribution. We&apos;re helping Blessed Dairy build operational systems and a brand that reflects the quality of their product.
              </p>
              <div className="portfolio__card-arrow">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 10h12M12 6l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
            </div>
            <div className="portfolio__card-visual">
              <div className="portfolio__card-logo" style={{ background: "#D4C4B0", color: "#5C4A3A" }}>BD</div>
            </div>
          </a>

          {/* Amazing Tools */}
          <a href="/case-studies/amazing-tools" className="portfolio__card" style={{ background: "#1A1A1A", color: "#fff" }}>
            <div className="portfolio__card-content">
              <p className="portfolio__card-eyebrow" style={{ color: "rgba(255,255,255,0.5)" }}>Amazing Tools Company</p>
              <h3 className="portfolio__card-headline">
                The tools that build Rwanda
              </h3>
              <p className="portfolio__card-desc" style={{ color: "rgba(255,255,255,0.55)" }}>
                Tools and equipment supply. We&apos;re helping Amazing Tools Company streamline operations and build a brand customers trust.
              </p>
              <div className="portfolio__card-arrow" style={{ borderColor: "rgba(255,255,255,0.2)", color: "#fff" }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 10h12M12 6l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
            </div>
            <div className="portfolio__card-visual">
              <div className="portfolio__card-logo" style={{ background: "#333", color: "#fff" }}>AT</div>
            </div>
          </a>

          {/* Maran Design */}
          <a href="/case-studies/maran-design" className="portfolio__card" style={{ background: "#F0EBE5" }}>
            <div className="portfolio__card-content">
              <p className="portfolio__card-eyebrow">Maran Design</p>
              <h3 className="portfolio__card-headline">
                Craft that scales into legacy
              </h3>
              <p className="portfolio__card-desc">
                Creative design studio. We&apos;re supporting Maran Design with the tools and structure to scale their craft into a lasting brand.
              </p>
              <div className="portfolio__card-arrow">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 10h12M12 6l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
            </div>
            <div className="portfolio__card-visual">
              <div className="portfolio__card-logo" style={{ background: "#D6CFC5", color: "#4A4038" }}>MD</div>
            </div>
          </a>

          {/* Kootana Holdings */}
          <a href="/case-studies/kootana-holdings" className="portfolio__card" style={{ background: "#1C2A35", color: "#fff" }}>
            <div className="portfolio__card-content">
              <p className="portfolio__card-eyebrow" style={{ color: "rgba(255,255,255,0.5)" }}>Kootana Holdings</p>
              <h3 className="portfolio__card-headline">
                Redefining residential living in Montreal
              </h3>
              <p className="portfolio__card-desc" style={{ color: "rgba(255,255,255,0.55)" }}>
                Real estate and residential rentals. We&apos;re helping Kootana Holdings digitize property management and build a trusted tenant experience.
              </p>
              <div className="portfolio__card-arrow" style={{ borderColor: "rgba(255,255,255,0.2)", color: "#fff" }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 10h12M12 6l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
            </div>
            <div className="portfolio__card-visual">
              <div className="portfolio__card-logo" style={{ background: "#2A3F4E", color: "#fff" }}>HB</div>
            </div>
          </a>
        </div>
      </section>

      {/* ════════════════ DARK CTA / CONTACT ════════════════ */}
      <section className="dark-cta">
        <div className="dark-cta__glow" />
        <div className="container dark-cta__inner">
          <div className="dark-cta__text">
            <p className="dark-cta__eyebrow">Get started</p>
            <h2 className="dark-cta__headline">
              Let&apos;s build something<br />worth talking about.
            </h2>
            <p className="dark-cta__sub">
              Tell us about your business. We&apos;ll show you how Syncabi can help you run it better.
            </p>
          </div>
          {ctaPhase === "done" ? (
            <div className="dark-cta__done">
              <div className="dark-cta__done-check">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              </div>
              <h3 className="dark-cta__question">We&apos;ll be in touch.</h3>
              <p className="dark-cta__done-body">
                Thanks{ctaValues.name ? `, ${ctaValues.name}` : ""}. Someone from our team will reach out
                {ctaValues.email ? ` to ${ctaValues.email}` : ""} within 48 hours.
              </p>
            </div>
          ) : (
            <div className="dark-cta__form" key={ctaStep}>
              <div className="dark-cta__step-count">{ctaStep + 1} / {ctaSteps.length}</div>
              <h3 className="dark-cta__question">{ctaSteps[ctaStep].question}</h3>

              {ctaSteps[ctaStep].type === "textarea" ? (
                <textarea
                  ref={ctaInputRef as React.RefObject<HTMLTextAreaElement>}
                  className="dark-cta__input dark-cta__textarea"
                  placeholder={ctaSteps[ctaStep].placeholder}
                  rows={3}
                  value={ctaValues[ctaSteps[ctaStep].id] || ""}
                  onChange={(e) => setCtaValues((v) => ({ ...v, [ctaSteps[ctaStep].id]: e.target.value }))}
                />
              ) : (
                <input
                  ref={ctaInputRef as React.RefObject<HTMLInputElement>}
                  className="dark-cta__input"
                  type={ctaSteps[ctaStep].type}
                  placeholder={ctaSteps[ctaStep].placeholder}
                  value={ctaValues[ctaSteps[ctaStep].id] || ""}
                  onChange={(e) => setCtaValues((v) => ({ ...v, [ctaSteps[ctaStep].id]: e.target.value }))}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); ctaAdvance(); } }}
                  autoComplete={ctaSteps[ctaStep].id === "email" ? "email" : "off"}
                />
              )}

              <div className="dark-cta__actions">
                {ctaStep > 0 && (
                  <button className="dark-cta__back" type="button" onClick={() => setCtaStep((s) => s - 1)}>
                    Back
                  </button>
                )}
                <button
                  className="dark-cta__submit"
                  type="button"
                  onClick={ctaAdvance}
                  disabled={!ctaValues[ctaSteps[ctaStep].id]?.trim()}
                >
                  {ctaStep < ctaSteps.length - 1 ? "Continue" : "Submit"}
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                <span className="dark-cta__hint">Press <kbd>Enter ↵</kbd></span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ════════════════ FOOTER ════════════════ */}
      <footer className="footer-min">
        <div className="container">
          <div className="footer-min__top">
            <div className="footer-min__left">
              <div className="footer-min__brand">Syncabi</div>
              <p className="footer-min__tagline">The software that powers your operations.</p>
            </div>
            <div className="footer-min__cols">
              <div className="footer-min__col">
                <div className="footer-min__col-title">Brands</div>
                <a href="/case-studies/blessed-dairy">Blessed Dairy</a>
                <a href="/case-studies/amazing-tools">Amazing Tools Company</a>
                <a href="/case-studies/maran-design">Maran Design</a>
                <a href="/case-studies/kootana-holdings">Kootana Holdings</a>
              </div>
              <div className="footer-min__col">
                <div className="footer-min__col-title">Company</div>
                <a href="/about">About</a>
                <a href="/contact">Contact</a>
              </div>
              <div className="footer-min__col">
                <div className="footer-min__col-title">Legal</div>
                <a href="#">Terms</a>
                <a href="#">Privacy</a>
              </div>
            </div>
          </div>
          <div className="footer-min__bottom">
            <span>&copy; 2026 Syncabi</span>
          </div>
        </div>
      </footer>
    </>
  );
}
