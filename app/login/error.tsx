"use client";

import Link from "next/link";

export default function LoginError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main
      style={{
        minHeight: "80vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "0 24px",
        fontFamily: "var(--font-space-grotesk), sans-serif",
      }}
    >
      <h2
        style={{
          fontSize: "20px",
          fontWeight: 600,
          color: "var(--ink, #1a1a1a)",
          marginBottom: "8px",
        }}
      >
        Sign-in failed
      </h2>
      <p
        style={{
          fontSize: "15px",
          color: "var(--ink-55, #767676)",
          maxWidth: "340px",
          marginBottom: "28px",
          lineHeight: 1.6,
        }}
      >
        Something went wrong while signing in. Please try again or go back to
        the homepage.
      </p>
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
        <button onClick={reset} className="pill-btn pill-btn--solid">
          Try again
        </button>
        <Link href="/" className="pill-btn pill-btn--outline">
          Go home
        </Link>
      </div>
    </main>
  );
}
