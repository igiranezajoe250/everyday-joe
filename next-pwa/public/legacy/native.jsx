// native.jsx — production / native-readiness layer for Poketee
// ───────────────────────────────────────────────────────────────────────────
// Adds everything needed to ship the prototype as a real installed app
// (Capacitor iOS/Android wrapper or installed PWA) without touching the
// screen code:
//   • PK_NATIVE        — runtime detection (Capacitor / standalone / iOS web)
//   • PKStore / hooks  — localStorage persistence ("remember progress")
//   • PoketeePush      — push-notification readiness scaffold
//   • AppShell         — device frame in preview, full-screen + safe-areas live
//   • LockGate         — passcode create/enter gate with (mock) Face ID
// Loaded after screens.jsx, before app.jsx.

// ─────────────────────────── runtime detection ───────────────────────────
const PK_NATIVE = (() => {
  try {
    const Cap = window.Capacitor;
    if (Cap && typeof Cap.isNativePlatform === 'function' && Cap.isNativePlatform()) return true;
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) return true;
    if (window.navigator.standalone === true) return true;
    const p = new URLSearchParams(location.search);
    if (p.get('app') === '1') return true; // force full-screen layout for testing
  } catch (e) {}
  return false;
})();

// ─────────────────────────── persistence ───────────────────────────
const PKStore = {
  get(k, fallback) {
    try { const v = localStorage.getItem('pk_' + k); return v == null ? fallback : JSON.parse(v); }
    catch (e) { return fallback; }
  },
  set(k, v) { try { localStorage.setItem('pk_' + k, JSON.stringify(v)); } catch (e) {} },
  del(k) { try { localStorage.removeItem('pk_' + k); } catch (e) {} },
};

// State mirrored to localStorage — survives app restarts.
function usePersisted(key, initial) {
  const [v, setV] = React.useState(() => PKStore.get(key, initial));
  React.useEffect(() => { PKStore.set(key, v); }, [key, v]);
  return [v, setV];
}

// ─────────────────────────── push readiness ───────────────────────────
// No-ops in the browser/preview; wires real listeners when the Capacitor
// PushNotifications plugin is present in the native build. See handoff README.
const PoketeePush = {
  async init() {
    try {
      const Cap = window.Capacitor;
      const PN = Cap && Cap.Plugins && Cap.Plugins.PushNotifications;
      if (!PN) { console.info('[Poketee] Push unavailable (browser/preview) — scaffold ready.'); return; }
      const perm = await PN.requestPermissions();
      if (perm.receive === 'granted') await PN.register();
      PN.addListener('registration', (t) => console.info('[Poketee] push token:', t.value));
      PN.addListener('registrationError', (e) => console.warn('[Poketee] push reg error:', e));
      PN.addListener('pushNotificationReceived', (n) => console.info('[Poketee] push received:', n));
      PN.addListener('pushNotificationActionPerformed', (n) => console.info('[Poketee] push tapped:', n));
    } catch (e) { console.warn('[Poketee] push init failed', e); }
  },
};

// ─────────────────────────── haptics ───────────────────────────
// Uses the Capacitor Haptics plugin on device; falls back to the Web Vibration
// API in a browser; silently no-ops if neither exists. Call via pkHaptic().
const PoketeeHaptics = {
  _h() { const Cap = window.Capacitor; return Cap && Cap.Plugins && Cap.Plugins.Haptics; },
  impact(style) {
    try { const H = this._h(); if (H) H.impact({ style }); else if (navigator.vibrate) navigator.vibrate(8); } catch (e) {}
  },
  notify(type) {
    try { const H = this._h(); if (H) H.notification({ type }); else if (navigator.vibrate) navigator.vibrate([0, 28, 40, 28]); } catch (e) {}
  },
  select() {
    try { const H = this._h(); if (H) (H.selectionChanged ? H.selectionChanged() : H.impact && H.impact({ style: 'LIGHT' })); else if (navigator.vibrate) navigator.vibrate(5); } catch (e) {}
  },
};
function pkHaptic(kind) {
  if (kind === 'success') return PoketeeHaptics.notify('SUCCESS');
  if (kind === 'warning') return PoketeeHaptics.notify('WARNING');
  if (kind === 'medium')  return PoketeeHaptics.impact('MEDIUM');
  if (kind === 'select')  return PoketeeHaptics.select();
  return PoketeeHaptics.impact('LIGHT');
}

// ─────────────────────────── app shell ───────────────────────────
// Preview → centered iOS device frame. Native/standalone → fill the screen,
// letting the inner top spacer + tab bar honour the safe-area insets.
function AppShell({ native, fontStack, children }) {
  if (!native) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        background: canvas, fontFamily: fontStack, color: ink,
        padding: '24px 16px',
      }}>
        <IOSDevice width={402} height={874}>{children}</IOSDevice>
      </div>
    );
  }
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: canvas, fontFamily: fontStack, color: ink,
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>{children}</div>
  );
}

