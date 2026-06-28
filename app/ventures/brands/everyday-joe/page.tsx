import Link from "next/link";
import MutaraCapitalNav from "../../../components/MutaraCapitalNav";

export const metadata = {
  title: "Everyday Joe — Rwanda's Finest, Every Morning",
};

export default function EverydayJoeBrandPage() {
  return (
    <>
      <MutaraCapitalNav activePanel="ventures" />

      <main className="bl">
        {/* ── Hero: split layout ── */}
        <section className="bl__hero">
          <div className="bl__hero-art" style={{ background: "#2d4a3e" }}>
            <div className="bl__hero-art-placeholder">
              <span className="bl__art-glyph">EJ</span>
            </div>
          </div>

          <div className="bl__hero-content">
            <nav className="bl__hero-nav">
              <Link href="/ventures/services-consumer-brands" className="bl__back">
                &larr; Portfolio
              </Link>
              <span className="bl__brand-wordmark">Everyday Joe</span>
            </nav>

            <div className="bl__hero-body">
              <p className="bl__category">Consumer Brand</p>
              <h1 className="bl__title">
                Rwanda&apos;s Finest Beans, Brewed for Every Morning
              </h1>
              <p className="bl__excerpt">
                Everyday Joe is a specialty coffee roastery that brings the best of
                Rwandan single-origin coffee to daily rituals. From farm-gate
                sourcing in the hills of Nyamasheke to precision roasting in Kigali,
                every batch is crafted to prove that world-class coffee doesn&apos;t need
                to leave Rwanda to be valued.
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
            <h2 className="bl__section-title">Why Everyday Joe exists</h2>
            <p>
              Rwanda produces some of the world&apos;s most prized specialty coffee, yet
              the domestic market barely experiences it. Most high-grade beans are
              exported, leaving Rwandans with commodity-grade product. Meanwhile,
              a new generation of Kigali&apos;s professionals want better coffee —
              they just don&apos;t have local options that match the quality going abroad.
            </p>
            <p>
              Everyday Joe was created to serve that gap: premium Rwandan coffee,
              roasted locally, priced for daily consumption. Not a luxury brand —
              a daily ritual.
            </p>

            <h2 className="bl__section-title">What it does</h2>
            <ul className="bl__feature-list">
              <li>
                <strong>Farm-gate sourcing</strong> — direct relationships with
                washing stations across Rwanda&apos;s top-producing regions.
              </li>
              <li>
                <strong>Precision roasting</strong> — small-batch roasting in
                Kigali, profiled for the local palate and brewing methods.
              </li>
              <li>
                <strong>Subscription & retail</strong> — weekly delivery to homes
                and offices, plus partnerships with cafes and hotels.
              </li>
              <li>
                <strong>Traceable supply chain</strong> — every bag carries its
                origin story, powered by Syncabi&apos;s operations layer.
              </li>
            </ul>

            <h2 className="bl__section-title">The opportunity</h2>
            <p>
              Rwanda&apos;s domestic coffee consumption is growing as urbanization
              accelerates and taste evolves. Everyday Joe is positioned at the
              intersection of agriculture, consumer brand, and supply chain
              innovation — exactly the kind of business Crowned Crane Ventures
              was built to grow.
            </p>

            <div className="bl__cta-block">
              <Link href="/contact" className="pill-btn pill-btn--solid">
                Partner with us
              </Link>
              <Link href="/ventures/services-consumer-brands" className="pill-btn pill-btn--outline">
                Back to portfolio
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
