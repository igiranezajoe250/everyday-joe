"use client";

import AuthEntryPanel, { type AuthProviderConfig } from "../components/AuthEntryPanel";
import MutaraCapitalNav from "../components/MutaraCapitalNav";
import Link from "next/link";

interface LoginPageClientProps {
  redirectTo: string;
  eyebrow: string;
  title: string;
  body: string;
  asideTitle: string;
  asideItems: string[];
  providers: AuthProviderConfig[];
}

export default function LoginPageClient({
  redirectTo,
  eyebrow,
  title,
  body,
  asideTitle,
  asideItems,
  providers,
}: LoginPageClientProps) {
  return (
    <>
      <MutaraCapitalNav minimal />
      <main className="login-page">
        <section className="login-shell">
          <div className="login-panel login-panel--brand">
            <a href="/" className="login-brand">
          Syncabi
            </a>
            <div className="login-copy">
              <div className="eyebrow">{eyebrow}</div>
              <h1 className="login-title">{title}</h1>
              <p className="login-body">{body}</p>
            </div>
            <div className="login-story">
              <div className="login-story__card">
                <div className="login-story__label">{asideTitle}</div>
                <ul className="login-story__list">
                  {asideItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="login-panel login-panel--auth">
            <AuthEntryPanel
              redirectTo={redirectTo}
              title=""
              body=""
              providers={providers}
              eyebrow=""
            />
          </div>
        </section>

        <footer className="footer footer--blend">
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
                  <div className="footer__col-title">Syncabi</div>
                  <ul className="footer__col-list">
                    <li><Link href="/business/syncabi">Overview</Link></li>
                    <li><Link href="/business/syncabi#services">Digitize Operations</Link></li>
                    <li><Link href="/business/syncabi#services">Automate Processes</Link></li>
                    <li><Link href="/business/syncabi#services">Optimize Performance</Link></li>
                  </ul>
                </div>
                <div>
                  <div className="footer__col-title">Company</div>
                  <ul className="footer__col-list">
                    <li><Link href="/about">About</Link></li>
                    <li><a href="#">Careers</a></li>
                    <li><a href="#">Press</a></li>
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
      </main>
    </>
  );
}
