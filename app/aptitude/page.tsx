"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import "./aptitude.css";

const materials = [
  {
    number: "01",
    status: "AVAILABLE NOW",
    format: "BOOK + AUDIO",
    title: "The Bottom Line",
    subtitle: "Building Trusted Systems",
    author: "Sheja Vallière",
    description: "How people, organizations, and nations build the evidence that turns potential into trust.",
    image: "/images/books/the-bottom-line/trust-built-v2.png",
    tone: "rose",
    href: "/books/the-bottom-line",
    action: "BEGIN LEARNING",
  },
  {
    number: "02",
    status: "IN DEVELOPMENT",
    format: "PUBLIC GUIDE",
    title: "Learning to Read Systems",
    subtitle: "A field guide to relationships and change",
    author: "Aptitude Foundation",
    description: "A practical introduction to seeing incentives, evidence, patterns, and the structures beneath everyday outcomes.",
    image: "/images/books/the-bottom-line/rwanda-reliability-v2.png",
    tone: "mint",
    href: null,
    action: "COMING SOON",
  },
  {
    number: "03",
    status: "IN DEVELOPMENT",
    format: "LEARNING SERIES",
    title: "Questions Worth Carrying",
    subtitle: "Curiosity as a public practice",
    author: "Aptitude Foundation",
    description: "Short learning materials designed to help people ask stronger questions and use knowledge with confidence.",
    image: "/images/books/the-bottom-line/authors-note-v2.png",
    tone: "blue",
    href: null,
    action: "COMING SOON",
  },
  {
    number: "04",
    status: "PLANNED",
    format: "PUBLIC TOOLKIT",
    title: "Make the Signal Clear",
    subtitle: "Communicating useful work",
    author: "Aptitude Foundation",
    description: "A toolkit for educators, institutions, and public-interest teams turning important knowledge into information people can use.",
    image: "/images/books/the-bottom-line/systems-that-held-v2.png",
    tone: "yellow",
    href: null,
    action: "COMING SOON",
  },
];

type Panel = "about" | "contact" | null;

export default function AptitudePage() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [panel, setPanel] = useState<Panel>(null);

  const move = (direction: number) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * track.clientWidth * 0.78, behavior: "smooth" });
  };

  return (
    <main className="apt-page">
      <header className="apt-nav">
        <Link href="/" className="apt-wordmark" aria-label="Return to Ingoga Labs">
          <span>APTITUDE</span>
          <small>FOUNDATION</small>
        </Link>
        <nav aria-label="Aptitude Foundation navigation">
          <button onClick={() => setPanel("about")}>ABOUT US</button>
          <button onClick={() => setPanel("contact")}>CONTACT US</button>
        </nav>
      </header>

      <section className="apt-hero">
        <div className="apt-intro">
          <p>PUBLIC EDUCATION + KNOWLEDGE / KIGALI</p>
          <h1>LEARNING<br />MADE <i>PUBLIC.</i></h1>
          <p className="apt-intro__copy">
            Books, guides, and public materials that make useful knowledge clear,
            accessible, and ready to travel.
          </p>
        </div>

        <div className="apt-shelf">
          <div className="apt-shelf__head">
            <div>
              <span>PUBLIC MATERIALS</span>
              <b>{String(materials.length).padStart(2, "0")} ITEMS</b>
            </div>
            <div className="apt-shelf__controls">
              <button onClick={() => move(-1)} aria-label="Previous material">←</button>
              <button onClick={() => move(1)} aria-label="Next material">→</button>
            </div>
          </div>

          <div className="apt-track" ref={trackRef}>
            {materials.map((material) => (
              <article className={`apt-material apt-material--${material.tone}`} key={material.number}>
                <div className="apt-material__art">
                  <img src={material.image} alt="" />
                  <div className="apt-material__index">{material.number}</div>
                </div>
                <div className="apt-material__body">
                  <div className="apt-material__meta">
                    <span>{material.format}</span>
                    <span>{material.status}</span>
                  </div>
                  <div>
                    <p className="apt-material__author">{material.author}</p>
                    <h2>{material.title}</h2>
                    <p className="apt-material__subtitle">{material.subtitle}</p>
                    <p className="apt-material__description">{material.description}</p>
                  </div>
                  {material.href ? (
                    <Link className="apt-material__action" href={material.href}>
                      {material.action}<span>→</span>
                    </Link>
                  ) : (
                    <span className="apt-material__action apt-material__action--disabled">
                      {material.action}<span>·</span>
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>

        <footer className="apt-foot">
          <span>APTITUDE FOUNDATION</span>
          <span>PUBLIC EDUCATION · PUBLIC INFORMATION · PUBLIC POSSIBILITY</span>
          <span>© 2026</span>
        </footer>
      </section>

      {panel && (
        <div className="apt-panel-layer" role="presentation" onClick={() => setPanel(null)}>
          <section
            className="apt-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`apt-${panel}-title`}
            onClick={(event) => event.stopPropagation()}
          >
            <button className="apt-panel__close" onClick={() => setPanel(null)} aria-label="Close">×</button>
            {panel === "about" ? (
              <>
                <p className="apt-panel__eyebrow">ABOUT / APTITUDE FOUNDATION</p>
                <h2 id="apt-about-title">Knowledge becomes valuable when more people can use it.</h2>
                <p>
                  Aptitude Foundation creates public education and information through
                  books, guides, audio, and practical learning materials. We focus on
                  making consequential ideas clear without making them shallow.
                </p>
                <p>
                  Based in Kigali, our work is grounded in African knowledge and designed
                  to travel—to classrooms, institutions, communities, and curious people everywhere.
                </p>
              </>
            ) : (
              <>
                <p className="apt-panel__eyebrow">WORK WITH US</p>
                <h2 id="apt-contact-title">Bring useful knowledge into public life.</h2>
                <p>
                  We work with educators, authors, institutions, and public-interest teams
                  to create books, learning series, public guides, and clear information.
                </p>
                <a className="apt-panel__contact" href="mailto:hello@ingogalabs.com">
                  HELLO@INGOGALABS.COM <span>→</span>
                </a>
              </>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
