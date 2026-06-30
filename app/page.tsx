"use client";

import { useEffect, useState } from "react";
import "./ingoga.css";

const focusAreas = [
  { number: "01", title: "Human Systems", copy: "We study where people and communities are most vulnerable across health, care, access, work, and public services—then define the gaps that demand precise intervention.", tag: "SOCIAL IMPACT", icon: "◎" },
  { number: "02", title: "Intelligent Technology", copy: "We combine responsible AI, sensing, data, and emerging interfaces to understand complex needs and design solutions around African realities, languages, and institutions.", tag: "APPLIED AI", icon: "✳" },
  { number: "03", title: "Climate + Resilience", copy: "We identify environmental and infrastructure risks across food, cities, production, and mobility, then build systems that help society anticipate, adapt, and recover.", tag: "CLIMATE TECH", icon: "◌" },
];

const projects = [
  { id: "A", label: "PRECISION MEDICINE", title: "Care designed around the person", copy: "Exploring data, diagnostics, and locally grounded health intelligence to identify vulnerable populations earlier and support more precise prevention, treatment, and care pathways.", metric: "HEALTH RESEARCH", tone: "blue" },
  { id: "B", label: "AGRICULTURAL SYSTEMS", title: "Food systems that can see risk coming", copy: "Connecting climate signals, soil and crop data, farmer knowledge, and supply-chain visibility to expose vulnerabilities and guide precise action from field to market.", metric: "FOOD + CLIMATE", tone: "black" },
  { id: "C", label: "MANUFACTURING SYSTEMS", title: "Stronger production through better signals", copy: "Studying material, energy, workforce, and process gaps to design intelligent production systems that reduce waste, strengthen quality, and improve local resilience.", metric: "INDUSTRIAL R+D", tone: "copper", href: "/legacy/Everyday.html", external: true },
  { id: "D", label: "MOBILITY SYSTEMS", title: "Movement shaped around real needs", copy: "Using spatial intelligence and lived travel patterns to reveal where access breaks down and design safer, cleaner, and more inclusive mobility for people and goods.", metric: "ACCESS + CITIES", tone: "paper" },
];

