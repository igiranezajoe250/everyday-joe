import Link from "next/link";
import MutaraCapitalNav from "../../components/MutaraCapitalNav";

export const metadata = {
  title: "Amazing Tools Company - Syncabi",
  description:
    "How Syncabi is helping Amazing Tools Company streamline operations and build a brand customers trust.",
};

export default function AmazingToolsPage() {
  return (
    <>
      <MutaraCapitalNav />

      <main className="csp">
        <section className="csp__hero">
          <div className="container">
            <Link href="/" className="csp__back">
              &larr; Portfolio
            </Link>
            <div className="csp__tag">Tools &amp; Equipment</div>
            <h1 className="csp__title">Amazing Tools Company</h1>
            <p className="csp__subtitle">
              Building the supply chain that equips Rwanda&apos;s builders, makers, and manufacturers.
            </p>
          </div>
        </section>

        <section className="csp__highlights">
          <div className="container">
            <div className="csp__stats">
              <div className="csp__stat">
                <div className="csp__stat-value">120+</div>
                <div className="csp__stat-label">Products catalogued</div>
              </div>
              <div className="csp__stat">
                <div className="csp__stat-value">12</div>
                <div className="csp__stat-label">Team members</div>
              </div>
              <div className="csp__stat">
                <div className="csp__stat-value">3</div>
                <div className="csp__stat-label">Distribution points</div>
              </div>
              <div className="csp__stat">
                <div className="csp__stat-value">2026</div>
                <div className="csp__stat-label">Partnership started</div>
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
                  Amazing Tools Company had built real demand across Kigali for quality
                  tools and equipment, but their operations were manual.
                  Inventory was tracked in notebooks, reorders were guesswork,
                  and there was no visibility into which products drove margin.
                </p>

                <h2 className="csp__section-title">What we&apos;re doing</h2>
                <p>
                  We&apos;re working alongside the Amazing Tools Company team to digitize
                  their inventory, implement ordering workflows, and build a
                  brand identity that matches the quality of products they sell.
                </p>
                <p>
                  Syncabi is powering their operations — from stock tracking to
                  supplier management — so the team can focus on serving
                  customers instead of chasing spreadsheets.
                </p>

                <h2 className="csp__section-title">Where we&apos;re headed</h2>
                <p>
                  The goal is a fully systematized operation with real-time
                  inventory, automated reordering, and a brand presence that
                  positions Amazing Tools Company as the go-to equipment supplier in
                  Rwanda.
                </p>
              </div>

              <aside className="csp__story-aside">
                <div className="csp__aside-card">
                  <div className="csp__aside-title">Quick facts</div>
                  <ul className="csp__aside-list">
                    <li><strong>Sector:</strong> Tools &amp; equipment supply</li>
                    <li><strong>Location:</strong> Kigali, Rwanda</li>
                    <li><strong>Partnership:</strong> Since 2026</li>
                    <li><strong>Focus:</strong> Operations &amp; brand</li>
                  </ul>
                </div>
                <div className="csp__aside-card">
                  <div className="csp__aside-title">Tools deployed</div>
                  <div className="csp__aside-pills">
                    <span className="csp__pill">Syncabi Inventory</span>
                    <span className="csp__pill">Order Management</span>
                    <span className="csp__pill">Brand Identity</span>
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
