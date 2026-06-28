import { notFound } from "next/navigation";
import Link from "next/link";
import MutaraCapitalNav from "../../components/MutaraCapitalNav";

const SECTORS: Record<string, {
  meta: string;
  headline: string;
  lead: string;
  focus: { title: string; body: string }[];
  what: { title: string; body: string }[];
}> = {
  "manufacturing-operations": {
    meta: "Manufacturing & Operations — Syncabi",
    headline: "Where things are made and moved.",
    lead: "Syncabi helps manufacturing businesses run clean operations and prove what they produce.",
    focus: [
      { title: "Agri-processing",          body: "Dairy, grains, coffee, horticulture." },
      { title: "Light manufacturing",       body: "Textiles, packaging, assembly." },
      { title: "Logistics & supply chain",  body: "Cold chain, distribution, warehousing." },
      { title: "Building materials",        body: "Tiles, precast, roofing, steel." },
    ],
    what: [
      { title: "Track every input and output.",   body: "Manufacturing runs on precision. Syncabi records every process so nothing slips through." },
      { title: "Build the financial paper trail.", body: "Clean books, tax compliance, and audit-ready reporting — built into how you operate." },
      { title: "Become investment-ready.",        body: "When your operations are documented and your financials are clear, capital has somewhere to go." },
    ],
  },
  "services-consumer-brands": {
    meta: "Services & Consumer Brands — Syncabi",
    headline: "Where Rwanda's consumers spend.",
    lead: "From retail to hospitality, Syncabi helps service businesses standardize operations and prove their financials. Our flagship: Butik — the rebirth of commerce in Africa.",
    focus: [
      { title: "Butik (Flagship)",          body: "AI-powered commerce platform for African retail and boutiques." },
      { title: "Hospitality & F&B",        body: "Hotels, restaurants, catering." },
      { title: "Retail & consumer goods",  body: "FMCG, fashion, home goods." },
      { title: "Professional services",    body: "Legal, accounting, consulting." },
    ],
    what: [
      { title: "Close the gaps service businesses leave.", body: "Fast-moving operations create blind spots. Syncabi standardizes how you run so every transaction is recorded." },
      { title: "Prove your financials.",                   body: "Reporting, compliance, and the audit trail that lenders and partners require — in one place." },
      { title: "Build toward investment.",                 body: "A service business that can show its track record is one worth backing." },
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(SECTORS).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sector = SECTORS[slug];
  return { title: sector?.meta ?? "Sector — Syncabi" };
}

export default async function SectorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sector = SECTORS[slug];
  if (!sector) notFound();

  const tabs = [
    { label: "Manufacturing & Operations",  href: "/ventures/manufacturing-operations",  active: slug === "manufacturing-operations" },
    { label: "Services & Consumer Brands", href: "/ventures/services-consumer-brands", active: slug === "services-consumer-brands" },
  ];

  return (
    <>
      <MutaraCapitalNav activePanel="ventures" />

      <main>
        {/* ── Hero — full screen, terracotta ── */}
        <section className="sv__hero">
          {/* Centered tab switcher */}
          <div className="sv__tabs">
            {tabs.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                className={`sv__tab${t.active ? " sv__tab--active" : ""}`}
              >
                {t.label}
              </Link>
            ))}
          </div>

          <div className="container">
            <div className="sv__hero-body">
              <p className="sv__eyebrow">Sector</p>
              <h1 className="sv__headline">{sector.headline}</h1>
              <p className="sv__lead">{sector.lead}</p>
              <Link href="/contact" className="pill-btn pill-btn--outline-light">Speak to us</Link>
            </div>
          </div>
        </section>

        {/* ── Focus areas — full screen ── */}
        <section className="sv__focus">
          <div className="container">
            <p className="sv__section-label">Businesses we work with</p>
            <div className="sv__focus-grid">
              {sector.focus.map((f) => (
                <div key={f.title} className="sv__focus-card">
                  <div className="sv__focus-title">{f.title}</div>
                  <div className="sv__focus-body">{f.body}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── What Syncabi does — full screen ── */}
        <section className="sv__what">
          <div className="container">
            <p className="sv__section-label">What Syncabi does</p>
            <div className="sv__what-list">
              {sector.what.map((w, i) => (
                <div key={w.title} className="sv__what-item">
                  <span className="sv__what-num">0{i + 1}</span>
                  <div>
                    <div className="sv__what-title">{w.title}</div>
                    <p className="sv__what-body">{w.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Butik flagship (services page only) ── */}
        {slug === "services-consumer-brands" && (
          <section className="sv__flagship">
            <div className="container">
              <div className="sv__flagship-inner">
                <div className="sv__flagship-img-wrap">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/butik/hero.png" alt="Butik commerce platform" className="sv__flagship-img" />
                </div>
                <div className="sv__flagship-content">
                  <p className="sv__section-label">Flagship project</p>
                  <h2 className="sv__flagship-title">Butik</h2>
                  <p className="sv__flagship-tagline">The Rebirth of Commerce in Africa</p>
                  <p className="sv__flagship-body">
                    AI-powered commerce for African retail. Multi-channel sales,
                    intelligent search, inventory operations, and merchant credit
                    — all on one platform.
                  </p>
                  <Link href="/business/butik" className="pill-btn pill-btn--solid">Explore Butik</Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── Brands in our portfolio (services page only) ── */}
        {slug === "services-consumer-brands" && (
          <section className="sv__portfolio">
            <div className="container">
              <p className="sv__section-label">Brands in our portfolio</p>
              <div className="sv__portfolio-grid">
                <Link href="/ventures/brands/butik" className="sv__portfolio-card">
                  <div className="sv__portfolio-img" style={{ background: "#1a1a2e" }}>
                    <span className="sv__portfolio-logo">Butik</span>
                  </div>
                  <div className="sv__portfolio-info">
                    <h3 className="sv__portfolio-name">Butik</h3>
                    <p className="sv__portfolio-desc">AI-powered commerce platform for African retail and boutiques.</p>
                  </div>
                </Link>
                <Link href="/ventures/brands/everyday-joe" className="sv__portfolio-card">
                  <div className="sv__portfolio-img" style={{ background: "#2d4a3e" }}>
                    <span className="sv__portfolio-logo">Everyday Joe</span>
                  </div>
                  <div className="sv__portfolio-info">
                    <h3 className="sv__portfolio-name">Everyday Joe</h3>
                    <p className="sv__portfolio-desc">Specialty coffee roastery bringing Rwanda&apos;s finest beans to everyday rituals.</p>
                  </div>
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* ── CTA ── */}
        <section className="sv__cta">
          <div className="container">
            <h2 className="sv__cta-headline">Start with how you operate.</h2>
            <div className="sv__cta-actions">
              <Link href="/contact"  className="pill-btn pill-btn--solid">Speak to us</Link>
              <Link href="/login"    className="pill-btn pill-btn--outline">Try Syncabi</Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container">
          <div className="footer__inner">
            <div className="footer__brand">
              <div className="footer__logo">Syncabi</div>
              <p className="footer__tagline">
                Helping Rwandan businesses build the operations and financial proof that makes them worth investing in.
              </p>
            </div>
            <div className="footer__links">
              <div>
                <div className="footer__col-title">Product</div>
                <ul className="footer__col-list">
                  <li><Link href="/ventures/manufacturing-operations">Mfg &amp; Operations</Link></li>
                  <li><Link href="/ventures/services-consumer-brands">Services &amp; Brands</Link></li>
                  <li><Link href="/business/butik">Butik</Link></li>
                  <li><Link href="/business/noetic-credit-line">Line of Credit</Link></li>
                </ul>
              </div>
              <div>
                <div className="footer__col-title">Company</div>
                <ul className="footer__col-list">
                  <li><Link href="/about">About</Link></li>
                  <li><Link href="/case-studies">Case Studies</Link></li>
                  <li><a href="#">Careers</a></li>
                  <li><Link href="/contact">Contact</Link></li>
                </ul>
              </div>
              <div>
                <div className="footer__col-title">Support</div>
                <ul className="footer__col-list">
                  <li><a href="#">Help centre</a></li>
                  <li><a href="#">Legal &amp; terms</a></li>
                  <li><a href="#">Privacy</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="footer__bottom">
            <span>&copy; 2026 Syncabi. All rights reserved.</span>
            <div className="footer__bottom-links">
              <a href="#">Terms</a>
              <a href="#">Privacy</a>
              <a href="#">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
