import Link from "next/link";
import MutaraCapitalNav from "../../../components/MutaraCapitalNav";

export const metadata = {
  title: "Butik — The Rebirth of Commerce in Africa",
};

export default function ButikBrandPage() {
  return (
    <>
      <MutaraCapitalNav activePanel="ventures" />

      <main className="bl">
        {/* ── Hero: split layout ── */}
        <section className="bl__hero">
          <div className="bl__hero-art" style={{ background: "#1a1a2e" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/butik/hero.png"
              alt="Butik commerce platform"
              className="bl__hero-art-img"
            />
          </div>

          <div className="bl__hero-content">
            <nav className="bl__hero-nav">
              <Link href="/ventures/services-consumer-brands" className="bl__back">
                &larr; Portfolio
              </Link>
              <span className="bl__brand-wordmark">Butik</span>
            </nav>

            <div className="bl__hero-body">
              <p className="bl__category">Commerce</p>
              <h1 className="bl__title">
                The Rebirth of Commerce in Africa
              </h1>
              <p className="bl__excerpt">
                Butik is an AI-powered commerce platform built for African retail.
                Multi-channel sales, intelligent search, inventory operations, and
                merchant credit — all on one platform designed to formalize how
                Africa&apos;s boutiques and retailers do business.
              </p>
              <div className="bl__meta">
                <span className="bl__meta-label">Built by</span>{" "}
                <span className="bl__meta-value">Crowned Crane Ventures</span>
                <br />
                <span className="bl__meta-label">Since</span>{" "}
                <span className="bl__meta-value">2025</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Body content ── */}
        <article className="bl__article">
          <div className="bl__article-inner">
            <h2 className="bl__section-title">Why Butik exists</h2>
            <p>
              Retail across Africa is massive — yet most of it remains informal.
              Boutiques, market vendors, and small retailers operate without digital
              tools for inventory, sales tracking, or customer management. This
              means billions in commerce goes unrecorded, making it nearly impossible
              for these businesses to access credit, attract investment, or scale.
            </p>
            <p>
              Butik was built to close this gap. By giving retailers an AI-powered
              platform that handles everything from product discovery to payments,
              we formalize their operations while keeping the experience intuitive
              and accessible.
            </p>

            <h2 className="bl__section-title">What it does</h2>
            <ul className="bl__feature-list">
              <li>
                <strong>Multi-modal search</strong> — customers find products using
                text, voice, or image search, powered by AI.
              </li>
              <li>
                <strong>Boutique marketplace</strong> — every retailer gets a
                branded storefront within the Butik ecosystem.
              </li>
              <li>
                <strong>Inventory operations</strong> — real-time stock management
                across physical and digital channels.
              </li>
              <li>
                <strong>Merchant credit</strong> — clean transaction history unlocks
                access to working capital through our credit line.
              </li>
            </ul>

            <h2 className="bl__section-title">The opportunity</h2>
            <p>
              Africa&apos;s retail market is projected to reach $2.1 trillion by 2030.
              The platforms that formalize this economy — that give it structure,
              data, and financial infrastructure — will define the next era of
              African commerce. Butik is built to be that platform.
            </p>

            <div className="bl__cta-block">
              <Link href="/business/butik" className="pill-btn pill-btn--solid">
                Explore the platform
              </Link>
              <Link href="/contact" className="pill-btn pill-btn--outline">
                Partner with us
              </Link>
            </div>
          </div>
        </article>
      </main>

      <footer className="footer">
        <div className="container">
          <div className="footer__inner">
            <div className="footer__brand">
              <div className="footer__logo">Syncabi</div>
              <p className="footer__tagline">
                Helping Rwandan businesses build the operations and financial proof
                that makes them worth investing in.
              </p>
            </div>
          </div>
          <div className="footer__bottom">
            <span>&copy; 2026 Syncabi. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </>
  );
}
