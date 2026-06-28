import Link from "next/link";
import MutaraCapitalNav from "../../components/MutaraCapitalNav";

export const metadata = {
  title: "Blessed Dairy - Syncabi",
  description:
    "How Syncabi helped Blessed Dairy 3.2x production output and reach breakeven in 18 months.",
};

export default function BlessedDairyPage() {
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
            <div className="csp__tag">Manufacturing</div>
            <h1 className="csp__title">Blessed Dairy</h1>
            <p className="csp__subtitle">
              From struggling supply chain to Rwanda&apos;s fastest-growing dairy producer.
            </p>
          </div>
        </section>

        {/* ── Highlights ── */}
        <section className="csp__highlights">
          <div className="container">
            <div className="csp__stats">
              <div className="csp__stat">
                <div className="csp__stat-value">3.2x</div>
                <div className="csp__stat-label">Production output</div>
              </div>
              <div className="csp__stat">
                <div className="csp__stat-value">47</div>
                <div className="csp__stat-label">People employed</div>
              </div>
              <div className="csp__stat">
                <div className="csp__stat-value">18 mo</div>
                <div className="csp__stat-label">To breakeven</div>
              </div>
              <div className="csp__stat">
                <div className="csp__stat-value">84M</div>
                <div className="csp__stat-label">RWF deployed</div>
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
                  Blessed Dairy had the demand but not the infrastructure.
                  Their supply chain was fragmented across dozens of
                  small-holder farmers with no cold chain logistics, inconsistent
                  quality, and margins that kept shrinking.
                </p>

                <h2 className="csp__section-title">What we did</h2>
                <p>
                  We came in and restructured everything from procurement to
                  distribution. Consolidated supplier relationships, introduced
                  quality benchmarks at collection points, and deployed
                  RWF 84M in structured capital to fund cold storage and
                  processing equipment.
                </p>
                <p>
                  Our operations team sat on-site for six months — building
                  financial reporting systems, training floor managers, and
                  implementing inventory tracking through Syncabi.
                </p>

                <h2 className="csp__section-title">The result</h2>
                <p>
                  Production output increased 3.2x within the first year.
                  The team grew from 14 to 47 employees. Blessed Dairy reached
                  breakeven in 18 months and is now exploring distribution
                  partnerships across East Africa.
                </p>
              </div>

              <aside className="csp__story-aside">
                <div className="csp__aside-card">
                  <div className="csp__aside-title">Quick facts</div>
                  <ul className="csp__aside-list">
                    <li><strong>Sector:</strong> Dairy manufacturing</li>
                    <li><strong>Location:</strong> Musanze, Rwanda</li>
                    <li><strong>Founded:</strong> 2021</li>
                    <li><strong>Partnership:</strong> Since 2023</li>
                    <li><strong>Capital type:</strong> Structured debt</li>
                  </ul>
                </div>
                <div className="csp__aside-card">
                  <div className="csp__aside-title">Tools deployed</div>
                  <div className="csp__aside-pills">
                    <span className="csp__pill">Syncabi Inventory</span>
                    <span className="csp__pill">Financial Reporting</span>
                    <span className="csp__pill">Supply Chain Ops</span>
                    <span className="csp__pill">Cold Storage</span>
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
