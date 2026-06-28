"use client";

import { useState } from "react";
import Link from "next/link";
import "../ingoga.css";
import "./apps.css";

const TOOLS = [
  {
    id: "precision-medicine",
    label: "PRECISION MEDICINE",
    title: "Care designed around the person",
    copy: "Exploring data, diagnostics, and locally grounded health intelligence to identify vulnerable populations earlier and support more precise prevention, treatment, and care pathways.",
    tag: "HEALTH RESEARCH",
    status: "ACTIVE",
    accent: "#a9d9ec",
  },
  {
    id: "agricultural-systems",
    label: "AGRICULTURAL SYSTEMS",
    title: "Food systems that can see risk coming",
    copy: "Connecting climate signals, soil and crop data, farmer knowledge, and supply-chain visibility to expose vulnerabilities and guide precise action from field to market.",
    tag: "FOOD + CLIMATE",
    status: "ACTIVE",
    accent: "#9b4f32",
  },
  {
    id: "manufacturing-systems",
    label: "MANUFACTURING SYSTEMS",
    title: "Stronger production through better signals",
    copy: "Studying material, energy, workforce, and process gaps to design intelligent production systems that reduce waste, strengthen quality, and improve local resilience.",
    tag: "INDUSTRIAL R+D",
    status: "R+D",
    accent: "#f1f0e9",
  },
  {
    id: "mobility-systems",
    label: "MOBILITY SYSTEMS",
    title: "Movement shaped around real needs",
    copy: "Using spatial intelligence and lived travel patterns to reveal where access breaks down and design safer, cleaner, and more inclusive mobility for people and goods.",
    tag: "ACCESS + CITIES",
    status: "R+D",
    accent: "#4a5568",
  },
];

export default function AppsPage() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className="il-apps">
      <nav className="il-apps-nav">
        <Link href="/" className="il-apps-nav__brand">
          <span className="il-mark" aria-hidden="true"><i /><i /><i /><i /><i /><i /></span>
          <span>INGOGA<br />LABS</span>
        </Link>
        <span className="il-apps-nav__title">Research Programs</span>
        <Link href="/#contact" className="il-apps-nav__cta">START A CONVERSATION ↗</Link>
      </nav>

      <header className="il-apps-hero">
        <p className="il-apps-hero__kicker">RESEARCH PROGRAMS / INGOGA LABS</p>
        <h1>Research tools<br />& programs.</h1>
        <p className="il-apps-hero__sub">
          Active and in-development research programs across health, climate,
          production, and mobility. Click any program to explore.
        </p>
      </header>

      <section className="il-apps-grid">
        {TOOLS.map((tool) => (
          <article
            key={tool.id}
            className={`il-app-card ${active === tool.id ? "il-app-card--open" : ""}`}
            onClick={() => setActive(active === tool.id ? null : tool.id)}
            style={{ "--il-app-accent": tool.accent } as React.CSSProperties}
          >
            <div className="il-app-card__top">
              <span className="il-app-card__label">{tool.label}</span>
              <span className={`il-app-card__status il-app-card__status--${tool.status === "ACTIVE" ? "active" : "rd"}`}>
                {tool.status}
              </span>
            </div>
            <h2 className="il-app-card__title">{tool.title}</h2>
            <p className="il-app-card__copy">{tool.copy}</p>
            <div className="il-app-card__foot">
              <span className="il-app-card__tag">{tool.tag}</span>
              <span className="il-app-card__toggle">{active === tool.id ? "CLOSE —" : "EXPLORE +"}</span>
            </div>
            <div className="il-app-card__expand">
              <div className="il-app-card__expand-inner">
                <p>This program is currently {tool.status === "ACTIVE" ? "active and accepting collaboration inquiries" : "in early research and development"}.</p>
                <a href="mailto:hello@ingogalabs.com" className="il-app-card__expand-cta">
                  Collaborate on this program ↗
                </a>
              </div>
            </div>
          </article>
        ))}
      </section>

      <footer className="il-apps-footer">
        <Link href="/" className="il-apps-footer__back">← Back to Ingoga Labs</Link>
        <span>© 2026 Ingoga Labs</span>
      </footer>
    </div>
  );
}