const faqs = [
  ["What is Ingoga Labs?", "Ingoga Labs is an independent research and development lab in Kigali. We investigate difficult social and technological questions, prototype possible futures, and help partners move useful ideas into the world."],
  ["Who do you work with?", "We collaborate with public institutions, foundations, universities, companies, and communities that want to tackle meaningful problems with evidence and imagination."],
  ["Do you fund research?", "We currently develop research through partnerships and commissioned programs. We are also building an open fellowship model for emerging researchers and technologists."],
  ["Can Ingoga Labs build a prototype with us?", "Yes. Our work spans discovery research, strategy, data and AI experiments, service design, and functional product prototypes."],
  ["Where are you based?", "Our home is Kigali, Rwanda. Our work is rooted here and designed to travel across Africa and beyond."],
];

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [loaderMounted, setLoaderMounted] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => setLoaded(true), reduceMotion ? 50 : 1450);
    const revealItems = document.querySelectorAll<HTMLElement>("[data-il-reveal]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("il-inview");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" },
    );
    revealItems.forEach((item) => observer.observe(item));

    const hero = document.querySelector<HTMLElement>(".il-hero");
    const heroImage = document.querySelector<HTMLElement>(".il-hero-image");
    let frame = 0;
    const updateDepth = () => {
      frame = 0;
      if (!hero || !heroImage || reduceMotion) return;
      const progress = Math.min(1, Math.max(0, window.scrollY / Math.max(hero.offsetHeight, 1)));
      hero.style.setProperty("--il-hero-scroll", progress.toFixed(3));
      heroImage.style.transform = `translate3d(0, ${progress * 52}px, 0) scale(${1.04 + progress * 0.035})`;
    };
    const onDepthScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(updateDepth);
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!hero || reduceMotion) return;
      const rect = hero.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
      hero.style.setProperty("--il-pointer-x", x.toFixed(3));
      hero.style.setProperty("--il-pointer-y", y.toFixed(3));
    };
    window.addEventListener("scroll", onDepthScroll, { passive: true });
    hero?.addEventListener("pointermove", onPointerMove, { passive: true });
    updateDepth();

    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
      window.removeEventListener("scroll", onDepthScroll);
      hero?.removeEventListener("pointermove", onPointerMove);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  // Once the loader has faded out, drop it from the DOM so its infinite
  // tetromino animations stop running behind the loaded page.
  useEffect(() => {
    if (!loaded) return;
    const timer = window.setTimeout(() => setLoaderMounted(false), 650);
    return () => window.clearTimeout(timer);
  }, [loaded]);

  return (
    <main className={`il-site ${loaded ? "il-loaded" : "il-loading"}`}>
      {loaderMounted && (
        <div className="il-loader" aria-hidden={loaded}>
          <div className="tetrominos">
            <div className="tetromino box1" />
            <div className="tetromino box2" />
            <div className="tetromino box3" />
            <div className="tetromino box4" />
          </div>
          <p>Building practical futures</p>
          <span>KIGALI / RWANDA</span>
        </div>
      )}
      <nav className={`il-nav ${scrolled ? "is-scrolled" : ""}`}>
        <a className="il-brand" href="#top" aria-label="Ingoga Labs home">
          <span className="il-mark" aria-hidden="true"><i /><i /><i /><i /><i /><i /></span>
          <span>INGOGA<br />LABS</span>
        </a>
        <div className="il-nav-links"><a href="#about">ABOUT</a><a href="#research">RESEARCH</a><a href="#work">PROGRAMS</a></div>
        <div className="il-nav-right">
          <a className="il-nav-contact" href="#contact">START A CONVERSATION ↗</a>
          <button
            className={`il-nav-burger ${menuOpen ? "is-open" : ""}`}
            onClick={() => setMenuOpen(o => !o)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      <div className={`il-mobile-menu ${menuOpen ? "is-open" : ""}`} aria-hidden={!menuOpen}>
        <nav className="il-mobile-menu__nav">
          <a href="#about"    onClick={() => setMenuOpen(false)}>ABOUT</a>
          <a href="#research" onClick={() => setMenuOpen(false)}>RESEARCH</a>
          <a href="#contact"  onClick={() => setMenuOpen(false)}>CONTACT</a>
          <a href="#work"     onClick={() => setMenuOpen(false)}>PROGRAMS</a>
        </nav>
        <div className="il-mobile-menu__foot">
          <a href="mailto:hello@ingogalabs.com">hello@ingogalabs.com</a>
          <span>KIGALI, RWANDA · 2026</span>
        </div>
      </div>

      <section className="il-hero" id="top">
        <img className="il-hero-image" src="/images/ingoga/hero-research-plate-v2.png" alt="Illustrated Rwandan researcher studying connected human, terrestrial, and orbital systems" />
        <div className="il-hero-copy">
          <p>Independent research &amp; development lab</p>
          <h1><span>IMAGINE</span><span>WHAT&apos;S <em>NEXT</em></span></h1>
        </div>
        <p className="il-hero-intro">We investigate complex problems and build<br />practical futures from Kigali, Rwanda.</p>
        <a className="il-scroll-cue" href="#about" aria-label="Scroll to discover"><span>SCROLL TO DISCOVER</span><b>↓</b></a>
      </section>

      <section className="il-statement" id="about" data-il-reveal>
        <div className="il-orbit" aria-hidden="true"><span>IL</span></div>
        <p className="il-kicker">WHY WE EXIST / 001</p>
        <h2>FIND THE GAP.<span>DESIGN PRECISELY.</span></h2>
        <div className="il-statement-foot">
          <p>We study where society is most vulnerable—across health, food, production, mobility, climate, and access—so the real need becomes visible.</p>
          <p>Then we combine <strong>human insight, science, and technology</strong> to design precise solutions for those gaps rather than generic answers.</p>
        </div>
      </section>

      <section className="il-focus" id="research">
        <header className="il-section-head" data-il-reveal><p>RESEARCH DOMAINS / 002</p><h2>WHERE WE<br />FOCUS</h2><span>Three connected fields.<br />One shared future.</span></header>
        <div className="il-focus-grid">
          {focusAreas.map((area, index) => (
            <article className="il-focus-card" key={area.number} data-il-reveal style={{ "--il-delay": `${index * 110}ms` } as React.CSSProperties}>
              <div className="il-card-top"><span>{area.number}</span><b>{area.icon}</b></div>
              <div><p>{area.tag}</p><h3>{area.title}</h3><div className="il-card-line" /><p className="il-card-copy">{area.copy}</p></div>
            </article>
          ))}
        </div>
      </section>

      <section className="il-method">
        <div className="il-method-sticky" data-il-reveal><p>OUR METHOD / 003</p><h2>FROM<br />QUESTION<br />TO <i>CHANGE.</i></h2></div>
        <ol className="il-method-list">
          <li data-il-reveal><span>01</span><div><b>LISTEN</b><p>Start close to people and context. Find the question beneath the question.</p></div></li>
          <li data-il-reveal><span>02</span><div><b>INVESTIGATE</b><p>Combine field research, data, systems thinking, and technical exploration.</p></div></li>
          <li data-il-reveal><span>03</span><div><b>MAKE</b><p>Turn knowledge into experiments, tools, services, and tangible prototypes.</p></div></li>
          <li data-il-reveal><span>04</span><div><b>LEARN IN PUBLIC</b><p>Measure honestly, share what works, and let the evidence shape what comes next.</p></div></li>
        </ol>
      </section>

      <section className="il-work" id="work">
        <header className="il-section-head il-section-head-light" data-il-reveal><p>RESEARCH PROGRAMS / 004</p><h2>SYSTEMS FOR<br />REAL NEEDS</h2><span>Identify vulnerability.<br />Design a precise response.</span></header>
        <div className="il-projects">
          {projects.map((project, index) => (
            <article className={`il-project il-project-${project.tone}`} key={project.id} data-il-reveal style={{ "--il-delay": `${index * 120}ms` } as React.CSSProperties}>
              <div className="il-project-meta"><span>[{project.id}]</span><span>{project.label}</span></div>
              <div className="il-project-visual" aria-hidden="true"><div className="il-radar"><i /><i /><i /></div><span>{project.metric}</span></div>
              <h3>{project.title}</h3><p>{project.copy}</p><a href={"href" in project ? project.href : "#contact"} {...("external" in project && project.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>VIEW EXPLORATION <b>↗</b></a>
            </article>
          ))}
        </div>
      </section>

      <section className="il-collab" data-il-reveal>
        <div className="il-collab-wheel" aria-hidden="true"><span>RESEARCH • PROTOTYPE • LEARN • BUILD • </span></div>
        <div><p>COLLABORATE / 005</p><h2>BRING US THE<br /><i>HARD QUESTION.</i></h2></div>
        <p className="il-collab-copy">We partner with ambitious institutions, communities, and teams who believe the future can be intentionally designed.</p>
        <a href="mailto:hello@ingogalabs.com">WORK WITH US ↗</a>
      </section>

      <section className="il-faq">
        <header data-il-reveal><p>COMMON QUESTIONS / 006</p><h2>BEFORE<br />YOU ASK</h2></header>
        <div className="il-faq-list">
          {faqs.map(([question, answer], index) => (
            <details key={question} data-il-reveal style={{ "--il-delay": `${index * 70}ms` } as React.CSSProperties}><summary><span>{question}</span><b>({index + 1}) +</b></summary><p>{answer}</p></details>
          ))}
        </div>
      </section>

      <footer className="il-footer" id="contact">
        <div className="il-footer-top"><p>THE NEXT DISCOVERY<br />COULD START HERE.</p><a href="mailto:hello@ingogalabs.com">HELLO@INGOGALABS.COM ↗</a></div>
        <div className="il-footer-word"><span>INGOGA</span><div className="il-footer-symbol">✳</div></div>
        <a className="il-footer-kootana" href="https://syncabi.com/kootana">Ingoga Labs is a <strong>Kootana Ventures</strong> company ↗</a>
        <div className="il-footer-bottom">
          <div><span>BASED IN</span><p>Kigali, Rwanda<br />East Africa</p></div>
          <div><span>EXPLORE</span><a href="#about">About</a><a href="#research">Research</a><a href="/aptitude">Aptitude</a></div>
          <div><span>CONNECT</span><a href="mailto:hello@ingogalabs.com">Email</a><a href="#top">LinkedIn ↗</a><a href="#top">Instagram ↗</a></div>
          <div className="il-copyright"><span>INGOGA LABS</span><p>© 2026. Curiosity, applied.</p></div>
        </div>
      </footer>
    </main>
  );
}
