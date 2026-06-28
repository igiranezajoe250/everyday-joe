import Link from "next/link";
import MutaraCapitalNav from "../../components/MutaraCapitalNav";

export const metadata = {
  title: "Kigali Coffee Co. - Syncabi",
  description:
    "How Syncabi helped Kigali Coffee Co. scale from a single washing station to a vertically integrated export operation.",
};

export default function KigaliCoffeeCoPage() {
  return (
    <>
      <MutaraCapitalNav />

      <main className="csp">
        {/* ── Hero ── */}
        <section className="csp__hero">
          <div className="container">
            <Link href="/case-studies" className="csp__back">
              &larr; All stories
            </Link>
            <div className="csp__tag">Agriculture</div>
            <h1 className="csp__title">Kigali Coffee Co.</h1>
            <p className="csp__subtitle">
              From a single washing station to a vertically integrated export operation.
            </p>
          </div>
        </section>

        {/* ── Highlights ── */}
        <section className="csp__highlights">
          <div className="container">
            <div className="csp__stats">
              <div className="csp__stat">
                <div className="csp__stat-value">3</div>
                <div className="csp__stat-label">Provinces reached</div>
              </div>
              <div className="csp__stat">
                <div className="csp__stat-value">Vertical</div>
                <div className="csp__stat-label">Integration achieved</div>
              </div>
              <div className="csp__stat">
                <div className="csp__stat-value">Export</div>
                <div className="csp__stat-label">Ready operations</div>
              </div>
              <div className="csp__stat">
                <div className="csp__stat-value">Diaspora</div>
                <div className="csp__stat-label">Investor network</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Story ── */}
        <section className="csp__story">
          <div className="container">
            <div className="csp__story-grid">
              <div className="csp__story-content">
                <h2 className="csp__section-title">The challenge</h2>
                <p>
                  Kigali Coffee Co. had one washing station and a strong
                  reputation for quality — but no path to scale. Their founder
                  knew the product was exceptional, yet lacked the operational
                  structure and capital to move beyond local markets.
                </p>

                <h2 className="csp__section-title">What we did</h2>
                <p>
                  We started with operational discipline. Built financial
                  systems that could withstand investor scrutiny, introduced
                  quality control processes at every stage from cherry to
                  export-grade green bean.
                </p>
                <p>
                  Then we connected them to diaspora investors who understood
                  the long-term value of Rwandan specialty coffee. Capital
                  came in, and with it the ability to acquire two additional
                  washing stations and build direct export relationships.
                </p>

                <h2 className="csp__section-title">The result</h2>
                <p>
                  Kigali Coffee Co. now operates across three provinces with
                  a vertically integrated supply chain — from farmer
                  cooperatives to roasted product reaching international
                  buyers. They&apos;re building a brand that represents the
                  best of Rwandan agriculture.
                </p>
              </div>

              <aside className="csp__story-aside">
                <div className="csp__aside-card">
                  <div className="csp__aside-title">Quick facts</div>
                  <ul className="csp__aside-list">
                    <li><strong>Sector:</strong> Specialty coffee</li>
                    <li><strong>Location:</strong> Kigali, Rwanda</li>
                    <li><strong>Founded:</strong> 2020</li>
                    <li><strong>Partnership:</strong> Since 2022</li>
                    <li><strong>Capital type:</strong> Equity + revenue share</li>
                  </ul>
                </div>
                <div className="csp__aside-card">
                  <div className="csp__aside-title">Tools deployed</div>
                  <div className="csp__aside-pills">
                    <span className="csp__pill">Financial Reporting</span>
                    <span className="csp__pill">Diaspora Network</span>
                    <span className="csp__pill">Quality Control</span>
                    <span className="csp__pill">Export Compliance</span>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="csp__cta">
          <div className="container" style={{ textAlign: "center" }}>
            <h2 className="csp__cta-title">Want to build something like this?</h2>
            <p className="csp__cta-body">
              We work alongside founders every day. If you&apos;re building in Rwanda, let&apos;s talk.
            </p>
            <div className="csp__cta-actions">
              <Link href="/about" className="pill-btn pill-btn--solid">
                Connect with us
              </Link>
              <Link href="/case-studies" className="pill-btn pill-btn--outline">
                More stories
              </Link>
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
                Helping Rwandan businesses build the operations and financial
                proof that makes them worth investing in.
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
