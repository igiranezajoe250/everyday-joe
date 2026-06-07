// ui.jsx — shared low-fi swiss primitives for Poketee

// ───────────────────────────── theming ─────────────────────────────

const CC_PALETTES = {
  teal:    { accent: '#C8102E', label: 'Syncabi' },
  amber:   { accent: '#8B3A2F', label: 'Brown'   },
  ink:     { accent: '#0A0A0A', label: 'Ink'     },
  blue:    { accent: '#1A1A1A', label: 'Dark'    },
};

const CC_TYPES = {
  manrope:  '"Space Grotesk", "Helvetica Neue", Helvetica, sans-serif',
  jakarta:  '"Space Grotesk", "Helvetica Neue", Helvetica, sans-serif',
  figtree:  '"Space Grotesk", "Helvetica Neue", Helvetica, sans-serif',
};

const CC_MONO = '"JetBrains Mono", "SF Mono", ui-monospace, monospace';

// shared color tokens — warm near-black ink, soft warm canvas, teal + amber.
const ink        = '#0A0A0A';
const ink70      = 'rgba(10,10,10,0.70)';
const ink55      = 'rgba(10,10,10,0.55)';
const ink40      = 'rgba(10,10,10,0.40)';
const ink25      = 'rgba(10,10,10,0.25)';
const ink12      = 'rgba(10,10,10,0.12)';
const ink06      = 'rgba(10,10,10,0.06)';
const paper      = '#FFFFFF';
const paperSoft  = '#FAFAFA';
const canvas     = '#FAF6F1';   // Syncabi cream app background
const teal       = '#8B3A2F';   // warm brown theme accent
const amber      = '#C8102E';   // Syncabi red, used sparingly
const cardShadow = '0 30px 80px rgba(0,0,0,0.12), 0 8px 24px rgba(0,0,0,0.06)';

// ───────────────────────────── small atoms ─────────────────────────────

// 1px hairline divider — used everywhere between sections (Swiss vocab)
function Rule({ color = ink12, style = {} } = {}) {
  return <div style={{ height: 0, borderTop: `1px solid ${color}`, ...style }} />;
}

// Soft grey label — sentence case, friendly geometric sans (matches the
// "Portfolio value" / "Earnings" labels in the reference). Replaces the old
// mono-uppercase eyebrow so every screen reads clean and modern.
function Eyebrow({ children, style = {} }) {
  return (
    <div style={{
      fontFamily: CC_MONO, fontSize: 10.5, fontWeight: 500,
      letterSpacing: '0.14em', textTransform: 'uppercase',
      color: ink40, ...style,
    }}>{children}</div>
  );
}

// Diagonal-stripe placeholder, optionally with a monospace label
function StripePlaceholder({
  label, width = '100%', height = 160, dark = false, radius = 20, style = {},
}) {
  const bg = dark ? '#111' : '#F2F2F2';
  const stripe = dark ? 'rgba(255,255,255,0.07)' : 'rgba(10,10,10,0.05)';
  return (
    <div style={{
      width, height,
      backgroundColor: bg,
      backgroundImage: `repeating-linear-gradient(45deg, ${stripe} 0 1px, transparent 1px 9px)`,
      borderRadius: radius,
      position: 'relative', display: 'flex', alignItems: 'flex-end',
      overflow: 'hidden',
      ...style,
    }}>
      {label && (
        <div style={{
          fontFamily: CC_MONO, fontSize: 10, letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: dark ? 'rgba(255,255,255,0.5)' : ink40,
          padding: '8px 12px',
        }}>{label}</div>
      )}
    </div>
  );
}