// ─────────────────────────── lock gate (passcode) ───────────────────────────
function PKMark({ size = 44 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.28,
      background: ink, display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <svg width={size * 0.56} height={size * 0.56} viewBox="0 0 1024 1024">
        <g fill="none" stroke="#F4F1EA" strokeWidth="64" strokeLinecap="round" strokeLinejoin="round">
          <path d="M 330 360 H 694 V 560 Q 694 720 512 720 Q 330 720 330 560 Z" />
          <path d="M 330 440 H 694" />
        </g>
      </svg>
    </div>
  );
}

function LockGate({ accent, native, onUnlock }) {
  const hasPin = PKStore.get('pin', null) != null;
  const [stage, setStage] = React.useState(hasPin ? 'enter' : 'create');
  const [first, setFirst] = React.useState('');
  const [pin, setPin] = React.useState('');
  const [shake, setShake] = React.useState(false);
  const [confirmReset, setConfirmReset] = React.useState(false);

  const title = { create: 'Create a passcode', confirm: 'Confirm your passcode', enter: 'Enter passcode' }[stage];
  const sub = {
    create: 'Secure your account with a 4-digit code.',
    confirm: 'Enter it again to confirm.',
    enter: 'Welcome back, Joseph.',
  }[stage];

  const fail = () => { pkHaptic('warning'); setShake(true); setPin(''); setTimeout(() => setShake(false), 480); };

  const submit = (code) => {
    if (stage === 'create') { setFirst(code); setPin(''); setStage('confirm'); return; }
    if (stage === 'confirm') {
      if (code === first) { PKStore.set('pin', code); pkHaptic('success'); onUnlock(); }
      else { fail(); setFirst(''); setStage('create'); }
      return;
    }
    if (code === PKStore.get('pin', null)) { pkHaptic('success'); onUnlock(); }
    else fail();
  };

  const press = (k) => {
    if (k === 'bio') { pkHaptic('success'); onUnlock(); return; }
    if (k === 'del') { pkHaptic('light'); setPin((p) => p.slice(0, -1)); return; }
    pkHaptic('light');
    setPin((p) => {
      if (p.length >= 4) return p;
      const next = p + k;
      if (next.length === 4) setTimeout(() => submit(next), 130);
      return next;
    });
  };

  // Forgot passcode → wipe the stored code and drop into the create flow.
  const resetPasscode = () => {
    PKStore.del('pin');
    setConfirmReset(false);
    setFirst(''); setPin(''); setStage('create');
  };

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', stage === 'enter' ? 'bio' : '', '0', 'del'];

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: canvas, padding: '0 28px',
      paddingTop: native ? 'max(56px, env(safe-area-inset-top, 56px))' : 72,
      paddingBottom: native ? 'max(28px, calc(env(safe-area-inset-bottom, 0px) + 20px))' : 40,
    }}>
      {/* Brand + prompt */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', textAlign: 'center',
      }}>
        <PKMark size={52} />
        <div style={{
          fontSize: 24, fontWeight: 500, letterSpacing: '-0.02em',
          marginTop: 28,
        }}>{title}</div>
        <div style={{ fontSize: 13.5, color: ink55, marginTop: 8, maxWidth: 240, lineHeight: 1.5 }}>{sub}</div>

        {/* dots */}
        <div className={shake ? 'pk-shake' : ''} style={{ display: 'flex', gap: 18, marginTop: 34 }}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} style={{
              width: 13, height: 13, borderRadius: '50%',
              background: i < pin.length ? ink : 'transparent',
              border: `1.5px solid ${i < pin.length ? ink : ink25}`,
              transition: 'background 140ms ease, border-color 140ms ease',
            }} />
          ))}
        </div>

        {/* forgot passcode (enter stage only) */}
        <div style={{ height: 46, marginTop: 16, display: 'flex', alignItems: 'center' }}>
          {stage === 'enter' && !confirmReset && (
            <button onClick={() => setConfirmReset(true)} style={{
              background: 'transparent', border: 0, cursor: 'pointer', fontFamily: 'inherit',
              fontSize: 13, color: ink55, textDecoration: 'underline', textUnderlineOffset: 3,
            }}>Forgot passcode?</button>
          )}
          {stage === 'enter' && confirmReset && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ fontSize: 12.5, color: ink70 }}>Reset &amp; create a new one?</span>
              <button onClick={resetPasscode} style={{
                background: 'transparent', border: 0, cursor: 'pointer', fontFamily: 'inherit',
                fontSize: 13, fontWeight: 600, color: accent || ink,
              }}>Reset</button>
              <button onClick={() => setConfirmReset(false)} style={{
                background: 'transparent', border: 0, cursor: 'pointer', fontFamily: 'inherit',
                fontSize: 13, color: ink55,
              }}>Cancel</button>
            </div>
          )}
        </div>
      </div>

      {/* keypad */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 'min(16px, 3vw)', justifyItems: 'center', maxWidth: 300, width: '100%',
        margin: '0 auto',
      }}>
        {keys.map((k, i) => {
          if (k === '') return <div key={i} />;
          const isGlyph = k === 'bio' || k === 'del';
          return (
            <button key={i} onClick={() => press(k)}
              style={{
                width: 'min(72px, 18vw)', height: 'min(72px, 18vw)', borderRadius: '50%',
                border: isGlyph ? 'none' : `1px solid ${ink12}`,
                background: isGlyph ? 'transparent' : paper,
                cursor: 'pointer', fontFamily: 'inherit',
                fontSize: 'min(26px, 6.5vw)', fontWeight: 400, color: ink,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
              {k === 'bio' ? (
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={ink} strokeWidth="1.5" strokeLinecap="round">
                  <path d="M4 8V6.5A2.5 2.5 0 0 1 6.5 4H8M16 4h1.5A2.5 2.5 0 0 1 20 6.5V8M20 16v1.5a2.5 2.5 0 0 1-2.5 2.5H16M8 20H6.5A2.5 2.5 0 0 1 4 17.5V16" />
                  <path d="M9 9.5v1M15 9.5v1M12 9v3.2c0 .6-.4 1-1 1M9.2 15.5c1.6 1 4 1 5.6 0" />
                </svg>
              ) : k === 'del' ? (
                <svg width="26" height="20" viewBox="0 0 26 20" fill="none" stroke={ink} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 3h13a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H8L1 10 8 3z" />
                  <path d="M12 7l6 6M18 7l-6 6" />
                </svg>
              ) : k}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────── onboarding ───────────────────────────
// 3 quiet first-run slides that frame the product (and the fund / expert /
// direct model) before the passcode. Shown once, then never again.
function Onboarding({ native, accent, onDone }) {
  const slides = [
    {
      mark: true,
      eyebrow: 'Welcome',
      title: 'Build wealth, one save at a time.',
      body: 'Everyday Joe helps you grow your money through one simple habit — saving consistently, straight from your pocket.',
    },
    {
      eyebrow: 'Save · Grow · Access',
      title: 'The more you save, the more opens up.',
      body: 'Your savings earn returns as they grow, and unlock a credit line you can draw on — the stronger your saving, the more finance you can access.',
    },
    {
      eyebrow: 'Your credit line',
      title: 'Saving builds your borrowing power.',
      body: 'Your borrowing capacity is a share of your savings, and rises automatically as you save more. Save when you can; access finance when you need it.',
    },
  ];
  const [i, setI] = React.useState(0);
  const s = slides[i];
  const last = i === slides.length - 1;
  const advance = () => { pkHaptic('select'); last ? onDone() : setI(i + 1); };

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: canvas, padding: '0 28px',
      paddingTop: native ? 'max(64px, env(safe-area-inset-top, 64px))' : 78,
      paddingBottom: native ? 'max(28px, calc(env(safe-area-inset-bottom, 0px) + 22px))' : 40,
    }}>
      {/* Skip */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', minHeight: 24 }}>
        {!last && (
          <button onClick={() => { pkHaptic('light'); onDone(); }} style={{
            background: 'transparent', border: 0, cursor: 'pointer', fontFamily: 'inherit',
            fontFamily: CC_MONO, fontSize: 11, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: ink55,
          }}>Skip</button>
        )}
      </div>

      {/* Body */}
      <div key={i} className="pk-rise" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {s.mark && <div style={{ marginBottom: 30 }}><PKMark size={56} /></div>}
        <div style={{
          fontFamily: CC_MONO, fontSize: 11, letterSpacing: '0.16em',
          textTransform: 'uppercase', color: ink55, marginBottom: 16,
        }}>{s.eyebrow}</div>
        <div style={{
          fontSize: 32, fontWeight: 500, letterSpacing: '-0.025em', lineHeight: 1.1,
          maxWidth: 320,
        }}>{s.title}</div>
        <div style={{
          fontSize: 15, color: ink70, marginTop: 18, lineHeight: 1.6, maxWidth: 330,
        }}>{s.body}</div>
      </div>

      {/* Footer: dots + CTA */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {slides.map((_, j) => (
            <div key={j} style={{
              height: 6, borderRadius: 999,
              width: j === i ? 22 : 6,
              background: j === i ? ink : ink25,
              transition: 'width 220ms ease, background 220ms ease',
            }} />
          ))}
        </div>
        <CCButton variant="solid" accent={accent} onClick={advance}
          style={{ minWidth: 132, padding: '0 26px' }}>
          {last ? 'Get started' : 'Continue'}
        </CCButton>
      </div>
    </div>
  );
}

Object.assign(window, {
  PK_NATIVE, PKStore, usePersisted, PoketeePush, AppShell, LockGate, PKMark,
  PoketeeHaptics, pkHaptic, Onboarding,
});
