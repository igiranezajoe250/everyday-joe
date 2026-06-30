"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import "../ingoga.css";
import "./about.css";

const PRINCIPLES = [
  {
    num: "01",
    label: "WHY WE EXIST",
    title: "Complex problems rarely yield to narrow solutions.",
    body: "Africa's most pressing challenges — in health, food, climate, and mobility — are systemic. They require patient investigation, not just fast prototypes. We start with curiosity and stay until we understand.",
  },
  {
    num: "02",
    label: "HOW WE WORK",
    title: "Fieldwork and technology must speak to each other.",
    body: "We combine human observation, scientific inquiry, and responsible technology to build a picture complete enough to act on. Every research program begins with listening before it begins with building.",
  },
  {
    num: "03",
    label: "WHAT WE BUILD",
    title: "Knowledge is only finished when it travels.",
    body: "We prototype, test, publish, and partner. Our goal is not papers on a shelf — it is practical change: tools, systems, and services that create real outcomes for real communities.",
  },
];

const DOMAINS = [
  { tag: "HEALTH", title: "Precision Medicine", copy: "Identifying vulnerable populations earlier through data, diagnostics, and locally grounded health intelligence.", color: "blue" },
  { tag: "FOOD + CLIMATE", title: "Agricultural Systems", copy: "Connecting climate signals, soil data, and farmer knowledge to guide precise action from field to market.", color: "copper" },
  { tag: "INDUSTRIAL R+D", title: "Manufacturing Systems", copy: "Designing intelligent production systems that reduce waste and improve local resilience.", color: "night" },
  { tag: "ACCESS + CITIES", title: "Mobility Systems", copy: "Using spatial intelligence to reveal where access breaks down and design safer, more inclusive movement.", color: "paper" },
];

