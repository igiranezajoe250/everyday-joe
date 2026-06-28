"use client";

import Link from "next/link";

interface PageShellProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export default function PageShell({ children, title, subtitle }: PageShellProps) {
  return (
    <div className="min-h-dvh bg-paper text-ink">
      <header className="fixed top-0 left-0 right-0 z-30 border-b border-ink/[0.04]" style={{ background: "rgba(245,245,240,0.8)", backdropFilter: "blur(20px) saturate(1.2)" }}>
        <div className="flex items-center justify-between max-w-[1440px] mx-auto" style={{ height: "3.5rem", padding: "0 1rem" }}>
          <Link href="/butik" className="flex items-center group">
            <span className="text-[0.82rem] sm:text-[0.88rem] font-semibold tracking-[0.18em] uppercase text-ink" style={{ fontFamily: "var(--font-display)" }}>
              Butik
            </span>
          </Link>
          <div className="text-right">
            <h1 className="text-[0.68rem] sm:text-[0.76rem] font-semibold tracking-[0.16em] uppercase text-ink/70">{title}</h1>
            {subtitle && <p className="text-[0.56rem] sm:text-[0.58rem] text-ink/32 tracking-[0.04em] hidden sm:block" style={{ marginTop: "0.125rem" }}>{subtitle}</p>}
          </div>
        </div>
      </header>

      <main style={{ paddingTop: "3.5rem" }}>
        {children}
      </main>
    </div>
  );
}
