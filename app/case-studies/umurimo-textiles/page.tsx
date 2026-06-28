import Link from "next/link";
import MutaraCapitalNav from "../../components/MutaraCapitalNav";

export const metadata = {
  title: "Umurimo Textiles - Syncabi",
  description:
    "How Syncabi helped Umurimo Textiles grow from 12 artisans into a structured business with institutional buyers.",
};

export default function UmurimoTextilesPage() {
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
            <div className="csp__tag">Light Industry</div>
            <h1 className="csp__title">Umurimo Textiles</h1>
            <p className="csp__subtitle">
              A team of 12 artisans growing into a structured, scalable business.
            </p>
          </div>
        </section>

        {/* ── Highlights ── */}
        <section className="csp__highlights">
          <div className="container">
            <div className="csp__stats">
              <div className="csp__stat">
                <div className="csp__stat-value">12</div>
                <div className="csp__stat-label">Founding artisans</div>
              </div>
              <div className="csp__stat">
                <div className="csp__stat-value">1st</div>
                <div className="csp__stat-label">Institutional buyer</div>
              </div>
              <div className="csp__stat">
                <div className="csp__stat-value">Syncabi</div>
                <div className="csp__stat-label">Inventory system</div>
              </div>
              <div className="csp__stat">
                <div className="csp__stat-value">Structured</div>
                <div className="csp__stat-label">Financial reporting</div>
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
                  Umurimo Textiles was a collective of talented artisans
                  producing beautiful handwoven goods — but operating
                  informally. No financial records, no inventory system, no
                  way to prove their business was real to the buyers who could
                  change their trajectory.
                </p>

                <h2 className="csp__section-title">What we did</h2>
                <p>
                  We started with the basics: built their financial reporting
                  from scratch so every franc in and out was accounted for.
                  Introduced Syncabi for inventory management — giving them
                  real-time visibility into materials, production, and
                  finished goods.
                </p>
                <p>
                  Then we worked on positioning. Helped them build a product
                  catalog, standardize quality, and present themselves to
                  institutional buyers who needed a reliable textile supplier
                  with transparent operations.
                </p>

                <h2 className="csp__section-title">The result</h2>
                <p>
                  Umurimo signed their first institutional buyer within eight
                  months of our partnership. The team now has financial
                  visibility, consistent production schedules, and a growing
                  order pipeline. They went from informal artisans to a
                  business that institutional partners take seriously.
                </p>
              </div>

              <aside className="csp__story-aside">
                <div className="csp__aside-card">
                  <div className="csp__aside-title">Quick facts</div>
                  <ul className="csp__aside-list">
                    <li><strong>Sector:</strong> Handwoven textiles</li>
                    <li><strong>Location:</strong> Kigali, Rwanda</li>
                    <li><strong>Founded:</strong> 2019</li>
                    <li><strong>Partnership:</strong> Since 2024</li>
                    <li><strong>Capital type:</strong> Capability-for-equity</li>
                  </ul>
                </div>
                <div className="csp__aside-card">
                  <div className="csp__aside-title">Tools deployed</div>
                  <div className="csp__aside-pills">
                    <span className="csp__pill">Syncabi Inventory</span>
                    <span className="csp__pill">Financial Reporting</span>
                    <span className="csp__pill">Product Catalog</span>
                    <span className="csp__pill">Buyer Matching</span>
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
