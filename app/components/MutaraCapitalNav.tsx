"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type PanelId = "syncabi" | "ventures";

interface MutaraCapitalNavProps {
  activePanel?: PanelId | null;
  minimal?: boolean;
}

export default function MutaraCapitalNav({
  activePanel = null,
  minimal = false,
}: MutaraCapitalNavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const nav = document.getElementById("nav");
    const handleScroll = () => {
      if (nav) nav.classList.toggle("scrolled", window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);

    const navWrap = document.getElementById("navWrap");
    const overlay = document.getElementById("navOverlay");
    const tabSyncabi = document.getElementById("tabSyncabi");
    const tabVentures = document.getElementById("tabVentures");
    const panelSyncabi = document.getElementById("panelSyncabi");
    const panelVentures = document.getElementById("panelVentures");
    const allTabs = [tabSyncabi, tabVentures];
    const allPanels = [panelSyncabi, panelVentures];
    let closeTimer: ReturnType<typeof setTimeout> | null = null;

    function openPanel(panel: HTMLElement | null, tab: HTMLElement | null) {
      if (closeTimer) clearTimeout(closeTimer);
      allPanels.forEach((p) => p?.classList.remove("nav__dropdown--open"));
      allTabs.forEach((t) => t?.classList.remove("nav__tab--active"));
      panel?.classList.add("nav__dropdown--open");
      tab?.classList.add("nav__tab--active");
      overlay?.classList.add("nav__overlay--visible");
    }

    function scheduleClose() {
      closeTimer = setTimeout(() => {
        allPanels.forEach((p) => p?.classList.remove("nav__dropdown--open"));
        allTabs.forEach((t) => t?.classList.remove("nav__tab--active"));
        overlay?.classList.remove("nav__overlay--visible");
      }, 150);
    }

    const openSyncabi = () => openPanel(panelSyncabi, tabSyncabi);
    const openVentures = () => openPanel(panelVentures, tabVentures);
    const keepOpen = () => { if (closeTimer) clearTimeout(closeTimer); };

    tabSyncabi?.addEventListener("mouseenter", openSyncabi);
    tabVentures?.addEventListener("mouseenter", openVentures);
    tabSyncabi?.addEventListener("click", openSyncabi);
    tabVentures?.addEventListener("click", openVentures);

    allPanels.forEach((p) => {
      p?.addEventListener("mouseenter", keepOpen);
      p?.addEventListener("mouseleave", scheduleClose);
    });

    navWrap?.addEventListener("mouseleave", scheduleClose);
    overlay?.addEventListener("mouseenter", scheduleClose);
    handleScroll();

    const handleResize = () => {
      if (window.innerWidth > 760) setMobileMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);

    if (activePanel) {
      const tabMap: Record<PanelId, HTMLElement | null> = {
        syncabi: tabSyncabi,
        ventures: tabVentures,
      };
      allPanels.forEach((p) => p?.classList.remove("nav__dropdown--open"));
      allTabs.forEach((t) => t?.classList.remove("nav__tab--active"));
      tabMap[activePanel]?.classList.add("nav__tab--active");
      overlay?.classList.remove("nav__overlay--visible");
    }

    return () => {
      if (closeTimer) clearTimeout(closeTimer);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      tabSyncabi?.removeEventListener("mouseenter", openSyncabi);
      tabVentures?.removeEventListener("mouseenter", openVentures);
      tabSyncabi?.removeEventListener("click", openSyncabi);
      tabVentures?.removeEventListener("click", openVentures);
      allPanels.forEach((p) => {
        p?.removeEventListener("mouseenter", keepOpen);
        p?.removeEventListener("mouseleave", scheduleClose);
      });
      navWrap?.removeEventListener("mouseleave", scheduleClose);
      overlay?.removeEventListener("mouseenter", scheduleClose);
    };
  }, [activePanel]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow =
      mobileMenuOpen && window.innerWidth <= 760 ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  return (
    <nav className="nav" id="nav">
      <div className="nav__dropdown-wrap" id="navWrap">
        <div className="container nav__bar">
          <div className="nav__left">
            <Link href="/" className="nav__logo">Syncabi</Link>
            {!minimal && (
              <>
                <button
                  className={`nav__menu-btn${mobileMenuOpen ? " nav__menu-btn--open" : ""}`}
                  type="button"
                  aria-expanded={mobileMenuOpen}
                  aria-controls="navMobilePanel"
                  onClick={() => setMobileMenuOpen((open) => !open)}
                >
                  <span></span>
                  <span></span>
                </button>
                <button className="nav__tab" id="tabSyncabi" data-panel="syncabi">
                  Services
                  <svg viewBox="0 0 10 10">
                    <path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button className="nav__tab" id="tabVentures" data-panel="ventures">
                  Brands
                  <svg viewBox="0 0 10 10">
                    <path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </>
            )}
          </div>
          <div className="nav__right">
            <Link href="/about" className="nav__link">About</Link>
            <Link href="/login" className="nav__btn nav__btn--solid">Log in</Link>
          </div>
        </div>
        <div className="nav__rule"></div>

        {/* ── Mobile panel ── */}
        <div
          className={`nav__mobile-panel${mobileMenuOpen ? " nav__mobile-panel--open" : ""}`}
          id="navMobilePanel"
        >
          <div className="container nav__mobile-inner">
            <div className="nav__mobile-group">
              <div className="nav__mobile-title">Services we provide</div>
              <div className="nav__mobile-links">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>Overview</Link>
                <Link href="/login#services" onClick={() => setMobileMenuOpen(false)}>Digitize Operations</Link>
                <Link href="/login#services" onClick={() => setMobileMenuOpen(false)}>Automate Processes</Link>
                <Link href="/login#services" onClick={() => setMobileMenuOpen(false)}>Business Intelligence</Link>
                <Link href="/login#services" onClick={() => setMobileMenuOpen(false)}>Operational Excellence</Link>
                <Link href="/business/syncabi#prove-it" onClick={() => setMobileMenuOpen(false)}>Financial Reports</Link>
                <Link href="/business/syncabi#prove-it" onClick={() => setMobileMenuOpen(false)}>Tax &amp; Compliance</Link>
                <Link href="/business/syncabi#prove-it" onClick={() => setMobileMenuOpen(false)}>Audit Trail</Link>
                <Link href="/business/noetic-credit-line" onClick={() => setMobileMenuOpen(false)}>Syncabi Line of Credit</Link>
              </div>
            </div>

            <div className="nav__mobile-group">
              <div className="nav__mobile-title">Brands we work with</div>
              <div className="nav__mobile-links">
                <Link href="#" onClick={() => setMobileMenuOpen(false)}>Blessed Dairy</Link>
                <Link href="#" onClick={() => setMobileMenuOpen(false)}>Amazing Tools Company</Link>
                <Link href="#" onClick={() => setMobileMenuOpen(false)}>Maran Design</Link>
                <Link href="#" onClick={() => setMobileMenuOpen(false)}>Kootana Holdings</Link>
              </div>
            </div>

            <div className="nav__mobile-actions">
              <Link href="/about" className="nav__mobile-link" onClick={() => setMobileMenuOpen(false)}>About</Link>
              <Link href="/login" className="nav__btn nav__btn--solid" onClick={() => setMobileMenuOpen(false)}>Log in</Link>
            </div>
          </div>
        </div>

        {/* Services menu: list the services we provide to businesses. */}
        <div className="nav__dropdown" id="panelSyncabi">
          <div className="container nav__dropdown-inner">
            <div className="nav__dropdown-featured">
              <Link href="/business/syncabi" className="nav__dropdown-featured-title">
                Services
                <svg viewBox="0 0 16 16" fill="none">
                  <path d="M4 8h8M9 5l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link href="/business/syncabi" className="nav__dropdown-featured-sub nav__dropdown-featured-sub--link">Services we provide to help good businesses.<br />Become great businesses.</Link>
            </div>
            {/* Service categories are grouped by the customer outcome they support. */}
            <div className="nav__dropdown-cols">
              <div>
                <div className="nav__dropdown-col-title">Run it</div>
                <ul className="nav__dropdown-col-list">
                  <li><Link href="/login#services">Digitize Operations</Link></li>
                  <li><Link href="/login#services">Automate Processes</Link></li>
                  <li><Link href="/login#services">Business Intelligence</Link></li>
                  <li><Link href="/login#services">Operational Excellence</Link></li>
                </ul>
              </div>
              <div>
                <div className="nav__dropdown-col-title">Prove it</div>
                <ul className="nav__dropdown-col-list">
                  <li><Link href="/business/syncabi#prove-it">Financial Reports</Link></li>
                  <li><Link href="/business/syncabi#prove-it">Tax &amp; Compliance</Link></li>
                  <li><Link href="/business/syncabi#prove-it">Audit Trail</Link></li>
                </ul>
              </div>
              <div>
                <div className="nav__dropdown-col-title">Grow it</div>
                <ul className="nav__dropdown-col-list">
                  <li><Link href="/business/noetic-credit-line">Syncabi Line of Credit</Link></li>
                </ul>
              </div>
            </div>
            <div className="nav__dropdown-cta">
              <Link href="/login" className="nav__dropdown-cta-btn">
                Try Syncabi
                <svg viewBox="0 0 16 16" fill="none">
                  <path d="M4 8h8M9 5l3 3-3 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* ── Featured panel ── */}
        <div className="nav__dropdown" id="panelVentures">
          <div className="container nav__dropdown-inner">
            <div className="nav__dropdown-featured">
              <span className="nav__dropdown-featured-title">
                Brands
              </span>
              <span className="nav__dropdown-featured-sub">Companies we work with</span>
            </div>
            <div className="nav__dropdown-cols">
              <div>
                <div className="nav__dropdown-col-title">Brands we work with</div>
                <ul className="nav__dropdown-col-list">
                  <li><Link href="#">Blessed Dairy</Link></li>
                  <li><Link href="#">Amazing Tools Company</Link></li>
                  <li><Link href="#">Maran Design</Link></li>
                  <li><Link href="#">Kootana Holdings</Link></li>
                </ul>
              </div>
            </div>
            <div className="nav__dropdown-cta">
              <Link href="/contact" className="nav__dropdown-cta-btn">
                Speak to us
                <svg viewBox="0 0 16 16" fill="none">
                  <path d="M4 8h8M9 5l3 3-3 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link href="/case-studies" className="nav__dropdown-cta-link">See our work</Link>
            </div>
          </div>
        </div>
      </div>
      <div
        className={`nav__overlay${mobileMenuOpen ? " nav__overlay--visible" : ""}`}
        id="navOverlay"
        onClick={() => setMobileMenuOpen(false)}
      ></div>
    </nav>
  );
}
