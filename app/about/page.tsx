import Link from "next/link";
import MutaraCapitalNav from "../components/MutaraCapitalNav";

export const metadata = {
  title: "About — Syncabi",
  description:
    "Syncabi helps Rwandan businesses build the systems, visibility, and confidence that help their business speak for itself.",
};

const principles = [
  {
    label: "The reality",
    title: "The value is there. The visibility is not.",
    body: "Behind every business is a founder who has spent years building relationships, serving customers, solving problems, and creating value. Yet much of that value remains difficult to see from the outside.",
  },
  {
    label: "The ambition",
    title: "A country where more people can build their future at home.",
    body: "Rwanda's ambition to become an upper-middle-income economy by 2035 is about more than growth. It is about creating a country where people can find meaningful work, raise their families, and dream bigger — without feeling they must leave to do so.",
  },
  {
    label: "Our response",
    title: "We are not waiting for stronger businesses to appear.",
    body: "We are helping build them. One company at a time. One process at a time. One improvement at a time. That future will not be built by policy alone — it will be built by thousands of businesses growing stronger year after year.",
  },
];

const pillars = [
  {
    title: "Systems",
    text: "Build the structure that turns daily work into a reliable, measurable operation.",
  },
  {
    title: "Visibility",
    text: "When the work is visible, trust follows. Every transaction recorded, every process tracked.",
  },
  {
    title: "Trust",
    text: "When trust follows, opportunity follows. A business that can show its track record earns credibility.",
  },
  {
    title: "Capital",
    text: "When opportunity follows, capital becomes easier to earn — not because of a pitch, but because of performance.",
  },
  {
    title: "The invitation",
    text: "If you run a business in Rwanda and want to build one whose performance tells the story for it, Syncabi is where that work happens.",
  },
];

export default function AboutPage() {
  return (
    <>
      <MutaraCapitalNav />

      <main className="abt">
        <section className="abt__hero">
          <div className="container">
            <div className="abt__eyebrow">About Syncabi</div>
            <h1 className="abt__title">
              We believe that should change.
            </h1>
            <p className="abt__lead">
              Behind every business is a founder who has spent years building
              relationships, serving customers, solving problems, and creating
              value. Yet much of that value remains difficult to see from the outside.
            </p>
          </div>
        </section>

        <section className="abt__principles">
          <div className="container">
            <div className="abt__principles-inner">
              <div className="abt__principles-left">
                <div className="abt__eyebrow">Why we exist</div>
                <h2 className="abt__section-title">
                  Syncabi is our response.
                </h2>
              </div>
              <div className="abt__principles-right">
                {principles.map((item) => (
                  <div key={item.label} className="abt__principle">
                    <div className="abt__principle-label">{item.label}</div>
                    <h3 className="abt__principle-title">{item.title}</h3>
                    <p className="abt__principle-body">{item.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="abt__statement">
          <div className="container">
            <div className="abt__statement-inner">
              <div className="abt__eyebrow">What guides us</div>
              <p className="abt__statement-copy">
                The goal is not to help businesses tell a better story. The goal
                is to help businesses build a business whose performance tells
                the story for them.
              </p>
            </div>
          </div>
        </section>

        <section className="abt__pillars">
          <div className="container">
            <div className="abt__pillars-head">
              <div className="abt__eyebrow">What follows</div>
              <h2 className="abt__section-title">
                When the work is visible, everything changes.
              </h2>
            </div>
            <div className="abt__pillar-grid">
              {pillars.map((pillar) => (
                <div key={pillar.title} className="abt__pillar">
                  <h3 className="abt__pillar-title">{pillar.title}</h3>
                  <p className="abt__pillar-text">{pillar.text}</p>
                </div>
              ))}
            </div>
            <div className="abt__cta-row">
              <Link href="/login" className="pill-btn pill-btn--solid">
                Try Syncabi
              </Link>
              <Link href="/contact" className="pill-btn pill-btn--outline">
                Let&apos;s build together
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