// ──────────────────────── Fund icons ────────────────────────
// Minimal, monoline SVGs that sit in a soft rounded square. Used in the
// Funds list (VentureRow) in place of the photographic placeholder, so the
// row feels like a clean app icon rather than missing imagery.
// One glyph per fund, mapped by id. Unknown ids fall back to a neutral mark.
const FUND_GLYPHS = {
  // Services & Consumer Brands — brand tag / label with hole
  'services-fund': (
    <g fill="none" stroke="currentColor" strokeWidth="1.4"
       strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 11.5 L11.5 4 H19 V11.5 L11.5 19 Z" />
      <circle cx="15.5" cy="7.5" r="1.2" />
    </g>
  ),
  // Manufacturing & Operations Fund — factory roofline + stack
  'industry-fund': (
    <g fill="none" stroke="currentColor" strokeWidth="1.4"
       strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19 V11 L9 13.5 V11 L14 13.5 V11 L19 13.5 V19 Z" />
      <path d="M16.5 11 V6 H19 V13" />
    </g>
  ),
  // Savannah Creek · Eco-tourism — horizon with sun + mountain peaks
  'savannah-creek': (
    <g fill="none" stroke="currentColor" strokeWidth="1.4"
       strokeLinecap="round" strokeLinejoin="round">
      <circle cx="17" cy="8" r="2.2" />
      <path d="M3 18 L9 11 L13.5 15 L17 12 L21 18" />
    </g>
  ),
  // Heza Estate · Real Estate — small house outline
  'heza-estate': (
    <g fill="none" stroke="currentColor" strokeWidth="1.4"
       strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 11 L12 5 L19.5 11" />
      <path d="M6.5 10.2 V19 H17.5 V10.2" />
    </g>
  ),
  // Shine Group · Consumer goods — stacked boxes
  'shine-group': (
    <g fill="none" stroke="currentColor" strokeWidth="1.4"
       strokeLinecap="round" strokeLinejoin="round">
      <rect x="4.5" y="11" width="15" height="8" rx="1.2" />
      <path d="M4.5 14.5 H19.5" />
      <path d="M9.5 11 V8 H14.5 V11" />
    </g>
  ),
  // Blessed Dairy · Dairy — droplet
  'blessed-dairy': (
    <g fill="none" stroke="currentColor" strokeWidth="1.4"
       strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 4 C8 9.5, 7 13, 9 16 C11 18.5, 13 18.5, 15 16 C17 13, 16 9.5, 12 4 Z" />
    </g>
  ),
  // Maran Design · Architecture — drafting triangle
  'maran-design': (
    <g fill="none" stroke="currentColor" strokeWidth="1.4"
       strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 19 L19 19 L19 5 Z" />
      <path d="M9 19 V15.5" />
      <path d="M13 19 V11.5" />
    </g>
  ),
  // GovTech Lab · Public-sector innovation — classical pillars (government)
  // crossed with a small spark dot above (innovation)
  'govtech-lab': (
    <g fill="none" stroke="currentColor" strokeWidth="1.4"
       strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="4.5" r="0.9" fill="currentColor" stroke="none" />
      <path d="M4.5 9 H19.5" />
      <path d="M7 9 V18" />
      <path d="M12 9 V18" />
      <path d="M17 9 V18" />
      <path d="M4 19 H20" />
    </g>
  ),
  // Great Lakes Logistics (GLL) · Logistics — directional arrow
  'gll': (
    <g fill="none" stroke="currentColor" strokeWidth="1.4"
       strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12 H19" />
      <path d="M14 7 L19 12 L14 17" />
    </g>
  ),
  // REIT Fund — twin towers / property block skyline
  'reit-fund': (
    <g fill="none" stroke="currentColor" strokeWidth="1.4"
       strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19 V9 L10 6 V19" />
      <path d="M10 19 V11 L17 8 V19" />
      <path d="M3 19 H19" />
      <path d="M6.5 11 V11.5 M6.5 14 V14.5 M13 13 V13.5 M13 15.5 V16" />
    </g>
  ),
  // EXP.AFRICA · Experiential / events — radiating burst (a live moment)
  'exp-africa': (
    <g fill="none" stroke="currentColor" strokeWidth="1.4"
       strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="2.4" />
      <path d="M12 4 V6.5 M12 17.5 V20 M4 12 H6.5 M17.5 12 H20 M6.4 6.4 L8.2 8.2 M15.8 15.8 L17.6 17.6 M17.6 6.4 L15.8 8.2 M8.2 15.8 L6.4 17.6" />
    </g>
  ),
  // TPNN · Media · PR — broadcast / signal waves from a centre point
  'tpnn': (
    <g fill="none" stroke="currentColor" strokeWidth="1.4"
       strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
      <path d="M8.5 8.5 A5 5 0 0 0 8.5 15.5" />
      <path d="M15.5 8.5 A5 5 0 0 1 15.5 15.5" />
      <path d="M5.5 5.5 A9 9 0 0 0 5.5 18.5" />
      <path d="M18.5 5.5 A9 9 0 0 1 18.5 18.5" />
    </g>
  ),
};

