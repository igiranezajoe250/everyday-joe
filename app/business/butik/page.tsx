import Link from "next/link";
import MutaraCapitalNav from "../../components/MutaraCapitalNav";

export const metadata = {
  title: "Butik — The Rebirth of Commerce in Africa",
  description:
    "Butik helps African retail businesses run better stores with AI-powered commerce, multi-channel sales, and intelligent operations.",
};

const boutiques = [
  { name: "Nataal", category: "Media & Culture", tagline: "Culture. Fashion. Music." },
  { name: "FLEXX", category: "Athletic Wear", tagline: "Push beyond limits." },
  { name: "Sonia Mugabo", category: "Womenswear", tagline: "Effortless. Enduring." },
  { name: "House of Tayo", category: "Menswear", tagline: "Stories through cloth." },
  { name: "Inzuki Designs", category: "Jewelry", tagline: "Handcrafted. Authentic." },
  { name: "Ichyulu", category: "Concept Store", tagline: "Curated African design." },
  { name: "K'tsobe", category: "Fine Jewelry", tagline: "Nature. Silver. Craft." },
];

const capabilities = [
  {
    num: "01",
    title: "AI-powered commerce",
    body: "Search by text, voice, image, or video. Butik intelligence understands what customers want and connects them to the right products — across every boutique on the platform.",
  },
  {
    num: "02",
    title: "Multi-channel sales",
    body: "Store, WhatsApp, USSD, and Web — all unified. Sell wherever your customers are, with one inventory, one order system, and one reconciliation at the end of the day.",
  },
  {
    num: "03",
    title: "Inventory & operations",
    body: "Real-time stock tracking, automated reordering, wholesaler management, and delivery logistics. The entire back-of-house runs on one system.",
  },
  {
    num: "04",
    title: "Merchant credit",
    body: "Butik builds a credit profile from actual sales data. Merchants with strong operations can access working capital directly through the platform.",
  },
];

const vision = [
  "To make running a business simpler.",
  "To make operations smarter.",
  "To make commerce more human.",
  "To give every merchant access to capabilities that were once available only to the world's largest retailers.",
];

export default function ButikPage() {
  return (
    <>
      <MutaraCapitalNav />

      <main>
        {/* ── Hero ── */}
        <section className="butik-hero">
          <div className="butik-hero__bg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/butik/hero.png"
              alt="Butik commerce platform"
              className="butik-hero__img"
            />
            <div className="butik-hero__overlay" />
          </div>
          <div className="container butik-hero__content">
            <p className="butik-hero__eyebrow">Flagship — Services & Consumer Brands</p>
            <h1 className="butik-hero__headline">Butik</h1>
            <p className="butik-hero__sub">The Rebirth of Commerce in Africa</p>
            <p className="butik-hero__lead">
              What if a merchant could focus on serving customers while benefiting
              from systems, processes, logistics, technology, and operational
              capabilities that were already proven?
            </p>
            <div className="butik-hero__actions">
              <Link href="/butik" target="_blank" className="pill-btn pill-btn--solid">Visit Butik</Link>
              <a href="/contact" className="pill-btn pill-btn--outline-light">Partner with us</a>
            </div>
          </div>
        </section>

        {/* ── The idea ── */}
        <section className="butik-idea">
          <div className="container">
            <div className="butik-idea__grid">
              <div className="butik-idea__left">
                <p className="butik-eyebrow">The idea</p>
                <h2 className="butik-idea__headline">
                  Keep doing what works.<br />Do it better.
                </h2>
              </div>
              <div className="butik-idea__right">
                <p className="butik-idea__body">
                  Many businesses do not struggle because they lack ambition.
                  They struggle because running a store requires carrying too
                  many responsibilities at once.
                </p>
                <p className="butik-idea__body">
                  Butik is not asking businesses to become something different.
                  We are helping them become a better version of what they
                  already are — with systems for inventory, sales, logistics,
                  payments, and intelligence built in from day one.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Capabilities ── */}
        <section className="butik-caps" id="capabilities">
          <div className="container">
            <p className="butik-eyebrow">What Butik does</p>
            <div className="butik-caps__list">
              {capabilities.map((c) => (
                <div key={c.num} className="butik-caps__item">
                  <span className="butik-caps__num">{c.num}</span>
                  <div>
                    <div className="butik-caps__title">{c.title}</div>
                    <p className="butik-caps__body">{c.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Boutiques ── */}
        <section className="butik-boutiques">
          <div className="container">
            <p className="butik-eyebrow">Boutiques on Butik</p>
            <h2 className="butik-boutiques__headline">
              Curated brands. One platform.
            </h2>
            <div className="butik-boutiques__grid">
              {boutiques.map((b) => (
                <div key={b.name} className="butik-boutiques__card">
                  <div className="butik-boutiques__card-name">{b.name}</div>
                  <div className="butik-boutiques__card-cat">{b.category}</div>
                  <div className="butik-boutiques__card-tag">{b.tagline}</div>
                </div>
              ))}
              <div className="butik-boutiques__card butik-boutiques__card--add">
                <div className="butik-boutiques__card-name">+</div>
                <div className="butik-boutiques__card-cat">Your brand</div>
                <div className="butik-boutiques__card-tag">Join the platform</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Gallery ── */}
        <section className="butik-gallery">
          <div className="butik-gallery__scroll">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/butik/fashion.png" alt="Fashion on Butik" className="butik-gallery__img" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/butik/cosmetics.png" alt="Beauty on Butik" className="butik-gallery__img" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/butik/jewels.png" alt="Accessories on Butik" className="butik-gallery__img" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/butik/boutiques.png" alt="Lifestyle on Butik" className="butik-gallery__img" />
          </div>
        </section>

        {/* ── Vision ── */}
        <section className="butik-vision">
          <div className="container">
            <p className="butik-eyebrow">The future is intelligent</p>
            <h2 className="butik-vision__headline">One business at a time.</h2>
            <ul className="butik-vision__list">
              {vision.map((v) => (
                <li key={v} className="butik-vision__item">{v}</li>
              ))}
            </ul>
            <p className="butik-vision__closing">
              Whatever commerce requires today, and whatever it becomes
              tomorrow — that is the future we are building.
            </p>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="butik-cta">
          <div className="container">
            <h2 className="butik-cta__headline">
              Commerce, reimagined.
            </h2>
            <p className="butik-cta__sub">
              Whether you are an existing retailer or building something new,
              Butik gives you the platform to compete with the best.
            </p>
            <div className="butik-cta__actions">
              <Link href="/contact" className="pill-btn pill-btn--solid">Talk to us</Link>
              <Link href="/ventures/services-consumer-brands" className="pill-btn pill-btn--outline">Back to Services & Brands</Link>
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
