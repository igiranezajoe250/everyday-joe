"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./AngazaCapitalProfile.module.css";

const panels = [
  {
    tab: "Innovation funds",
    eyebrow: "What they do",
    title: "Ecosystem\ncreation",
    body: "Angaza supports innovation ecosystems across Africa and the Middle East through cross-border R&D partnerships, entrepreneurial support, and horizontal thinking that connects founders, governments, and institutions.",
  },
  {
    tab: "Project development",
    eyebrow: "What they do",
    title: "Strategy,\nstructure,\nexecution",
    body: "Their venture support and business development teams connect people and partners, foster growth synergies, and establish long-lasting partnerships while implementing tailor-made strategies, organizational design, and financial structuring.",
  },
  {
    tab: "Funding",
    eyebrow: "What they do",
    title: "Capital for\nambitious\nteams",
    body: "Angaza provides promising ventures with the capital and support required to achieve their vision, expand operations, grow internationally, and become exponential solutions to Africa’s biggest challenges.",
  },
  {
    tab: "Abu Dhabi • Tel Aviv • Kigali",
    eyebrow: "Operating hubs",
    title: "Three cities.\nOne map.",
    body: "Headquartered across Abu Dhabi for capital access and strategic partnerships, Tel Aviv for innovation networks and venture expertise, and Kigali for regional execution, local presence, and ecosystem activation.",
  },
];

export default function AngazaCapitalProfile() {
  const [active, setActive] = useState(0);
  const panel = panels[active];

  return (
    <main className={styles.shell}>
      {/* ── Top rail ── */}
      <header className={styles.rail}>
        <div className={`container ${styles.railInner}`}>
          <span className={styles.railPrompt}>Angaza Capital</span>
          <Link href="/case-studies" className={styles.railLink}>
            Back
          </Link>
        </div>
      </header>

      {/* ── Hero — full viewport ── */}
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroContent} key={active}>
            <div className={styles.eyebrow}>{panel.eyebrow}</div>
            <h1 className={styles.title}>
              {panel.title.split("\n").map((line, i) => (
                <span key={i}>
                  {line}
                  {i < panel.title.split("\n").length - 1 && <br />}
                </span>
              ))}
            </h1>
            <p className={styles.lead}>{panel.body}</p>
          </div>
        </div>
      </section>

      {/* ── Tab strip — full width, edge to edge ── */}
      <nav className={styles.tabStrip}>
        {panels.map((p, i) => (
          <button
            key={p.tab}
            className={`${styles.tab} ${i === active ? styles.tabActive : ""}`}
            onClick={() => setActive(i)}
            type="button"
          >
            {p.tab}
          </button>
        ))}
      </nav>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <div className="container">
          <div className={styles.footerInner}>
            <div>
              <div className={styles.footerBrand}>Angaza Capital</div>
              <p className={styles.footerNote}>
                Part of the Ignite Investments development platform, scaling
                global innovation for Africa and the Middle East&apos;s
                sustainable future.
              </p>
            </div>
            <p className={styles.footerCopy}>&copy; 2023 Ignite Investments</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
