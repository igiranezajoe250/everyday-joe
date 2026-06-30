"use client";

import Link from "next/link";
import "./books.css";

/* Single author / single book — kept minimal on purpose. */
const AUTHOR = {
  name: ["SHEJA", "VALLIÈRE"],
  nameShort: "SHEJA VALLIÈRE",
  role: "AUTHOR · STRATEGIST",
  location: "KIGALI / RWANDA",
  photo: "/images/books/sheja-valliere-plate-v2.png",
  book: {
    href: "/books/the-bottom-line",
    title: "The Bottom Line",
    subtitle: "Building Trusted Systems",
    year: "2026",
    tag: "STRATEGY",
  },
};

export default function BooksPage() {
  const { book } = AUTHOR;

  return (
    <div className="bl-stage">
      <div className="bl-crt">
        {/* portrait — full bleed, person never cropped */}
        <img src={AUTHOR.photo} alt={AUTHOR.nameShort} className="bl-crt__photo" />

        {/* readability gradient */}
        <div className="bl-crt__scrim" />

        {/* top bar */}
        <div className="bl-crt__topbar">
          <span className="bl-crt__brand">INGOGA / BOOKS</span>
          <span className="bl-crt__meta">{AUTHOR.location}</span>
        </div>

        {/* nameplate + single-step CTA */}
        <div className="bl-crt__author">
          <p className="bl-crt__role">{AUTHOR.role}</p>
          <h1 className="bl-crt__name">
            {AUTHOR.name.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </h1>

          <p className="bl-crt__bookline">
            <span className="bl-crt__book-title">{book.title}</span>
            <span className="bl-crt__book-sub">
              {book.subtitle} · {book.tag} · {book.year}
            </span>
          </p>

          <Link href={book.href} className="bl-crt__cta">
            <span className="bl-crt__cta-icon" aria-hidden="true">
              <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 2.5L13.5 8 4 13.5V2.5Z" />
              </svg>
            </span>
            BEGIN READING
          </Link>
        </div>
      </div>
    </div>
  );
}
