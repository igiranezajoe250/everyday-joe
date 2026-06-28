// native.jsx — production / native-readiness layer for Ingoga Invest
// ───────────────────────────────────────────────────────────────────────────
// Adds everything needed to ship the prototype as a real installed app
// (Capacitor iOS/Android wrapper or installed PWA) without touching the
// screen code:
//   • PK_NATIVE        — runtime detection (Capacitor / standalone / iOS web)
//   • PKStore / hooks  — localStorage persistence ("remember progress")
//   • EverydayPush     — push-notification readiness scaffold
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
    if (p.get('app') === '1') return true;
  } catch (e) {}
  return false;
})();

const PK_WEB = (() => {
  try {
    return new URLSearchParams(location.search).get('layout') === 'web';
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
const EverydayPush = {
  async init() {
    try {
      const Cap = window.Capacitor;
      const PN = Cap && Cap.Plugins && Cap.Plugins.PushNotifications;
      if (!PN) { console.info('[Ingoga Invest] Push unavailable (browser/preview) — scaffold ready.'); return; }
      const perm = await PN.requestPermissions();
      if (perm.receive === 'granted') await PN.register();
      PN.addListener('registration', (t) => console.info('[Ingoga Invest] push token:', t.value));
      PN.addListener('registrationError', (e) => console.warn('[Ingoga Invest] push reg error:', e));
      PN.addListener('pushNotificationReceived', (n) => console.info('[Ingoga Invest] push received:', n));
      PN.addListener('pushNotificationActionPerformed', (n) => console.info('[Ingoga Invest] push tapped:', n));
    } catch (e) { console.warn('[Ingoga Invest] push init failed', e); }
  },
};

// ─────────────────────────── haptics ───────────────────────────
// Uses the Capacitor Haptics plugin on device; falls back to the Web Vibration
// API in a browser; silently no-ops if neither exists. Call via pkHaptic().
const EverydayHaptics = {
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
  if (kind === 'success') return EverydayHaptics.notify('SUCCESS');
  if (kind === 'warning') return EverydayHaptics.notify('WARNING');
  if (kind === 'medium')  return EverydayHaptics.impact('MEDIUM');
  if (kind === 'select')  return EverydayHaptics.select();
  return EverydayHaptics.impact('LIGHT');
}

// ─────────────────────────── app shell ───────────────────────────
// Preview → centered iOS device frame. Native/standalone → fill the screen,
// letting the inner top spacer + tab bar honour the safe-area insets.
function AppShell({ native, web, fontStack, children }) {
  if (web) {
    return (
      <div style={{
        position: 'absolute', inset: 0,
        background: canvas, fontFamily: fontStack, color: ink,
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>{children}</div>
    );
  }
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
      eyebrow: 'Your Ingoga Invest',
      title: 'Your everyday trust.',
      body: 'One place to shop, pay, plan and grow — where everyone you deal with has already been vetted. Welcome to Ingoga Invest.',
    },
    {
      eyebrow: 'Vetted, always',
      title: 'Only people worth your trust.',
      body: 'Every business, brand, and individual on Ingoga Invest is verified before they’re let in. No strangers, no guesswork — just people and places you can rely on.',
    },
    {
      eyebrow: 'Plan · Save · Grow',
      title: 'And manage your wealth.',
      body: 'Beyond the everyday, Ingoga Invest helps you plan your spending, save consistently, and grow your money — building real wealth, one day at a time.',
    },
  ];
  const [i, setI] = React.useState(0);
  const selecting = i >= slides.length;          // final step: function picker
  const onLastInfo = i === slides.length - 1;
  const s = selecting ? null : slides[i];

  // Which functions the user wants. Default everything on; Save is mandatory.
  const [picked, setPicked] = React.useState(() => new Set(DEFAULT_FUNCTION_IDS));
  const togglePick = (id) => {
    if (id === 'save') return;                    // Save can't be turned off
    pkHaptic('select');
    setPicked((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };
  const advance = () => { pkHaptic('select'); setI((n) => n + 1); };
  const finish = () => {
    const ids = EVERYDAY_FUNCTIONS.map((f) => f.id).filter((id) => id === 'save' || picked.has(id));
    PKStore.set('functions', ids);
    pkHaptic('success');
    onDone();
  };

  const frame = (children, footer) => (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: canvas, padding: '0 28px',
      paddingTop: native ? 'max(64px, env(safe-area-inset-top, 64px))' : 78,
      paddingBottom: native ? 'max(28px, calc(env(safe-area-inset-bottom, 0px) + 22px))' : 40,
    }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', minHeight: 24 }}>
        {!selecting && (
          <button onClick={() => { pkHaptic('light'); onDone(); }} style={{
            background: 'transparent', border: 0, cursor: 'pointer',
            fontFamily: CC_MONO, fontSize: 11, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: ink55,
          }}>Skip</button>
        )}
      </div>
      {children}
      {footer}
    </div>
  );

  // ── Function picker (final step) ──
  if (selecting) {
    return frame(
      <div key="sel" className="pk-rise" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ fontFamily: CC_MONO, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: ink55, marginBottom: 16 }}>Set up your app</div>
        <div style={{ fontSize: 30, fontWeight: 500, letterSpacing: '-0.025em', lineHeight: 1.12, marginBottom: 10 }}>Choose what you'll use.</div>
        <div style={{ fontSize: 14, color: ink70, marginBottom: 24, lineHeight: 1.5 }}>
          Pick the functions for your home <strong style={{ fontWeight: 700 }}>+</strong> menu. Save is always on — change the rest anytime.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {EVERYDAY_FUNCTIONS.map((fn) => {
            const on = fn.id === 'save' || picked.has(fn.id);
            return (
              <button key={fn.id} onClick={() => togglePick(fn.id)} aria-pressed={on} disabled={fn.id === 'save'} style={{
                position: 'relative', display: 'flex', flexDirection: 'column', gap: 10,
                padding: '14px', borderRadius: 16,
                cursor: fn.id === 'save' ? 'default' : 'pointer',
                background: on ? paper : 'transparent',
                border: `1.5px solid ${on ? fn.color : ink12}`,
                fontFamily: 'inherit', textAlign: 'left',
                transition: 'border-color 180ms ease, background 180ms ease',
              }}>
                <div style={{ width: 40, height: 40, borderRadius: 11, background: on ? fn.color + '18' : ink06, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {React.cloneElement(fn.icon, { width: 21, height: 21, stroke: on ? fn.color : ink40 })}
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 650, color: on ? ink : ink55 }}>{fn.label}</div>
                  <div style={{ fontSize: 12, color: ink40, marginTop: 2 }}>{fn.sub}</div>
                </div>
                <div style={{ position: 'absolute', top: 12, right: 12, width: 18, height: 18, borderRadius: 999, border: `1.5px solid ${on ? fn.color : ink25}`, background: on ? fn.color : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {on && (<svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke={paper} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 6.5l2.5 2.5 4.5-5" /></svg>)}
                </div>
                {fn.id === 'save' && (<div style={{ position: 'absolute', bottom: 12, right: 12, fontFamily: CC_MONO, fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: ink40 }}>Always</div>)}
              </button>
            );
          })}
        </div>
      </div>,
      <div style={{ marginTop: 22 }}>
        <CCButton variant="solid" accent={accent} fullWidth onClick={finish} style={{ height: 54 }}>Get started</CCButton>
      </div>
    );
  }

  // ── Info slides ──
  return frame(
    <div key={i} className="pk-rise" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      {s.mark && <div style={{ marginBottom: 30 }}><PKMark size={56} /></div>}
      <div style={{ fontFamily: CC_MONO, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: ink55, marginBottom: 16 }}>{s.eyebrow}</div>
      <div style={{ fontSize: 32, fontWeight: 500, letterSpacing: '-0.025em', lineHeight: 1.1, maxWidth: 320 }}>{s.title}</div>
      <div style={{ fontSize: 15, color: ink70, marginTop: 18, lineHeight: 1.6, maxWidth: 330 }}>{s.body}</div>
    </div>,
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        {[...slides, 'sel'].map((_, j) => (
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
        {onLastInfo ? 'Next' : 'Continue'}
      </CCButton>
    </div>
  );
}

Object.assign(window, {
  PK_NATIVE, PKStore, usePersisted, EverydayPush, AppShell, LockGate, PKMark,
  EverydayHaptics, pkHaptic, Onboarding,
  ['Poke' + 'teePush']: EverydayPush,
  ['Poke' + 'teeHaptics']: EverydayHaptics,
});