function FundIcon({ id, size = 48, radius = 12, tone = 'soft' }) {
  const glyph = FUND_GLYPHS[id] || (
    <g fill="none" stroke="currentColor" strokeWidth="1.4">
      <circle cx="12" cy="12" r="5" />
    </g>
  );
  const bg = tone === 'paper' ? paperSoft : '#F2F2F2';
  return (
    <div style={{
      width: size, height: size,
      background: bg,
      borderRadius: radius,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: ink,
      flexShrink: 0,
    }}>
      <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24"
           aria-hidden="true">
        {glyph}
      </svg>
    </div>
  );
}

// Status pill — used for venture statuses (Vetted / Pipeline / In-House / For You)
function StatusPill({ children, variant = 'outline', accent }) {
  const styles = {
    outline:  { background: 'transparent', color: ink, border: `1px solid ${ink}` },
    solid:    { background: accent || ink, color: '#fff', border: `1px solid ${accent || ink}` },
    ghost:    { background: 'transparent', color: ink55, border: `1px solid ${ink25}` },
  }[variant];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', height: 24,
      padding: '0 12px', borderRadius: 999,
      fontFamily: CC_MONO, fontSize: 10, letterSpacing: '0.12em',
      textTransform: 'uppercase',
      ...styles,
    }}>{children}</span>
  );
}

// Rounded card — outline container used for grouped content
function RoundedCard({ children, padding = 20, radius = 20, style = {} }) {
  return (
    <div style={{
      border: `1px solid ${ink12}`, borderRadius: radius,
      padding, background: paper, ...style,
    }}>{children}</div>
  );
}

// Collapsible section — header always visible, body opens/closes smoothly.
// Body height animates via the CSS-grid 0fr→1fr trick (no JS measurement needed).
function CollapsibleSection({
  title, meta, defaultOpen = false, padded = true, children,
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <div>
      <button onClick={() => setOpen((o) => !o)} style={{
        width: '100%', background: 'transparent', border: 0,
        padding: padded ? '22px 24px' : '22px 0',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        fontFamily: 'inherit',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{
            fontFamily: CC_MONO, fontSize: 10, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: ink55,
          }}>{title}</span>
          {meta && (
            <span style={{
              fontFamily: CC_MONO, fontSize: 10, letterSpacing: '0.08em',
              textTransform: 'uppercase', color: ink25,
            }}>· {meta}</span>
          )}
        </div>
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          border: `1px solid ${ink12}`, background: paper,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform 220ms cubic-bezier(.2,.6,.2,1)',
          transform: open ? 'rotate(45deg)' : 'rotate(0)',
        }}>
          <svg width="10" height="10" viewBox="0 0 10 10">
            <path d="M5 1v8M1 5h8" stroke={ink} strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
        </div>
      </button>
      <div style={{
        display: 'grid',
        gridTemplateRows: open ? '1fr' : '0fr',
        transition: 'grid-template-rows 320ms cubic-bezier(.2,.6,.2,1)',
      }}>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ padding: padded ? '0 24px 26px' : '0 0 26px' }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

