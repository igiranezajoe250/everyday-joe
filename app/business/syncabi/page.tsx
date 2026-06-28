import Link from "next/link";
import MutaraCapitalNav from "../../components/MutaraCapitalNav";

export const metadata = {
  title: "Syncabi — Helping good businesses become great businesses.",
  description: "Run operations. Prove your financials. Grow with confidence.",
};

const SECTIONS = [
  {
    label: "Run it",
    headline: "Build a system around how you operate.",
    features: [
      {
        title: "Digitize Operations",
        body: "Stop running your business on spreadsheets and messages. Syncabi moves every sale, purchase, transfer, and workflow into one structured system — captured automatically as it happens.",
      },
      {
        title: "Automate Processes",
        body: "The tasks that repeat every day — reorders, approvals, invoices, reminders — run on their own. Set the rules once. The system handles the rest without manual follow-up.",
      },
      {
        title: "Business Intelligence",
        body: "Real-time visibility into how your business actually performs. Revenue, margins, inventory, and trends shown clearly — so decisions are based on data, not guesswork or end-of-month reports.",
      },
      {
        title: "Operational Excellence",
        body: "Build a consistent standard across everything you do. Defined processes, measurable outputs, and a system that performs the same way every time — whether you are there or not.",
      },
    ],
  },
  {
    label: "Prove it",
    headline: "Show what your business is worth.",
    features: [
      {
        title: "Financial Reports",
        body: "Income statements, balance sheets, and cash flow reports — generated from how you actually operate, not from manual entries. Audit-ready at any time, without the reconciliation work.",
      },
      {
        title: "Tax & Compliance",
        body: "Stay ahead of RRA requirements. Syncabi tracks VAT, PAYE, and corporate tax obligations in the background and keeps your records clean for every filing — no surprises.",
      },
      {
        title: "Audit Trail",
        body: "Every transaction, every change, every user action — logged, timestamped, and retrievable. The complete operational history that builds credibility with lenders, partners, and investors.",
      },
    ],
  },
  {
    label: "Grow it",
    headline: "Capital that follows performance.",
    features: [
      {
        title: "Syncabi Line of Credit",
        body: "Access working capital based on how your business actually performs — not on a pitch deck or personal guarantee. When your track record speaks for itself, capital follows.",
        cta: { label: "Learn more", href: "/business/noetic-credit-line" },
      },
    ],
  },
];

export default function SyncabiPage() {
  return (
    <>
      <MutaraCapitalNav activePanel="syncabi" />

      <main>
        {/* ── Hero ── */}
        <section className="sv__hero sv__hero--syncabi">
          <div className="container">
            <div className="sv__hero-body">
              <p className="sv__eyebrow">Platform</p>
              <h1 className="sv__headline">Helping good businesses become great businesses.</h1>
              <p className="sv__lead">One platform to run operations, prove your financials, and grow with confidence.</p>
              <Link href="/login" className="pill-btn pill-btn--outline-light">Try Syncabi</Link>
            </div>
          </div>
        </section>

        {/* ── Feature sections ── */}
        {SECTIONS.map((section, si) => (
          <section key={section.label} id={section.label.toLowerCase().replace(/\s+/g, "-")} className={`syf__section${si % 2 === 1 ? " syf__section--alt" : ""}`}>
            <div className="container">
              <div className="syf__inner">
                {/* Left: sticky label */}
                <div className="syf__sidebar">
                  <p className="syf__label">{section.label}</p>
                  <h2 className="syf__headline">{section.headline}</h2>
                </div>

                {/* Right: feature rows */}
                <div className="syf__rows">
                  {section.features.map((f, fi) => (
                    <div key={f.title} className="syf__row">
                      <div className="syf__row-num">0{fi + 1}</div>
                      <div className="syf__row-content">
                        <div className="syf__row-title">{f.title}</div>
                        <p className="syf__row-body">{f.body}</p>
                        {"cta" in f && f.cta && (
                          <Link href={f.cta.href} className="syf__row-link">
                            {f.cta.label} →
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        ))}
      </main>

      <footer className="footer">
        <div className="container">
          <div className="footer__inner">
            <div className="footer__brand">
              <div className="footer__logo">Syncabi</div>
              <p className="footer__tagline">Helping Rwandan businesses build the operations and financial proof that makes them worth investing in.</p>
            </div>
            <div className="footer__links">
              <div>
                <div className="footer__col-title">Product</div>
                <ul className="footer__col-list">
                  <li><Link href="/ventures/manufacturing-operations">Mfg &amp; Operations</Link></li>
                  <li><Link href="/ventures/services-consumer-brands">Services &amp; Brands</Link></li>
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
