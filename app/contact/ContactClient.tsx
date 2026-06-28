"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

const EMAIL = "hello@syncabi.com";

const STEPS = [
  { id: "name",    question: "What's your name?",                     placeholder: "Your name",          type: "text"  },
  { id: "company", question: "What does your business do?",           placeholder: "Brief description",  type: "text"  },
  { id: "sector",  question: "Which best describes your sector?",     placeholder: "",                   type: "choice",
    choices: ["Manufacturing & Operations", "Services & Consumer Brands", "Something else"] },
  { id: "help",    question: "What do you need help with?",           placeholder: "Tell us briefly",    type: "textarea" },
  { id: "email",   question: "Where can we reach you?",              placeholder: "your@email.com",     type: "email"  },
];

export default function ContactClient() {
  const [phase, setPhase]   = useState<"form" | "submitting" | "done" | "error">("form");
  const [step, setStep]     = useState(0);
  const [values, setValues] = useState<Record<string, string>>({});
  const [errorMsg, setErrorMsg] = useState("");
  const inputRef            = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  const current = STEPS[step];
  const progress = ((step) / STEPS.length) * 100;

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

  const mailtoHref = `mailto:${EMAIL}?subject=Let's build together — Syncabi&body=Hi Syncabi team,`;

  /* ── Done ── */
  if (phase === "done") {
    return (
      <div className="ct__shell">
        <nav className="ct__nav">
          <Link href="/" className="ct__logo">Syncabi</Link>
        </nav>
        <div className="ct__done">
          <div className="ct__done-check">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
          </div>
          <h1 className="ct__done-headline">We&apos;ll be in touch.</h1>
          <p className="ct__done-body">
            Thanks, {values.name}. Someone from our team will reach out to{" "}
            <strong>{values.email}</strong> within 48 hours.
          </p>
          <Link href="/" className="ct__done-link">Back to Syncabi →</Link>
        </div>
      </div>
    );
  }

  /* ── Submitting ── */
  if (phase === "submitting") {
    return (
      <div className="ct__shell">
        <nav className="ct__nav">
          <Link href="/" className="ct__logo">Syncabi</Link>
        </nav>
        <div className="ct__done">
          <h1 className="ct__done-headline">Sending…</h1>
          <p className="ct__done-body">Hang tight, we&apos;re submitting your details.</p>
        </div>
      </div>
    );
  }

  /* ── Error ── */
  if (phase === "error") {
    return (
      <div className="ct__shell">
        <nav className="ct__nav">
          <Link href="/" className="ct__logo">Syncabi</Link>
        </nav>
        <div className="ct__done">
          <h1 className="ct__done-headline">Something went wrong</h1>
          <p className="ct__done-body">{errorMsg}</p>
          <button
            className="ct__btn"
            onClick={() => setPhase("form")}
            style={{ marginTop: 16 }}
          >
            Try again
          </button>
          <div className="ct__email-footer" style={{ marginTop: 24 }}>
            <span>Or email us directly —</span>
            <a href={mailtoHref} className="ct__email-footer-link">{EMAIL}</a>
          </div>
        </div>
      </div>
    );
  }

  /* ── Form ── */
  return (
    <div className="ct__shell">
      <nav className="ct__nav">
        <Link href="/" className="ct__logo">Syncabi</Link>
      </nav>

      {/* Progress bar */}
      <div className="ct__progress">
        <div className="ct__progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="ct__form">
        <div className="ct__step-count">{step + 1} / {STEPS.length}</div>
        <h2 className="ct__question">{current.question}</h2>

        {current.type === "choice" ? (
          <div className="ct__choices">
            {current.choices!.map((c) => (
              <button
                key={c}
                className={`ct__choice${values[current.id] === c ? " ct__choice--selected" : ""}`}
                onClick={() => {
                  const updated = { ...values, [current.id]: c };
                  setValues(updated);
                  setTimeout(() => {
                    if (step + 1 < STEPS.length) {
                      setStep(s => s + 1);
                    } else {
                      void submitForm(updated);
                    }
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
            className="ct__input ct__input--area"
            placeholder={current.placeholder}
            rows={3}
            value={values[current.id] || ""}
            onChange={e => setValues(v => ({ ...v, [current.id]: e.target.value }))}
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            className="ct__input"
            type={current.type}
            placeholder={current.placeholder}
            value={values[current.id] || ""}
            onChange={e => setValues(v => ({ ...v, [current.id]: e.target.value }))}
            onKeyDown={handleKey}
            autoComplete={current.id === "email" ? "email" : "off"}
          />
        )}

        {current.type !== "choice" && (
          <div className="ct__actions">
            <button
              className="ct__btn"
              onClick={advance}
              disabled={!values[current.id]?.trim()}
            >
              {step < STEPS.length - 1 ? "Continue" : "Submit"}
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {current.type !== "choice" && (
              <span className="ct__hint">Press <kbd>Enter ↵</kbd></span>
            )}
          </div>
        )}

        <div className="ct__email-footer">
          <span>Or email us directly —</span>
          <a href={mailtoHref} className="ct__email-footer-link">{EMAIL}</a>
        </div>
      </div>
    </div>
  );
}