// Slide-up wrapper — animates child in from below on first paint.
// Used for the numeric keypad showing up after navigating to Amount.
function SlideUp({ children, delay = 0, style = {} }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    const t = setTimeout(() => setMounted(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <div style={{
      transform: mounted ? 'translateY(0)' : 'translateY(24px)',
      opacity: mounted ? 1 : 0,
      transition: 'transform 360ms cubic-bezier(.2,.7,.2,1), opacity 280ms ease',
      ...style,
    }}>
      {children}
    </div>
  );
}

// Smooth amber-gradient area chart — a single warm line with a vertical fill
// that fades to transparent, mirroring the reference portfolio graph. The path
// is smoothed with Catmull-Rom → cubic-bezier so it reads organic, not jagged.
function Sparkline({ data = [], width = 320, height = 150, accent, strokeWidth = 2.5 }) {
  if (!data.length) return null;
  const id = React.useMemo(() => 'spark' + Math.random().toString(36).slice(2, 8), []);
  const min = Math.min(...data), max = Math.max(...data);
  const span = max - min || 1;
  const padX = strokeWidth + 1;
  const padTop = strokeWidth + 2;
  const stepX = (width - padX * 2) / (data.length - 1);
  const pts = data.map((v, i) => [
    padX + i * stepX,
    padTop + (height - padTop - 2) * (1 - (v - min) / span),
  ]);
  // Catmull-Rom to bezier smoothing.
  const line = (() => {
    let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;
      const c1x = p1[0] + (p2[0] - p0[0]) / 6;
      const c1y = p1[1] + (p2[1] - p0[1]) / 6;
      const c2x = p2[0] - (p3[0] - p1[0]) / 6;
      const c2y = p2[1] - (p3[1] - p1[1]) / 6;
      d += ` C${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
    }
    return d;
  })();
  const area = `${line} L${pts[pts.length - 1][0].toFixed(1)} ${height} L${pts[0][0].toFixed(1)} ${height} Z`;
  const last = pts[pts.length - 1];
  const col = accent || amber;
  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none"
         style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={col} stopOpacity="0.34" />
          <stop offset="55%" stopColor={col} stopOpacity="0.12" />
          <stop offset="100%" stopColor={col} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke={col} strokeWidth={strokeWidth}
            strokeLinecap="round" strokeLinejoin="round"
            vectorEffect="non-scaling-stroke" />
      <circle cx={last[0]} cy={last[1]} r={strokeWidth + 1} fill="#fff"
              stroke={col} strokeWidth={strokeWidth} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

// Thin progress / utilization bar.
function ProgressBar({ percent = 0, accent, track = ink12, height = 4 }) {
  return (
    <div style={{ position: 'relative', height, background: track, borderRadius: 999 }}>
      <div style={{
        position: 'absolute', inset: 0, width: `${Math.max(0, Math.min(100, percent))}%`,
        background: accent || ink, borderRadius: 999,
        transition: 'width 320ms cubic-bezier(.2,.6,.2,1)',
      }} />
    </div>
  );
}

// Bottom tab bar — only 2 tabs, very minimal
function TabBar({ active, onChange, accent, native }) {
  const tabs = [
    { id: 'capital',  label: 'Save'    },
    { id: 'credit',   label: 'Credit'  },
  ];
  return (
    <div style={{
      borderTop: `1px solid ${ink12}`,
      background: paper,
      // Home-indicator clearance: real safe-area inset on device, fixed in preview.
      paddingBottom: native ? 'max(12px, calc(env(safe-area-inset-bottom, 0px) + 8px))' : 30,
    }}>
      <div style={{ display: 'flex' }}>
        {tabs.map((t) => {
          const on = active === t.id;
          return (
            <button key={t.id}
              onClick={() => onChange(t.id)}
              style={{
                flex: 1, background: 'transparent', border: 0, padding: '10px 0 8px',
                cursor: 'pointer', position: 'relative',
                fontFamily: 'inherit',
              }}>
              <div style={{
                fontSize: 13, fontWeight: 500, letterSpacing: '0.02em',
                color: on ? ink : ink40,
              }}>{t.label}</div>
              <div style={{
                position: 'absolute', left: '50%', transform: 'translateX(-50%)',
                bottom: 0, width: 28, height: 2,
                background: on ? (accent || ink) : 'transparent',
              }} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Top app header — small, used inside frame below status bar
function ScreenHeader({ left, right, style = {} }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '8px 20px 0',
      ...style,
    }}>
      <div style={{ minHeight: 28, display: 'flex', alignItems: 'center' }}>{left}</div>
      <div style={{ minHeight: 28, display: 'flex', alignItems: 'center', gap: 8 }}>{right}</div>
    </div>
  );
}

// Small circular avatar placeholder
function Avatar({ initials = 'JK', size = 32 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      border: `1px solid ${ink25}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: CC_MONO, fontSize: 10, letterSpacing: '0.06em',
      color: ink70,
    }}>{initials}</div>
  );
}

