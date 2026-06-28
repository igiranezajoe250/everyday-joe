"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

function KigaliClock() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const kgl = now.toLocaleTimeString("en-GB", {
        timeZone: "Africa/Kigali",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      setTime(kgl);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return <span className="topbar-link topbar-meta" style={{ justifySelf: "end" }}>{time} KGL</span>;
}

type Slide = null | "01" | "02" | "03" | "04";

const partners = [
  { name: "Kigali Marriott", type: "Hospitality" },
  { name: "Visit Rwanda", type: "Tourism" },
  { name: "One&Only Nyungwe House", type: "Luxury Lodges" },
  { name: "Radisson Blu Kigali", type: "Hospitality" },
];

const highlights = [
  { title: "Launches with pull", text: "Campaigns that feel clean, current, and hard to ignore." },
  { title: "Events with presence", text: "From private rooms to public moments, every detail lands." },
  { title: "Stories that travel", text: "Sharp messaging, media handling, and brand rhythm in one move." },
];

const featuredWork = [
  "Destination campaigns",
  "Brand launches",
  "Corporate events",
  "Public relations",
];

const progressWidths: Record<string, string> = {
  default: "0%",
  "01": "25%",
  "02": "50%",
  "03": "75%",
  "04": "100%",
};

const railLabels: Record<string, string> = {
  "01": "Our Partners",
  "02": "Work",
  "03": "The Agency",
  "04": "Work With Us",
};

export default function Home() {
  const [active, setActive] = useState<Slide>(null);

  const progressWidth = active ? progressWidths[active] : progressWidths.default;

  const toggle = (id: Slide) => setActive((prev) => (prev === id ? null : id));

  return (
    <main className="exp-shell">
      <section className="hero-panel" id="top">
        <div className="hero-backdrop" aria-hidden="true">
          <div className="hero-glow hero-glow-left" />
          <div className="hero-glow hero-glow-right" />
          <div className="hero-grid" />
        </div>

        <header className="topbar">
          <span className="topbar-link topbar-meta">Kigali, Rwanda</span>
          <a className="topbar-link" href="https://instagram.com" target="_blank" rel="noopener noreferrer">
            Instagram ↗
          </a>
          <button className="brand-mark exp-btn" onClick={() => setActive(null)} aria-label="EXP.RW home">
            <Image src="/exp-mark.svg" alt="" width={52} height={22} priority />
          </button>
          <a className="topbar-link" href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
            LinkedIn ↗
          </a>
          <KigaliClock />
        </header>

        {/* Side meta — visible only on default */}
        {!active && (
          <>
            <div className="hero-meta hero-meta-left">
              <span className="eyebrow">Based in Kigali</span>
              <p className="meta-copy">
                Marketing, events, PR, and brand systems built for memorable moments.
              </p>
            </div>
            <div className="hero-meta hero-meta-right">
              <span className="eyebrow">Scroll</span>
              <p className="meta-copy">Short copy. Sharp visuals. Real impact.</p>
            </div>
          </>
        )}

        {/* Sliding content area */}
        <div className="hero-copy exp-slide" key={active ?? "default"}>
          {/* Default */}
          {!active && (
            <>
              <p className="hero-kicker">Experience Rwanda</p>
              <h1 className="hero-title">EXP.RW</h1>
              <p className="hero-summary">
                We shape attention for brands, launches, and events that need to be seen clearly.
              </p>
              <div className="hero-actions">
                <button className="primary-action exp-btn" onClick={() => toggle("04")}>
                  Work With Us
                </button>
                <button className="secondary-action exp-btn" onClick={() => toggle("03")}>
                  The Agency
                </button>
              </div>
            </>
          )}

          {/* 01 — Our Partners */}
          {active === "01" && (
            <div className="exp-slide-content">
              <div className="section-heading">
                <span className="section-index">(01)</span>
                <h2>Brands that trust us with their moment.</h2>
              </div>
              <div className="service-grid">
                {partners.map((p) => (
                  <article className="service-card exp-card" key={p.name}>
                    <p className="service-title">{p.name}</p>
                    <p className="service-text">{p.type}</p>
                  </article>
                ))}
              </div>
            </div>
          )}

          {/* 02 — Featured Work */}
          {active === "02" && (
            <div className="exp-slide-content">
              <div className="section-heading">
                <span className="section-index">(02)</span>
                <h2>Featured work, framed simply.</h2>
              </div>
              <div className="feature-layout">
                <div className="feature-list">
                  {featuredWork.map((item, i) => (
                    <div className="feature-row" key={item}>
                      <span>{String(i + 1).padStart(2, "0")}</span>
                      <p>{item}</p>
                    </div>
                  ))}
                </div>
                <div className="feature-panel">
                  {highlights.map((item) => (
                    <article className="highlight-card exp-card" key={item.title}>
                      <p className="highlight-title">{item.title}</p>
                      <p className="highlight-text">{item.text}</p>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 03 — The Agency */}
          {active === "03" && (
            <div className="exp-slide-content">
              <div className="section-heading">
                <span className="section-index">(03)</span>
                <h2>The Agency</h2>
              </div>
              <p className="about-copy">
                EXP.RW is a Kigali-based agency built for brands that need to be seen clearly.
                We handle the full surface — marketing, events, PR, and brand identity — so
                founders can focus on building while we shape how the world receives them.
              </p>
            </div>
          )}

          {/* 04 — Work With Us */}
          {active === "04" && (
            <div className="exp-slide-content">
              <div className="section-heading">
                <span className="section-index">(04)</span>
                <h2>Let&apos;s make the next moment count.</h2>
              </div>
              <div className="contact-panel exp-card">
                <p>For campaigns, launches, partnerships, and event production.</p>
                <a className="contact-link" href="mailto:hello@exp.rw">hello@exp.rw</a>
              </div>
            </div>
          )}
        </div>

        <div className="hero-year">2026</div>

        {/* Bottom rail */}
        <div className="bottom-rail">
          <div className="progress-line" aria-hidden="true">
            <span style={{ width: progressWidth, transition: "width 450ms cubic-bezier(0.16,1,0.3,1)" }} />
          </div>
          <div className="bottom-rail-copy">
            <button
              className="exp-btn exp-rail-home"
              onClick={() => setActive(null)}
              aria-label="Back to home"
            >
              EXP.RW
            </button>
            {(["01", "02", "03", "04"] as Slide[]).map((id) => (
              <button
                key={id}
                onClick={() => toggle(id)}
                className={`exp-rail-btn${active === id ? " exp-rail-btn--active" : ""}`}
              >
                <span className="exp-rail-num">{id}</span>
                <span className="exp-rail-label">{railLabels[id!]}</span>
              </button>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
