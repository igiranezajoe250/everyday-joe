"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import "../ingoga.css";
import "./contact.css";

const EMAIL = "hello@ingogalabs.com";

const STEPS = [
  { id: "name",    question: "What's your name?",                              placeholder: "Your name",               type: "text"     },
  { id: "org",     question: "What organisation are you from?",                placeholder: "Institution or company",  type: "text"     },
  { id: "topic",   question: "What topic or challenge brings you to us?",      placeholder: "",                        type: "choice",
    choices: ["Health & Precision Medicine", "Agriculture & Food Systems", "Manufacturing & Industry", "Mobility & Cities", "Climate & Resilience", "Something else"] },
  { id: "message", question: "Tell us more about what you have in mind.",      placeholder: "A sentence or two is fine", type: "textarea" },
  { id: "email",   question: "Where can we reach you?",                        placeholder: "your@email.com",           type: "email"    },
];

export default function ContactClient() {
  const [phase, setPhase]     = useState<"form" | "submitting" | "done" | "error">("form");
  const [step, setStep]       = useState(0);
  const [values, setValues]   = useState<Record<string, string>>({});
  const [errorMsg, setErrorMsg] = useState("");
  const inputRef              = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  const current  = STEPS[step];
  const progress = (step / STEPS.length) * 100;

  useEffect(() => {
    if (phase === "form") inputRef.current?.focus();
  }, [step, phase]);

  const submitForm = useCallback(async (data: Record<string, string>) => {
    setPhase("submitting");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Submission failed");
      }
      setPhase("done");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
      setPhase("error");
    }
  }, []);

  function advance() {
    if (!values[current.id]?.trim()) return;
    if (step < STEPS.length - 1) {
      setStep(s => s + 1);
    } else {
      void submitForm(values);
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && current.type !== "textarea") {
      e.preventDefault();
      advance();
    }
  }

  const mailtoHref = `mailto:${EMAIL}?subject=Collaboration Inquiry — Ingoga Labs`;

  const NavBar = () => (
    <nav className="il-ct-nav">
      <Link href="/" className="il-ct-nav__brand">
        <span className="il-mark" aria-hidden="true"><i /><i /><i /><i /><i /><i /></span>
        <span>INGOGA<br />LABS</span>
      </Link>
      <a href={`mailto:${EMAIL}`} className="il-ct-nav__email">{EMAIL}</a>
    </nav>
  );

  if (phase === "done") {
    return (
      <div className="il-ct">
        <NavBar />
        <div className="il-ct__done">
          <div className="il-ct__done-mark">✓</div>
          <h1 className="il-ct__done-headline">We&apos;ll be in touch.</h1>
          <p className="il-ct__done-body">
            Thanks, {values.name}. We&apos;ll reach out to <strong>{values.email}</strong> within 48 hours.
          </p>
          <Link href="/" className="il-ct__done-link">← Back to Ingoga Labs</Link>
        </div>
      </div>
    );
  }

  if (phase === "submitting") {
    return (
      <div className="il-ct">
        <NavBar />
        <div className="il-ct__done">
          <h1 className="il-ct__done-headline">Sending…</h1>
          <p className="il-ct__done-body">Hang tight, we&apos;re submitting your details.</p>
        </div>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="il-ct">
        <NavBar />
        <div className="il-ct__done">
          <h1 className="il-ct__done-headline">Something went wrong</h1>
          <p className="il-ct__done-body">{errorMsg}</p>
          <button className="il-ct__btn" onClick={() => setPhase("form")} style={{ marginTop: 16 }}>
            Try again
          </button>
          <div className="il-ct__email-footer">
            <span>Or email us directly —</span>
            <a href={mailtoHref} className="il-ct__email-link">{EMAIL}</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="il-ct">
      <NavBar />

      <div className="il-ct__progress">
        <div className="il-ct__progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="il-ct__form">
        <div className="il-ct__step-count">{step + 1} / {STEPS.length}</div>
        <h2 className="il-ct__question">{current.question}</h2>

        {current.type === "choice" ? (
          <div className="il-ct__choices">
            {current.choices!.map((c) => (
              <button
                key={c}
                className={`il-ct__choice${values[current.id] === c ? " il-ct__choice--selected" : ""}`}
                onClick={() => {
                  const updated = { ...values, [current.id]: c };
                  setValues(updated);
                  setTimeout(() => {
                    if (step + 1 < STEPS.length) setStep(s => s + 1);
                    else void submitForm(updated);
                  }, 180);
                }}
              >
                {c}
              </button>
            ))}
          </div>
        ) : current.type === "textarea" ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            className="il-ct__input il-ct__input--area"
            placeholder={current.placeholder}
            rows={3}
            value={values[current.id] || ""}
            onChange={e => setValues(v => ({ ...v, [current.id]: e.target.value }))}
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            className="il-ct__input"
            type={current.type}
            placeholder={current.placeholder}
            value={values[current.id] || ""}
            onChange={e => setValues(v => ({ ...v, [current.id]: e.target.value }))}
            onKeyDown={handleKey}
            autoComplete={current.id === "email" ? "email" : "off"}
          />
        )}

        {current.type !== "choice" && (
          <div className="il-ct__actions">
            <button className="il-ct__btn" onClick={advance} disabled={!values[current.id]?.trim()}>
              {step < STEPS.length - 1 ? "Continue" : "Submit"}
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <span className="il-ct__hint">Press <kbd>Enter ↵</kbd></span>
          </div>
        )}

        <div className="il-ct__email-footer">
          <span>Or email us directly —</span>
          <a href={mailtoHref} className="il-ct__email-link">{EMAIL}</a>
        </div>
      </div>
    </div>
  );
}
