import Link from "next/link";
import MutaraCapitalNav from "../../components/MutaraCapitalNav";

export const metadata = {
  title: "EXP.RW - Syncabi",
  description:
    "How EXP.RW positions hospitality brands, launches, and guest experiences with sharper storytelling and cleaner market presence.",
};

export default function ExpRwPage() {
  return (
    <>
      <MutaraCapitalNav />

      <main className="csp">
        <section className="csp__hero">
          <div className="container">

            {/* Top bar — back link + visit site */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "48px",
            }}>
              <Link href="/case-studies" className="csp__back">
                &larr; All stories
              </Link>
              <a
                href="http://localhost:3001"
                target="_blank"
                rel="noopener noreferrer"
                className="csp__visit-btn"
              >
                exp.rw
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M1.5 8.5L8.5 1.5M8.5 1.5H3M8.5 1.5V7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            </div>

            <div className="csp__tag">Hospitality</div>
            <h1 className="csp__title">EXP.RW</h1>
            <p className="csp__subtitle">
              Positioning hospitality brands and destination experiences with more clarity, confidence, and pull.
            </p>
          </div>
        </section>

        <section className="csp__highlights">
          <div className="container">
            <div className="csp__stats">
              <div className="csp__stat">
                <div className="csp__stat-value">4</div>
                <div className="csp__stat-label">Service lines aligned</div>
              </div>
              <div className="csp__stat">
                <div className="csp__stat-value">1</div>
                <div className="csp__stat-label">Unified market identity</div>
              </div>
              <div className="csp__stat">
                <div className="csp__stat-value">Fast</div>
                <div className="csp__stat-label">Launch-ready direction</div>
              </div>
              <div className="csp__stat">
                <div className="csp__stat-value">Clear</div>
                <div className="csp__stat-label">Audience positioning</div>
              </div>
            </div>
          </div>
        </section>

        <section className="csp__story">
          <div className="container">
            <div className="csp__story-grid">
              <div className="csp__story-content">
                <h2 className="csp__section-title">The opportunity</h2>
                <p>
                  Rwanda's hospitality sector is growing quickly, but many strong experience-led businesses still look fragmented online. Messaging, events, branding, and guest-facing storytelling often live in separate places.
                </p>

                <h2 className="csp__section-title">What EXP.RW solves</h2>
                <p>
                  EXP.RW brings marketing, event management, PR, communications, and branding into one sharp system. Instead of scattered promotion, hospitality brands get a cleaner public image and a stronger launch rhythm.
                </p>
                <p>
                  The platform is designed to help hotels, destination experiences, and service businesses show up with more consistency across campaigns, partnerships, activations, and guest touchpoints.
                </p>

                <h2 className="csp__section-title">Why it matters</h2>
                <p>
                  For a tourism and hospitality economy, presentation is not cosmetic. It drives bookings, trust, media attention, and the confidence to scale. EXP.RW strengthens that layer for companies building the next version of Rwanda's visitor economy.
                </p>
              </div>

              <aside className="csp__story-aside">
                <div className="csp__aside-card">
                  <div className="csp__aside-title">Quick facts</div>
                  <ul className="csp__aside-list">
                    <li><strong>Sector:</strong> Hospitality marketing</li>
                    <li><strong>Location:</strong> Kigali, Rwanda</li>
                    <li><strong>Focus:</strong> Guest-facing brands</li>
                    <li><strong>Coverage:</strong> Launches, campaigns, events</li>
                    <li><strong>Model:</strong> Service-led growth support</li>
                  </ul>
                </div>
                <div className="csp__aside-card">
                  <div className="csp__aside-title">Core strengths</div>
                  <div className="csp__aside-pills">
                    <span className="csp__pill">Branding</span>
                    <span className="csp__pill">PR</span>
                    <span className="csp__pill">Events</span>
                    <span className="csp__pill">Marketing</span>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>


        <section className="csp__cta">
          <div className="container" style={{ textAlign: "center" }}>
            <h2 className="csp__cta-title">Building in hospitality?</h2>
            <p className="csp__cta-body">
                  EXP.RW is part of the hospitality and services pipeline we support through Syncabi.
            </p>
            <div className="csp__cta-actions">
              <Link href="/ventures/services-consumer-brands" className="pill-btn pill-btn--solid">
                Services &amp; Brands
              </Link>
              <Link href="/case-studies" className="pill-btn pill-btn--outline">
                More stories
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
