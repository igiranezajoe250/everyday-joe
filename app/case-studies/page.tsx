import Link from "next/link";
import MutaraCapitalNav from "../components/MutaraCapitalNav";

export const metadata = {
  title: "Case Studies - Syncabi",
  description:
    "Stories of founders and teams making a difference. See how Syncabi works alongside Rwandan businesses.",
};

const stories = [
  {
    slug: "blessed-dairy",
    name: "Blessed Dairy",
    tag: "Manufacturing",
    body: "We restructured their supply chain, deployed RWF 84M in structured capital, and helped them 3.2x production output. Today they employ 47 people and reached breakeven in 18 months.",
  },
  {
    slug: "exp-rw",
    name: "EXP.RW",
    tag: "Hospitality",
    body: "Experience Rwanda is a hospitality-facing marketing and brand platform designed to sharpen how destination businesses present themselves, attract guests, and launch new experiences with confidence.",
  },
];

export default function CaseStudiesPage() {
  return (
    <>
      <MutaraCapitalNav />

      <main className="cs">
        <section className="cs__hero">
          <div className="container">
            <h1 className="cs__title">Stories of Impact</h1>
          </div>
        </section>

        <section className="cs__feature">
          <div className="container">
            <div className="cs__feature-grid">
              <div className="cs__feature-content">
                <h2 className="cs__feature-headline">
                  What happens when the right support reaches the right founder
                </h2>
                <p className="cs__feature-body">
                  We do not just send capital. We sit with founders, understand
                  their operations, and stay until the business has the structure
                  it needs to grow on its own. These stories are what that looks
                  like in practice.
                </p>
                <div className="cs__feature-actions">
                  <a href="#" className="cs__action-icon" aria-label="Watch video">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                    <span>Watch</span>
                  </a>
                  <Link href="/case-studies/blessed-dairy" className="cs__action-icon" aria-label="Read article">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    </svg>
                    <span>Read</span>
                  </Link>
                </div>
              </div>
              <div className="cs__feature-visual">
                <img
                  src="/images/studies-hero.jpg"
                  alt="Rwanda landscape"
                  className="cs__feature-image"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="cs__cards">
          <div className="container">
            <div className="cs__card-grid">
              {stories.map((story) => (
                <Link
                  key={story.slug}
                  href={`/case-studies/${story.slug}`}
                  className="cs__card"
                >
                  <div className="cs__card-tag">{story.tag}</div>
                  <h3 className="cs__card-name">{story.name}</h3>
                  <p className="cs__card-body">{story.body}</p>
                  <span className="cs__card-link">Read story -&gt;</span>
                </Link>
              ))}
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
