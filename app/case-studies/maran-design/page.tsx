import Link from "next/link";
import MutaraCapitalNav from "../../components/MutaraCapitalNav";

export const metadata = {
  title: "Maran Design - Syncabi",
  description:
    "How Syncabi is supporting Maran Design to scale their craft into a lasting brand.",
};

export default function MaranDesignPage() {
  return (
    <>
      <MutaraCapitalNav />

      <main className="csp">
        <section className="csp__hero">
          <div className="container">
            <Link href="/" className="csp__back">
              &larr; Portfolio
            </Link>
            <div className="csp__tag">Creative Studio</div>
            <h1 className="csp__title">Maran Design</h1>
            <p className="csp__subtitle">
              Turning creative craft into a scalable, structured design studio.
            </p>
          </div>
        </section>

        <section className="csp__highlights">
          <div className="container">
            <div className="csp__stats">
              <div className="csp__stat">
                <div className="csp__stat-value">8</div>
                <div className="csp__stat-label">Team members</div>
              </div>
              <div className="csp__stat">
                <div className="csp__stat-value">20+</div>
                <div className="csp__stat-label">Brand projects</div>
              </div>
              <div className="csp__stat">
                <div className="csp__stat-value">2026</div>
                <div className="csp__stat-label">Partnership started</div>
              </div>
              <div className="csp__stat">
                <div className="csp__stat-value">Kigali</div>
                <div className="csp__stat-label">Based in</div>
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
                  Maran Design had the talent and the taste, but the business
                  side was holding them back. Projects were managed over
                  WhatsApp, invoicing was inconsistent, and there was no system
                  to track deliverables or client feedback.
                </p>

                <h2 className="csp__section-title">What we&apos;re doing</h2>
                <p>
                  We&apos;re helping Maran Design build the operational backbone
                  a creative studio needs to scale — project management
                  workflows, structured client onboarding, and financial
                  tracking that gives them clarity on profitability per project.
                </p>
                <p>
                  On the brand side, we&apos;re working together to position
                  Maran Design as a premium studio that companies trust with
                  their most important work.
                </p>

                <h2 className="csp__section-title">Where we&apos;re headed</h2>
                <p>
                  The vision is a design studio with the creative excellence of
                  a boutique and the operational maturity of an agency —
                  repeatable processes, predictable revenue, and a brand that
                  speaks for itself.
                </p>
              </div>

              <aside className="csp__story-aside">
                <div className="csp__aside-card">
                  <div className="csp__aside-title">Quick facts</div>
                  <ul className="csp__aside-list">
                    <li><strong>Sector:</strong> Creative design</li>
                    <li><strong>Location:</strong> Kigali, Rwanda</li>
                    <li><strong>Partnership:</strong> Since 2026</li>
                    <li><strong>Focus:</strong> Operations &amp; brand</li>
                  </ul>
                </div>
                <div className="csp__aside-card">
                  <div className="csp__aside-title">Tools deployed</div>
                  <div className="csp__aside-pills">
                    <span className="csp__pill">Project Management</span>
                    <span className="csp__pill">Financial Reporting</span>
                    <span className="csp__pill">Brand Strategy</span>
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
              We work alongside founders every day. If you&apos;re building in Rwanda, let&apos;s talk.
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

      <footer className="footer">
        <div className="container">
          <div className="footer__inner">
            <div className="footer__brand">
              <div className="footer__logo">Syncabi</div>
              <p className="footer__tagline">
                The software that powers your operations and supports your hard work.
              </p>
            </div>
            <div className="footer__links">
              <div>
                <div className="footer__col-title">Portfolio</div>
                <ul className="footer__col-list">
                  <li><Link href="/case-studies/blessed-dairy">Blessed Dairy</Link></li>
                  <li><Link href="/case-studies/amazing-tools">Amazing Tools Company</Link></li>
                  <li><Link href="/case-studies/maran-design">Maran Design</Link></li>
                  <li><Link href="/case-studies/kootana-holdings">Kootana Holdings</Link></li>
                </ul>
              </div>
              <div>
                <div className="footer__col-title">Company</div>
                <ul className="footer__col-list">
                  <li><Link href="/about">About</Link></li>
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