// Circular back-chevron button
function BackBtn({ onClick }) {
  return (
    <button onClick={onClick} aria-label="Back" style={{
      width: 40, height: 40, border: `1px solid ${ink12}`, background: paper,
      borderRadius: '50%', padding: 0, cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <svg width="14" height="14" viewBox="0 0 14 14">
        <path d="M9 2L4 7l5 5" stroke={ink} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  );
}

// Circular icon-only button
function IconBtn({ children, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: 40, height: 40, border: `1px solid ${ink12}`, background: paper,
      borderRadius: '50%',
      padding: 0, cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>{children}</button>
  );
}

// Small pill button — used like Wise's "Help" link
function PillLink({ children, onClick }) {
  return (
    <button onClick={onClick} style={{
      height: 36, padding: '0 16px', borderRadius: 999,
      border: `1px solid ${ink12}`, background: paper, cursor: 'pointer',
      fontFamily: 'inherit', fontSize: 13, fontWeight: 500, color: ink,
    }}>{children}</button>
  );
}

// Three-line "more" glyph
const MoreIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14">
    <circle cx="3" cy="7" r="1.1" fill={ink}/>
    <circle cx="7" cy="7" r="1.1" fill={ink}/>
    <circle cx="11" cy="7" r="1.1" fill={ink}/>
  </svg>
);

// Outline / ghost / solid PILL button — fully rounded, single primary action per screen
function CCButton({
  children, onClick, variant = 'outline', accent, fullWidth = false,
  size = 'lg', style = {},
}) {
  const sizes = {
    lg: { height: 56, fontSize: 15, padding: '0 24px' },
    md: { height: 48, fontSize: 14, padding: '0 20px' },
    sm: { height: 40, fontSize: 13, padding: '0 16px' },
  }[size];
  const base = {
    ...sizes,
    borderRadius: 999,
    fontFamily: 'inherit', fontWeight: 500,
    letterSpacing: '0.005em',
    cursor: 'pointer', display: 'inline-flex',
    alignItems: 'center', justifyContent: 'center',
    width: fullWidth ? '100%' : undefined,
  };
  const v = {
    outline: { background: paper, color: ink, border: `1px solid ${ink}` },
    solid:   { background: accent || ink, color: '#fff', border: `1px solid ${accent || ink}` },
    ghost:   { background: 'transparent', color: ink, border: `1px solid ${ink12}` },
  }[variant];
  return (
    <button onClick={onClick} style={{ ...base, ...v, ...style }}>{children}</button>
  );
}

// Allocation bar — Swiss bar chart row, thin line
function AllocBar({ label, percent, accent }) {
  return (
    <div style={{ padding: '14px 0' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        fontSize: 14, marginBottom: 8,
      }}>
        <span>{label}</span>
        <span style={{ fontFamily: CC_MONO, letterSpacing: '0.04em' }}>{percent}%</span>
      </div>
      <div style={{ position: 'relative', height: 2, background: ink12 }}>
        <div style={{
          position: 'absolute', inset: 0, width: `${percent}%`,
          background: accent || ink,
        }} />
      </div>
    </div>
  );
}

// Activity row
function ActivityRow({ title, amount, time, last = false }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
      padding: '16px 0',
      borderBottom: last ? 'none' : `1px solid ${ink06}`,
    }}>
      <div>
        <div style={{ fontSize: 14 }}>{title}</div>
        <div style={{
          fontFamily: CC_MONO, fontSize: 10, letterSpacing: '0.08em',
          color: ink55, textTransform: 'uppercase', marginTop: 4,
        }}>{time}</div>
      </div>
      <div style={{ fontFamily: CC_MONO, fontSize: 13, letterSpacing: '0.02em' }}>{amount}</div>
    </div>
  );
}

// Quick stat block
function StatBlock({ label, value, sub, style = {} }) {
  return (
    <div style={{ ...style }}>
      <Eyebrow style={{ marginBottom: 8 }}>{label}</Eyebrow>
      <div style={{
        fontSize: 24, fontWeight: 800, letterSpacing: '-0.015em', lineHeight: 1,
        fontFeatureSettings: '"tnum"',
      }}>{value}</div>
      {sub && <div style={{
        fontSize: 12, color: ink55, marginTop: 7, fontWeight: 500,
      }}>{sub}</div>}
    </div>
  );
}

// Format RWF with thousand separators
function fmtRWF(n) {
  return 'RWF ' + Number(n).toLocaleString('en-US');
}

Object.assign(window, {
  CC_PALETTES, CC_TYPES, CC_MONO,
  ink, ink70, ink55, ink40, ink25, ink12, ink06, paper, paperSoft,
  Rule, Eyebrow, StripePlaceholder, FundIcon, StatusPill, RoundedCard,
  CollapsibleSection, SlideUp, Sparkline, ProgressBar,
  TabBar, ScreenHeader, Avatar, BackBtn, IconBtn, PillLink, MoreIcon,
  CCButton, AllocBar, ActivityRow, StatBlock, fmtRWF,
  canvas, teal, amber, cardShadow,
});
