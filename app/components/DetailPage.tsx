"use client";

import { useState } from "react";
import Link from "next/link";
import MutaraCapitalNav from "./MutaraCapitalNav";
import AuthEntryPanel, { type AuthProviderConfig } from "./AuthEntryPanel";

/* ── Types ── */
export type PhoneScreen =
  | { type: "stats"; title: string; subtitle: string; stats: { label: string; value: string }[]; progress?: number }
  | { type: "list"; title: string; items: { name: string; initials: string; detail: string }[] }
  | { type: "text"; title: string; body: string; tags?: string[] }
  | { type: "input"; fundName: string; fundHandle: string; initials: string; currency: string; amount: string; buttonLabel: string };

export interface Step {
  title: string;
  description: string;
  phone: PhoneScreen;
}

export interface Tab {
  label: string;
  href: string;
  active?: boolean;
}

export interface DetailPageProps {
  tabs: Tab[];
  steps: Step[];
  ctaLabel: string;
  ctaHref?: string;
  authPanel?: {
    title: string;
    body: string;
    redirectTo: string;
    providers: AuthProviderConfig[];
  };
}

/* ── Phone screen renderers ── */

function PhoneStats({ s }: { s: PhoneScreen & { type: "stats" } }) {
  return (
    <div className="dp__body">
      <div className="ps__nav">
        <div className="ps__nav-back">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <span className="ps__nav-title">Fund Details</span>
      </div>
      <div className="ps__title">{s.title}</div>
      <div className="ps__subtitle">{s.subtitle}</div>
      <div className="ps__stats">
        {s.stats.map((st, i) => (
          <div key={i}>
            <div className="ps__stat-label">{st.label}</div>
            <div className="ps__stat-value">{st.value}</div>
          </div>
        ))}
      </div>
      {s.progress !== undefined && (
        <div className="ps__progress">
          <div className="ps__progress-fill" style={{ width: `${s.progress}%` }} />
        </div>
      )}
    </div>
  );
}

function PhoneText({ s }: { s: PhoneScreen & { type: "text" } }) {
  return (
    <div className="dp__body">
      <div className="ps__nav">
        <div className="ps__nav-back">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <span className="ps__nav-title">Details</span>
      </div>
      <div className="ps__title">{s.title}</div>
      {s.tags && (
        <div className="ps__tags">
          {s.tags.map((t, i) => (
            <span key={i} className="ps__tag">{t}</span>
          ))}
        </div>
      )}
      <p className="ps__text">{s.body}</p>
    </div>
  );
}

