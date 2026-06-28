import Link from "next/link";
import "./ingoga.css";

export const metadata = {
  title: "Page not found — Ingoga Labs",
};

export default function NotFound() {
  return (
    <div className="il-site" style={{ minHeight: "100svh", background: "var(--paper)", display: "flex", flexDirection: "column" }}>
      <nav className="il-nav" style={{ mixBlendMode: "normal", color: "var(--night)", background: "rgba(241,240,233,0.92)", backdropFilter: "blur(10px)", borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
        <Link href="/" className="il-brand" style={{ color: "var(--night, #0d1011)" }}>
          <span className="il-mark" aria-hidden="true" style={{ color: "var(--night, #0d1011)" }}><i /><i /><i /><i /><i /><i /></span>
          <span>INGOGA<br />LABS</span>
        </Link>
        <div />
        <Link href="/#contact" className="il-nav-contact" style={{ color: "var(--night, #0d1011)" }}>START A CONVERSATION ↗</Link>
      </nav>

      <main style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "0 24px",
        fontFamily: "var(--font-space-grotesk), sans-serif",
        color: "var(--night, #0d1011)",
      }}>
        <div style={{
          fontFamily: "var(--font-playfair), Georgia, serif",
          fontSize: "clamp(96px, 16vw, 180px)",
          fontWeight: 700,
          fontStyle: "italic",
          lineHeight: 1,
          color: "rgba(0,0,0,0.08)",
          letterSpacing: "-0.06em",
          marginBottom: 0,
        }}>
          404
        </div>
        <h1 style={{ fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 600, marginTop: 8, marginBottom: 10, letterSpacing: "-0.04em" }}>
          Page not found
        </h1>
        <p style={{ fontSize: 15, color: "#767676", maxWidth: 360, marginBottom: 36, lineHeight: 1.6 }}>
          The page you are looking for does not exist or has been moved.
        </p>
        <Link href="/" style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: ".1em",
          color: "var(--night, #0d1011)",
          textDecoration: "none",
          border: "1px solid rgba(0,0,0,0.2)",
          padding: "13px 28px",
          transition: "border-color .2s ease",
        }}>
          ← BACK TO HOME
        </Link>
      </main>
    </div>
  );
}
