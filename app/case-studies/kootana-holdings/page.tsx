import Link from "next/link";
import MutaraCapitalNav from "../../components/MutaraCapitalNav";

export const metadata = {
  title: "Kootana Holdings - Syncabi",
  description:
    "How Syncabi is helping Kootana Holdings modernize property management and residential rentals in Montreal.",
};

export default function KootanaHoldingsPage() {
  return (
    <>
      <MutaraCapitalNav />

      <main className="csp">
        <section className="csp__hero">
          <div className="container">
            <Link href="/" className="csp__back">
              &larr; Portfolio
            </Link>
            <div className="csp__tag">Real Estate</div>
            <h1 className="csp__title">Kootana Holdings</h1>
            <p className="csp__subtitle">
              Redefining residential living through modern property management in Montreal.
            </p>
          </div>
        </section>

        <section className="csp__highlights">
          <div className="container">
            <div className="csp__stats">
              <div className="csp__stat">
                <div className="csp__stat-value">Montreal</div>
                <div className="csp__stat-label">Based in</div>
              </div>
              <div className="csp__stat">
                <div className="csp__stat-value">Residential</div>
                <div className="csp__stat-label">Focus</div>
              </div>
              <div className="csp__stat">
                <div className="csp__stat-value">2026</div>
                <div className="csp__stat-label">Partnership started</div>
              </div>
              <div className="csp__stat">
                <div className="csp__stat-value">Rentals</div>
                <div className="csp__stat-label">Sector</div>
              </div>
            </div>
          </div>
        </section>

        <section className="csp__story">
          <div className="container">
            <div className="csp__story-grid">
              <div className="csp__story-content">
                <h2 className="csp__section-title">The challenge</h2>
                <p>
                  Kootana Holdings had a growing portfolio of residential
                  properties across Montreal, but operations were fragmented.
                  Tenant communication, maintenance requests, lease management,
                  and financial tracking were spread across multiple tools with
                  no unified view.
                </p>

                <h2 className="csp__section-title">What we&apos;re doing</h2>
                <p>
                  We&apos;re working alongside the Kootana Holdings team to
                  build a centralized property management system &mdash; from
                  tenant onboarding and lease tracking to maintenance workflows
                  and financial reporting.
                </p>
                <p>
                  Syncabi is bringing clarity to every property in their
                  portfolio, giving the team real-time visibility into
                  occupancy, revenue, and operational health.
                </p>

                <h2 className="csp__section-title">Where we&apos;re headed</h2>
                <p>
                  The vision is a fully digital property management operation
                  where tenants have a seamless experience, maintenance is
                  proactive, and every property performs at its best &mdash;
                  backed by data, not guesswork.
                </p>
              </div>

              <aside className="csp__story-aside">
                <div className="csp__aside-card">
                  <div className="csp__aside-title">Quick facts</div>
                  <ul className="csp__aside-list">
                    <li><strong>Sector:</strong> Real estate &amp; rentals</li>
                    <li><strong>Location:</strong> Montreal, Canada</li>
                    <li><strong>Partnership:</strong> Since 2026</li>
                    <li><strong>Focus:</strong> Property operations</li>
                  </ul>
                </div>
                <div className="csp__aside-card">
                  <div className="csp__aside-title">Tools deployed</div>
                  <div className="csp__aside-pills">
                    <span className="csp__pill">Property Management</span>
                    <span className="csp__pill">Tenant Portal</span>
                    <span className="csp__pill">Financial Reporting</span>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        <section className="csp__cta">
          <div className="container" style={{ textAlign: "center" }}>
            <h2 className="csp__cta-title">Want to build something like this?</h2>
            <p className="csp__cta-body">
              We work alongside founders every day. Let&apos;s talk.
            </p>
            <div className="csp__cta-actions">
              <Link href="/about" className="pill-btn pill-btn--solid">
                Connect with us
              </Link>
              <Link href="/" className="pill-btn pill-btn--outline">
                Back to portfolio
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer-min">
        <div className="container">
          <div className="footer-min__top">
            <div className="footer-min__left">
              <div className="footer-min__brand">Syncabi</div>
              <p className="footer-min__tagline">The software that powers your operations.</p>
            </div>
            <div className="footer-min__cols">
              <div className="footer-min__col">
                <div className="footer-min__col-title">Brands</div>
                <a href="/case-studies/blessed-dairy">Blessed Dairy</a>
                <a href="/case-studies/amazing-tools">Amazing Tools Company</a>
                <a href="/case-studies/maran-design">Maran Design</a>
                <a href="/case-studies/kootana-holdings">Kootana Holdings</a>
              </div>
              <div className="footer-min__col">
                <div className="footer-min__col-title">Company</div>
                <a href="/about">About</a>
                <a href="/contact">Contact</a>
              </div>
              <div className="footer-min__col">
                <div className="footer-min__col-title">Legal</div>
                <a href="#">Terms</a>
                <a href="#">Privacy</a>
              </div>
            </div>
          </div>
          <div className="footer-min__bottom">
            <span>&copy; 2026 Syncabi</span>
          </div>
        </div>
      </footer>
    </>
  );
}
