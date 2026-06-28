"use client";

import { useState } from "react";
import Link from "next/link";
import "./books.css";

const AUTHORS = [
  {
    id: "sheja-valliere",
    name: "SHEJA\nVALLIÈRE",
    nameShort: "SHEJA",
    role: "AUTHOR · STRATEGIST",
    location: "KIGALI / RWANDA",
    photo: "/images/books/sheja-valliere.png",
    initials: "SV",
    accentA: "#9b4f32",
    accentB: "#a9d9ec",
    books: [
      {
        slug: "/books/the-bottom-line",
        title: "The Bottom Line",
        subtitle: "Building Trusted Systems",
        year: "2026",
        tag: "STRATEGY",
      },
    ],
  },
] as const;

export default function BooksPage() {
  const [activeAuthor, setActiveAuthor] = useState(0);
  const [view, setView] = useState<"author" | "books">("author");

  const author = AUTHORS[activeAuthor];
  const prev = activeAuthor > 0 ? AUTHORS[activeAuthor - 1] : null;
  const next = activeAuthor < AUTHORS.length - 1 ? AUTHORS[activeAuthor + 1] : null;

  return (
    <div className="bl-stage">
      {/* CRT frame */}
      <div className="bl-crt">

        {/* abstract bg decoration */}
        <div
          className="bl-crt__bg"
          style={{ "--bl-accent-a": author.accentA, "--bl-accent-b": author.accentB } as React.CSSProperties}
        >
          <svg viewBox="0 0 800 560" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="bl-crt__svg">
            {/* large soft blobs */}
            <ellipse cx="400" cy="210" rx="360" ry="270" fill={author.accentB} opacity="0.30" />
            <ellipse cx="280" cy="170" rx="240" ry="195" fill={author.accentA} opacity="0.28" />
            <ellipse cx="540" cy="190" rx="200" ry="160" fill={author.accentB} opacity="0.22" />
            <circle cx="140" cy="100" r="90" fill={author.accentA} opacity="0.20" />
            <circle cx="660" cy="130" r="110" fill={author.accentB} opacity="0.18" />
            {/* sharp broken fragments */}
            <polygon points="340,20 430,90 385,170 300,145 278,55" fill={author.accentA} opacity="0.50" />
            <polygon points="455,30 545,65 575,155 495,178 415,108" fill={author.accentB} opacity="0.42" />
            <polygon points="185,65 258,35 305,115 242,162 172,138" fill={author.accentA} opacity="0.38" />
            <polygon points="580,40 650,20 690,90 640,130 570,100" fill={author.accentB} opacity="0.32" />
            <polygon points="100,140 160,110 175,175 115,195" fill={author.accentA} opacity="0.28" />
          </svg>
        </div>

        {/* portrait */}
        <div className="bl-crt__portrait">
          {author.photo ? (
            <img src={author.photo} alt={author.nameShort} className="bl-crt__photo" />
          ) : (
            <div className="bl-crt__initials" style={{ "--bl-accent-a": author.accentA } as React.CSSProperties}>
              {author.initials}
            </div>
          )}
        </div>

        {/* vignette */}
        <div className="bl-crt__vignette" />

        {/* top bar */}
        <div className="bl-crt__topbar">
          <span className="bl-crt__brand">INGOGA / BOOKS</span>
          <span className="bl-crt__meta">{author.location}</span>
        </div>

        {/* side labels */}
        {prev && (
          <button
            className="bl-crt__side bl-crt__side--left"
            onClick={() => { setActiveAuthor(activeAuthor - 1); setView("author"); }}
            aria-label={`Previous author: ${prev.nameShort}`}
          >
            <span>← PREV</span>
          </button>
        )}
        {next && (
          <button
            className="bl-crt__side bl-crt__side--right"
            onClick={() => { setActiveAuthor(activeAuthor + 1); setView("author"); }}
            aria-label={`Next author: ${next.nameShort}`}
          >
            <span>NEXT →</span>
          </button>
        )}

        {/* author count indicator */}
        <div className="bl-crt__counter">
          {String(activeAuthor + 1).padStart(2, "0")} / {String(AUTHORS.length).padStart(2, "0")}
        </div>

        {/* main content: author view */}
        {view === "author" && (
          <div className="bl-crt__author">
            <p className="bl-crt__role">{author.role}</p>
            <h1 className="bl-crt__name">
              {author.name.split("\n").map((line, i) => (
                <span key={i}>{line}</span>
              ))}
            </h1>
            <button
              className="bl-crt__cta"
              onClick={() => setView("books")}
            >
              VIEW BOOKS ↓
            </button>
          </div>
        )}

        {/* books shelf view */}
        {view === "books" && (
          <div className="bl-crt__shelf">
            <button
              className="bl-crt__shelf-back"
              onClick={() => setView("author")}
            >
              ← {author.nameShort}
            </button>
            <div className="bl-crt__shelf-list">
              {author.books.map((book) => (
                <Link
                  key={book.slug}
                  href={book.slug}
                  className="bl-crt__book"
                >
                  <span className="bl-crt__book-tag">{book.tag} · {book.year}</span>
                  <span className="bl-crt__book-title">{book.title}</span>
                  <span className="bl-crt__book-sub">{book.subtitle}</span>
                  <span className="bl-crt__play">
                    <span className="bl-crt__play-btn" aria-hidden="true">
                      <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 2.5L13.5 8 4 13.5V2.5Z" />
                      </svg>
                    </span>
                    <span className="bl-crt__play-label">BEGIN READING</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
