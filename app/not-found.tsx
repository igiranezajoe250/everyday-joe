import Link from "next/link";
import MutaraCapitalNav from "./components/MutaraCapitalNav";

export const metadata = {
  title: "Page not found — Syncabi",
};

export default function NotFound() {
  return (
    <>
      <MutaraCapitalNav />
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
        <div
          style={{
            fontSize: "clamp(72px, 12vw, 120px)",
            fontWeight: 700,
            lineHeight: 1,
            color: "var(--ink-06, #f4f0ed)",
            letterSpacing: "-4px",
          }}
        >
          404
        </div>
        <h1
          style={{
            fontSize: "clamp(20px, 3vw, 28px)",
            fontWeight: 600,
            marginTop: "16px",
            marginBottom: "8px",
            color: "var(--ink, #1a1a1a)",
          }}
        >
          Page not found
        </h1>
        <p
          style={{
            fontSize: "16px",
            color: "var(--ink-55, #767676)",
            maxWidth: "380px",
            marginBottom: "32px",
            lineHeight: 1.6,
          }}
        >
          The page you are looking for does not exist or has been moved.
        </p>
        <Link href="/" className="pill-btn pill-btn--solid">
          Back to home
        </Link>
      </main>
    </>
  );
}