function PhoneList({ s }: { s: PhoneScreen & { type: "list" } }) {
  return (
    <div className="dp__body">
      <div className="ps__nav">
        <div className="ps__nav-back">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <span className="ps__nav-title">{s.title}</span>
      </div>
      <div className="ps__title">{s.title}</div>
      <div className="ps__list">
        {s.items.map((item, i) => (
          <div key={i} className="ps__list-item">
            <div className="ps__list-dot">{item.initials}</div>
            <div>
              <div className="ps__list-name">{item.name}</div>
              <div className="ps__list-detail">{item.detail}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PhoneInput({ s }: { s: PhoneScreen & { type: "input" } }) {
  const keys = [
    { n: "1", sub: "" }, { n: "2", sub: "ABC" }, { n: "3", sub: "DEF" },
    { n: "4", sub: "GHI" }, { n: "5", sub: "JKL" }, { n: "6", sub: "MNO" },
    { n: "7", sub: "PQRS" }, { n: "8", sub: "TUV" }, { n: "9", sub: "WXYZ" },
    { n: "+*#", sub: "" }, { n: "0", sub: "" }, { n: "⌫", sub: "" },
  ];
  return (
    <div className="dp__body">
      <div className="ps__nav">
        <div className="ps__nav-back">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <span className="ps__nav-title">{s.buttonLabel}</span>
      </div>
      <div className="ps__recipient">
        <div className="ps__recipient-avatar">{s.initials}</div>
        <div>
          <div className="ps__recipient-name">{s.fundName}</div>
          <div className="ps__recipient-handle">{s.fundHandle}</div>
        </div>
      </div>
      <div className="ps__amount-row">
        <div className="ps__amount"><span>RWF</span>{s.amount}</div>
        <div className="ps__currency">
          {s.currency}
          <svg width="10" height="10" viewBox="0 0 10 10">
            <path d="M3 4l2 2 2-2" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <div className="ps__msg-row">
        <div className="ps__msg-input">Add a note</div>
        <div className="ps__msg-btn">Next</div>
      </div>
      <div className="ps__keypad">
        {keys.map((k, i) => (
          <div key={i} className="ps__key">
            {k.n}
            {k.sub && <span className="ps__key-sub">{k.sub}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

function RenderPhone({ screen }: { screen: PhoneScreen }) {
  switch (screen.type) {
    case "stats": return <PhoneStats s={screen} />;
    case "text": return <PhoneText s={screen} />;
    case "list": return <PhoneList s={screen} />;
    case "input": return <PhoneInput s={screen} />;
  }
}

/* ── Main component ── */

export default function DetailPage({
  tabs,
  steps,
  ctaLabel,
  ctaHref = "#",
  authPanel,
}: DetailPageProps) {
  const [active, setActive] = useState(0);
  const activePanel = tabs[0]?.href.startsWith("/business")
    ? "syncabi"
    : "ventures";

  return (
    <div className="detail">
      <MutaraCapitalNav activePanel={activePanel} />

      {/* Tab bar */}
      <div className="dt">
        <div className="dt__pills">
          {tabs.map((tab, i) => (
            <Link
              key={i}
              href={tab.href}
              className={`dt__pill${tab.active ? " dt__pill--active" : ""}`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="container dm">
        {/* Phone */}
        <div className="dp">
          <div className="dp__frame">
            <div className="dp__screen">
              <div className="dp__notch" />
              <div className="dp__screen-inner">
                {active >= 0 && active < steps.length && (
                  <RenderPhone screen={steps[active].phone} />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="ds">
          {steps.map((step, i) => (
            <div
              key={i}
              className={`ds__step${i === active ? " ds__step--active" : ""}`}
              onClick={() => setActive(i === active ? -1 : i)}
            >
              <div className="ds__step-header">
                <h3 className="ds__step-title">{step.title}</h3>
                <div className="ds__step-icon">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
              <div className="ds__step-body">
                <p className="ds__step-desc">{step.description}</p>
                {i === steps.length - 1 && (
                  <div className="ds__cta">
                    <Link href={ctaHref} className="pill-btn pill-btn--solid">{ctaLabel}</Link>
                  </div>
                )}
              </div>
            </div>
          ))}

          {authPanel && (
            <div className="ds__auth">
              <AuthEntryPanel
                compact
                redirectTo={authPanel.redirectTo}
                title={authPanel.title}
                body={authPanel.body}
                providers={authPanel.providers}
              />
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
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
                <div className="footer__col-title">Syncabi</div>
                <ul className="footer__col-list">
                  <li><Link href="/business/syncabi">Overview</Link></li>
                  <li><Link href="/business/syncabi#services">Digitize Operations</Link></li>
                  <li><Link href="/business/syncabi#services">Automate Processes</Link></li>
                  <li><Link href="/business/syncabi#services">Business Insights</Link></li>
                  <li><Link href="/business/syncabi#services">Optimize Performance</Link></li>
                </ul>
              </div>
              <div>
                <div className="footer__col-title">Ventures</div>
                <ul className="footer__col-list">
                  <li><Link href="/ventures/manufacturing-operations">Manufacturing &amp; Operations</Link></li>
                  <li><Link href="/ventures/services-consumer-brands">Services &amp; Consumer Brands</Link></li>
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
    </div>
  );
}