export default function AboutPageClient() {
  const [scrolled, setScrolled] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 80);
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("il-inview"); observer.unobserve(e.target); } }),
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    document.querySelectorAll<HTMLElement>("[data-il-reveal]").forEach(el => observer.observe(el));

    return () => { clearTimeout(t); window.removeEventListener("scroll", onScroll); observer.disconnect(); };
  }, []);

  return (
    <div className={`il-about ${loaded ? "il-ab-loaded" : ""}`}>

      {/* Nav */}
      <nav className={`il-nav ${scrolled ? "is-scrolled" : ""}`} style={{ mixBlendMode: "normal", color: "var(--night, #0d1011)", background: "rgba(241,240,233,0.92)", backdropFilter: "blur(10px)", borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
        <Link href="/" className="il-brand" style={{ color: "var(--night)" }}>
          <span className="il-mark" aria-hidden="true" style={{ color: "var(--night)" }}><i /><i /><i /><i /><i /><i /></span>
          <span>INGOGA<br />LABS</span>
        </Link>
        <div className="il-nav-links" style={{ color: "var(--night)" }}>
          <a href="/#research">RESEARCH</a>
          <a href="/#work">WORK</a>
          <a href="/about">ABOUT</a>
        </div>
        <a className="il-nav-contact" href="/#contact" style={{ color: "var(--night)" }}>START A CONVERSATION ↗</a>
      </nav>

      {/* Hero */}
      <section className="il-ab-hero">
        <p className="il-ab-hero__kicker">ABOUT INGOGA LABS / KIGALI, RWANDA</p>
        <h1 className="il-ab-hero__title">
          <span>CURIOSITY,</span>
          <span><em>APPLIED.</em></span>
        </h1>
        <p className="il-ab-hero__lead">
          We are an independent research and development lab investigating complex problems
          across health, food, climate, and mobility — and building practical futures from Kigali.
        </p>
        <a href="#mission" className="il-ab-hero__scroll">SCROLL TO READ ↓</a>
      </section>

      {/* Mission statement */}
      <section className="il-ab-mission" id="mission" data-il-reveal>
        <div className="il-ab-mission__orbit" aria-hidden="true"><span>IL</span></div>
        <p className="il-kicker">OUR PURPOSE / 001</p>
        <h2 className="il-ab-mission__headline">
          FIND THE GAP.<span>DESIGN PRECISELY.</span>
        </h2>
        <div className="il-ab-mission__body">
          <p>We study where society is most vulnerable — across health, food, production, mobility, climate, and access — so the real need becomes visible.</p>
          <p>Then we combine <strong>human insight, science, and technology</strong> to design precise solutions for those gaps rather than generic answers.</p>
        </div>
      </section>

      {/* Principles */}
      <section className="il-ab-principles" data-il-reveal>
        <header className="il-section-head" data-il-reveal>
          <p>HOW WE THINK / 002</p>
          <h2>OUR<br />APPROACH</h2>
          <span>Three commitments.<br />One direction.</span>
        </header>
        <div className="il-ab-principles__grid">
          {PRINCIPLES.map((p, i) => (
            <article className="il-ab-card" key={p.num} data-il-reveal style={{ "--il-delay": `${i * 100}ms` } as React.CSSProperties}>
              <div className="il-ab-card__top">
                <span className="il-ab-card__num">{p.num}</span>
                <span className="il-ab-card__label">{p.label}</span>
              </div>
              <h3 className="il-ab-card__title">{p.title}</h3>
              <div className="il-card-line" />
              <p className="il-ab-card__body">{p.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Research domains */}
      <section className="il-ab-domains" data-il-reveal>
        <header className="il-section-head il-section-head-light" data-il-reveal>
          <p>RESEARCH DOMAINS / 003</p>
          <h2>WHERE WE<br />FOCUS</h2>
          <span>Four fields.<br />One shared future.</span>
        </header>
        <div className="il-ab-domains__grid">
          {DOMAINS.map((d, i) => (
            <article className={`il-ab-domain il-ab-domain--${d.color}`} key={d.tag} data-il-reveal style={{ "--il-delay": `${i * 80}ms` } as React.CSSProperties}>
              <p className="il-ab-domain__tag">{d.tag}</p>
              <h3 className="il-ab-domain__title">{d.title}</h3>
              <p className="il-ab-domain__copy">{d.copy}</p>
              <Link href="/#work" className="il-ab-domain__link">EXPLORE PROGRAM ↗</Link>
            </article>
          ))}
        </div>
      </section>

      {/* Based in Kigali */}
      <section className="il-ab-place" data-il-reveal>
        <div className="il-ab-place__inner">
          <p className="il-kicker">WHERE WE WORK / 004</p>
          <h2 className="il-ab-place__headline">ROOTED IN<br /><em>KIGALI.</em></h2>
          <p className="il-ab-place__copy">
            Our work starts in Rwanda. The questions we investigate are shaped by African realities —
            local languages, institutions, infrastructure, and opportunity. We design solutions that belong here,
            and are built to travel across the continent and beyond.
          </p>
          <div className="il-ab-place__tags">
            <span>KIGALI, RWANDA</span>
            <span>EAST AFRICA</span>
            <span>FOUNDED 2024</span>
          </div>
        </div>
      </section>

      {/* Kootana */}
      <section className="il-ab-kootana" data-il-reveal>
        <p className="il-kicker">PART OF / 005</p>
        <p className="il-ab-kootana__copy">
          Ingoga Labs is a <strong>Kootana Ventures</strong> company — a family of organisations
          building institutions that serve Rwanda and Africa.
        </p>
        <a href="https://syncabi.com/kootana" className="il-ab-kootana__link">KOOTANA VENTURES ↗</a>
      </section>

      {/* CTA */}
      <section className="il-collab" data-il-reveal>
        <div className="il-collab-wheel" aria-hidden="true"><span>RESEARCH • PROTOTYPE • LEARN • BUILD • </span></div>
        <div><p>WORK WITH US / 006</p><h2>BRING US THE<br /><i>HARD QUESTION.</i></h2></div>
        <p className="il-collab-copy">We partner with ambitious institutions, communities, and teams who believe the future can be intentionally designed.</p>
        <a href="mailto:hello@ingogalabs.com">WORK WITH US ↗</a>
      </section>

      {/* Footer */}
      <footer className="il-footer" id="contact">
        <div className="il-footer-top"><p>THE NEXT DISCOVERY<br />COULD START HERE.</p><a href="mailto:hello@ingogalabs.com">HELLO@INGOGALABS.COM ↗</a></div>
        <div className="il-footer-word"><span>INGOGA</span><div className="il-footer-symbol">✳</div></div>
        <a className="il-footer-kootana" href="https://syncabi.com/kootana">Ingoga Labs is a <strong>Kootana Ventures</strong> company ↗</a>
        <div className="il-footer-bottom">
          <div><span>BASED IN</span><p>Kigali, Rwanda<br />East Africa</p></div>
          <div><span>EXPLORE</span><a href="/#about">About</a><a href="/#research">Research</a><a href="/#work">Work</a></div>
          <div><span>CONNECT</span><a href="mailto:hello@ingogalabs.com">Email</a></div>
          <div className="il-copyright"><span>INGOGA LABS</span><p>© 2026. Curiosity, applied.</p></div>
        </div>
      </footer>
    </div>
  );
}
